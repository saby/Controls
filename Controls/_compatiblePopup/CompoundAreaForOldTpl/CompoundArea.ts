import CompoundContainer = require('Core/CompoundContainer');
import template = require('wml!Controls/_compatiblePopup/CompoundAreaForOldTpl/CompoundArea');
import LikeWindowMixin = require('Lib/Mixins/LikeWindowMixin');
import arrayFindIndex = require('Core/helpers/Array/findIndex');
import cDeferred = require('Core/Deferred');
import makeInstanceCompatible = require('Core/helpers/Hcontrol/makeInstanceCompatible');
import {delay as runDelayed} from 'Types/function';
import trackElement = require('Core/helpers/Hcontrol/trackElement');
import doAutofocus = require('Core/helpers/Hcontrol/doAutofocus');
import Env = require('Env/Env');
import EnvEvent = require('Env/Event');
import {Controller} from 'Controls/popup';
import {InstantiableMixin} from 'Types/entity';
import callNext = require('Core/helpers/Function/callNext');
import cInstance = require('Core/core-instance');
import { SyntheticEvent } from 'Vdom/Vdom';
import {Logger} from 'UI/Utils';
import 'css!theme?Controls/compatiblePopup';

function removeOperation(operation, array) {
   var idx = arrayFindIndex(array, function(op) {
      return op === operation;
   });
   array.splice(idx, 1);
}

function finishResultOk(result) {
   return !(result instanceof Error || result === false);
}

var allProducedPendingOperations = [];
var invisibleRe = /ws-invisible/ig;
var hiddenRe = /ws-hidden/ig;
let DialogRecord;

/**
 * Слой совместимости для открытия старых шаблонов в новых попапах
 * */
var CompoundArea = CompoundContainer.extend([
   InstantiableMixin,
   LikeWindowMixin
], {
   _template: template,
   _compoundId: undefined,

   _beforeCloseHandlerResult: true,
   _isClosing: false,
   _pending: null,
   _pendingTrace: null,
   _waiting: null,

   _childPendingOperations: null,
   _allChildrenPendingOperation: null,
   _finishPendingQueue: null,
   _isFinishingChildOperations: false,
   _producedPendingOperations: null,

   _isReadOnly: true,

   _baseAfterUpdate: null,
   _popupController: null,

   _beforeMount: function(_options) {
      CompoundArea.superclass._beforeMount.apply(this, arguments);

      this._childPendingOperations = [];
      this._producedPendingOperations = [];

      this._className = 'controls-CompoundArea';
      if (_options.type !== 'base') {
         this._className += (_options.type === 'stack') ? ' ws-float-area' : ' ws-window'; // Старые шаблоны завязаны селекторами на этот класс.
      }

      // Отступ крестика должен быть по старым стандартам. У всех кроме стики, переопределяем
      if ((_options.popupComponent !== 'floatArea' && _options.type === 'dialog') || _options.type === 'stack') {
         this._className += ' controls-CompoundArea-close_button';
      }

      this.subscribeTo(EnvEvent.Bus.channel('navigation'), 'onBeforeNavigate', this._onBeforeNavigate.bind(this));

      this._childControlName = _options.template;

      /**
       * Поведение если вызвали через ENGINE/MiniCard.
       */
      var _this = this;

      if (_options.hoverTarget) {
         $(_options.hoverTarget).on('mouseenter', function() {
            clearTimeout(_this._hoverTimer);
            _this._hoverTimer = null;
         });
         $(_options.hoverTarget).on('mouseleave', function() {
            _this._hoverTimer = setTimeout(function() {
               _this.hide();
            }, 1000);
         });
      }
      if (_options.popupComponent === 'recordFloatArea') {
         if (typeof _options.readOnly !== 'undefined') {
            this._isReadOnly = _options.readOnly;
         } else {
            // Старая RecordFloatArea по умолчанию имела значение
            // опции readOnly === false
            this._isReadOnly = false;
         }
         return new Promise((resolve) => {
            requirejs(['optional!Deprecated/Controls/DialogRecord/DialogRecord'], (DeprecatedDialogRecord) => {
               DialogRecord = DeprecatedDialogRecord;
               this.subscribeOnBeforeUnload();
               resolve();
            }, () => resolve);
         });
      }
   },

   _shouldUpdate: function(popupOptions) {
      if (popupOptions._compoundId !== this._compoundId) {
         this._childConfig = this._options.templateOptions || {};
         this._childControlName = this._options.template;
         this.rebuildChildControl();
         this._compoundId = popupOptions._compoundId;
      }
      if (this._options.canMaximize) {
         var maximized = this.getContainer().hasClass('ws-float-area-maximized-mode');
         var templateComponent = this._getTemplateComponent();
         this.getContainer().toggleClass('ws-float-area-has-maximized-button', popupOptions.showMaximizedButton || false);
         this.getContainer().toggleClass('ws-float-area-maximized-mode', popupOptions.maximized || false);
         if (templateComponent && maximized !== popupOptions.maximized) {
            templateComponent._notifyOnSizeChanged();
            templateComponent._notify('onChangeMaximizeState', popupOptions.maximized);
            templateComponent._options.isPanelMaximized = popupOptions.maximized;
            this._notify('onChangeMaximizeState', popupOptions.maximized);
         }
      }
      return false;
   },

   _onBeforeNavigate: function(event, activeElement, isIconClick) {
      if (!isIconClick) {
         this.close();
      }
   },

   _changeMaximizedMode: function(event) {
      event.stopPropagation();
      var state = this.getContainer().hasClass('ws-float-area-maximized-mode');
      this._notifyVDOM('maximized', [!state], { bubbling: true });
   },

   rebuildChildControl: function() {
      var
         self = this,
         rebuildDeferred;

      self._childConfig._compoundArea = self;

      self.once('onInit', function() {
         // _initCompoundArea должен быть вызван после уничтожения старого childControl (если он есть), но перед
         // созданием нового, поэтому делаем на onInit
         if (self._options._initCompoundArea) {
            self._options._initCompoundArea(self);
         }
         self.setEnabled(self._enabled);
      });
      self.once('onAfterLoad', function() {
         EnvEvent.Bus.globalChannel().notify('onWindowCreated', self); // StickyHeaderMediator listens for onWindowCreated
      });

      rebuildDeferred = CompoundArea.superclass.rebuildChildControl.apply(self, arguments);
      self._logicParent.waitForPopupCreated = true;
      self._isPopupCreated = false;
      self._waitReadyDeferred = true;
      rebuildDeferred.addCallback(function() {
         self._getReadyDeferred();
         self._fixIos();
         runDelayed(function() {
            self._childControl._notifyOnSizeChanged();
            self._notifyManagerPopupCreated();
            runDelayed(function() {
               self._isPopupCreated = true;
               if (!self._waitReadyDeferred) { // Если попап создан и отработал getReadyDeferred - начинаем показ
                  self._callCallbackCreated();
               }
            });
         });
      });

      return rebuildDeferred;
   },

   _notifyManagerPopupCreated(): void {
      // Слой совместимости нотифаит событие manager'a за него, т.к. только он знает, когда будет построен старый шаблон
      const item = this._getManagerConfig();
      const popupItems = Controller.getContainer()._popupItems;
      // Нотифай события делаю в следующий цикл синхронизации после выставления позиции окну.
      this._notifyVDOM('managerPopupCreated', [item, popupItems], {bubbling: true});
   },

   _getDialogClasses: function() {
      // При fixed таргета нет => совместимость определяет это окно как type === 'dialog' и использует его позиционирование
      // Но на самом диалоге такой опции нет, т.к. это опция FloatArea => в этом случае класс диалога не вешаем
      if (this._options.type === 'dialog' && !this._options.fixed) {
         return ' ws-window-content';
      }
      return '';
   },

   _fixIos: function() {
      // крутейшая бага, айпаду не хватает перерисовки.
      // уже с такой разбирались, подробности https://online.sbis.ru/opendoc.html?guid=e9a6ea23-6ded-40da-9b9e-4c2d12647d84
      var container = this._childControl && this._childControl.getContainer();

      // не вызывается браузерная перерисовка. вызываю вручную
      if (container && Env.constants.browser.isMobileIOS) {
         container = container.get ? container.get(0) : container;
         setTimeout(function() {
            container.style.webkitTransform = 'scale(1)';

            // Если внутри контейнера верстка написана абсолютами с большой вложенностью, ios при scale(1) просто ее не показывает.
            // Пример ошибки https://online.sbis.ru/opendoc.html?guid=bb492dee-cc34-4e60-9174-5224ef47f047
            setTimeout(function() {
               container.style.webkitTransform = '';
            }, 200);
         }, 100);
      }
   },


   // AreaAbstract.js::getReadyDeferred
   // getReadyDeferred с areaAbstract, который даёт возможность отложить показ компонента в области, пока
   // не завершится деферред
   _getReadyDeferred: function() {
      var self = this;
      if (this._childControl.getReadyDeferred) {
         var def = this._childControl.getReadyDeferred();
         if (cInstance.instanceOfModule(def, 'Core/Deferred') && !def.isReady()) {
            def.addCallback(function() {
               self._waitReadyDeferred = false;
               if (self._isPopupCreated) { // Если попап создан и отработал getReadyDeferred - начинаем показ
                  self._callCallbackCreated();
               }
               self._notifyVDOM('controlResize', [], { bubbling: true });
            });
         } else {
            self._waitReadyDeferred = false;
         }
      } else {
         self._waitReadyDeferred = false;
      }
   },

   _callCallbackCreated: function() {
      this._logicParent.callbackCreated && this._logicParent.callbackCreated();
      this._logicParent.waitForPopupCreated = false;
      var self = this;
      if (this._waitClose) {
         this._waitClose = false;
         this.close();
      } else {
          self._setCustomHeaderAsync();
          runDelayed(function() {
            // Перед автофокусировкой нужно проверить, что фокус уже не находится внутри
            // панели, т. к. этот callback вызывается уже после полного цикла создания
            // старой области, и фокус могли проставить с прикладной стороны (в onInit,
            // onAfterShow, onReady, ...).
            // В таком случае, если мы позовем автофокус, мы можем сбить правильно поставленный
            // фокус.

            if (
               self._options.catchFocus &&
               self.getContainer().length &&
               !self.getContainer()[0].contains(document.activeElement)
            ) {
               doAutofocus(self.getContainer());
            }
         });
      }
   },

   _setCustomHeaderAsync() {
      // Каким-то чудом на медленных машинах не успевает построиться childControl.
      // Сам повторить не смог, ставлю защиту
      if (this._destroyed) {
         return;
      }
      if (!this._childControl) {
         runDelayed(() => {
            this._setCustomHeaderAsync();
         });
      } else {
         this._setCustomHeader();
      }
   },

   _afterMount: function(cfg) {
      this._options = cfg;
      this._enabled = cfg.hasOwnProperty('enabled') ? cfg.enabled : true;

      // Нам нужно пометить контрол замаунченым для слоя совместимости,
      // чтобы не создавался еще один enviroment для той же ноды

      if (makeInstanceCompatible && makeInstanceCompatible.newWave) {
         makeInstanceCompatible(this);
      } else {
         this.VDOMReady = true;
         this.deprecatedContr(this._options);
      }

      var self = this;

      // Переведем фокус сразу на окно, после построения шаблона уже сфокусируем внутренности
      // Если этого не сделать, то во время построения окна, при уничтожении контролов в других областях запустится восстановление фокуса,
      // которое восстановит его в последнюю активную область.
      if (self._options.catchFocus) {
         doAutofocus(self.getContainer());
      }

      // Для не-vdom контролов всегда вызывается _oldDetectNextActiveChildControl, в BaseCompatible
      // определена ветка в которой для vdom контролов используется новая система фокусов, а в случае
      // CompoundArea мы точно знаем, что внутри находится CompoundControl и фокус нужно распространять
      // по правилам AreaAbstract.compatible для контролов WS3
      self.detectNextActiveChildControl = self._oldDetectNextActiveChildControl;

      var container = self.getContainer()[0];
      container.wsControl = self;

      self._childConfig = self._options.templateOptions || {};
      self._compoundId = self._options._compoundId;

      self._pending = self._pending || [];
      self._pendingTrace = self._pendingTrace || [];
      self._waiting = self._waiting || [];

      self.__parentFromCfg = self._options.__parentFromCfg;

      // getParent() возвращает правильного предка, но у предка не зареган потомок.
      // регаем в предке CompoundArea и содержимое начинает искаться по getChildControlByName
      if (self.__parentFromCfg && self._registerToParent) {
         self._registerToParent(self.__parentFromCfg);
      }
      self.__openerFromCfg = self._options.__openerFromCfg;
      self._parent = self._options.parent;
      self._logicParent = self._options.parent;

      // Чтобы после применения makeInstanceCompatible BaseCompatible не стирал self._logicParent,
      // нужно в оставить его в опциях в поле _logicParent, logicParent или parent.
      // https://git.sbis.ru/sbis/ws/blob/rc-19.610/WS.Core/lib/Control/BaseCompatible/BaseCompatible.js#L956
      self._options._logicParent = self._options.parent;
      self._options.parent = null;

      self._notifyVDOM = self._notify;
      self._notify = self._notifyCompound;

      self._subscribeOnResize();

      self._windowResize = self._windowResize.bind(self);
      if (window) {
         window.addEventListener('resize', self._windowResize);
      }

      self._trackTarget(true);
      self._createBeforeCloseHandlerPending();

      self.rebuildChildControl().addCallback(function() {
         runDelayed(function() {
            runDelayed(function() {
               self._notifyCompound('onResize');
            });
         });
      });
   },

   _beforeUnmount: function() {
      this.__parentFromCfg = null;
      this.__openerFromCfg = null;
      this._parent = null;
      this._logicParent = null;
      if (this._options.popupComponent === 'recordFloatArea') {
         this.unsubscribeOnBeforeUnload();
      }
   },

   isOpened: function() {
      return true;
   },

   _isValidTarget: function(target) {
      var isValid = !target || target instanceof jQuery || (typeof Node !== 'undefined' && target instanceof Node);
      if (!isValid) {
         Logger.error(this._moduleName, 'Передано некорректное значение опции target', this);
      }
      return isValid;
   },

   _trackTarget: function(track) {
      var target = this._options.target;
      var self = this;

      // Защита от неправильно переданной опции target
      if (!this._options.trackTarget || !target || !this._isValidTarget(target)) {
         return;
      }

      // на всякий случай отписываемся, чтобы не было массовых подписок
      trackElement(target, false);

      if (track) {
         trackElement(target)
            .subscribe('onMove',
               function(event, offset, isInitial) {
                  if (!self.isDestroyed() && !isInitial) {
                     if (self._options.closeOnTargetScroll) {
                        // 1. Если показалась клавиатура, то не реагируем на onMove таргета
                        // 2. После скрытия клавиатуры тоже не реагируем.
                        if (!self._isIosKeyboardVisible()) {
                           if (!self._isKeyboardVisible) {
                              self.close();
                           } else {
                              self._isKeyboardVisible = false;
                           }
                        }
                     } else {
                        // Перепозиционируемся
                        self._notifyVDOM('controlResize', [], { bubbling: true });
                     }
                  }
               })
            .subscribe('onVisible',
               function(event, visibility) {
                  if (!self.isDestroyed() && !visibility) {
                     const parentVdomPopup = $(self._options.target).closest('.controls-Popup__template');
                     // Вдомные стековые окна, если перекрыты другими окнами из стека, скрываются через ws-hidden.
                     // PopupMixin реагирует на скритие таргета и закрывается.
                     // Делаю фикс, чтобы в этом случае попап миксин не закрывался
                     if (!parentVdomPopup.length || !parentVdomPopup.hasClass('ws-hidden')) {
                        self.close();
                     }
                  }
               });
      }
   },

   _isIosKeyboardVisible(): boolean {
      const isVisible =  Env.constants.browser.isMobileIOS && window.scrollY > 0;
      if (isVisible) {
         this._isKeyboardVisible = true;
      }
      return isVisible;
   },

   _setCustomHeader: function() {
      var hasHeader = !!this._options.caption;
      var customHeaderContainer = this._getCustomHeaderContainer();
      if (hasHeader || (this._options.popupComponent === 'dialog' && !customHeaderContainer.length && !this._options.hideCross)) {
         if (customHeaderContainer.length) {
            if ($('.ws-float-area-title', customHeaderContainer).length === 0) {
               customHeaderContainer.prepend('<div class="ws-float-area-title">' + this._options.caption + '</div>');
            }
            this._prependCustomHeader(customHeaderContainer);
         } else {
            customHeaderContainer = $('<div class="ws-window-titlebar"><div class="ws-float-area-title ws-float-area-title-generated">' + (this._options.caption || '') + '</div></div>');
            this.getContainer().prepend(customHeaderContainer);
            this.getContainer().addClass('controls-CompoundArea-headerPadding');
         }
      } else if (customHeaderContainer.length && this._options.type === 'dialog') {
         this._prependCustomHeader(customHeaderContainer);
      } else {
         this.getContainer().removeClass('controls-CompoundArea-headerPadding');
      }
      this._titleBar = customHeaderContainer;
      if (!this._options.maximize && customHeaderContainer.length && this._options.draggable) {
         // Drag поддержан на шапке DialogTemplate. Т.к. шапка в слое совместимости своя - ловим событие
         // mousedown на ней и проксируем его на dialogTemplate.
         customHeaderContainer.addClass('controls-CompoundArea__move-cursor');
         customHeaderContainer.bind('mousedown', this._headerMouseDown.bind(this));
      }
   },

   // Совместимость может принимать на себя фокус
   canAcceptFocus(): boolean {
      return this.isVisible();
   },

   setSize: function(sizes) {
      if (sizes.width) {
         this.getContainer().width(sizes.width);
      }
      if (sizes.height) {
         this.getContainer().height(sizes.height);
      }
      this._notifyVDOM('controlResize', null, { bubbling: true });
   },

   setCaption: function(newTitle) {
      this._setCaption(newTitle);
   },

   setTitle: function(newTitle) {
      this._setCaption(newTitle);
   },

   _setCaption: function(newTitle) {
      var titleContainer = $('.ws-float-area-title', this.getContainer());
      if (titleContainer.length) {
         titleContainer.text(newTitle);
      }
   },

   _getCustomHeaderContainer: function() {
      var customHeader = $('.ws-window-titlebar-custom', this._childControl.getContainer());

      // Ищем кастомную шапку только на первом уровне вложенности шаблона.
      // Внутри могут лежать другие шаблоны, которые могут использоваться отдельно в панелях,
      // На таких шаблонах есть свой ws-titlebar-custom, который не нужно учитывать.
      if (customHeader.length) {
         var nesting = 0;
         var parent;
         for (var i = 0; i < customHeader.length; i++) {
            parent = customHeader[i];

            // Ищем класс с кастомным заголовком, с вложенностью не более 5. 5 вычислено эмпирическим путем
            // Старая панель так умела
            while (parent !== this._childControl.getContainer()[0] && nesting < 5) {
               parent = parent.parentElement;
               nesting++;
            }
            if (nesting < 5) {
               var cH = $(customHeader[i]);
               cH.addClass('ws-window-titlebar');
               return cH;
            }
         }
      }

      return [];
   },

   _headerMouseDown: function(event) {
      var dialogTemplate = this._children.DialogTemplate;

      // Если мы кликнули в контрол в шапке - то работаем с этим контролом.
      // d'n'd работает, когда кликнули непосредственно в шапку
      var isClickedInControl = $(event.target).wsControl() !== this;
      if (dialogTemplate && !isClickedInControl) {
         dialogTemplate._startDragNDrop(new SyntheticEvent(event));
      }
   },

   _prependCustomHeader: function(customHead) {
      var container = $('.controls-DialogTemplate, .controls-StackTemplate', this.getContainer());
      container.prepend(customHead.addClass('controls-CompoundArea-custom-header'));
      this.getContainer().addClass('controls-CompoundArea-headerPadding');
      if (this._options.type === 'dialog') {
         var height = customHead.height();
         $('.controls-DialogTemplate', this.getContainer()).css('padding-top', height);
      }
   },

   _rebuildTitleBar: function() {
      this._removeCustomHeader();
      this._setCustomHeader();
      return true; // команда rebuildTitleBar не должна всплывать выше окна
   },

   _removeCustomHeader: function() {
      var customTitles = this.getContainer().find('.ws-window-titlebar-custom.controls-CompoundArea-custom-header');
      customTitles.remove();
   },

   handleCommand: function(commandName, args) {
      var arg = args[0];

      if (commandName === 'close' || commandName === 'hide') {
         this.close(arg);
         return true; // команда close не должна всплывать выше окна
      } if (commandName === 'ok') {
         this.close(true);
         return true; // команда ok не должна всплывать выше окна
      } if (commandName === 'cancel') {
         this.close(false);
         return true; // команда cancel не должна всплывать выше окна
      } if (this._options._mode === 'recordFloatArea' && commandName === 'save') {
         return this.save(arg);
      } if (commandName === 'rebuildTitleBar') {
         return this._rebuildTitleBar(arg);
      } if (commandName === 'delete') {
         return this.delRecord(arg);
      } if (commandName === 'print') {
         return this.print(arg);
      } if (commandName === 'printReport') {
         return this.printReport(arg);
      } if (commandName === 'resize' || commandName === 'resizeYourself') {
         this._notifyVDOM('controlResize', null, { bubbling: true });
      } else if (commandName === 'registerPendingOperation' || commandName === 'unregisterPendingOperation') {
         // перехватываем обработку операций только если CompoundControl не умеет обрабатывать их сам
         if (!cInstance.instanceOfMixin(this._childControl, 'Lib/Mixins/PendingOperationParentMixin')) {
            if (commandName === 'registerPendingOperation') {
               return this._registerChildPendingOperation(arg);
            }
            if (commandName === 'unregisterPendingOperation') {
               return this._unregisterChildPendingOperation(arg);
            }
         }
      } else {
         return CompoundArea.superclass.handleCommand.apply(this, arguments);
      }
   },

   _resizeHandler: function() {
      if (this._childControl) {
         this._childControl._notifyOnSizeChanged();
      }
   },
   closeHandler: function(e, arg) {
      e.stopPropagation();
      if (this._options._mode === 'recordFloatArea') {
         this._confirmationClose(arg);
      } else {
         this.close(arg);
      }
   },
   _confirmationClose: function(arg) {
      var self = this;
      if (!this._options.readOnly && this.getRecord().isChanged()) { // Запрашиваем подтверждение если сделали close()
         self._openConfirmDialog(false, true).addCallback(function(result) {
            switch (result) {
               case 'yesButton': {
                  self.updateRecord().addCallback(function() {
                     self.close(arg);
                  });
                  break;
               }
               case 'noButton': {
                  self.getRecord().rollback();
                  self.close(arg);
                  break;
               }
            }
         });
      } else {
         this.close(arg);
      }
   },
   _mouseenterHandler: function() {
      if (this._options.hoverTarget) {
         clearTimeout(this._hoverTimer);
         this._hoverTimer = null;
      }
   },
   _mouseleaveHandler: function(event) {
      // Если ховер ушел в панель связанную с текущей по опенерам - не запускаем таймер на закрытие
      if (this._options.hoverTarget && !this._isLinkedPanel(event)) {
         var _this = this;

         this._hoverTimer = setTimeout(function() {
            _this.hide();
         }, 1000);
      }
   },

   // По таргету с события определяем, связан ли компонент, в котором лежит таргет, с текущей панелью по опенерам
   _isLinkedPanel: function(event) {
      const target = $(event.nativeEvent.relatedTarget);
      const compoundArea = target.closest('.controls-CompoundArea');
      let opener;

      // don't check overlay
      if (target.hasClass('controls-Container__overlay')) {
         return true;
      }

      if (compoundArea.length) {
         opener = compoundArea[0].controlNodes[0].control.getOpener();
      }

      const vdomPopupContaner = target.closest('.controls-Popup');
      if (vdomPopupContaner.length) {
         const vdomPopup = vdomPopupContaner[0].controlNodes[0].control;
         if (vdomPopup) {
            opener = vdomPopup._options.opener;
         }
      }

      const popupMixin = target.closest('.controls-Menu, .controls-FloatArea');
      if (popupMixin.length) {
         opener = popupMixin.wsControl().getOpener();
      }
      return this._checkLink(opener);
   },

   // TODO https://online.sbis.ru/opendoc.html?guid=06867738-a18d-46e4-9904-f6528ba5fcf0
   _checkLink: function(opener) {
      while (opener && opener._moduleName !== this._moduleName) {
         opener = opener.getParent && opener.getParent();
      }
      return opener === this;
   },
   _keyDown: function(event) {
      if (!event.nativeEvent.shiftKey && event.nativeEvent.keyCode === Env.constants.key.esc) {
         this.close();
         if (Env.detection.safari) {
            // Need to prevent default behaviour if popup is opened
            // because safari escapes fullscreen mode on 'ESC' pressed
            event.preventDefault();
         }
         event.stopPropagation();
      }
   },
   _keyUp: function(event) {
      if (!event.nativeEvent.shiftKey && event.nativeEvent.keyCode === Env.constants.key.esc) {
         event.stopPropagation();
      }
   },

   _windowResize: function() {
      if (this._childControl) {
         this._childControl._onResizeHandler();
      }
   },

   _setCompoundAreaOptions: function(newOptions, popupOptions) {
      if (newOptions.record) { // recordFloatArea
         this._record = newOptions.record;
      }
      this._popupOptions = popupOptions;
      this._childControlName = newOptions.template;
      this._childConfig = newOptions.templateOptions || {};
   },

   reload: function() {
      if (this._popupOptions) {
         // set new sizes for popup
         var popupCfg = this._getManagerConfig();
         if (popupCfg && this._popupOptions.minWidth && this._popupOptions.maxWidth) {
            popupCfg.popupOptions.minWidth = this._popupOptions.minWidth;
            popupCfg.popupOptions.maxWidth = this._popupOptions.maxWidth;
            Controller.update(popupCfg.id, popupCfg.popupOptions);
         }
      }
      this._removeCustomHeader();
      this.rebuildChildControl();
   },
   setTemplate: function(template, templateOptions) {
      if (templateOptions) {
         this._childConfig = templateOptions;
      }
      this._childControlName = template;
      return this.rebuildChildControl();
   },
   getCurrentTemplateName: function() {
      return this._childControlName;
   },

   /* from api floatArea, window */

   getParent: function() {
      return this.__parentFromCfg || null;
   },
   getOpener: function() {
      return this.__openerFromCfg || null;
   },

   getTemplateName: function() {
      return this._template;
   },

   /* start RecordFloatArea */
   getRecord: function() {
      return this._record || this._options.record || this._options.templateOptions && this._options.templateOptions.record;
   },
   isNewRecord: function() {
      return this._options.newRecord;
   },

   setRecord: function(record, noConfirm) {
      var self = this;
      if (!noConfirm) {
         this.openConfirmDialog(true).addCallback(function(result) {
            if (result) {
               self._setRecord(record);
            }
         });
      } else {
         this._setRecord(record);
      }
   },
   _setRecord: function(record) {
      var oldRecord = this.getRecord(),
         context = this.getLinkedContext(),
         self = this,
         setRecordFunc = function() {
            if (self._options.clearContext) {
               context.setContextData(record);
            } else {
               context.replaceRecord(record);
            }
            if (self.isNewRecord()) {
               self._options.newRecord = record.getKey() === null;
            }
            self._record = record;
            self._notify('onChangeRecord', record, oldRecord);// Отдаем запись, хотя здесь ее можно получить простым getRecord + старая запись
         },
         result;
      result = this._notify('onBeforeChangeRecord', record, oldRecord);
      cDeferred.callbackWrapper(result, setRecordFunc.bind(this));
   },
   openConfirmDialog: function(noHide) {
      var self = this,
         deferred = new cDeferred();
      this._displaysConfirmDialog = true;
      deferred.addCallback(function(result) {
         self._notify('onConfirmDialogSelect', result);
         self._displaysConfirmDialog = false;
         return result;
      });
      if ((self.getRecord().isChanged() && !self.isSaved()) || self._recordIsChanged) {
         this._openConfirmDialog(false, true).addCallback(function(result) {
            switch (result) {
               case 'yesButton': {
                  if (self._result === undefined) {
                     self._result = true;
                  }
                  self.updateRecord().addCallback(function() {
                     self._confirmDialogToCloseActions(deferred, noHide);
                  }).addErrback(function() {
                     deferred.callback(false);
                  });
                  break;
               }
               case 'noButton': {
                  if (self._result === undefined) {
                     self._result = false;
                  }

                  /**
                   * Если откатить изменения в записи, поля связи, которые с ней связанны, начнут обратно вычитываться, если были изменены, а это уже не нужно
                   * Положили rollback обратно, поля связи уже так себя вести не должны, а rollback реально нужен
                   * Оставляем возможность проводить сохранение записи в прикладном коде. По задаче Алены(см коммент вверху) ошибка не повторяется, т.к. там уже юзают formController
                   */
                  self._confirmDialogToCloseActions(deferred, noHide);
                  break;
               }
               default: {
                  deferred.callback(false);
               }
            }
         });
      } else {
         self._confirmDialogToCloseActions(deferred, noHide);
      }
      return deferred;
   },
   _confirmDialogToCloseActions: function(deferred, noHide) {
      // EventBus.channel('navigation').unsubscribe('onBeforeNavigate', this._onBeforeNavigate, this);
      deferred.callback(true);
      if (!noHide) {
         this.close.apply(this, arguments);
      }
   },


   setReadOnly: function(isReadOnly) {
      if (!this.isDestroyed()) {
         this._isReadOnly = isReadOnly;
         if (this._childControl) {
            this._setEnabledForChildControls(!isReadOnly);
         } else {
            this._childCreatedDfr.addCallback(function() {
               this._setEnabledForChildControls(!isReadOnly);
            }.bind(this));
         }
      }
   },
   isReadOnly: function() {
      return this._isReadOnly;
   },


   setSaveDiffOnly: function() {
      DialogRecord.prototype.setSaveDiffOnly.apply(this, arguments);
   },
   ok: function() {
      DialogRecord.prototype.ok.apply(this, arguments);
   },
   _setEnabledForChildControls: function() {
      DialogRecord.prototype._setEnabledForChildControls.apply(this, arguments);
   },
   _showLoadingIndicator: function() {
      DialogRecord.prototype._showLoadingIndicator.apply(this, arguments);
   },
   _hideLoadingIndicator: function() {
      DialogRecord.prototype._hideLoadingIndicator.apply(this, arguments);
   },
   isAllReady: function() {
      return DialogRecord.prototype.isAllReady.apply(this, arguments);
   },
   getReports: function() {
      return DialogRecord.prototype.getReports.apply(this, arguments);
   },
   _printMenuItemsIsChanged: function() {
      return DialogRecord.prototype._printMenuItemsIsChanged.apply(this, arguments);
   },
   _createPrintMenu: function() {
      return DialogRecord.prototype._createPrintMenu.apply(this, arguments);
   },
   showReportList: function() {
      return DialogRecord.prototype.showReportList.apply(this, arguments);
   },
   printReport: function() {
      return DialogRecord.prototype.printReport.apply(this, arguments);
   },
   _showReport: function() {
      return DialogRecord.prototype._showReport.apply(this, arguments);
   },
   print: function() {
      return DialogRecord.prototype.print.apply(this, arguments);
   },
   _hideWindow: function() {
   },
   _getTitle: function() {
      return document.title;
   },

   _openConfirmDialog: function() {
      return DialogRecord.prototype._openConfirmDialog.apply(this, arguments);
   },
   isSaved: function() {
      return DialogRecord.prototype.isSaved.apply(this, []);
   },
   _unbindBeforeUnload: function() {
      DialogRecord.prototype._unbindBeforeUnload.apply(this);
   },
   _beforeUnloadHandler: function() {
      return DialogRecord.prototype._beforeUnloadHandler.apply(this);
   },
   subscribeOnBeforeUnload: function() {
      DialogRecord.prototype.subscribeOnBeforeUnload.apply(this);
   },
   unsubscribeOnBeforeUnload: function() {
      DialogRecord.prototype.unsubscribeOnBeforeUnload.apply(this);
   },
   updateRecord: function() {
      return DialogRecord.prototype.updateRecord.apply(this, arguments);
   },
   save: function() {
      return DialogRecord.prototype.save.apply(this, arguments);
   },
   delRecord: function() {
      return DialogRecord.prototype.delRecord.apply(this, arguments);
   },
   _processError: function(error) {
      DialogRecord.prototype._processError.apply(this, [error]);
   },

   /* end RecordFloatArea */

   isVisible: function() {
      if (this._options.autoShow === false) {
         return this._isVisible;
      }
      return true;
   },

   show: function() {
      this._toggleVisible(true);
   },

   hide: function() {
      this.close();
   },
   _createBeforeCloseHandlerPending(): void {
      const self = this;
      self._notifyVDOM('registerPending', [new cDeferred(), {
         showLoadingIndicator: false,
         validateCompatible(): boolean {
            if (cInstance.instanceOfModule(self._childControl, 'SBIS3.CONTROLS/FormController')) {
               // _beforeCloseHandlerResult = true выставляется, если не отменили закрытие на onBeforeClose,
               // соответственно второй раз закрытие звать не нужно
               if (self._beforeCloseHandlerResult !== true) {
                  self.close();
               }
               return !self._beforeCloseHandlerResult;
            }
            return false;
         }
      }], { bubbling: true });
   },
   close: function(arg) {
      // Если из обработчика на onBeforeClose вызвали повторное закрытие с новыми аргументами,
      // То защита не даст повторно запустить закрытие окна, но актуальные аргументы обработать нужно.
      this._closeArgs = arg;
      if (!this.isDestroyed()) {
         if (this._logicParent.waitForPopupCreated) {
            this._waitClose = true;
            return;
         }

         if (this._options.autoCloseOnHide === false) {
            if (this._isVisible !== false) {
               this._toggleVisible(false);
               this._notifyCompound('onClose', arg);
               this._notifyCompound('onAfterClose', arg);
            }
         } else if (this._childControl && !this._childControl.isDestroyed()) {
            // Закрытие панели могут вызвать несколько раз подряд
            if (this._isClosing) {
               return false;
            }
            this._isClosing = true;
            if (this._notifyCompound('onBeforeClose', this._closeArgs) !== false) {
               this._beforeCloseHandlerResult = true;
               this._notifyVDOM('close', null, { bubbling: true });
               this._notifyCompound('onClose', this._closeArgs);
               this._notifyCompound('onAfterClose', this._closeArgs);
            } else {
               this._beforeCloseHandlerResult = false;
            }
            this._isClosing = false;
         }
         return true;
      }
   },

   _toggleVisibleClass: function(className, visible) {
      className = className || '';
      if (visible) {
         className = className.replace(hiddenRe, '');
      } else if (className.indexOf('ws-hidden') === -1) {
         className += ' ws-hidden';
      }
      return className;
   },
   _toggleVisible: function(visible) {
      var
         prevVisible = this._isVisible,
         popupContainer = this.getContainer().closest('.controls-Popup')[0],
         id = this._getPopupId(),
         popupConfig = this._getManagerConfig(),
         self = this;

      if (popupConfig) {
         // Удалим или поставим ws-hidden в зависимости от переданного аргумента
         popupConfig.popupOptions.className = this._toggleVisibleClass(popupConfig.popupOptions.className, visible);

         // Сразу обновим список классов на контейнере, чтобы при пересинхронизации он не "прыгал"
         popupContainer.className = this._toggleVisibleClass(popupContainer.className, visible);

         // Если попап модальный, нужно чтобы Manager показал/скрыл/переместил оверлей
         // Из popupConfig.popupOptions.modal узнаем, является ли попап модальным
         if (popupConfig.popupOptions.modal) {
            // Текущее состояние модальности задается в popupConfig
            popupConfig.modal = visible;

            // Изменили конфигурацию попапа, нужно, чтобы менеджер увидел эти изменения
            Controller.reindex();
            Controller.update(id, popupConfig.popupOptions);
         }

         if (visible && !prevVisible) {
            // После изменения видимости, изменятся размеры CompoundArea, из-за чего будет пересчитана позиция
            // окна на экране. Чтобы не было видно "прыжка" со старой позиции (вычисленной при старых размерах)
            // на новую, поставим на время пересчета класс `ws-invisible`
            popupConfig.popupOptions.className += ' ws-invisible';
            popupContainer.className += ' ws-invisible';

            // Также проставим флаг, обозначающий что попап скрыт на время пересчета позиции
            popupConfig.isHiddenForRecalc = true;

            var popupAfterUpdated = function popupAfterUpdated(item, container) {
               if (item.isHiddenForRecalc) {
                  // Если попап был скрыт `ws-invisible` на время пересчета позиции, нужно его отобразить
                  item.isHiddenForRecalc = false;

                  // Перед тем как снять ws-insivible - пересчитаем размеры попапа, т.к. верстка могла измениться
                  self._notifyVDOM('controlResize', [], { bubbling: true });

                  runDelayed(function() {
                     item.popupOptions.className = item.popupOptions.className.replace(invisibleRe, '');
                     container.className = container.className.replace(invisibleRe, '');
                     if (self._options.catchFocus) {
                        // автофокусировка теперь здесь, после того как все выехало, оживилось и отобразилось
                        // если звать автофокусировку в момент когда контейнер visibility: hidden, не сфокусируется!
                        doAutofocus(self.getContainer());
                     }
                  });
               }
            };

            // Нужно убрать класс `ws-invisible` после того как будет пересчитана позиция. Чтобы понять, когда
            // это произошло, нужно пропатчить elementAfterUpdated в контроллере попапа, чтобы он поддерживал
            // CompoundArea
            if (!popupConfig.controller._modifiedByCompoundArea) {
               popupConfig.controller._modifiedByCompoundArea = true;
               self._popupController = popupConfig.controller;
               self._baseAfterUpdate = popupConfig.controller._elementAfterUpdated;
               popupConfig.controller._elementAfterUpdated = callNext(
                  popupConfig.controller._elementAfterUpdated,
                  popupAfterUpdated
               );
            }

            // если не попадаем в elementAfterUpdated потому что он случился раньше, то попадаем хотя бы по таймауту
            setTimeout(popupAfterUpdated.bind(self, popupConfig, popupContainer), 2000);
         }

         this._isVisible = visible;

         if (visible !== prevVisible) {
            // Совместимость с FloatArea. После реального изменении видимости, нужно сообщать об этом,
            // стреляя событием onAfterVisibilityChange
            this._notifyCompound('onAfterVisibilityChange', visible);
         }
      }
   },
   setOffset: function(newOffset) {
      var popupConfig = this._getManagerConfig();
      if (popupConfig) {
         popupConfig.popupOptions.offset = popupConfig.popupOptions.offset || {};

         popupConfig.popupOptions.offset.horizontal = newOffset.x || 0;
         popupConfig.popupOptions.offset.vertical = newOffset.y || 0;

         Controller.update(this._getPopupId(), popupConfig.popupOptions);
      }
   },
   _getManagerConfig: function() {
      var id = this._getPopupId();
      return id ? Controller.find(id) : undefined;
   },
   _getPopupId: function() {
      var popupContainer = this.getContainer().closest('.controls-Popup')[0];
      var controlNode = popupContainer && popupContainer.controlNodes && popupContainer.controlNodes[0];
      return controlNode && controlNode.control._options.id;
   },
   _getTemplateComponent: function() {
      return this._childControl;
   },
   destroy: function() {
      if (this.isDestroyed()) {
         return;
      }
      this._trackTarget(false);

      // Unregister CompoundArea's inner Event/Listener, before its
      // container is destroyed by compatibility layer
      this._unregisterEventListener();
      if (window) {
         window.removeEventListener('resize', this._windowResize);
      }

      if (this._popupController && this._baseAfterUpdate) {
         this._popupController._elementAfterUpdated = this._baseAfterUpdate;
         this._popupController._modifiedByCompoundArea = false;
      }

      var ops = this._producedPendingOperations;
      while (ops.length > 0) {
         this._unregisterPendingOperation(ops[0]);
      }
      var
         operation = this._allChildrenPendingOperation,
         message;

      if (this._isFinishingChildOperations) {
         message = 'У контрола ' + this._moduleName + ' (name = ' + this.getName() + ', id = ' + this.getId() + ') вызывается метод destroy, ' +
            'хотя у него ещё есть незавёршённые операции (свои или от дочерних контролов';
         Logger.error('Lib/Mixins/PendingOperationParentMixin: ' + message, this);
      }

      this._childPendingOperations = [];// cleanup им вызывать не надо - всё равно там destroy будет работать, у дочернего контрола
      if (this._allChildrenPendingOperation) {
         this._allChildrenPendingOperation = null;
         this._unregisterPendingOperation(operation);
      }

      // В _afterMount CompoundArea регистрируется у родителя, нужно
      // эту связь разорвать
      if (this.__parentFromCfg) {
         this._clearInformationOnParentFromCfg();
      }

      CompoundArea.superclass.destroy.apply(this, arguments);
   },

   _clearInformationOnParentFromCfg: function() {
      var
         parent = this.__parentFromCfg,
         id = this._id,
         name = this._options.name,
         tabindex = this._options.tabindex;

      if (parent._childsMapId) {
         var mapId = parent._childsMapId[id];
         if (typeof mapId !== 'undefined') {
            if (parent._childControls) {
               delete parent._childControls[mapId];
            }
            if (parent._childContainers) {
               delete parent._childContainers[mapId];
            }
            delete parent._childsMapId[id];
         }
      }

      if (parent._childsMapName) {
         delete parent._childsMapName[name || id];
      }

      if (parent._childsTabindex) {
         delete parent._childsTabindex[tabindex];
      }
   },

   _unregisterEventListener: function() {
      var
         element = this.getContainer()[0],
         controlNodes = element && element.controlNodes,
         controlNode;

      if (controlNodes) {
         // Find CompoundArea's control node
         for (var i = 0; i < controlNodes.length; i++) {
            if (controlNodes[i].control === this) {
               controlNode = controlNodes[i];
               break;
            }
         }

         if (controlNode) {
            // Get event listener's control node
            var
               listenerNode = controlNode.childrenNodes && controlNode.childrenNodes[1],
               listener = listenerNode && listenerNode.control;

            if (listener) {
               // Tell event listener to unregister from its Registrar to
               // prevent leaks
               listener._notify('unregister', ['controlResize', listener], { bubbling: true });
            }
         }
      }
   },

   _removeOpFromCollections: function(operation) {
      removeOperation(operation, this._producedPendingOperations);
      removeOperation(operation, allProducedPendingOperations);
   },

   _registerPendingOperation: function(name, finishFunc, registerTarget) {
      var
         name = this._moduleName ? this._moduleName + '/' + name : name,
         operation = {
            name: name,
            finishFunc: finishFunc,
            cleanup: null,
            control: this,
            registerTarget: registerTarget
         };

      operation.cleanup = this._removeOpFromCollections.bind(this, operation);
      if (operation.registerTarget) {
         operation.registerTarget.sendCommand('registerPendingOperation', operation);

         this._producedPendingOperations.push(operation);
         allProducedPendingOperations.push(operation);
      }
      return operation;
   },

   _unregisterPendingOperation: function(operation) {
      operation.cleanup();

      if (operation.registerTarget) {
         operation.registerTarget.sendCommand('unregisterPendingOperation', operation);
      }
   },

   getAllPendingOperations: function() {
      return allProducedPendingOperations;
   },

   getPendingOperations: function() {
      return this._producedPendingOperations;
   },

   _registerChildPendingOperation: function(operation) {
      var name, finishFunc;

      this._childPendingOperations.push(operation);

      if (!this._allChildrenPendingOperation) {
         name = (this._moduleName ? this._moduleName + '/' : '') + 'allChildrenPendingOperation';
         finishFunc = this.finishChildPendingOperations.bind(this);

         this._allChildrenPendingOperation = this._registerPendingOperation(name, finishFunc, this.getParent());
      }

      return true;
   },

   _unregisterChildPendingOperation: function(operation) {
      var
         childOps = this._childPendingOperations,
         allChildrenPendingOperation;

      if (childOps.length > 0) {
         removeOperation(operation, childOps);
         if (childOps.length === 0) {
            allChildrenPendingOperation = this._allChildrenPendingOperation;
            this._allChildrenPendingOperation = null;
            Env.coreDebug.checkAssertion(!!allChildrenPendingOperation);

            this._unregisterPendingOperation(allChildrenPendingOperation);
         }
      }
      return true;
   },
   finishChildPendingOperations: function(needSavePendings) {
      var
         self = this,
         checkFn = function(prevResult) {
            var
               childOps = self._childPendingOperations,
               result, allChildrenPendingOperation;

            function cleanupFirst() {
               if (childOps.length > 0) {
                  childOps.shift().cleanup();
               }
            }

            if (finishResultOk(prevResult) && childOps.length > 0) {
               result = childOps[0].finishFunc(needSavePendings);
               if (result instanceof cDeferred) {
                  result.addCallback(function(res) {
                     if (finishResultOk(res)) {
                        cleanupFirst();
                     }
                     return checkFn(res);
                  }).addErrback(function(res) {
                     return checkFn(res);
                  });
               } else {
                  if (finishResultOk(result)) {
                     cleanupFirst();
                  }
                  result = checkFn(result);
               }
            } else {
               allChildrenPendingOperation = self._allChildrenPendingOperation;
               if (childOps.length === 0 && allChildrenPendingOperation) {
                  self._allChildrenPendingOperation = null;
                  self._unregisterPendingOperation(allChildrenPendingOperation);
               }
               self._isFinishingChildOperations = false;
               result = prevResult;
            }
            return result;
         };

      if (!this._isFinishingChildOperations) {
         this._finishPendingQueue = cDeferred.success(true);
         this._isFinishingChildOperations = true;

         this._finishPendingQueue.addCallback(checkFn);
      }

      return this._finishPendingQueue;
   },

   getChildPendingOperations: function() {
      return this._childPendingOperations;
   },

   /**
    *
    * Добавить отложенную асинхронную операцию в очередь ожидания окна.
    * @param {Core/Deferred} dOperation Отложенная операция.
    * @returns {Boolean} "true", если добавление операции в очередь успешно.
    * @see waitAllPendingOperations
    */
   addPendingOperation: function(dOperation) {
      var result = !!(dOperation && (dOperation instanceof cDeferred));
      if (result) {
         this._pending.push(dOperation);
         this._pendingTrace.push(Env.coreDebug.getStackTrace());
         dOperation.addBoth(this._checkPendingOperations.bind(this));
      }
      return result;
   },
   _finishAllPendingsWithSave: function() {
      this._pending.forEach(function(pending) {
         pending.callback(true);
      });
   },

   moveToTop: function() {},

   /**
    * Получение информации о добавленных пендингах, включая информацию, откуда был добавлен пендинг
    * @returns {Array} Массив объектов, хранящих пендинг и информацию, откуда был добавлен пендинг
    */
   getAllPendingInfo: function() {
      var res = [],
         self = this;
      this._pending.forEach(function(pending, index) {
         res.push({
            pending: pending,
            trace: self._pendingTrace[index]
         });
      });
      return res;
   },

   /**
    *
    * Добавить асинхронное событие на завершение всех отложенных операций.
    * Добавить асинхронное событие, которое сработает в момент завершения всех отложенных операций,
    * добавленных с помощью {@link addPendingOperation}.
    * Если очередь пуста, то сработает сразу.
    * Если попытаться передать Deferred, находящийся в каком-либо состоянии (успех, ошибка), то метод вернет false и
    * ожидающий не будет добавлен в очередь.
    * @param {Core/Deferred} dNotify Deferred-объект, ожидающий завершения всех отложенных операций.
    * @returns {Boolean} "true", если добавление в очередь ожидающих успешно.
    * @see addPendingOperation
    */
   waitAllPendingOperations: function(dNotify) {
      if (dNotify && (dNotify instanceof cDeferred) && !dNotify.isReady()) {
         if (this._pending.length === 0) {
            dNotify.callback();
         } else {
            this._waiting.push(dNotify);
         }
         return true;
      }
      return false;
   },
   _checkPendingOperations: function(res) {
      var totalOps = this._pending.length, result;

      // Сперва отберем Deferred, которые завершились
      result = this._pending.filter(function(dfr) {
         return dfr.isReady();
      });

      // Затем получим их результаты
      result = result.map(function(dfr) {
         return dfr.getResult();
      });

      // If every waiting op is completed
      if (result.length == totalOps) {
         this._pending = [];
         this._pendingTrace = [];
         while (this._waiting.length > 0) {
            this._waiting.pop().callback(result);
         }
      }

      // if res instanceof Error, return it as non-captured
      return res;
   }
});

export default CompoundArea;
