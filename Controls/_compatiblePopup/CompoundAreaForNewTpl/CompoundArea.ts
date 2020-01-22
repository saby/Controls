/**
 * Created by as.krasilnikov on 13.04.2018.
 */

import CompoundControl = require('Lib/Control/CompoundControl/CompoundControl');
import template = require('wml!Controls/_compatiblePopup/CompoundAreaForNewTpl/CompoundArea');
import ManagerWrapperController from 'Controls/Popup/Compatible/ManagerWrapper/Controller';
import WindowManager = require('Core/WindowManager');
import ComponentWrapper from './ComponentWrapper';
import control = require('Core/Control');
import clone = require('Core/core-clone');
import makeInstanceCompatible = require('Core/helpers/Hcontrol/makeInstanceCompatible');
import Vdom = require('Vdom/Vdom');
import Deferred = require('Core/Deferred');
import {constants} from 'Env/Env';
import {StackStrategy} from 'Controls/popupTemplate';
import {load} from 'Core/library';
import 'css!theme?Controls/compatiblePopup';
import {Logger} from 'UI/Utils';

/**
 * Слой совместимости для открытия новых шаблонов в старых попапах
 * */
const moduleClass = CompoundControl.extend({
   _dotTplFn: template,
   $protected: {
      _isVDomTemplateMounted: false,
      _options: {
         isDefaultOpener: true // Останавливаем поиск опенера(Vdom.DefaultOpenerFinder) на compoundArea
      },
      _closeTimerId: null
   },
   init(): void {
      moduleClass.superclass.init.apply(this, arguments);
      this._listeners = [];
      this._onCloseHandler = this._onCloseHandler.bind(this);
      this._keydownHandler = this._keydownHandler.bind(this);
      this._onResultHandler = this._onResultHandler.bind(this);
      this._onResizeHandler = this._onResizeHandler.bind(this);
      this._beforeCloseHandler = this._beforeCloseHandler.bind(this);
      this._onRegisterHandler = this._onRegisterHandler.bind(this);
      this._onMaximizedHandler = this._onMaximizedHandler.bind(this);
      this._onResizingLineHandler = this._onResizingLineHandler.bind(this);
      this._onCloseHandler.control = this._onResultHandler.control = this;

      this.getContainer().bind('keydown', this._keydownHandler);

      this._panel = this.getParent();
      this._panel.subscribe('onBeforeClose', this._beforeCloseHandler);
      this._panel.subscribe('onAfterClose', this._callCloseHandler.bind(this));
      this._maximized = !!this._options.templateOptions.maximized;

      // Если внутри нас сработал вдомный фокус (активация), нужно активироваться
      // самим с помощью setActive. Тогда и CompoundControl'ы-родители узнают
      // об активации.
      // Так как вдом зовет событие activated на каждом активированном контроле,
      // можно просто слушать это событие на себе и активироваться если оно
      // сработает.
      this._activatedHandler = this._activatedHandler.bind(this);
      this.subscribe('activated', this._activatedHandler);

      // То же самое с деактивацией, ее тоже нужно делать через setActive,
      // чтобы старый контрол-родитель мог об этом узнать.
      this._deactivatedHandler = this._deactivatedHandler.bind(this);
      this.subscribe('deactivated', this._deactivatedHandler);

      // фокус уходит, нужно попробовать закрыть ненужные панели
      this.subscribe('onFocusOut', this._onFocusOutHandler.bind(this));

      // Здесь заранее можно построить ManagerWrapper, т.к. либа popupTemplate уже точно загружена и новые зависимости не прилетят
      import('Controls/popup').then((PopupLib) => {
         PopupLib.BaseOpener.getManager();
      });

      this._runInBatchUpdate('CompoundArea - init - ' + this._id, function() {
         const def = new Deferred();

         if (this._options.innerComponentOptions) {
            if (this._options.innerComponentOptions._template) {
               this._options.template = this._options.innerComponentOptions._template;
            }
            this._saveTemplateOptions(this._options.innerComponentOptions);
            Logger.error('Шаблон CompoundArea задается через опцию template. Конфигурация шаблона через опцию templateOptions', this);
         }

         this._modifyInnerOptionsByHandlers();

         const deps = [
            this._loadTemplate(this._options.template),
            import('Vdom/Vdom')
         ];

         // Совместимость используется только на онлайне. Могу напрямую зарекваерить контроллер Лобастова для получения конфига
         if (this._options._popupOptions.propStorageId) {
            deps.push(import('ViewSettings/controller'));
         }

         Promise.all(deps).then((result) => {
            this._settingsController = result[2] && result[2].Settings;
            if (this._settingsController && this._settingsController.getSettings) {
               this._getSettingsWidth().then((width) => {
                  if (width) {
                     this._updateFloatAreaWidth(width);
                  }
                  this._createTemplate(def);
               });
            } else {
               this._createTemplate(def);
            }
         });

         return def;
      });
   },

   _createTemplate(def): void {
      // Пока грузили шаблон, компонент могли задестроить
      if (this.isDestroyed()) {
         return;
      }
      const wrapper = $('.vDomWrapper', this.getContainer());
      if (wrapper.length) {
         const wrapperOptions = {
            template: this._options.template,
            templateOptions: this._options.templateOptions,

            // Нужно передать себя в качестве родителя, чтобы система фокусов
            // могла понять, где находятся вложенные компоненты
            parent: this,
            popupOptions: this._getNewPopupOptions()
         };
         // todo откатил потому что упала ошибка https://online.sbis.ru/opendoc.html?guid=d8cc1098-3d3a-4fed-800c-81b4e6ed2319
         if (this._options.isWS3Compatible) {
            wrapperOptions.iWantBeWS3 = true;
         }
         this._vDomTemplate = control.createControl(ComponentWrapper, wrapperOptions, wrapper);
         if (this._options.isWS3Compatible) {
            makeInstanceCompatible(this._vDomTemplate);
         }
         this._afterMountHandler();
         this._afterUpdateHandler();
      } else {
         this._isVDomTemplateMounted = true;
         this.sendCommand('close');
      }

      def.callback();
   },

   _getSettingsWidth(): Promise<null|number> {
      return new Promise((resolve) => {
         const propStorageId = this._options._popupOptions.propStorageId;
         if (propStorageId) {
            this._settingsController.getSettings([propStorageId]).then((storage) => {
               if (storage && storage[propStorageId]) {
                  this._options._popupOptions.width = storage[propStorageId];
               }
               resolve(storage[propStorageId]);
            });
         } else {
            resolve();
         }
      });
   },

   _setSettingsWidth(width: number): void {
      const propStorageId = this._options._popupOptions.propStorageId;
      if (propStorageId && width && this._settingsController && this._settingsController.setSettings) {
         this._settingsController.setSettings({[propStorageId]: width});
      }
   },

   _loadTemplate(tpl: string|Function): Promise<Function> {
      if (typeof tpl === 'string') {
         return load(tpl);
      }
      return Promise.resolve(tpl);
   },

   _keydownHandler(e) {
      if (!e.shiftKey && e.which === constants.key.esc) {
         e.stopPropagation();
         this._onCloseHandler();
      }
   },

   _createEventProperty(handler) {
      return {
         fn: this._createFnForEvents(handler),
         args: []
      };
   },

   // Создаем обработчик события, который положим в eventProperties узла
   _createFnForEvents(callback) {
      const fn = callback;

      // Нужно для событийного канала vdom'a.
      // У fn.control позовется forceUpdate. На compoundArea его нет, поэтому ставим заглушку
      fn.control = {
         _forceUpdate: this._forceUpdate
      };
      return fn;
   },

   _beforeCloseHandler(event) {
      // Если позвали закрытие панели до того, как построился VDOM компонент - дожидаемся когда он построится
      // Только после этого закрываем панель
      if (!this._isVDomTemplateMounted) {
         this._closeAfterMount = true;
         event.setResult(false);
      } else {
         this.popupBeforeDestroyed();
         if (this._vDomTemplate.hasRegisteredPendings()) {
            event.setResult(false);
            // FloatArea после отмены закрытия на beforeClose не сбрасывает state === hide,
            // из-за чего закрытие после завершения пендингов не отрабатывает, т.к. панель считает что уже закрывается.
            // Сбрасываю состояние только в совместимости, старый контрол не трогаю.
            this.getParent()._state = '';
            this._finishPendingOperations();
         }
      }
   },

   popupBeforeDestroyed() {
      // Эмулируем событие вдомного попапа managerPopupBeforeDestroyed для floatArea
      const ManagerWrapper = ManagerWrapperController.getManagerWrapper();
      if (ManagerWrapper) {
         const container = this._container[0] ? this._container[0] : this._container;
         ManagerWrapper._beforePopupDestroyedHandler(null, {}, [], container);
      }
   },

   _finishPopupOpenedDeferred() {
       // Сообщим окну о том, что шаблон построен
      if (this.getParent()._finishPopupOpenedDeferred) {
         this.getParent()._finishPopupOpenedDeferred();
      }
   },

   // Обсудили с Д.Зуевым, другого способа узнать что vdom компонент добавился в dom нет.
   _afterMountHandler() {
      const self = this;
      self._baseAfterMount = self._vDomTemplate._afterMount;
      self._vDomTemplate._afterMount = function() {
         self._options.onOpenHandlerEvent && self._options.onOpenHandlerEvent('onOpen');
         self._options.onOpenHandler && self._options.onOpenHandler('onOpen');
         self._baseAfterMount.apply(this, arguments);
         if (self._options._initCompoundArea) {
            self._notifyOnSizeChanged(self, self);
            self._options._initCompoundArea(self);
            self._options._initCompoundArea = null;
         }
         self._finishPopupOpenedDeferred();
         self._isVDomTemplateMounted = true;
         if (self._closeAfterMount) {
            self.sendCommand('close');
            self.popupBeforeDestroyed();
         } else if (self._options.catchFocus) {
            self._vDomTemplate.activate && self._vDomTemplate.activate();
         }
      };
   },

   // Обсудили с Д.Зуевым, другого способа узнать что vdom компонент обновился - нет.
   _afterUpdateHandler() {
      const self = this;
      self._baseAfterUpdate = self._vDomTemplate._afterUpdate;
      self._vDomTemplate._afterUpdate = function() {
         self._baseAfterUpdate.apply(this, arguments);
         if (self._isNewOptions) {
            // костыль от дубровина не позволяет перерисовать окно, если prevHeight > текущей высоты.
            // Логику в панели не меняю, решаю на стороне совместимости
            self._panel._prevHeight = 0;
            self._panel._recalcPosition && self._panel._recalcPosition();
            self._panel.getContainer().closest('.ws-float-area').removeClass('ws-invisible');
            self._isNewOptions = false;
         }
      };
   },
   _modifyInnerOptionsByHandlers() {
      const innerOptions = this._options.templateOptions;
      innerOptions._onCloseHandler = this._onCloseHandler;
      innerOptions._onResultHandler = this._onResultHandler;
      innerOptions._onResizeHandler = this._onResizeHandler;
      innerOptions._onRegisterHandler = this._onRegisterHandler;
      innerOptions._onMaximizedHandler = this._onMaximizedHandler;
      innerOptions._onResizingLineHandler = this._onResizingLineHandler;
   },
   _onResizeHandler() {
      this._notifyOnSizeChanged();
      ManagerWrapperController.startResizeEmitter();
   },
   _onCloseHandler(): void {
      // We need to delay reaction to close event, because it shouldn't
      // synchronously destroy all child controls of CompoundArea

      // protect against multi call
      if (this._closeTimerId) {
         return;
      }
      this._closeTimerId = setTimeout(() => {
         this._closeTimerId = null;
         this._finishPendingOperations();
      }, 0);
   },
   _finishPendingOperations(): void {
      this._vDomTemplate.finishPendingOperations().addCallback(() => {
         this.sendCommand('close', this._result);
         this._result = null;
      });
   },
   _callCloseHandler() {
      this._options.onCloseHandler && this._options.onCloseHandler(this._result);
      this._options.onCloseHandlerEvent && this._options.onCloseHandlerEvent('onClose', [this._result]);
   },
   _onFocusOutHandler(event, destroyed, focusedControl) {
      // если фокус уходит со старой панели на новый контрол, старых механизм не будет вызван, нужно вручную звать onaActivateWindow
      if (focusedControl) {
         if (focusedControl._template) {
            if (!focusedControl._doneCompat) {
               makeInstanceCompatible(focusedControl);
            }
            WindowManager.onActivateWindow(focusedControl);
         } else {
            // должно само работать!
         }
      }
   },
   _onResultHandler() {
      this._result = Array.prototype.slice.call(arguments, 1); // first arg - event;

      this._options.onResultHandler && this._options.onResultHandler.apply(this, this._result);
      this._options.onResultHandlerEvent && this._options.onResultHandlerEvent('onResult', this._result);
   },
   _onRegisterHandler(event, eventName, emitter, handler) {
      // Пробрасываю событие о регистрации listener'ов до регистраторов, которые лежат в managerWrapper и физически
      // не могут отловить событие
      if (handler) {
         this._listeners.push({
            event,
            eventName,
            emitter
         });
         ManagerWrapperController.registerListener(event, eventName, emitter, handler);
      } else {
         ManagerWrapperController.unregisterListener(event, eventName, emitter);
      }
   },

   onBringToFront() {
      this._vDomTemplate && this._vDomTemplate.activate();
   },

   _getFloatAreaStackRootCoords() {
      const stackRootContainer = document.querySelector('.ws-float-area-stack-root');
      let right = 0;
      const top = 0;
      if (stackRootContainer) {
         right = document.body.clientWidth - stackRootContainer.getBoundingClientRect().right;
      }
      return {top, right};
   },

   _onResizingLineHandler(offset: number): void {
      if (!this._panel._updateAreaWidth) {
         return;
      }
      const strategyData = this._getStrategyData(offset);
      this._setSettingsWidth(strategyData.width);
      this._options._popupOptions.width = strategyData.width;
      const newOptions = clone(this._options.templateOptions);

      this._updateFloatAreaWidth(strategyData.width, newOptions);
      this._vDomTemplate.setPopupOptions(this._getNewPopupOptions(offset));
   },

    _getNewPopupOptions(offset: number = 0): object {
        const strategyData = this._getStrategyData(offset);
        const newPopupOptions = clone(this._options._popupOptions);
        if (strategyData.maxWidth) {
            newPopupOptions.maxWidth = strategyData.maxWidth;
        }
        return newPopupOptions;
    },

    _getStrategyData(offset: number = 0): object {
        const coords = this._getFloatAreaStackRootCoords();
        const item = {
            popupOptions: {
                minWidth: this._options._popupOptions.minWidth,
                maxWidth: this._options._popupOptions.maxWidth,
                width: this._options._popupOptions.width + offset,
                containerWidth: this._container.width()
            }
        };
        return StackStrategy.getPosition(coords, item);
    },

   _onMaximizedHandler(): void {
      if (!this._panel._updateAreaWidth) {
         return;
      }

      this._maximized = !this._maximized;
      const coords = this._getFloatAreaStackRootCoords();
      const item = {
         popupOptions: {
            maximized: this._maximized,
            minWidth: this._options._popupOptions.minWidth,
            maxWidth: this._options._popupOptions.maxWidth,
            minimizedWidth: this._options._popupOptions.minimizedWidth,
            containerWidth: this._container.width()
         }
      };

      // todo https://online.sbis.ru/opendoc.html?guid=256679aa-fac2-4d95-8915-d25f5d59b1ca
      item.popupOptions.width = this._maximized ? item.popupOptions.maxWidth : (item.popupOptions.minimizedWidth || item.popupOptions.minWidth);
      const width = StackStrategy.getPosition(coords, item).width;

      const newOptions = clone(this._options.templateOptions);
      newOptions.maximized = this._maximized;
      this._panel._options.maximized = this._maximized;

      this._updateFloatAreaWidth(width, newOptions);
   },

    _updateFloatAreaWidth(width: number, newOptions?: object): void {
        this._panel._options.width = width;
        this._panel._options.maxWidth = width;
        this._panel._updateAreaWidth(width);
        this._panel._updateSideBarVisibility();
        this._panel.getContainer()[0].style.maxWidth = '';
        this._panel.getContainer()[0].style.minWidth = '';

        if (newOptions) {
           this._updateVDOMTemplate(newOptions);
           this._onResizeHandler();
        }
    },

   _getRootContainer() {
      const container = this._vDomTemplate.getContainer();
      return container.get ? container.get(0) : container;
   },

   destroy() {
      this._container[0].eventProperties = null;
      this.unsubscribe('activated', this._activatedHandler);
      this.unsubscribe('deactivated', this._deactivatedHandler);
      this._finishPopupOpenedDeferred();
      if (this._closeTimerId) {
         clearTimeout(this._closeTimerId);
         this._closeTimerId = null;
      }

      // Очищаем список лисенеров в контроллерах.
      for (let i = 0; i < this._listeners.length; i++) {
         const listener = this._listeners[i];
         ManagerWrapperController.unregisterListener(listener.event, listener.eventName, listener.emitter);
      }
      moduleClass.superclass.destroy.apply(this, arguments);
      this._isVDomTemplateMounted = true;
      this.getContainer().unbind('keydown', this._keydownHandler);
      if (this._vDomTemplate) {
         const
            self = this,
            Sync = Vdom.Synchronizer;

         Sync.unMountControlFromDOM(this._vDomTemplate, this._vDomTemplate._container);

         // Временное решение для очистки памяти. Вдомные контролы при вызове unMountControlFromDOM
         // уничтожаются (destroy) синхронно, но удаляются из DOM через инферно асинхронно.
         // При этом CompoundArea лежит внутри FloatArea на старой странице. Когда FloatArea
         // уничтожается, она уничтожает CompoundArea, и чистит свой контейнер через remove.
         // Соответственно инферно нечего удалять из DOM, так как удалены родители корневой
         // vdom-ноды. Из-за этого не чистятся различные вдомные свойства контейнеров: controlNodes,
         // eventProperties, ...
         //
         // У нас нет ссылок на эти элементы, но сборщик мусора хрома все равно не собирает их
         // (либо профилировщик показывает, что они не собраны). Для того, чтобы этот мусор собрался,
         // нужно почистить все добавленные vdom-ом свойства на элементах.
         //
         // Более правильное решение будет придумываться по ошибке:
         // https://online.sbis.ru/opendoc.html?guid=37e1cf9f-913d-4c96-b73a-effc3a5fba92
         setTimeout(function() {
            self._clearVdomProperties(self._vDomTemplate._container);
            self._vdomTemplate = null;
         }, 3000);
      }
   },
   _clearVdomProperties(container) {
      const children = (container[0] || container).getElementsByTagName('*');

      for (let i = 0; i < children.length; i++) {
         const c = children[i];

         delete c.controlNodes;
         delete c.eventProperties;
         delete c.eventPropertiesCnt;
         delete c.$EV;
         delete c.$V;
      }

      delete container.controlNodes;
      delete container.eventProperties;
      delete container.eventPropertiesCnt;
      delete container.$EV;
      delete container.$V;
   },

   _forceUpdate() {
      // Заглушка для ForceUpdate которого на compoundControl нет
   },
   canAcceptFocus() {
      return this.isVisible();
   },

   setTemplateOptions(newOptions) {
      // Могут позвать перерисоку до того, как компонент создался
      // Если компонент еще не создался а его уже перерисовали, то создаться должент с новыми опциями
      this._saveTemplateOptions(newOptions);
      this._modifyInnerOptionsByHandlers();

      if (this._vDomTemplate) {
         this._isNewOptions = true;

         // Скроем окно перед установкой новых данных. покажем его после того, как новые данные отрисуются и окно перепозиционируется
         // Если панель стековая, то не скрываем, т.к. позиция окна не изменится.
         if (this._panel._moduleName !== 'Lib/Control/FloatArea/FloatArea' || this._panel._options.isStack !== true) {
            this._panel.getContainer().closest('.ws-float-area').addClass('ws-invisible');
         }
         this._updateVDOMTemplate(this._options.templateOptions);
      }
   },

   _saveTemplateOptions(newOptions) {
      this._options.templateOptions = newOptions;
      this._maximized = !!this._options.templateOptions.maximized;
   },

   _updateVDOMTemplate(templateOptions) {
      this._vDomTemplate.setTemplateOptions(templateOptions);
      this._vDomTemplate._forceUpdate();
   },

   _activatedHandler(event, args) {
      if (!this.isActive()) {
         const activationTarget = args[0];
         const curContainer = this._container.length
            ? this._container[0]
            : this._container;
         const toContainer = activationTarget._$to._container.length
            ? activationTarget._$to._container[0]
            : activationTarget._$to._container;

         // активируем только тот контрол CompoundArea, в который ушел фокус. Родительским панелям не зовем setActive,
         // потому что тогда FloatAreaManager решит, что фокус ушел туда и закроет текущую панель

         // активируем только если фокус уходит в wasaby-контрол. если в панели лежит старый контрол и фокус уходит на
         // него, он сам позовет setActive для предков. а если здесь звать setActive система позовет setActive(false) для контрола получившего фокус
         if (curContainer.contains(toContainer) && activationTarget._$to._template) {
            this.setActive(true, activationTarget.isShiftKey, true, activationTarget._$to);
         }
      }
   },

   _deactivatedHandler(event, args) {
      if (this.isActive()) {
         const activationTarget = args[0];
         this.setActive(false, activationTarget.isShiftKey, true);
      }
   }
});

moduleClass.dimensions = {
   resizable: false
};

export default moduleClass;
