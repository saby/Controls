/**
 * Created by dv.zuev on 25.12.2017.
 */
define('Controls/Application',
   [

      'wml!Controls/Application/Page',
      'Core/BodyClasses',
      'Env/Env',
      'Env/Touch',
      'Env/Event',
      'UI/Base',
      'Controls/scroll',
      'Core/helpers/getResourceUrl',
      'Controls/Application/SettingsController',
      'Controls/event',
      'Controls/popup',
      'UI/HotKeys',
      'Controls/dragnDrop',
      'Core/TimeTesterInv',
      'Controls/context',
      'Application/Page',
      'css!theme?Controls/Application/oldCss'
   ],

   /**
    * Корневой контрол для Wasaby-приложений. Служит для создания базовых html-страниц.
    * Подробнее читайте <a href='/doc/platform/developmentapl/interface-development/controls/controls-application/'>здесь</a>.
    *
    * @class Controls/Application
    * @extends UI/Base:Control
    *
    * @mixes Controls/_interface/IApplication
    * @mixes UI/_base/interface/IHTML
    * @mixes Controls/_interface/IRUM
    *
    *
    * @public
    * @author Санников К.А.
    */

   /*
    * Root component for WS applications. Creates basic html page.
    *
    * @class Controls/Application
    * @extends UI/Base:Control
    *
    * @mixes Controls-demo/BlockLayouts/Index
    * @mixes Controls/_interface/IRUM
    * @mixes Controls/_interface/IApplication
    * @mixes UI/_base/interface/IRootTemplate
    * @mixes UI/_base/interface/IHTML
    *
    *
    * @public
    * @author Санников К.А.
    */

   function(
      template,
      cBodyClasses,
      Env,
      Touch,
      EnvEvent,
      UIBase,
      scroll,
      getResourceUrl,
      SettingsController,
      ControlsEvent,
      popup,
      HotKeys,
      dragnDrop,
      TimeTesterInv,
      cContext,
      aPage) {
      'use strict';
      var _private;

      _private = {

         /**
          * Перекладываем опции или recivedState на инстанс
          * @param self
          * @param cfg
          * @param routesConfig
          */
         initState: function(instance, cfg) {
            instance.templateConfig = cfg.templateConfig;
            instance.compat = cfg.compat || false;
         },
         isHover: function(touchClass, dragClass) {
            return touchClass === 'ws-is-no-touch' && dragClass === 'ws-is-no-drag';
         }
      };

      var Page = UIBase.Control.extend({
         _template: template,
         /** Динамические классы для body */
         _bodyClasses: {

            /* eslint-disable */
            /**
             * @type {String} Property controls whether or not touch devices use momentum-based scrolling for innerscrollable areas.
             * @private
             */
            /* eslint-enable */
            scrollingClass: Env.detection.isMobileIOS ? 'controls-Scroll_webkitOverflowScrollingTouch' : '',
            fromOptions: '',
            touchClass: '',
            hoverClass: '',
            dragClass: 'ws-is-no-drag',
            themeClass: '',
            isAdaptiveClass: ''
         },

         _registers: {},

         _getChildContext: function() {
            return {
               ScrollData: this._scrollData,
               isTouch: this._touchObjectContext
            };
         },

         _scrollPage: function(ev) {
            this._registers.scroll.start(ev);
            this._popupManager.eventHandler('pageScrolled', []);
         },

         _resizeBody: function(ev) {
            if (!this._isIOS13()) {
               this._resizePage(ev);
            }
         },

         _isIOS13: function() {
            return Env.detection.isMobileIOS && Env.detection.IOSVersion > 12;
         },

         _resizePage: function(ev) {
            this._registers.controlResize.start(ev);
            this._popupManager.eventHandler('popupResizeOuter', []);
         },
         _mousedownPage: function(ev) {
            this._registers.mousedown.start(ev);
            this._popupManager.mouseDownHandler(ev);
         },
         _mousemovePage: function(ev) {
            this._registers.mousemove.start(ev);
            this._updateTouchClass();
         },
         _mouseupPage: function(ev) {
            this._registers.mouseup.start(ev);
         },
         _touchmovePage: function(ev) {
            this._registers.touchmove.start(ev);
         },
         _touchendPage: function(ev) {
            this._registers.touchend.start(ev);
         },
         _mouseleavePage: function(ev) {
            /* eslint-disable */
            /**
             * Перемещение элементов на странице происходит по событию mousemove. Браузер генерирует его исходя из
             * доступных ресурсов, и с дополнительными оптимизациями, чтобы не перегружать систему. Поэтому событие не происходит
             * на каждое попиксельное смещение мыши. Между двумя соседними событиями, мышь проходит некоторое расстояние.
             * Чем быстрее перемещается мышь, тем больше оно будет.
             * Событие не происход, когда мышь покидает граници экрана. Из-за этого, элементы не могут быть перемещены в плотную к ней.
             * В качестве решения, генерируем событие mousemove, на момент ухода мыши за граници экрана.
             * Демо: https://jsfiddle.net/q7rez3v5/
             */
            /* eslint-enable */
            this._registers.mousemove.start(ev);
         },

         _touchStartPage: function() {
            this._updateTouchClass();
         },

         /** Задаем классы для body, которые не будут меняться */
         _initBodyClasses: function(cfg) {
            this._initIsAdaptiveClass(cfg);
            var BodyAPI = aPage.Body.getInstance();
            // Эти классы вешаются в двух местах. Разница в том, что BodyClasses всегда возвращает один и тот же класс,
            // а TouchDetector реагирует на изменение состояния.
            // Поэтому в Application оставим только класс от TouchDetector
            var bodyClasses = cBodyClasses()
               .replace('ws-is-touch', '')
               .replace('ws-is-no-touch', '')
               .split(' ')
               .concat(['zIndex-context'])
               .filter(isExist);
            for (var key in this._bodyClasses) {
               if (this._bodyClasses.hasOwnProperty(key)) {
                  if (isExist(this._bodyClasses[key])) {
                     bodyClasses.push(this._bodyClasses[key]);
                  }
               }
            }
            BodyAPI.addClass.apply(BodyAPI, bodyClasses);
         },

         _updateBodyClasses: function(updated) {
            var BodyAPI = aPage.Body.getInstance();
            var bodyClassesToUpdate = updated || this._bodyClasses;
            var oldValue;
            var newValue;
            var classesToDelete;
            var classesToAdd;

            for (var key in bodyClassesToUpdate) {
               if (bodyClassesToUpdate.hasOwnProperty(key)) {
                  oldValue = this._bodyClasses[key];
                  newValue = bodyClassesToUpdate[key];
                  if (oldValue !== newValue) {
                     classesToAdd = newValue.split(' ').filter(isExist);

                     /** Отфильтруем классы для удаления: может нам и не надо ничего удалять, а только добавить? */
                     classesToDelete = oldValue.split(' ')
                        .filter(isExist)
                        // eslint-disable-next-line no-loop-func
                        .filter(function(value) {
                           return !classesToAdd.includes(value);
                        });

                     if (classesToDelete.length) {
                        BodyAPI.removeClass.apply(BodyAPI, classesToDelete);
                     }
                     BodyAPI.addClass.apply(BodyAPI, classesToAdd);

                     this._bodyClasses[key] = newValue;
                  }
               }
            }
         },

         _updateFromOptionsClass: function(options) {
            this._updateBodyClasses({
               fromOptions: options.bodyClass || ''
            });
         },

         _updateScrollingClass: function() {
            var scrollingClass;
            if (Env.detection.isMobileIOS) {
               if (this._isPopupShow || this._isSuggestShow) {
                  scrollingClass = 'controls-Scroll_webkitOverflowScrollingAuto';
               } else {
                  scrollingClass = 'controls-Scroll_webkitOverflowScrollingTouch';
               }
            } else {
               scrollingClass = '';
            }

            this._updateBodyClasses({
               scrollingClass: scrollingClass
            });
         },

         _updateTouchClass: function(initialUpdated) {
            var updated = initialUpdated || {};
            updated.touchClass = '';
            updated.hoverClass = '';

            // Данный метод вызывается до построения вёрстки, и при первой отрисовке еще нет _children (это нормально)
            // поэтому сами детектим touch с помощью compatibility
            if (this._touchController) {
               updated.touchClass = this._touchController.getClass();
            } else {
               updated.touchClass = Env.compatibility.touch ? 'ws-is-touch' : 'ws-is-no-touch';
            }

            updated.hoverClass = _private
               .isHover(updated.touchClass, updated.dragClass || this._bodyClasses.dragClass)
               ? 'ws-is-hover'
               : 'ws-is-no-hover';

            this._updateBodyClasses(updated);
         },

         _updateThemeClass: function(options) {
            this._updateBodyClasses({
               themeClass: 'Application-body_theme-' + options.theme
            });
         },

         _initIsAdaptiveClass: function(cfg) {//TODO: toso
            if (cfg.isAdaptive) {
               var HeadAPI = aPage.Head.getInstance();
               var tagsId = HeadAPI.getTag('meta', { name: 'viewport' });
               if (tagsId) {
                  if (tagsId instanceof Array) {
                     tagsId.forEach(function(tagId) {
                        HeadAPI.deleteTag(tagId);
                     });
                  } else {
                     HeadAPI.deleteTag(tagsId);
                  }
               }
               HeadAPI.createTag('meta', {
                  name: 'viewport',
                  content: 'width=device-width, initial-scale=1.0'
               });
               this._bodyClasses.isAdaptiveClass = 'ws-is-adaptive';
            } else {
               this._bodyClasses.isAdaptiveClass = '';
            }
         },

         _dragStartHandler: function() {
            this._updateTouchClass({
               dragClass: 'ws-is-drag'
            });
         },

         _dragEndHandler: function() {
            this._updateTouchClass({
               dragClass: 'ws-is-no-drag'
            });
         },

         /**
          * Код должен быть вынесен в отдельных контроллер в виде хока в 610.
          * https://online.sbis.ru/opendoc.html?guid=2dbbc7f1-2e81-4a76-89ef-4a30af713fec
          */
         _popupCreatedHandler: function() {
            this._isPopupShow = true;

            this._updateScrollingClass();
         },

         _popupDestroyedHandler: function(event, element, popupItems) {
            if (popupItems.getCount() === 0) {
               this._isPopupShow = false;
            }

            this._updateScrollingClass();
         },

         _suggestStateChangedHandler: function(event, state) {
            this._isSuggestShow = state;

            this._updateScrollingClass();
         },

         /** ************************************************** */

         _checkDeprecatedOptions: function(opts) {
            /* eslint-disable */
            if (opts.compat) {
               Env.IoC.resolve('ILogger').warn('Опция compat является устаревшей. Для вставки старых контролов внутри VDOM-ного окружения ' +
                'используйте один из способов, описанных в этой статье: https://wi.sbis.ru/doc/platform/developmentapl/ws3/compound-wasaby/');
            }
            /* eslint-enable */
         },

         _beforeMount: function(cfg) {
            this._checkDeprecatedOptions(cfg);
            this._scrollData = new scroll._scrollContext({ pagingVisible: cfg.pagingVisible });

            var appData = UIBase.AppData.getAppData();
            this.RUMEnabled = cfg.RUMEnabled || appData.RUMEnabled || false;
            this.pageName = cfg.pageName || appData.pageName || '';
            this.resourceRoot = cfg.resourceRoot || Env.constants.resourceRoot;

            // Чтобы при загрузке слоя совместимости, понять нужно ли грузить провайдеры(extensions, userInfo, rights),
            // положим опцию из Application в constants. Иначе придется использовать глобальную переменную.
            // TODO: Удалить этот код отсюда по задае:
            // https://online.sbis.ru/opendoc.html?guid=3ed5ebc1-0b55-41d5-a8fa-921ad24aeec3
            Env.constants.loadDataProviders = cfg.loadDataProviders;

            if (Env.constants.isBrowserPlatform) {
               /* eslint-disable */
               if (document.getElementsByClassName('head-custom-block').length > 0) {
                  this.head = undefined;
               }
               /* eslint-enable */
            }
            this._initBodyClasses(cfg);
            this._updateTouchClass();
            this._updateThemeClass(cfg);
            this._updateFromOptionsClass(cfg);

            SettingsController.setController(cfg.settingsController);

            this._createDragnDropController();
            this._createGlobalPopup();
            this._createPopupManager(cfg);
            this._createRegisters();
            this._createTouchDetector();
         },

         _afterMount: function(cfg) {
            // Подписка через viewPort дает полную информацию про ресайз страницы, на мобильных устройствах
            // сообщает так же про изменение экрана после показа клавиатуры и/или зуме страницы.
            // Подписка на body стреляет не всегда. в 2100 включаю только для 13ios, в перспективе можно включить
            // везде, где есть visualViewport
            var timeTester = new TimeTesterInv.default(this.RUMEnabled, this.pageName);
            timeTester.load();
            if (this._isIOS13()) {
               window.visualViewport.addEventListener('resize', this._resizePage.bind(this));
            }
            var channelPopupManager = EnvEvent.Bus.channel('popupManager');
            channelPopupManager.subscribe('managerPopupCreated', this._popupCreatedHandler, this);
            channelPopupManager.subscribe('managerPopupDestroyed', this._popupDestroyedHandler, this);
            channelPopupManager.subscribe('managerPopupBeforeDestroyed', this._popupBeforeDestroyedHandler, this);

            this._globalpopup.registerGlobalPopup();
            this._popupManager.init(cfg, this._getChildContext());

         },

         _beforeUnmount: function () {
            for (var register in this._registers) {
               this._registers[register].destroy();
            }
            var channelPopupManager = EnvEvent.Bus.channel('popupManager');
            channelPopupManager.unsubscribe('managerPopupCreated', this._popupCreatedHandler, this);
            channelPopupManager.unsubscribe('managerPopupDestroyed', this._popupDestroyedHandler, this);
            channelPopupManager.unsubscribe('managerPopupBeforeDestroyed', this._popupBeforeDestroyedHandler, this);

            this._globalpopup.registerGlobalPopupEmpty();
            this._popupManager.destroy();
            this._dragnDropController.destroy();
         },

         _beforeUpdate: function(cfg) {
            if (this._scrollData.pagingVisible !== cfg.pagingVisible) {
               this._scrollData.pagingVisible = cfg.pagingVisible;
               this._scrollData.updateConsumers();
            }
            this._updateTouchClass();
            this._updateThemeClass(cfg);
            this._updateFromOptionsClass(cfg);
         },

         _afterUpdate: function(oldOptions) {
            /* eslint-disable */
            var elements = document.getElementsByClassName('head-title-tag');
            /* eslint-enable */
            if (elements.length === 1) {
               // Chrome на ios при вызове History.replaceState, устанавливает в title текущий http адрес.
               // Если после загрузки установить title, который уже был, то он не обновится, и в заголовке вкладки
               // останется http адрес. Поэтому сначала сбросим title, а затем положим туда нужное значение.
               if (Env.detection.isMobileIOS && Env.detection.chrome && oldOptions.title === this._options.title) {
                  elements[0].textContent = '';
               }
               elements[0].textContent = this._options.title;
            }
            this._popupManager.updateOptions(this._options, this._getChildContext());
         },

         _createRegisters: function() {
            var registers = ['scroll', 'controlResize', 'mousemove', 'mouseup', 'touchmove', 'touchend', 'mousedown'];
            var _this = this;
            registers.forEach(function(register) {
               _this._registers[register] = new ControlsEvent.RegisterClass({ register: register });
            });
         },

         _createGlobalPopup: function() {
            this._globalpopup = new popup.GlobalController();
         },

         _createPopupManager: function(cfg) {
            this._popupManager = new popup.ManagerClass(cfg);
         },

         _registerHandler: function(event, registerType, component, callback, config) {
            if (this._registers[registerType]) {
               this._registers[registerType].register(event, registerType, component, callback, config);
               return;
            }
            this._dragnDropController.registerHandler(event, registerType, component, callback, config);
         },

         _unregisterHandler: function(event, registerType, component, config) {
            if (this._registers[registerType]) {
               this._registers[registerType].unregister(event, registerType, component, config);
               return;
            }
            this._dragnDropController.unregisterHandler(event, registerType, component, config);
         },

         _createTouchDetector: function() {
            this._touchController = Touch.TouchDetect.getInstance();
            this._touchObjectContext = new cContext.TouchContextField.create();
         },

         _createDragnDropController: function() {
            this._dragnDropController = new dragnDrop.ControllerClass();
         },

         _documentDragStart: function(event, dragObject) {
            this._dragnDropController.documentDragStart(dragObject);
            this._dragStartHandler();
         },

         _documentDragEnd: function(event, dragObject) {
            this._dragnDropController.documentDragEnd(dragObject);
            this._dragEndHandler();
         },

         _updateDraggingTemplate: function(event, draggingTemplateOptions, draggingTemplate) {
            this._dragnDropController.updateDraggingTemplate(draggingTemplateOptions, draggingTemplate);
         },

         _removeDraggingTemplate: function(event) {
            this._dragnDropController.removeDraggingTemplate();
         },

         _getResourceUrl: function(str) {
            return getResourceUrl(str);
         },

         _keyPressHandler: function(event) {
            if (this._isPopupShow) {
               if (Env.constants.browser.safari) {
                  // Need to prevent default behaviour if popup is opened
                  // because safari escapes fullscreen mode on 'ESC' pressed
                  // TODO https://online.sbis.ru/opendoc.html?guid=5d3fdab0-6a25-41a1-8018-a68a034e14d9
                  if (event.nativeEvent && event.nativeEvent.keyCode === 27) {
                     event.preventDefault();
                  }
               }
            }
         },

         _popupBeforeDestroyedHandler: function(event, popupCfg, popupList, popupContainer) {
            this._globalpopup.popupBeforeDestroyedHandler(event, popupCfg, popupList, popupContainer);
         },

         _openInfoBoxHandler: function(event, config) {
            this._globalpopup.openInfoBoxHandler(event, config);
         },

         _openDialogHandler: function(event, templ, templateOptions, opener) {
            return this._globalpopup.openDialogHandler(event, templ, templateOptions, opener);
         },

         _closeInfoBoxHandler: function(event, delay) {
            this._globalpopup.closeInfoBoxHandler(event, delay);
         },

         _forceCloseInfoBoxHandler: function() {
            this._globalpopup.forceCloseInfoBoxHandler();
         },

         _openPreviewerHandler: function(event, config, type) {
            return this._globalpopup.openPreviewerHandler(event, config, type);
         },

         _cancelPreviewerHandler: function(event, action) {
            this._globalpopup.cancelPreviewerHandler(event, action);
         },

         _isPreviewerOpenedHandler: function(event) {
            return this._globalpopup.isPreviewerOpenedHandler(event);
         },

         _closePreviewerHandler: function(event, type) {
            this._globalpopup.closePreviewerHandler(event, type);
         },

         _keyDownHandler: function(event) {
            return HotKeys.dispatcherHandler(event);
         },

         _popupEventHandler: function(event, action) {
            var args = Array.prototype.slice.call(arguments, 2);
            this._popupManager.eventHandler.apply(this._popupManager, [action, args]);
         }
      });

      Page.getDefaultOptions = function() {
         return {
            title: '',
            pagingVisible: false
         };
      };

      Object.defineProperty(Page, 'defaultProps', {
         enumerable: true,
         configurable: true,

         get: function() {
            return Page.getDefaultOptions();
         }
      });

      Page._theme = ['Controls/application'];
      Page._styles = ['Controls/dragnDrop'];

      /**
       * Добавление ресурсов, которые необходимо вставить в head как <link rel="prefetch"/>
       * По умолчанию ресурсы добавляются только на сервисе представления
       * @param modules
       * @param force
       * @public
       */
      Page.addPrefetchModules = function(modules, force) {
         _addHeadLinks(modules, { prefetch: true, force: !!force });
      };

      /**
       * Добавление ресурсов, которые необходимо вставить в head как <link rel="preload"/>
       * По умолчанию ресурсы добавляются только на сервисе представления
       * @param modules
       * @param force
       * @public
       */
      Page.addPreloadModules = function(modules, force) {
         _addHeadLinks(modules, { preload: true, force: !!force });
      };

      /**
       * Добавление ресурсов, которые необходимо вставить в head как <link rel="prefetch"/> или <link rel="preload"/>
       * @param modules
       * @param cfg настройки для ссылок
       *             {
       *                'prefetch': <boolean>,  // добавить prefetch-ссылку в head
       *                'preload': <boolean>  // добавить preload-ссылку в head
       *                'force': <boolean>  // по умолчанию ресурсы добавляются только на сервисе представления, но
       *                                    // с этим параметром можно на это повлиять
       *             }
       * @private
       */
      function _addHeadLinks(modules, cfg) {
         cfg = cfg || {};
         if (!Env.constants.isServerSide && !cfg.force) {
            return;
         }
         if (!modules || !modules.length) {
            return;
         }

         var pls = new UIBase.PrefetchLinksStore();
         if (cfg.prefetch) {
            pls.addPrefetchModules(modules);
         } else {
            pls.addPreloadModules(modules);
         }
      }

      return Page;
   });

function isExist(value) {
   return !!value;
}
