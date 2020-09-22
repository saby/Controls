import Control = require('Core/Control');
import Deferred = require('Core/Deferred');
import Env = require('Env/Env');
import ScrollData = require('Controls/_scroll/Scroll/Context');
import StickyHeaderContext = require('Controls/_scroll/StickyHeader/Context');
import {
    IFixedEventData,
    isStickySupport,
    TRegisterEventData,
    TYPE_FIXED_HEADERS
} from 'Controls/_scroll/StickyHeader/Utils';
import ScrollWidthUtil = require('Controls/_scroll/Scroll/ScrollWidthUtil');
import ScrollHeightFixUtil = require('Controls/_scroll/Scroll/ScrollHeightFixUtil');
import template = require('wml!Controls/_scroll/Scroll/Scroll');
import {tmplNotify} from 'Controls/eventUtils';
import {Bus} from 'Env/Event';
import {isEqual} from 'Types/object';
import 'Controls/_scroll/Scroll/Watcher';
import 'Controls/event';
import 'Controls/_scroll/Scroll/Scrollbar';
import * as newEnv from 'Core/helpers/isNewEnvironment';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Logger} from 'UI/Utils';
import {scrollToElement} from 'Controls/scrollUtils';
import {descriptor} from 'Types/entity';
import {detection, constants} from 'Env/Env';
import {LocalStorageNative} from 'Browser/Storage';
import Observer from './IntersectionObserver/Observer';
import {IIntersectionObserverObject} from './IntersectionObserver/Types';
import StickyHeaderController from './StickyHeader/Controller';
import {debounce} from 'Types/function';

/**
 * Контейнер с тонким скроллом.
 * Для контрола требуется {@link Controls/_scroll/Context context}.
 *
 * @remark
 * Контрол работает как нативный скролл: скроллбар появляется, когда высота контента больше высоты контрола. Для корректной работы контрола необходимо ограничить его высоту.
 * Для корректной работы внутри WS3 необходимо поместить контрол в контроллер Controls/dragnDrop:Compound, который обеспечит работу функционала Drag-n-Drop.
 *
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_scroll.less">переменные тем оформления</a>
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

       _setScrollTop(self, value: number): void {
            // На айпаде скроллбар не строится. Чтобы изменение св-ва _scrollTop не приводило к _forceUpdate
            // его нельзя объявлять на шаблоне ( даже в ветке кода, которая не испольняется). Перевожу на сеттер.
           //TODO: https://online.sbis.ru/opendoc.html?guid=65a30a09-0581-4506-9329-e472ea9630b5
            self._scrollTop = value;
            self._children.scrollBar?.setScrollPosition(value);
            _private.updateStates(self);
       },

       updateStates(self): void {
           const oldDisplayState = self._displayState;
           const displayState = _private.calcDisplayState(self);

           if (!isEqual(oldDisplayState, displayState)) {
               self._displayState = displayState;
               if (oldDisplayState.canScroll !== displayState.canScroll) {
                   self._stickyHeaderController.setCanScroll(displayState.canScroll).then(() => {

                       // Заголовки обновляются асинхронно отложенно пачкой, т.к. для их рассчетов снимается
                       // position: sticky. Скроллбар мы можем обновить только после того, как рассчитали заголовки.
                       self._headersHeight.top =
                           self._stickyHeaderController.getHeadersHeight(POSITION.TOP, TYPE_FIXED_HEADERS.initialFixed);
                       self._headersHeight.bottom =
                           self._stickyHeaderController.getHeadersHeight(POSITION.BOTTOM, TYPE_FIXED_HEADERS.initialFixed);
                       _private._updateScrollbar(self);
                   });
               }
           }
       },
      /**
       * Возвращает включено ли отображение тени.
       * Если отключено, то не рендерим контейнер тени и не рассчитываем его состояние.
       * @param options Опции компонента.
       * @param position Позиция тени.
       */
      isShadowEnable: function(options, position: POSITION): boolean {
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
         const value = _private.getScrollTop(self, self._children.content);
         _private._setScrollTop(self, value);
         _private.notifyScrollEvents(self, scrollTop);
      },

       setScrollLeft(self, scrollLeft): void {
           self._children.content.scrollLeft = scrollLeft;
           self._scrollLeft = _private.getScrollLeft(self, self._children.content);
       },

      notifyScrollEvents(self, scrollTop) {
         self._notify('scroll', [scrollTop]);
         // Перед уничтожением скролл контейнера уничтожается dragnDrop/Container, который нотифает событие
         // окончания драга, в этот момент scrollDetect (как и scrollWatcher) уже уничтожен.
         if (self._children.scrollDetect) {
            const eventCfg = {
            type: 'scroll',
            target: self._children.content,
            currentTarget: self._children.content,
            _bubbling: false
            };
            self._children.scrollDetect.start(new SyntheticEvent(null, eventCfg), scrollTop);
         }
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

      calcShadowEnable(options, position: POSITION, canScroll: boolean): boolean {
          return options[`${position}ShadowVisibility`] === SHADOW_VISIBILITY.VISIBLE ||
                 (_private.isShadowEnable(options, position) && canScroll)
      },

      calcDisplayState(self) {
         const
             canScroll = _private.calcCanScroll(SCROLL_TYPE.VERTICAL, self),
             canHorizontalScroll = _private.calcCanScroll(SCROLL_TYPE.HORIZONTAL, self),
             topShadowEnable = _private.calcShadowEnable(self._options, POSITION.TOP, canScroll),
             bottomShadowEnable = _private.calcShadowEnable(self._options, POSITION.BOTTOM, canScroll),
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
            self._pagingState.stateUp = false;
            self._pagingState.stateDown = true;
         } else if (scrollTop + clientHeight >= scrollHeight) {
            self._pagingState.stateUp = true;
            self._pagingState.stateDown = false;
         } else {
            self._pagingState.stateUp = true;
            self._pagingState.stateDown = true;
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

       _updateScrollbar: function(self): void {
          // Там где нативный скроллбар, стили считать не нужно
         if (self._displayState.canScroll && self._scrollbarVisibility()) {
            self._displayState.contentHeight = _private.getContentHeight(self);
            self._scrollbarStyles =  'top:' + self._headersHeight.top + 'px; bottom:' + self._headersHeight.bottom + 'px;';
         }
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

      _stickyHeaderController: null,
       _topPlaceholderSizeChanged: false,
       _updateScrollStateDebounce: null,

      constructor: function(cfg) {
         Scroll.superclass.constructor.call(this, cfg);
      },

      _beforeMount: function(options, context, receivedState) {
         var
            self = this,
            def;

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
            shadowPosition: '',
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
               stateUp: false,
               stateDown: true
            };
         } else {
            this._pagingState = {};
         }

         this._stickyHeaderController = new StickyHeaderController(this, {
             fixedCallback: this._stickyHeaderFixedCallback.bind(this)
         });

         this._getScrollPositionCallback = this._getScrollPositionCallback.bind(this);

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
          this._stickyHeaderController.init(this._children.content);

         /**
          * Для определения heightFix и styleHideScrollbar может требоваться DOM, поэтому проверим
          * смогли ли мы в beforeMount их определить.
          */
         let needUpdate = false;
         let calculatedOptionValue;

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
            // Сделано не через опции потому что stickyController скоро станет не компонентом
            // а полностью js контроллером. И что бы избежать лишних синхронизаций.
            this._stickyHeaderController.setCanScroll(calculatedOptionValue);
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

         calculatedOptionValue = _private.calcShadowEnable(this._options, POSITION.TOP, this._displayState.canScroll);
         if (calculatedOptionValue) {
            this._displayState.shadowEnable.top = calculatedOptionValue;
            needUpdate = true;
         }

         calculatedOptionValue = _private.calcShadowEnable(this._options, POSITION.BOTTOM, this._displayState.canScroll);
         if (calculatedOptionValue !== this._displayState.shadowEnable.bottom) {
            this._displayState.shadowEnable.bottom = calculatedOptionValue;
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
          this._updateScrollStateDebounce = debounce(this._updateScrollState.bind(this), 20);
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

         const oldDisplayState = this._displayState;
         const displayState = _private.calcDisplayState(this);

         if (!isEqual(this._displayState, displayState)) {
            this._displayState = displayState;
            this._stickyHeaderController.setCanScroll(displayState.canScroll);
            if (oldDisplayState.canScroll !== displayState.canScroll) {
               _private._updateScrollbar(this);
            }
            this._updateStickyHeaderContext();
         }

         this._stickyHeaderController.updateContainer(this._children.content);
      },

      _beforeUnmount(): void {
         // TODO Compatibility на старых страницах нет Register, который скажет controlResize
         if (!newEnv() && window) {
            window.removeEventListener('resize', this._resizeHandler);
         }

         Bus.globalChannel().unsubscribe('MobileInputFocus', this._lockScrollPositionUntilKeyboardShown);
         this._lockScrollPositionUntilKeyboardShown = null;

         if(this._observer) {
             this._observer.destroy();
             this._observer = null;
         }
         this._stickyHeaderController.destroy();
      },

       // Если курсор мыши сразу наведен на область со скроллконтейенером в момент его построения
       // (к примеру клик по записи открывает окно со скроллом, курсор сразу находится над скроллируемой областью),
       // то скроллбар в этот момент еще не инициализирован, т.к. состояние, отвечающее за условие построения,
       // высчитывается после маунта,а между маунтом и обработчиком события mouseenter еще не прошел цикл синхронизации.
       // Если скроллконтейнеру в этот момент (сразу после маунта) установили скроллтоп из кода, то контейнер не может
       // сообщить скроллбару о новой позиции, т.к. скроллбар еще не успел построиться.
       // Добавляю геттер текущей позиции скролла, который скроллбар дернет в момент своего построения.
       // Код можно убрать после перевода работы скроллбара с сеттера на опции после выполнения задачи
       // TODO: https://online.sbis.ru/opendoc.html?guid=65a30a09-0581-4506-9329-e472ea9630b5
       _getScrollPositionCallback(): void {
          return this._scrollTop;
       },

      _shadowVisible(position: POSITION) {
         const stickyController = this._stickyHeaderController;
         const fixed: boolean = stickyController?.hasFixed(position);
         const shadowVisible: boolean = stickyController?.hasShadowVisible(position);
         // Do not show shadows on the scroll container if there are fixed headers. They display their own shadows.
         if (fixed && shadowVisible) {
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

       _stickyHeaderFixedCallback(position: POSITION): void {
           // После того, как заголовки зафиксировались нужно пересчитать отображение скроллбара и теней.
          this._forceUpdate();
       },

      _updateShadowMode(event, shadowVisibleObject): void {
          event.stopImmediatePropagation();
         // _shadowVisibilityByInnerComponents не используется в шаблоне,
         // поэтому св-во не является реактивным и для обновления надо позвать _forceUpdate
         // TODO https://online.sbis.ru/doc/a88a5697-5ba7-4ee0-a93a-221cce572430
         // Не запускаем перерисовку, если контрол скрыт
         if (this._isHidden()) {
             return;
         }
         const oldValue = this._shadowVisibilityByInnerComponents;
         this._shadowVisibilityByInnerComponents = {
             ...oldValue,
             ...shadowVisibleObject
         };
         for (let key of Object.keys(shadowVisibleObject)) {
             if (shadowVisibleObject[key] && shadowVisibleObject[key] !== oldValue[key]) {
                 this._forceUpdate();
                 return;
             }
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
          this._children.content.style.overflow = value;
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

         this._contentStyles = this._styleHideScrollbar.replace(/-?[1-9]\d*/g, function(found) {
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
         _private.updateStates(this);
         _private.calcPagingStateBtn(this);
         this._stickyHeaderController.resizeHandler();
      },

       _updateScrollState(event: SyntheticEvent): void {
           const scrollTop = _private.getScrollTop(this, this._children.content);
           const scrollLeft = _private.getScrollLeft(this, this._children.content);
           this._topPlaceholderSizeChanged = false;

           if (this._scrollLockedPosition !== null) {
               this._children.content.scrollTop = this._scrollLockedPosition;

               // Проверяем, изменился ли scrollTop, чтобы предотвратить ложные срабатывания события.
               // Например, при пересчете размеров перед увеличением, плитка может растянуть контейнер между перерисовок,
               // и вернуться к исходному размеру.
               // После этого  scrollTop остается прежним, но срабатывает незапланированный нативный scroll
           } else if (this._scrollTop !== scrollTop || this._scrollLeft !== scrollLeft) {
               if (!this._dragging) {
                   if (this._scrollTop !== scrollTop) {
                       _private._setScrollTop(this, scrollTop);
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
               // В последнем выполнении _updateScrollState, происходящим перед разрушением контролла,
               // например, когда выбирается конец периода в календаре и после этого оконо календаря сразу
               // закрывается, scrollDetect может оказаться уничтоженым.
               if (this._children.scrollDetect) {
                   this._children.scrollDetect.start(event, this._scrollTop);
               }
           }
       },

      _scrollHandler: function(event: SyntheticEvent): void {
          // Убираем дерганья скролбара при работе виртуального скролла. Когда отрабатывает виртуальный скрол, изменяется
          // topPlaceholderSize, scrollTop же получаем складывая scrollTop c topPlaceholderSize, в итоге, контент в скрол
          // контейнере еще не появился, scrollTop не изменился, а topPlaceholderSize уже был измненен. Поэтому чтобы не было
          // дерганий скролбара мы отложенно высчитаем scrollTop.
          if (!this._topPlaceholderSizeChanged) {
              this._updateScrollState(event);
          } else {
              this._updateScrollStateDebounce(event);
          }
      },

      _keydownHandler: function(ev) {
         // если сами вызвали событие keydown (горячие клавиши), нативно не прокрутится, прокрутим сами
         if (!ev.nativeEvent.isTrusted) {
            let offset: number;
            const scrollTop: number = _private.getScrollTop(this, this._children.content);

            const scrollSize = _private.getScrollSize(SCROLL_TYPE.VERTICAL, this._children.content);
            const containerSize = _private.getContainerSize(SCROLL_TYPE.VERTICAL, this._children.content);
            const scrollContainerSize = scrollSize - containerSize;

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

            if (offset > scrollContainerSize) {
                offset = scrollContainerSize;
            }
            if (offset < 0 ) {
                offset = 0;
            }
            if (offset !== undefined && offset !== scrollTop) {
               this.scrollTo(offset);
               ev.preventDefault();
            }

            if (ev.nativeEvent.which === Env.constants.key.home && scrollTop !== 0) {
               this.scrollToTop();
               ev.preventDefault();
            }
            if (ev.nativeEvent.which === Env.constants.key.end && scrollTop !== scrollContainerSize) {
               this.scrollToBottom();
               ev.preventDefault();
            }
         }
      },

      _scrollbarTaken() {
         if (this._showScrollbarOnHover && (this._displayState.canScroll || this._displayState.canHorizontalScroll)) {
             // Обновляем позицию скроллабара, так как он появляется только при наведении на скролл контейнер
             //TODO: https://online.sbis.ru/opendoc.html?guid=65a30a09-0581-4506-9329-e472ea9630b5
            this._children.scrollBar?.setScrollPosition(this._scrollTop);
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
               this._pagingState.stateUp = false;
               this._pagingState.stateDown = true;
            } else if (scrollData.position === 'down') {
               this._pagingState.stateUp = true;
               this._pagingState.stateDown = false;
            } else {
               this._pagingState.stateUp = true;
               this._pagingState.stateDown = true;
            }
            this._forceUpdate();
         }
      },

      _mouseenterHandler: function(event) {
         this._scrollbarTaken(true);
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
                _private._setScrollTop(this, this._scrollTopAfterDragEnd);
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
              // Контекст для тени постоянно вызывает обновление всех заголовков при смене shadowPosition, это
              // сильно сказывается на производительности и вызывает дерганья при скролле на ios в случае,
              // когда доскроллили до низа контейнера.
              if (detection.isMobileIOS) {
                  this._stickyHeaderController.setShadowVisibility(topShadowVisible, bottomShadowVisible);
              } else {
                  this._stickyHeaderContext.updateConsumers();
              }
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
            this._topPlaceholderSizeChanged = true;
            this._topPlaceholderSize = placeholdersSizes.top;
            this._bottomPlaceholderSize = placeholdersSizes.bottom;
            this._children.scrollWatcher.updatePlaceholdersSize(placeholdersSizes);
         }
         // Виртуальный скролл взаимодействует только с ближайшим родительским скролл контейнером.
         e.stopImmediatePropagation();
      },

      _scrollToElement(event: SyntheticEvent<Event>, { itemContainer, toBottom, force }): void {
         event.stopPropagation();
         scrollToElement(itemContainer, toBottom, force);
      },

      _saveScrollPosition(event: SyntheticEvent<Event>): void {
         // На это событие должен реагировать только ближайший скролл контейнер.
         // В противном случае произойдет подскролл в ненужном контейнере
         event.stopPropagation();

         this._savedScrollTop = this._children.content.scrollTop;
         this._savedScrollPosition = this._children.content.scrollHeight - this._savedScrollTop;
          // Инерционный скролл приводит к дерганью: мы уже
          // восстановили скролл, но инерционный скролл продолжает работать и после восстановления, как итог - прыжки,
          // дерганья и лишняя загрузка данных.
          // Поэтому перед восстановлением позиции скрола отключаем инерционный скролл, а затем включаем его обратно.
          // https://popmotion.io/blog/20170704-manually-set-scroll-while-ios-momentum-scroll-bounces/
          if (Env.detection.isMobileIOS) {
              this.setOverflowScrolling('hidden');
          }
      },

      _restoreScrollPosition(event: SyntheticEvent<Event>, heightDifference: number, direction: string,
                             correctingHeight: number = 0): void {
         // На это событие должен реагировать только ближайший скролл контейнер.
         // В противном случае произойдет подскролл в ненужном контейнере
         event.stopPropagation();
          // Инерционный скролл приводит к дерганью: мы уже
          // восстановили скролл, но инерционный скролл продолжает работать и после восстановления, как итог - прыжки,
          // дерганья и лишняя загрузка данных.
          // Поэтому перед восстановлением позиции скрола отключаем инерционный скролл, а затем включаем его обратно.
          if (Env.detection.isMobileIOS) {
              this.setOverflowScrolling('');
          }
         const newPosition = direction === 'up' ?
             this._children.content.scrollHeight - this._savedScrollPosition + heightDifference - correctingHeight :
             this._savedScrollTop - heightDifference + correctingHeight;

         this._children.scrollWatcher.setScrollTop(newPosition, true);
      },

      _fixedHandler: function(topHeight, bottomHeight) {
         this._headersHeight.top = topHeight;
         this._headersHeight.bottom = bottomHeight;
         _private._updateScrollbar(this);
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
      },

       // Intersection observer

       _initObserver(): void {
           if (!this._observer) {
               this._observer = new Observer(this._intersectHandler.bind(this));
           }
       },

       _intersectionObserverRegisterHandler(event: SyntheticEvent, intersectionObserverObject: IIntersectionObserverObject): void {
           this._initObserver();
           this._observer.register(this._container, intersectionObserverObject);
           if (!intersectionObserverObject.observerName) {
               event.stopImmediatePropagation();
           }
       },

       _intersectionObserverUnregisterHandler(event: SyntheticEvent, instId: string, observerName: string): void {
           this._observer.unregister(instId, observerName);
           if (!observerName) {
               event.stopImmediatePropagation();
           }
       },

       _intersectHandler(items): void {
           this._notify('intersect', [items]);
       },

       // StickyHeaderController

       _stickyFixedHandler(event: SyntheticEvent<Event>, fixedHeaderData: IFixedEventData): void {
          this._stickyHeaderController.fixedHandler(event, fixedHeaderData);
          this._fixedHandler(
              this._stickyHeaderController.getHeadersHeight(POSITION.TOP, TYPE_FIXED_HEADERS.initialFixed),
              this._stickyHeaderController.getHeadersHeight(POSITION.BOTTOM, TYPE_FIXED_HEADERS.initialFixed)
          )
          this._notify('fixed', [this._headersHeight.top, this._headersHeight.bottom]);
       },

       _stickyRegisterHandler(event: SyntheticEvent<Event>, data: TRegisterEventData, register: boolean): void {
          this._stickyHeaderController.registerHandler(event, data, register);
       },

       getHeadersHeight(position: POSITION, type: TYPE_FIXED_HEADERS = TYPE_FIXED_HEADERS.initialFixed): number {
          return this._stickyHeaderController.getHeadersHeight(position, type)
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

// Добавлялись по задаче https://online.sbis.ru/opendoc.html?guid=1c831383-36a7-474b-9832-35e08a424034
// Функционал был эксперементальным. Закоментировали, т.к не исключаем, что это может понадбиться в будущем.
// https://online.sbis.ru/opendoc.html?guid=251ce7fe-0b79-4c02-83db-1b82be76c693
// function setEnableScrollbar(value: boolean): void {
//     enableScrollbar = value;
//     LocalStorageNative.setItem('enableScrollbar', JSON.stringify(value));
// }
//
// function getEnableScrollbar(scrollbarVisibleHard: boolean = false): void {
//     if (enableScrollbar === null) {
//         enableScrollbar = JSON.parse(LocalStorageNative.getItem('enableScrollbar'));
//         enableScrollbar = enableScrollbar === null ? true : enableScrollbar;
//     }
//     return scrollbarVisibleHard ? scrollbarVisibleHard : enableScrollbar;
// }
//
// let enableScrollbar = null;

export = Scroll;
