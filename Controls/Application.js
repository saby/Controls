/**
 * Created by dv.zuev on 25.12.2017.
 */
define('Controls/Application',
   [
      'Core/Control',
      'wml!Controls/Application/Page',
      'Core/BodyClasses',
      'Env/Env',
      'UI/Base',
      'Controls/scroll',
      'Core/helpers/getResourceUrl',
      'Controls/decorator',
      'Controls/Application/SettingsController',
      'Controls/Utils/DOMUtil',
      'css!theme?Controls/Application/oldCss'
   ],

   /**
    * Корневой контрол для Wasaby-приложений. Служит для создания базовых html-страниц.
    * Подробнее читайте <a href='https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/controls-application/'>здесь</a>.
    *
    * @class Controls/Application
    * @extends Core/Control
    *
    * @mixes Controls/_interface/IApplication
    * @mixes UI/_base/interface/IHTML
    * @mixes Controls/_interface/IRUM
    *
    * @control
    * @public
    * @author Санников К.А.
    */

   /*
    * Root component for WS applications. Creates basic html page.
    *
    * @class Controls/Application
    * @extends Core/Control
    *
    * @mixes Controls-demo/BlockLayouts/Index
    * @mixes Controls/_interface/IRUM
    * @mixes Controls/_interface/IApplication
    * @mixes UI/_base/interface/IRootTemplate
    * @mixes UI/_base/interface/IHTML
    *
    * @control
    * @public
    * @author Санников К.А.
    */

   function(Base,
      template,
      cBodyClasses,
      Env,
      UIBase,
      scroll,
      getResourceUrl,
      decorator,
      SettingsController,
      DOMUtils) {
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
         calculateBodyClasses: function() {
            // Эти классы вешаются в двух местах. Разница в том, что BodyClasses всегда возвращает один и тот же класс,
            // а TouchDetector реагирует на изменение состояния.
            // Поэтому в Application оставим только класс от TouchDetector

            var bodyClasses = cBodyClasses().replace('ws-is-touch', '').replace('ws-is-no-touch', '');

            return bodyClasses;
         },

         // Generates JML from options array of objects
         translateJML: function JMLTranslator(type, obj) {
            var objects = obj || [];
            var result = [];
            for (var i = 0; i < objects.length; i++) {
               result[i] = [type, objects[i]];
            }
            return result;
         },
         generateJML: function (links, styles, meta) {
            return []
               // фильтруем css (их вставит theme_controller)
               .concat(_private.translateJML('link', links.filter(function (l) { return l.type !== 'text/css'; })))
               .concat(_private.translateJML('style', styles))
               .concat(_private.translateJML('meta', meta));
         },
         isHover: function(touchClass, dragClass) {
            return touchClass === 'ws-is-no-touch' && dragClass === 'ws-is-no-drag';
         }
      };

      function generateHeadValidHtml() {
         // Tag names and attributes allowed in the head.
         return {
            validNodes: {
               link: true,
               style: true,
               script: true,
               meta: true,
               title: true
            },
            validAttributes: {
               rel: true,
               defer: true,
               as: true,
               src: true,
               name: true,
               sizes: true,
               crossorigin: true,
               type: true,
               href: true,
               property: true,
               'http-equiv': true,
               content: true,
               id: true,
               'class': true
            }
         };
      }

      var linkAttributes = {
         src: true,
         href: true
      };

      var Page = Base.extend({
         _template: template,
         /* eslint-disable */
         /**
          * @type {String} Property controls whether or not touch devices use momentum-based scrolling for innerscrollable areas.
          * @private
          */
         /* eslint-enable */
         _scrollingClass: Env.detection.isMobileIOS ? 'controls-Scroll_webkitOverflowScrollingTouch' : '',

         _dragClass: 'ws-is-no-drag',

         _getChildContext: function() {
            return {
               ScrollData: this._scrollData
            };
         },

         _scrollPage: function(ev) {
            this._children.scrollDetect.start(ev);
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
            this._children.resizeDetect.start(ev);
         },
         _mousedownPage: function(ev) {
            this._children.mousedownDetect.start(ev);
         },
         _mousemovePage: function(ev) {
            this._children.mousemoveDetect.start(ev);
         },
         _mouseupPage: function(ev) {
            this._children.mouseupDetect.start(ev);
         },
         _touchmovePage: function(ev) {
            this._children.touchmoveDetect.start(ev);
         },
         _touchendPage: function(ev) {
            this._children.touchendDetect.start(ev);
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
            this._children.mousemoveDetect.start(ev);
         },
         _updateClasses: function() {
            // Данный метод вызывается до построения вёрстки, и при первой отрисовке еще нет _children (это нормально)
            // поэтому сами детектим touch с помощью compatibility
            if (this._children.touchDetector) {
               this._touchClass = this._children.touchDetector.getClass();
            } else {
               this._touchClass = Env.compatibility.touch ? 'ws-is-touch' : 'ws-is-no-touch';
            }

            this._hoverClass = _private.isHover(this._touchClass, this._dragClass) ? 'ws-is-hover' : 'ws-is-no-hover';
         },

         _dragStartHandler: function() {
            this._dragClass = 'ws-is-drag';
            this._updateClasses();
         },

         _dragEndHandler: function() {
            this._dragClass = 'ws-is-no-drag';
            this._updateClasses();
         },

         _changeTouchStateHandler: function() {
            this._updateClasses();
         },

         /**
          * Код должен быть вынесен в отдельных контроллер в виде хока в 610.
          * https://online.sbis.ru/opendoc.html?guid=2dbbc7f1-2e81-4a76-89ef-4a30af713fec
          */
         _popupCreatedHandler: function() {
            this._isPopupShow = true;

            // На Ipad необходимо вызывать reflow в момент открытия окон для решения проблем с z-index-ами
            // https://online.sbis.ru/opendoc.html?guid=3f84a4bc-2973-497c-91ad-0165b5046bbc
            if (Env.detection.isMobileIOS) {
               DOMUtils.reflow();
            }

            this._changeOverflowClass();
         },

         _popupDestroyedHandler: function(event, element, popupItems) {
            if (popupItems.getCount() === 0) {
               this._isPopupShow = false;
            }

            this._changeOverflowClass();
         },

         _suggestStateChangedHandler: function(event, state) {
            this._isSuggestShow = state;

            this._changeOverflowClass();
         },

         /** ************************************************** */

         _changeOverflowClass: function() {
            if (Env.detection.isMobileIOS) {
               if (this._isPopupShow || this._isSuggestShow) {
                  this._scrollingClass = 'controls-Scroll_webkitOverflowScrollingAuto';
               } else {
                  this._scrollingClass = 'controls-Scroll_webkitOverflowScrollingTouch';
               }
            } else {
               this._scrollingClass = '';
            }
         },

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
            this.headTagResolver = this._headTagResolver.bind(this);
            this.BodyClasses = _private.calculateBodyClasses;
            this._scrollData = new scroll._scrollContext({ pagingVisible: cfg.pagingVisible });

            // translate arrays of links, styles, meta and scripts from options to JsonML format
            this.headJson = _private.generateJML(cfg.links, cfg.styles, cfg.meta);
            if (Array.isArray(cfg.headJson)) {
               this.headJson = this.headJson.concat(cfg.headJson);
            }
            this.headValidHtml = generateHeadValidHtml();

            var appData = UIBase.AppData.getAppData();
            this.RUMEnabled = cfg.RUMEnabled || appData.RUMEnabled || false;
            this.pageName = cfg.pageName || appData.pageName || '';
            this.resourceRoot = cfg.resourceRoot || Env.constants.resourceRoot;

            // Чтобы при загрузке слоя совместимости, понять нужно ли грузить провайдеры(extensions, userInfo, rights),
            // положим опцию из Application в constants. Иначе придется использовать глобальную переменную.
            // TODO: Удалить этот код отсюда по задае:
            // https://online.sbis.ru/opendoc.html?guid=3ed5ebc1-0b55-41d5-a8fa-921ad24aeec3
            Env.constants.loadDataProviders = cfg.loadDataProviders;

            if (typeof window !== 'undefined') {
               /* eslint-disable */
               if (document.getElementsByClassName('head-custom-block').length > 0) {
                  this.head = undefined;
                  this.headJson = undefined;
                  this.headValidHtml = undefined;
               }
               /* eslint-enable */
            }
            this._updateClasses();

            SettingsController.setController(cfg.settingsController);
         },

         _afterMount: function() {
            // Подписка через viewPort дает полную информацию про ресайз страницы, на мобильных устройствах
            // сообщает так же про изменение экрана после показа клавиатуры и/или зуме страницы.
            // Подписка на body стреляет не всегда. в 2100 включаю только для 13ios, в перспективе можно включить
            // везде, где есть visualViewport
            if (this._isIOS13()) {
               window.visualViewport.addEventListener('resize', this._resizePage.bind(this));
            }
         },

         _beforeUpdate: function(cfg) {
            if (this._scrollData.pagingVisible !== cfg.pagingVisible) {
               this._scrollData.pagingVisible = cfg.pagingVisible;
               this._scrollData.updateConsumers();
            }
            this._updateClasses();
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
         },

         _getResourceUrl: function(str) {
            return getResourceUrl(str);
         },

         _headTagResolver: function(value, parent) {
            var newValue = decorator.noOuterTag(value, parent),
               attributes = Array.isArray(newValue) && typeof newValue[1] === 'object' &&
                  !Array.isArray(newValue[1]) && newValue[1];
            if (attributes) {
               for (var attributeName in attributes) {
                  if (attributes.hasOwnProperty(attributeName)) {
                     var attributeValue = attributes[attributeName];
                     if (typeof attributeValue === 'string' && linkAttributes[attributeName]) {
                        attributes[attributeName] = this._getResourceUrl(attributeValue);
                     }
                  }
               }
            }
            return newValue;
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
         }
      });

      Page.getDefaultOptions = function() {
         return {
            title: '',
            pagingVisible: false
         };
      };

      Page._theme = ['Controls/application'];

      return Page;
   });
