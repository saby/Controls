import Control = require('Core/Control');
import Deferred = require('Core/Deferred');
import Env = require('Env/Env');
import ScrollData = require('Controls/_scroll/Scroll/Context');
import StickyHeaderContext = require('Controls/_scroll/StickyHeader/Context');
import {isStickySupport} from 'Controls/_scroll/StickyHeader/Utils';
import ScrollWidthUtil = require('Controls/_scroll/Scroll/ScrollWidthUtil');
import ScrollHeightFixUtil = require('Controls/_scroll/Scroll/ScrollHeightFixUtil');
import template = require('wml!Controls/_scroll/Scroll/Scroll');
import tmplNotify = require('Controls/Utils/tmplNotify');
import {Bus} from 'Env/Event';
import {isEqual} from 'Types/object';
import 'Controls/_scroll/Scroll/Watcher';
import 'Controls/event';
import 'Controls/_scroll/Scroll/Scrollbar';
import * as newEnv from 'Core/helpers/isNewEnvironment';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Logger} from 'UI/Utils';
import * as scrollToElement from 'Controls/Utils/scrollToElement';
import {descriptor} from 'Types/entity';
import {constants} from 'Env/Env';
import {LocalStorageNative} from 'Browser/Storage';

/**
 * Контейнер с тонким скроллом.
 * Для контрола требуется {@link Controls/_scroll/Scroll/Context context}.
 *
 * @class Controls/_scroll/Container
 * @extends Core/Control
 * @control
 * @public
 * @author Красильников А.С.
 * @category Container
 * @remark
 * Контрол работает как нативный скролл: скроллбар появляется, когда высота контента больше высоты контрола. Для корректной работы контрола необходимо ограничить его высоту.
 * Для корректной работы внутри WS3 необходимо поместить контрол в контроллер Controls/dragnDrop:Compound, который обеспечит работу функционала Drag-n-Drop.
 * @demo Controls-demo/Container/Scroll
 *
 */

/*
 * Container with thin scrollbar.
 * For the component, a {@link Controls/_scroll/Scroll/Context context} is required.
 *
 * @class Controls/_scroll/Container
 * @extends Core/Control
 * @control
 * @public
 * @author Красильников А.С.
 * @category Container
 * @demo Controls-demo/Scroll/Default/Index
 *
 */

/**
 * @event Происходит при скроллировании области.
 * @name Controls/_scroll/Container#scroll
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Number} scrollTop Смещение контента сверху относительно контейнера.
 */

/*
 * @event scroll Scrolling content.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject.
 * @param {Number} scrollTop Top position of content relative to container.
 */

/**
 * @name Controls/_scroll/Container#content
 * @cfg {Content} Содержимое контейнера.
 */

/*
 * @name Controls/_scroll/Container#content
 * @cfg {Content} Container contents.
 */

/**
 * @name Controls/_scroll/Container#shadowVisible
 * @cfg {Boolean} Следует ли показывать тень (когда содержимое не подходит).
 * @deprecated Используйте {@link topShadowVisibility} и {@link bottomShadowVisibility}
 */

/*
 * @name Controls/_scroll/Container#shadowVisible
 * @cfg {Boolean} Whether shadow should be shown (when content doesn't fit).
 * @deprecated Use {@link topShadowVisibility} and {@link bottomShadowVisibility} instead.
 */

/**
 * @typedef {String} shadowVisibility
 * @variant auto Видимость зависит от состояния скролируемой области. Тень отображается только с той стороны
 * в которую можно скролить.
 * контент, то на этой границе отображается тень.
 * @variant visible Тень всегда видима.
 * @variant hidden Тень всегда скрыта.
 */

/**
 * @name Controls/_scroll/Container#topShadowVisibility
 * @cfg {shadowVisibility} Устанавливает режим отображения тени сверху.
 * @default auto
 * @demo Controls-demo/Scroll/ShadowVisibility/TopShadowVisibility/Index
 */

/**
 * @name Controls/_scroll/Container#bottomShadowVisibility
 * @cfg {shadowVisibility} Устанавливает режим отображения тени снизу.
 * @demo Controls-demo/Scroll/ShadowVisibility/BottomShadowVisibility/Index
 */

/**
 * @name Controls/_scroll/Container#scrollMode
 * @cfg {Boolean} Режим скроллирования.
 * @variant vertical Вертикальный скролл.
 * @variant verticalHorizontal Вертикальный и горизонтальный скролл.
 * @demo Controls-demo/Scroll/ScrollMode/Index
 */

/**
 * @name Controls/_scroll/Container#scrollbarVisible
 * @cfg {Boolean} Следует ли отображать скролл.
 * @demo Controls-demo/Scroll/ScrollbarVisible/Index
 */

/*
 * @name Controls/_scroll/Container#scrollbarVisible
 * @cfg {Boolean} Whether scrollbar should be shown.
 */

/**
 * @name Controls/_scroll/Container#style
 * @cfg {String} Цветовая схема (цвета тени и скролла).
 * @variant normal Тема по умолчанию (для ярких фонов).
 * @variant inverted Преобразованная тема (для темных фонов).
 */

/*
 * @name Controls/_scroll/Container#style
 * @cfg {String} Color scheme (colors of the shadow and scrollbar).
 * @variant normal Default theme (for bright backgrounds).
 * @variant inverted Inverted theme (for dark backgrounds).
 */

const enum SHADOW_VISIBILITY {
   HIDDEN = 'hidden',
   VISIBLE = 'visible',
   AUTO = 'auto'
}

const enum POSITION {
   TOP = 'top',
   BOTTOM = 'bottom',
   LEFT = 'left',
   RIGHT = 'right'
}

const enum SCROLL_MODE {
    VERTICAL = 'vertical',
    VERTICALHORIZONTAL = 'verticalHorizontal'
}

const enum SCROLL_TYPE {
    VERTICAL = 'vertical',
    HORIZONTAL = 'horizontal'
}

const
   SHADOW_ENABLE_MAP = {
      hidden: false,
      visible: true,
      auto: true
   },
   INITIAL_SHADOW_VISIBILITY_MAP = {
      hidden: false,
      visible: true,
      auto: false
   };

const SCROLL_BY_ARROWS = 40;
let
   _private = {
      SHADOW_HEIGHT: 8,
      SHADOW_WIDTH: 8,
      KEYBOARD_SHOWING_DURATION: 500,
      scaleRoundingError: 1.5,
      /**
       * Получить расположение тени внутри контейнера в зависимости от прокрутки контента.
       * @return {String}
       */
      calcShadowPosition(scrollType: string, scrollSide: number, containerSize: number, scrollSize: number): string {
          let shadowPosition = '';

          if (scrollSide > 0) {
              shadowPosition = scrollType === SCROLL_TYPE.VERTICAL ?
                  'top' :
                  'left';
          }

          // The scrollHeight returned by the browser is more, because of the invisible elements
          // that climbs outside of the fixed headers (shadow and observation targets).
          // We take this into account when calculating. 8 pixels is the height of the shadow.
          if (scrollType === SCROLL_TYPE.VERTICAL && (Env.detection.firefox || Env.detection.isIE) &&
              isStickySupport()) {
              scrollSize -= scrollType === SCROLL_TYPE.VERTICAL ?
                  _private.SHADOW_HEIGHT :
                  _private.SHADOW_WIDTH;
          }

          // Compare with 1.5 to prevent rounding errors in the scale do not equal 100%
          if (scrollSize - containerSize - scrollSide >= this.scaleRoundingError) {
              shadowPosition += scrollType === SCROLL_TYPE.VERTICAL ?
                  'bottom' :
                  'right';
          }

          return shadowPosition;
      },

      /**
       * Возвращает включено ли отображение тени.
       * Если отключено, то не рендерим контейнер тени и не рассчитываем его состояние.
       * @param options Опции компонента.
       * @param position Позиция тени.
       */
      isShadowEnable: function(options, position: POSITION): boolean {
         if (options.shadowVisible === false) {
            return false;
         }
         return SHADOW_ENABLE_MAP[options[`${position}ShadowVisibility`]];
      },
      /**
       * Возвращает отображается ли тень в текущем состоянии контрола.
       * @param self Экземпляр контрола.
       * @param position Позиция тени.
       * @param shadowsPosition Рассчитанное состояние теней
       */
      isShadowVisible: function(self, position: POSITION, shadowsPosition: string): boolean {
         const
             visibleFromInnerComponents = self._shadowVisibilityByInnerComponents[position],
             visibleOptionValue = position === POSITION.LEFT || position === POSITION.RIGHT ?
                 'auto' :
                 self._options[`${position}ShadowVisibility`];
         if (self._options.shadowVisible === false) {
            return false;
         }

         if (visibleFromInnerComponents !== SHADOW_VISIBILITY.AUTO) {
            return SHADOW_ENABLE_MAP[visibleFromInnerComponents];
         }

         if (visibleOptionValue !== SHADOW_VISIBILITY.AUTO) {
            return SHADOW_ENABLE_MAP[visibleOptionValue];
         }

         return shadowsPosition.indexOf(position) !== -1;
      },

      getInitialShadowVisibleState: function (options, position: POSITION): boolean {
         return INITIAL_SHADOW_VISIBILITY_MAP[options[`${position}ShadowVisibility`]];
      },

       getScrollSize(scrollType, container): number {
           return scrollType === SCROLL_TYPE.VERTICAL ?
               container.scrollHeight :
               container.scrollWidth;
       },

       getContainerSize(scrollType, container): number {
            return scrollType === SCROLL_TYPE.VERTICAL ?
               container.offsetHeight :
               container.offsetWidth;
       },

      getScrollTop: function(self, container) {
         return container.scrollTop + self._topPlaceholderSize;
      },

      getScrollLeft(self, container) {
         return container.scrollLeft + self._leftPlaceholderSize;
      },

      setScrollTop: function(self, scrollTop) {
         self._children.scrollWatcher.setScrollTop(scrollTop);
         self._scrollTop = _private.getScrollTop(self, self._children.content);
         _private.notifyScrollEvents(self, scrollTop);
      },

       setScrollLeft(self, scrollLeft): void {
           self._children.content.scrollLeft = scrollLeft;
           self._scrollLeft = _private.getScrollLeft(self, self._children.content);
       },

      notifyScrollEvents(self, scrollTop) {
         self._notify('scroll', [scrollTop]);
         const eventCfg = {
             type: 'scroll',
             target: self._children.content,
             currentTarget: self._children.content,
             _bubbling: false
         };
         self._children.scrollDetect.start(new SyntheticEvent(null, eventCfg), scrollTop);
      },

       calcCanScroll(scrollType: string, self: Control): boolean {
           if (scrollType === SCROLL_TYPE.HORIZONTAL && self._options.scrollMode !== SCROLL_MODE.VERTICALHORIZONTAL) {
               return false;
           }

           let scrollSize = _private.getScrollSize(scrollType, self._children.content);
           const containerSize = _private.getContainerSize(scrollType, self._children.content);

           /**
            * In IE, if the content has a rational height, the height is rounded to the smaller side,
            * and the scrollable height to the larger side. Reduce the scrollable height to the real.
            */
           if (Env.detection.isIE) {
               scrollSize--;
           }

           return scrollSize > containerSize;
       },

      getContentHeight(self) {
         return _private.getScrollSize(SCROLL_TYPE.VERTICAL, self._children.content) - self._headersHeight.top -
            self._headersHeight.bottom + self._topPlaceholderSize + self._bottomPlaceholderSize;
      },

      getContentWidth(self) {
         return _private.getScrollSize(SCROLL_TYPE.HORIZONTAL, self._children.content) - self._headersWidth.left -
             self._headersWidth.right + self._leftPlaceholderSize + self._rightPlaceholderSize;
      },

      getShadowPosition(self) {
         let
            scrollTop = _private.getScrollTop(self, self._children.content),
            scrollHeight = _private.getScrollSize(SCROLL_TYPE.VERTICAL, self._children.content),
            containerHeight = _private.getContainerSize(SCROLL_TYPE.VERTICAL, self._children.content);

         return _private.calcShadowPosition(SCROLL_TYPE.VERTICAL, scrollTop, containerHeight, scrollHeight + self._topPlaceholderSize + self._bottomPlaceholderSize);
      },

      getHorizontalShadowPosition(self) {
         const scrollLeft = _private.getScrollLeft(self, self._children.content);
         const scrollWidth = _private.getScrollSize(SCROLL_TYPE.HORIZONTAL, self._children.content);
         const containerWidth = _private.getContainerSize(SCROLL_TYPE.HORIZONTAL, self._children.content);
         return _private.calcShadowPosition(SCROLL_TYPE.HORIZONTAL, scrollLeft, containerWidth,
              scrollWidth + self._leftPlaceholderSize + self._rightPlaceholderSize);
      },

      calcHeightFix(self) {
         return ScrollHeightFixUtil.calcHeightFix(self._children.content);
      },

      calcDisplayState(self) {
         const
             canScroll = _private.calcCanScroll(SCROLL_TYPE.VERTICAL, self),
             canHorizontalScroll = _private.calcCanScroll(SCROLL_TYPE.HORIZONTAL, self),
             topShadowEnable = self._options.topShadowVisibility === SHADOW_VISIBILITY.VISIBLE ||
                 (_private.isShadowEnable(self._options, POSITION.TOP) && canScroll),
             bottomShadowEnable = self._options.bottomShadowVisibility === SHADOW_VISIBILITY.VISIBLE ||
                 (_private.isShadowEnable(self._options, POSITION.BOTTOM) && canScroll),
             shadowPosition = topShadowEnable || bottomShadowEnable ? _private.getShadowPosition(self) : '',
             leftShadowEnable = canHorizontalScroll,
             rightShadowEnable = canHorizontalScroll,
             horizontalShadowPosition = leftShadowEnable || rightShadowEnable ? _private.getHorizontalShadowPosition(self) : '';
         return {
            heightFix: _private.calcHeightFix(self),
            canScroll,
            canHorizontalScroll,
            contentHeight: _private.getContentHeight(self),
            contentWidth: _private.getContentWidth(self),
            shadowPosition,
            horizontalShadowPosition,
            shadowEnable: {
               top: topShadowEnable,
               bottom: bottomShadowEnable,
               left: leftShadowEnable,
               right: rightShadowEnable
            },
            shadowVisible: {
               top: topShadowEnable ? _private.isShadowVisible(self, POSITION.TOP, shadowPosition) : false,
               bottom: bottomShadowEnable ? _private.isShadowVisible(self, POSITION.BOTTOM, shadowPosition) : false,
               left: leftShadowEnable ? _private.isShadowVisible(self, POSITION.LEFT, horizontalShadowPosition) : false,
               right: rightShadowEnable ? _private.isShadowVisible(self, POSITION.RIGHT, horizontalShadowPosition) : false
            }
         };
      },

      calcPagingStateBtn: function (self) {
         const {scrollTop, clientHeight, scrollHeight} = self._children.content;

         if (scrollTop <= 0) {
            self._pagingState.stateUp = 'disabled';
            self._pagingState.stateDown = 'normal';
         } else if (scrollTop + clientHeight >= scrollHeight) {
            self._pagingState.stateUp = 'normal';
            self._pagingState.stateDown = 'disabled';
         } else {
            self._pagingState.stateUp = 'normal';
            self._pagingState.stateDown = 'normal';
         }
      },

      updateDisplayState: function (self, displayState) {
         self._displayState.canHorizontalScroll = displayState.canHorizontalScroll;
         self._displayState.canScroll = displayState.canScroll;
         self._displayState.heightFix = displayState.heightFix;
         self._displayState.contentHeight = displayState.contentHeight;
         self._displayState.contentWidth = displayState.contentWidth;
         self._displayState.shadowPosition = displayState.shadowPosition;
         self._displayState.horizontalShadowPosition = displayState.horizontalShadowPosition;
         self._displayState.shadowEnable = displayState.shadowEnable;
         self._displayState.shadowVisible = displayState.shadowVisible;
      },

      proxyEvent(self, event, eventName, args) {
         // Forwarding bubbling events makes no sense.
         if (!event.propagating()) {
            return self._notify(eventName, args) || event.result;
         }
      }
   },
   Scroll = Control.extend({
      _template: template,

      // Т.к. в VDOM'e сейчас нет возможности сделать компонент прозрачным для событий
      // Или же просто проксирующий события выше по иерархии, то необходимые событие с контента просто пока
      // прокидываем руками
      // EVENTSPROXY
      _tmplNotify: tmplNotify,

      /**
       * Смещение контента сверху относительно контейнера.
       * @type {number}
       */
      _scrollTop: 0,

       /**
        * Смещение контента слева относительно контейнера.
        * @type {number}
        */
       _scrollLeft: 0,

      /**
       * Нужно ли показывать скролл при наведении.
       * @type {boolean}
       */
      _showScrollbarOnHover: true,

      /**
       * Наведен ли курсор на контейнер.
       * @type {boolean}
       */
      _hasHover: false,

      /**
       * Используется ли нативный скролл.
       * @type {boolean}
       */
      _useNativeScrollbar: null,

      _displayState: null,

      _pagingState: null,

      _shadowVisibilityByInnerComponents: null,

      /**
             * @type {Controls/_scroll/Context|null}
       * @private
       */
      _stickyHeaderContext: null,

      _headersHeight: null,
      _headersWidth: null,
      _scrollbarStyles: '',

      _topPlaceholderSize: 0,
      _bottomPlaceholderSize: 0,
      _leftPlaceholderSize: 0,
      _rightPlaceholderSize: 0,

      _scrollTopAfterDragEnd: undefined,
       _scrollLeftAfterDragEnd: undefined,
       _scrollLockedPosition: null,

       _classTypeScroll: null,

      _isMounted: false,

      constructor: function(cfg) {
         Scroll.superclass.constructor.call(this, cfg);
      },

      _beforeMount: function(options, context, receivedState) {
         var
            self = this,
            def;

         if (!constants.isServerSide) {
             this._showScrollbarOnHover = getEnableScrollbar();
         }

         if ('shadowVisible' in options) {
            Logger.warn('Controls/scroll:Container: Опция shadowVisible устарела, используйте topShadowVisibility и bottomShadowVisibility.', self);
         }

         // TODO Compatibility на старых страницах нет Register, который скажет controlResize
         this._resizeHandler = this._resizeHandler.bind(this);
         this._shadowVisibilityByInnerComponents = {
            top: SHADOW_VISIBILITY.AUTO,
            bottom: SHADOW_VISIBILITY.AUTO,
             left: SHADOW_VISIBILITY.AUTO,
             right: SHADOW_VISIBILITY.AUTO
         };
         this.calcStyleOverflow(options.scrollMode);
         this._displayState = {};
         this._stickyHeaderContext = new StickyHeaderContext({
            shadowPosition: options.topShadowVisibility !== SHADOW_VISIBILITY.HIDDEN ? 'bottom' : '',
         });
         this._headersHeight = {
            top: 0,
            bottom: 0
         };
         this._headersWidth = {
            left: 0,
            right: 0
         };

         if (context.ScrollData && context.ScrollData.pagingVisible) {
            // paging buttons are invisible. Control calculates height and shows buttons after mounting.
            this._pagingState = {
               visible: false,
               stateUp: 'disabled',
               stateDown: 'normal'
            };
         } else {
            this._pagingState = {};
         }

         if (receivedState) {
            _private.updateDisplayState(this, receivedState.displayState);
            this._styleHideScrollbar = receivedState.styleHideScrollbar || ScrollWidthUtil.calcStyleHideScrollbar(options.scrollMode);
            this._useNativeScrollbar = receivedState.useNativeScrollbar;
            this._contentStyles = receivedState.contentStyles;
         } else {
            def = new Deferred();

            def.addCallback(function() {
               let
                  topShadowVisible = _private.getInitialShadowVisibleState(options, POSITION.TOP),
                  bottomShadowVisible = _private.getInitialShadowVisibleState(options, POSITION.BOTTOM),
                   leftShadowVisible = false,
                   rightShadowVisible = false,
                   displayState = {
                     heightFix: ScrollHeightFixUtil.calcHeightFix(),
                     shadowPosition: '',
                      horizontalShadowPosition: '',
                      canScroll: false,
                     canHorizontalScroll: false,
                     shadowEnable: {
                        top: topShadowVisible,
                        bottom: bottomShadowVisible,
                        left: leftShadowVisible,
                        right: rightShadowVisible
                     },
                     shadowVisible: {
                        top: topShadowVisible,
                        bottom: bottomShadowVisible,
                        left: leftShadowVisible,
                        right: rightShadowVisible
                     }
                  },
                   styleHideScrollbar = ScrollWidthUtil.calcStyleHideScrollbar(options.scrollMode),

                  // На мобильных устройствах используется нативный скролл, на других платформенный.
                  useNativeScrollbar = Env.detection.isMobileIOS || Env.detection.isMobileAndroid;

               _private.updateDisplayState(self, displayState);
               self._styleHideScrollbar = styleHideScrollbar;
               self._useNativeScrollbar = useNativeScrollbar;

               //  Сразу же устанавливаем contentStyles как '' на платформах, в которых скрол бар прячется нативными
               //  средсвами а не маргинами(_styleHideScrollbar === '').
               //  Иначе по умолчаниюе он равен undefined, а после инициализации
               //  устанавливается в ''. Это приводит к forceUpdate. Код этой логики грязный, нужен рефакторинг.
               //  https://online.sbis.ru/opendoc.html?guid=0cb8e81e-ba7f-4f98-8384-aa52d200f8c8
               //  TODO: Нельзя делать проверку if(!_styleHideScrollbar){...}. Свойство _styleHideScrollbar может быть равным undefined.
               //  Например, в firefox на сервере нельзя определить ширину скролла. Потому что из-за зума она меняется.
               if (self._styleHideScrollbar === '') {
                  self._contentStyles = '';
               }

               return {
                  displayState,
                  styleHideScrollbar,
                  useNativeScrollbar,
                  contentStyles: self._contentStyles
               };
            });

            def.callback();

            // При построении на клиенте не возвращаем def, т.к. используется в старых компонентах
            // и там ассинхронного построения
            if (typeof window === 'undefined') {
               return def;
            }
         }
      },

      _afterMount: function() {
         /**
          * Для определения heightFix и styleHideScrollbar может требоваться DOM, поэтому проверим
          * смогли ли мы в beforeMount их определить.
          */
         var needUpdate = false, calculatedOptionValue;

         if (typeof this._displayState.heightFix === 'undefined') {
            this._displayState.heightFix = ScrollHeightFixUtil.calcHeightFix(this._children.content);
            needUpdate = true;
         }

         /**
          * The following states cannot be defined in _beforeMount because the DOM is needed.
          */
         calculatedOptionValue = _private.calcCanScroll(SCROLL_TYPE.HORIZONTAL, this);
         if (calculatedOptionValue) {
            this._displayState.canHorizontalScroll = calculatedOptionValue;
            needUpdate = true;
         }

         calculatedOptionValue = _private.calcCanScroll(SCROLL_TYPE.VERTICAL, this);
         if (calculatedOptionValue) {
            this._displayState.canScroll = calculatedOptionValue;
            needUpdate = true;
         }

         this._displayState.contentHeight = _private.getContentHeight(this);
         this._displayState.contentWidth = _private.getContentWidth(this);

         calculatedOptionValue = _private.getShadowPosition(this);
         if (calculatedOptionValue) {
            this._displayState.shadowPosition = calculatedOptionValue;
            needUpdate = true;
         }

         calculatedOptionValue = _private.getHorizontalShadowPosition(this);
         if (calculatedOptionValue) {
            this._displayState.horizontalShadowPosition = calculatedOptionValue;
            needUpdate = true;
         }

         calculatedOptionValue = _private.isShadowVisible(this, POSITION.TOP, this._displayState.shadowPosition);
         if (calculatedOptionValue) {
            this._displayState.shadowVisible.top = calculatedOptionValue;
            needUpdate = true;
         }

         calculatedOptionValue = _private.isShadowVisible(this, POSITION.BOTTOM, this._displayState.shadowPosition);
         if (calculatedOptionValue) {
            this._displayState.shadowVisible.bottom = calculatedOptionValue;
            needUpdate = true;
         }

         calculatedOptionValue = _private.isShadowVisible(this, POSITION.LEFT, this._displayState.horizontalShadowPosition);
         if (calculatedOptionValue) {
              this._displayState.shadowVisible.left = calculatedOptionValue;
              needUpdate = true;
          }

         calculatedOptionValue = _private.isShadowVisible(this, POSITION.RIGHT, this._displayState.horizontalShadowPosition);
         if (calculatedOptionValue) {
              this._displayState.shadowVisible.right = calculatedOptionValue;
              needUpdate = true;
          }

         this._updateStickyHeaderContext();
         this._adjustContentMarginsForBlockRender();

         // Create a scroll container with a "overflow-scrolling: auto" style and then set
         // "overflow-scrolling: touch" style. Otherwise, after switching on the overflow-scrolling: auto,
         // the page will scroll entirely. This solution fixes the problem, but in the old controls the container
         // was created with "overflow-scrolling: touch" style style.
         // A task has been created to investigate the problem more.
         // https://online.sbis.ru/opendoc.html?guid=1c9b807c-41ab-4fbf-9f22-bf8b9fcbdc8d
         if (Env.detection.isMobileIOS) {
            this._overflowScrolling = true;
            needUpdate = true;

            this._lockScrollPositionUntilKeyboardShown = this._lockScrollPositionUntilKeyboardShown.bind(this);
            Bus.globalChannel().subscribe('MobileInputFocus', this._lockScrollPositionUntilKeyboardShown);
         }

         if (needUpdate) {
            this._forceUpdate();
         }

         if (!newEnv() && window) {
            window.addEventListener('resize', this._resizeHandler);
         }

          this._isMounted = true;
      },

      _beforeUpdate: function(options, context) {
         this._pagingState.visible = context.ScrollData && context.ScrollData.pagingVisible && this._displayState.canScroll;
         this._updateStickyHeaderContext();
      },

      _afterUpdate: function() {
         // Нельзя рассчитать состояние для скрытого скрол контейнера
         if (this._isHidden()) {
            return;
         }

         let displayState = _private.calcDisplayState(this);

         if (!isEqual(this._displayState, displayState)) {
            this._displayState = displayState;
            this._updateStickyHeaderContext();

            this._forceUpdate();
         }
      },

      _beforeUnmount(): void {
         // TODO Compatibility на старых страницах нет Register, который скажет controlResize
         if (!newEnv() && window) {
            window.removeEventListener('resize', this._resizeHandler);
         }

         Bus.globalChannel().unsubscribe('MobileInputFocus', this._lockScrollPositionUntilKeyboardShown);
         this._lockScrollPositionUntilKeyboardShown = null;
      },

      _shadowVisible(position: POSITION) {
         const stickyController = this._children.stickyController;
         const fixed: boolean = stickyController?.hasFixed(position);
         const shadowVisible: boolean = stickyController?.hasShadowVisible(position);
         // Do not show shadows on the scroll container if there are fixed headers. They display their own shadows.
         if (fixed && shadowVisible) {
            return false;
         }

         // On ipad with inertial scrolling due to the asynchronous triggering of scrolling and caption fixing  events,
         // sometimes it turns out that when the first event is triggered, the shadow must be displayed,
         // and immediately after the second event it is not necessary.
         // These conditions appear during scrollTop < 0. Just do not display the shadow when scrollTop < 0.
         // Turn off this check on the first build when there is no dom tree yet.
         if (Env.detection.isMobileIOS && position === POSITION.TOP && this._children.content &&
               _private.getScrollTop(this, this._children.content) < 0) {
            return false;
         }

         return this._displayState.shadowVisible[position];
      },

       _verticalShadowVisible(position: POSITION): boolean {
           if (Env.detection.isMobileIOS && position === POSITION.LEFT && this._children.content &&
               _private.getScrollLeft(this, this._children.content) < 0) {
               return false;
           }

           return this._displayState.shadowVisible[position];
       },

      _updateShadowMode(event, shadowVisibleObject): void {
         // _shadowVisibilityByInnerComponents не используется в шаблоне,
         // поэтому св-во не является реактивным и для обновления надо позвать _forceUpdate
         // TODO https://online.sbis.ru/doc/a88a5697-5ba7-4ee0-a93a-221cce572430
         // Не запускаем перерисовку, если контрол скрыт
         if (!this._isHidden()) {
            this._shadowVisibilityByInnerComponents = shadowVisibleObject;
            this._forceUpdate();
         }
      },

       calcStyleOverflow(scrollMode: string): void {
           this._classTypeScroll = scrollMode === SCROLL_MODE.VERTICAL ?
               'controls-Scroll__scroll_vertical' :
               'controls-Scroll__scroll_verticalHorizontal';
       },

      setShadowMode: function(shadowVisibleObject) {
         // Спилить после того как удалят использование в engine
         this._shadowVisibilityByInnerComponents = shadowVisibleObject;
      },

      setOverflowScrolling: function(value: string) {
          this._children.content.style.webkitOverflowScrolling = value;
      },

      /**
       * Если используем верстку блоков, то на content появится margin-right.
       * Его нужно добавить к margin-right для скрытия нативного скролла.
       * TODO: метод нужно порефакторить. Делаем для сдачи в план, в 600 будет переработано.
       * https://online.sbis.ru/opendoc.html?guid=0cb8e81e-ba7f-4f98-8384-aa52d200f8c8
       */
      _adjustContentMarginsForBlockRender: function() {
         let computedStyle = getComputedStyle(this._children.content);
         let marginTop = parseInt(computedStyle.marginTop, 10);
         let marginRight = parseInt(computedStyle.marginRight, 10);

         this._contentStyles = this._styleHideScrollbar.replace(/-?\d+/g, function(found) {
            return parseInt(found, 10) + marginRight;
         });

         if (this._stickyHeaderContext.top !== -marginTop) {
            this._stickyHeaderContext.top = -marginTop;
            this._stickyHeaderContext.updateConsumers();
         }
      },

      _resizeHandler: function() {

         // Событие ресайза может прилететь из _afterMount внутренних контролов
         // до вызова _afterMount на скрол контейнере.
         if (!this._isMounted) {
            return;
         }
         // TODO https://online.sbis.ru/doc/a88a5697-5ba7-4ee0-a93a-221cce572430
         // Не реагируем на ресайз, если контрол скрыт
         if (this._isHidden()) {
            return;
         }
         const displayState = _private.calcDisplayState(this);

         if (!isEqual(this._displayState, displayState)) {
            this._displayState = displayState;
         }

         _private.calcPagingStateBtn(this);
      },

      _scrollHandler: function(ev) {
         const scrollTop = _private.getScrollTop(this, this._children.content);
          const scrollLeft = _private.getScrollLeft(this, this._children.content);

         if (this._scrollLockedPosition !== null) {
            this._children.content.scrollTop = this._scrollLockedPosition;

            // Проверяем, изменился ли scrollTop, чтобы предотвратить ложные срабатывания события.
            // Например, при пересчете размеров перед увеличением, плитка может растянуть контейнер между перерисовок,
            // и вернуться к исходному размеру.
            // После этого  scrollTop остается прежним, но срабатывает незапланированный нативный scroll
         } else if (this._scrollTop !== scrollTop || this._scrollLeft !== scrollLeft) {
            if (!this._dragging) {
                if (this._scrollTop !== scrollTop) {
                    this._scrollTop = scrollTop;
                    this._notify('scroll', [this._scrollTop]);
                }
                if (this._scrollLeft !== scrollLeft) {
                    this._scrollLeft = scrollLeft;
                    this._notify('scroll', [this._scrollLeft]);
                }
            } else {
               // scrollTop/scrollLeft нам во время перетаскивания могут проставить извне (например
               // восстановив скролл после подгрузки новых данных). Во время перетаскивания,
               // мы не меняем наш scrollTop/scrollLeft, чтобы сам скролл и позиция ползунка не
               // перепрыгнули из под мышки пользователя, но запомним эту позицию,
               // возможно нужно будет установить ее после завершения перетаскивания
                if (this._scrollTop !== scrollTop) {
                    this._scrollTopAfterDragEnd = scrollTop;
                }
                if (this._scrollLeft !== scrollLeft) {
                    this._scrollLeftAfterDragEnd = scrollLeft;
                }
            }
            this._children.scrollDetect.start(ev, this._scrollTop);
         }
      },

       _wheelHandler(event: SyntheticEvent): void {
          if (enableScrollbar) {
              setEnableScrollbar(false);
          }
       },

      _keydownHandler: function(ev) {
         // если сами вызвали событие keydown (горячие клавиши), нативно не прокрутится, прокрутим сами
         if (!ev.nativeEvent.isTrusted) {
            let offset: number;
            const scrollTop: number = _private.getScrollTop(this, this._children.content);
            if (ev.nativeEvent.which === Env.constants.key.pageDown) {
               offset = scrollTop + this._children.content.clientHeight;
            }
            if (ev.nativeEvent.which === Env.constants.key.down) {
               offset = scrollTop + SCROLL_BY_ARROWS;
            }
            if (ev.nativeEvent.which === Env.constants.key.pageUp) {
               offset = scrollTop - this._children.content.clientHeight;
            }
            if (ev.nativeEvent.which === Env.constants.key.up) {
               offset = scrollTop - SCROLL_BY_ARROWS;
            }
            if (offset !== undefined) {
               this.scrollTo(offset);
               ev.preventDefault();
            }

            if (ev.nativeEvent.which === Env.constants.key.home) {
               this.scrollToTop();
               ev.preventDefault();
            }
            if (ev.nativeEvent.which === Env.constants.key.end) {
               this.scrollToBottom();
               ev.preventDefault();
            }
         }
      },

      _scrollbarTaken() {
         if (this._showScrollbarOnHover && (this._displayState.canScroll || this._displayState.canHorizontalScroll)) {
            this._notify('scrollbarTaken', [], { bubbling: true });
         }
      },

      _arrowClickHandler: function(event, btnName) {
         var scrollParam;

         switch (btnName) {
            case 'Begin':
               scrollParam = 'top';
               break;
            case 'End':
               scrollParam = 'bottom';
               break;
            case 'Prev':
               scrollParam = 'pageUp';
               break;
            case 'Next':
               scrollParam = 'pageDown';
               break;
         }

         this._children.scrollWatcher.doScroll(scrollParam);
      },

      _scrollMoveHandler: function(e, scrollData) {
         if (this._pagingState.visible) {
            if (scrollData.position === 'up') {
               this._pagingState.stateUp = 'disabled';
               this._pagingState.stateDown = 'normal';
            } else if (scrollData.position === 'down') {
               this._pagingState.stateUp = 'normal';
               this._pagingState.stateDown = 'disabled';
            } else {
               this._pagingState.stateUp = 'normal';
               this._pagingState.stateDown = 'normal';
            }
            this._forceUpdate();
         }
      },

      _mouseenterHandler: function(event) {
         this._scrollbarTaken(true);
         if (this._showScrollbarOnHover !== getEnableScrollbar()) {
             this._showScrollbarOnHover = getEnableScrollbar();
             this._forceUpdate();
         }
      },

      _mouseleaveHandler: function(event) {
         if (this._showScrollbarOnHover) {
            this._notify('scrollbarReleased', [], { bubbling: true });
         }
      },

      _scrollbarTakenHandler: function() {
         this._showScrollbarOnHover = false;

         // todo _forceUpdate тут нужен, потому что _showScrollbarOnHover не используется в шаблоне, так что изменение
         // этого свойства не запускает перерисовку. нужно явно передавать это свойство в методы в шаблоне, в которых это свойство используется
         this._forceUpdate();
      },

      _scrollbarReleasedHandler: function(event) {
         if (!this._showScrollbarOnHover) {
            this._showScrollbarOnHover = true;

            // todo _forceUpdate тут нужен, потому что _showScrollbarOnHover не используется в шаблоне, так что изменение
            // этого свойства не запускает перерисовку. нужно явно передавать это свойство в методы в шаблоне, в которых это свойство используется
            this._forceUpdate();
            event.preventDefault();
         }
      },

      _scrollbarVisibility: function() {
         return Boolean(!this._useNativeScrollbar && this._options.scrollbarVisible && this._displayState.canScroll && this._showScrollbarOnHover);
      },

       _horizontalScrollbarVisibility() {
           return Boolean(!this._useNativeScrollbar && this._options.scrollbarVisible
               && this._displayState.canHorizontalScroll && this._options.scrollMode === SCROLL_MODE.VERTICALHORIZONTAL
               && this._showScrollbarOnHover);
       },

      /**
       * TODO: убрать после выполнения https://online.sbis.ru/opendoc.html?guid=93779c1a-8d18-42fe-8dc8-1bab779d0943.
       * Переделать на bind в шаблоне и избавится от прокидывания опций.
       */
      _positionChangedHandler(event, position) {
         _private.setScrollTop(this, position);
      },

       _horizontalPositionChangedHandler(event, position): void {
           _private.setScrollLeft(this, position);
       },

      _draggingChangedHandler(event, dragging) {
         this._dragging = dragging;


         if (!dragging && typeof this._scrollTopAfterDragEnd !== 'undefined') {
            // В случае если запомненная позиция скролла для восстановления не совпадает с
            // текущей, установим ее при окончании перетаскивания
            if (this._scrollTopAfterDragEnd !== this._scrollTop) {
               this._scrollTop = this._scrollTopAfterDragEnd;
               _private.notifyScrollEvents(this, this._scrollTop);
            }
            this._scrollTopAfterDragEnd = undefined;
         }
      },

       _horizontalDraggingChangedHandler(event, dragging) {
           this._dragging = dragging;
           if (!dragging && typeof this._scrollLeftAfterDragEnd !== 'undefined') {
               // В случае если запомненная позиция скролла для восстановления не совпадает с
               // текущей, установим ее при окончании перетаскивания
               if (this._scrollLeftAfterDragEnd !== this._scrollLeft) {
                   this._scrollLeft = this._scrollLeftAfterDragEnd;
                   _private.notifyScrollEvents(this, this._scrollLeft);
               }
               this._scrollLeftAfterDragEnd = undefined;
           }
       },

      /**
       * Update the context value of sticky header.
       * TODO: Плохой метод. Дублирование tmpl и вызов должен только в методе изменения видимости тени. Будет поправлено по https://online.sbis.ru/opendoc.html?guid=01c0fb63-9121-4ee4-a652-fe9c329eec8f
       * @param shadowVisible
       * @private
       */

      _updateStickyHeaderContext() {
          let
              shadowPosition: string = '',
              topShadowVisible: boolean = false,
              bottomShadowVisible: boolean = false;

          if (this._displayState.canScroll) {
              topShadowVisible = this._displayState.shadowVisible.top;
              bottomShadowVisible = this._displayState.shadowVisible.bottom;
          }

          if (topShadowVisible) {
              shadowPosition += 'top';
          }
          if (bottomShadowVisible) {
              shadowPosition += 'bottom';
          }

          if (this._stickyHeaderContext.shadowPosition !== shadowPosition) {
              this._stickyHeaderContext.shadowPosition = shadowPosition;
              this._stickyHeaderContext.updateConsumers();
          }
      },

      _getChildContext: function() {
         return {
            stickyHeader: this._stickyHeaderContext
         };
      },

      getDataId: function() {
               return 'Controls/_scroll/Container';
      },

      /**
       * Скроллит к выбранной позиции. Позиция определяется в пикселях от верха контейнера.
       * @function Controls/_scroll/Container#scrollTo
       * @param {Number} Позиция в пикселях
       */

      /*
       * Scrolls to the given position from the top of the container.
       * @function Controls/_scroll/Container#scrollTo
       * @param {Number} Offset
       */
      scrollTo: function(offset) {
         _private.setScrollTop(this, offset);
      },

      /**
       * Возвращает true если есть возможность вроскролить к позиции offset.
       * @function Controls/_scroll/Container#canScrollTo
       * @param offset Позиция в пикселях
       * @noshow
       */
      canScrollTo: function(offset: number): boolean {
         return offset <= this._children.content.scrollHeight - this._children.content.clientHeight;
      },

       /**
        * Скроллит к выбранной позиции по горизонтале. Позиция определяется в пикселях от левого края контейнера.
        * @function Controls/_scroll/Container#horizontalScrollTo
        * @param {Number} Позиция в пикселях
        */

       /*
        * Scrolls to the given position from the top of the container.
        * @function Controls/_scroll/Container#scrollTo
        * @param {Number} Offset
        */
       horizontalScrollTo(offset) {
           _private.setScrollLeft(this, offset);
       },

      /**
       * Скроллит к верху контейнера
       * @function Controls/_scroll/Container#scrollToTop
       */

      /*
       * Scrolls to the top of the container.
       * @function Controls/_scroll/Container#scrollToTop
       */
      scrollToTop: function() {
         _private.setScrollTop(this, 0);
      },

       /**
        * Скроллит к левому краю контейнера
        * @function Controls/_scroll/Container#scrollToTop
        */

       /*
        * Scrolls to the lefе of the container.
        * @function Controls/_scroll/Container#scrollToTop
        */
       scrollToLeft() {
           _private.setScrollLeft(this, 0);
       },

      /**
       * Скроллит к низу контейнера
       * @function Controls/_scroll/Container#scrollToBottom
       */

      /*
       * Scrolls to the bottom of the container.
       * @function Controls/_scroll/Container#scrollToBottom
       */
      scrollToBottom() {
         _private.setScrollTop(this, _private.getScrollSize(SCROLL_TYPE.VERTICAL, this._children.content)  - this._children.content.clientHeight + this._topPlaceholderSize);
      },

       /**
        * Скроллит к правому краю контейнера
        * @function Controls/_scroll/Container#scrollToBottom
        */

       /*
        * Scrolls to the right of the container.
        * @function Controls/_scroll/Container#scrollToBottom
        */
       scrollToRight() {
           _private.setScrollLeft(this, _private.getScrollSize(SCROLL_TYPE.HORIZONTAL, this._children.content) -
               this._children.content.clientWidth + this._leftPlaceholderSize);
       },

      // TODO: система событий неправильно прокидывает аргументы из шаблонов, будет исправлено тут:
      // https://online.sbis.ru/opendoc.html?guid=19d6ff31-3912-4d11-976f-40f7e205e90a
      selectedKeysChanged: function(event) {
         _private.proxyEvent(this, event, 'selectedKeysChanged', Array.prototype.slice.call(arguments, 1));
      },

      excludedKeysChanged: function(event) {
         _private.proxyEvent(this, event, 'excludedKeysChanged', Array.prototype.slice.call(arguments, 1));
      },

      itemClick: function(event) {
         return _private.proxyEvent(this, event, 'itemClick', Array.prototype.slice.call(arguments, 1));
      },

      _updatePlaceholdersSize: function(e, placeholdersSizes) {
         if (this._topPlaceholderSize !== placeholdersSizes.top ||
            this._bottomPlaceholderSize !== placeholdersSizes.bottom) {
            this._topPlaceholderSize = placeholdersSizes.top;
            this._bottomPlaceholderSize = placeholdersSizes.bottom;
            this._children.scrollWatcher.updatePlaceholdersSize(placeholdersSizes);
         }
      },

      _scrollToElement(event: SyntheticEvent<Event>, { itemContainer, toBottom, force }): void {
         event.stopPropagation();
         scrollToElement(itemContainer, toBottom, force);
      },

      _saveScrollPosition(event: SyntheticEvent<Event>): void {
         // На это событие должен реагировать только ближайший скролл контейнер.
         // В противном случае произойдет подскролл в ненужном контейнере
         event.stopPropagation();

         // Инерционный скролл приводит к дерганью: мы уже
         // восстановили скролл, но инерционный скролл продолжает работать и после восстановления, как итог - прыжки,
         // дерганья и лишняя загрузка данных.
         // Поэтому перед восстановлением позиции скрола отключаем инерционный скролл, а затем включаем его обратно.
         // https://popmotion.io/blog/20170704-manually-set-scroll-while-ios-momentum-scroll-bounces/
         if (Env.detection.isMobileIOS) {
            this.setOverflowScrolling('auto');
         }

         this._savedScrollTop = this._children.content.scrollTop;
         this._savedScrollPosition = this._children.content.scrollHeight - this._savedScrollTop;
      },

      _restoreScrollPosition(event: SyntheticEvent<Event>, heightDifference: number, direction: string): void {
         // На это событие должен реагировать только ближайший скролл контейнер.
         // В противном случае произойдет подскролл в ненужном контейнере
         event.stopPropagation();

         const newPosition = direction === 'up' ?
             this._children.content.scrollHeight - this._savedScrollPosition + heightDifference :
             this._savedScrollTop - heightDifference;

         this._children.scrollWatcher.setScrollTop(newPosition, true);

         // Инерционный скролл приводит к дерганью: мы уже
         // восстановили скролл, но инерционный скролл продолжает работать и после восстановления, как итог - прыжки,
         // дерганья и лишняя загрузка данных.
         // Поэтому перед восстановлением позиции скрола отключаем инерционный скролл, а затем включаем его обратно.
         if (Env.detection.isMobileIOS) {
            this.setOverflowScrolling('');
         }
      },

      _fixedHandler: function(event, topHeight, bottomHeight) {
         this._headersHeight.top = topHeight;
         this._headersHeight.bottom = bottomHeight;
         this._displayState.contentHeight = _private.getContentHeight(this);
         this._scrollbarStyles =  'top:' + topHeight + 'px; bottom:' + bottomHeight + 'px;';
      },

      /* При получении фокуса input'ами на IOS13, может вызывается подскролл у ближайшего контейнера со скролом,
         IPAD пытается переместить input к верху страницы. Проблема не повторяется,
         если input будет выше клавиатуры после открытия. */
      _lockScrollPositionUntilKeyboardShown(): void {
         this._scrollLockedPosition = this._scrollTop;
         setTimeout(() => {
            this._scrollLockedPosition = null;
         }, _private.KEYBOARD_SHOWING_DURATION);
      },

      _isHidden: function(): boolean {
         // TODO https://online.sbis.ru/doc/a88a5697-5ba7-4ee0-a93a-221cce572430
         // Не запускаем перерисовку, если контрол скрыт
         return !!this._container.closest('.ws-hidden');
      }
   });

Scroll.getDefaultOptions = function() {
   return {
      topShadowVisibility: SHADOW_VISIBILITY.AUTO,
      bottomShadowVisibility: SHADOW_VISIBILITY.AUTO,
      scrollbarVisible: true,
      scrollMode: 'vertical'
   };
};

Scroll._theme = ['Controls/scroll'];
Scroll.getOptionTypes = () => {
    return {
        scrollMode: descriptor(String).oneOf([
            'vertical',
            'verticalHorizontal'
        ])
    };
};

Scroll.contextTypes = function() {
   return {
      ScrollData
   };
};

Scroll._private = _private;

function setEnableScrollbar(value: boolean): void {
    enableScrollbar = value;
    localStorage.setItem('enableScrollbar', JSON.stringify(value));
}

function getEnableScrollbar(): void {
    if (enableScrollbar === null) {
        enableScrollbar = LocalStorageNative.getItem('enableScrollbar');
        enableScrollbar = enableScrollbar === null ? true : enableScrollbar;
    }
    return enableScrollbar;
}

let enableScrollbar = null;

export = Scroll;
