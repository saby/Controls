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
import 'css!theme?Controls/scroll';
import * as newEnv from 'Core/helpers/isNewEnvironment';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Logger} from "UI/Utils";

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
 * @demo Controls-demo/Container/Scroll
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
 */

/**
 * @name Controls/_scroll/Container#bottomShadowVisibility
 * @cfg {shadowVisibility} Устанавливает режим отображения тени снизу.
 */

/**
 * @name Controls/_scroll/Container#scrollbarVisible
 * @cfg {Boolean} Следует ли отображать скролл.
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
   BOTTOM = 'bottom'
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

var
   _private = {
      SHADOW_HEIGHT: 8,
      KEYBOARD_SHOWING_DURATION: 500,

      /**
       * Получить расположение тени внутри контейнера в зависимости от прокрутки контента.
       * @return {String}
       */
      calcShadowPosition: function(scrollTop, containerHeight, scrollHeight) {
         var shadowPosition = '';

         if (scrollTop > 0) {
            shadowPosition += 'top';
         }

         // The scrollHeight returned by the browser is more, because of the invisible elements
         // that climbs outside of the fixed headers (shadow and observation targets).
         // We take this into account when calculating. 8 pixels is the height of the shadow.
         if ((Env.detection.firefox || Env.detection.isIE) && isStickySupport()) {
            scrollHeight -= _private.SHADOW_HEIGHT;
         }

         // Compare with 1 to prevent rounding errors in the scale do not equal 100%
         if (scrollHeight - containerHeight - scrollTop >= 1) {
            shadowPosition += 'bottom';
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
             visibleOptionValue = self._options[`${position}ShadowVisibility`];

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

      getScrollHeight: function(container) {
         return container.scrollHeight;
      },

      getContainerHeight: function(container) {
         return container.offsetHeight;
      },

      getScrollTop: function(self, container) {
         return container.scrollTop + self._topPlaceholderSize;
      },

      setScrollTop: function(self, scrollTop) {
         self._children.scrollWatcher.setScrollTop(scrollTop);
         self._scrollTop = _private.getScrollTop(self, self._children.content);
         _private.notifyScrollEvents(self, scrollTop);
      },

      notifyScrollEvents: function(self, scrollTop) {
         self._notify('scroll', [scrollTop]);
         const eventCfg = {
             type: 'scroll',
             target: self._children.content,
             currentTarget: self._children.content,
             _bubbling: false
         };
         self._children.scrollDetect.start(new SyntheticEvent(null, eventCfg), scrollTop);
      },

      calcCanScroll: function(self) {
         var
            scrollHeight = _private.getScrollHeight(self._children.content),
            containerHeight = _private.getContainerHeight(self._children.content);

         /**
          * In IE, if the content has a rational height, the height is rounded to the smaller side,
          * and the scrollable height to the larger side. Reduce the scrollable height to the real.
          */
         if (Env.detection.isIE) {
            scrollHeight--;
         }

         return scrollHeight > containerHeight;
      },

      getContentHeight: function(self) {
         return _private.getScrollHeight(self._children.content) - self._headersHeight.top -
            self._headersHeight.bottom + self._topPlaceholderSize + self._bottomPlaceholderSize;
      },

      getShadowPosition: function(self) {
         var
            scrollTop = _private.getScrollTop(self, self._children.content),
            scrollHeight = _private.getScrollHeight(self._children.content),
            containerHeight = _private.getContainerHeight(self._children.content);

         return _private.calcShadowPosition(scrollTop, containerHeight, scrollHeight + self._topPlaceholderSize + self._bottomPlaceholderSize);
      },

      calcHeightFix: function(self) {
         return ScrollHeightFixUtil.calcHeightFix(self._children.content);
      },

      calcDisplayState: function(self) {
         const
             canScroll = _private.calcCanScroll(self),
             topShadowEnable = self._options.topShadowVisibility === SHADOW_VISIBILITY.VISIBLE ||
                 (_private.isShadowEnable(self._options, POSITION.TOP) && canScroll),
             bottomShadowEnable = self._options.bottomShadowVisibility === SHADOW_VISIBILITY.VISIBLE ||
                 (_private.isShadowEnable(self._options, POSITION.BOTTOM) && canScroll),
             shadowPosition = topShadowEnable || bottomShadowEnable ? _private.getShadowPosition(self) : '';
         return {
            heightFix: _private.calcHeightFix(self),
            canScroll: canScroll,
            contentHeight: _private.getContentHeight(self),
            shadowPosition,
            shadowEnable: {
               top: topShadowEnable,
               bottom: bottomShadowEnable
            },
            shadowVisible: {
               top: topShadowEnable ? _private.isShadowVisible(self, POSITION.TOP, shadowPosition) : false,
               bottom: bottomShadowEnable ? _private.isShadowVisible(self, POSITION.BOTTOM, shadowPosition) : false
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

      updateDisplayState: function(self, displayState) {
         self._displayState.canScroll = displayState.canScroll;
         self._displayState.heightFix = displayState.heightFix;
         self._displayState.contentHeight = displayState.contentHeight;
         self._displayState.shadowPosition = displayState.shadowPosition;
         self._displayState.shadowEnable = displayState.shadowEnable;
         self._displayState.shadowVisible = displayState.shadowVisible;
      },

      proxyEvent: function(self, event, eventName, args) {
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
      _scrollbarStyles: '',

      _topPlaceholderSize: 0,
      _bottomPlaceholderSize: 0,

      _scrollTopAfterDragEnd: undefined,
      _scrollLockedPosition: null,

      constructor: function(cfg) {
         Scroll.superclass.constructor.call(this, cfg);
      },

      _beforeMount: function(options, context, receivedState) {
         var
            self = this,
            def;

         if ('shadowVisible' in options) {
            Logger.warn('Controls/scroll:Container: Опция shadowVisible устарела, используйте topShadowVisibility и bottomShadowVisibility.', self);
         }

         this._shadowVisibilityByInnerComponents = {
            top: SHADOW_VISIBILITY.AUTO,
            bottom: SHADOW_VISIBILITY.AUTO
         };
         this._displayState = {};
         this._stickyHeaderContext = new StickyHeaderContext({
            shadowPosition: options.topShadowVisibility !== SHADOW_VISIBILITY.HIDDEN ? 'bottom' : ''
         });
         this._headersHeight = {
            top: 0,
            bottom: 0
         };

         if (context.ScrollData && context.ScrollData.pagingVisible) {
            //paging buttons are invisible. Control calculates height and shows buttons after mounting.
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
            this._styleHideScrollbar = receivedState.styleHideScrollbar || ScrollWidthUtil.calcStyleHideScrollbar();
            this._useNativeScrollbar = receivedState.useNativeScrollbar;
         } else {
            def = new Deferred();

            def.addCallback(function() {
               var
                  topShadowVisible = _private.getInitialShadowVisibleState(options, POSITION.TOP),
                  bottomShadowVisible = _private.getInitialShadowVisibleState(options, POSITION.BOTTOM),
                  displayState = {
                     heightFix: ScrollHeightFixUtil.calcHeightFix(),
                     shadowPosition: '',
                     shadowEnable: {
                        top: topShadowVisible,
                        bottom: bottomShadowVisible
                     },
                     shadowVisible: {
                        top: topShadowVisible,
                        bottom: bottomShadowVisible
                     }
                  },
                  styleHideScrollbar = ScrollWidthUtil.calcStyleHideScrollbar(),

                  // На мобильных устройствах используется нативный скролл, на других платформенный.
                  useNativeScrollbar = Env.detection.isMobileIOS || Env.detection.isMobileAndroid;

               _private.updateDisplayState(self, displayState);
               self._styleHideScrollbar = styleHideScrollbar;
               self._useNativeScrollbar = useNativeScrollbar;

               return {
                  displayState: displayState,
                  styleHideScrollbar: styleHideScrollbar,
                  useNativeScrollbar: useNativeScrollbar
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

         calculatedOptionValue = _private.calcCanScroll(this);
         if (calculatedOptionValue) {
            this._displayState.canScroll = calculatedOptionValue;
            needUpdate = true;
         }

         this._displayState.contentHeight = _private.getContentHeight(this);

         calculatedOptionValue = _private.getShadowPosition(this);
         if (calculatedOptionValue) {
            this._displayState.shadowPosition = calculatedOptionValue;
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

          //TODO Compatibility на старых страницах нет Register, который скажет controlResize
          this._resizeHandler = this._resizeHandler.bind(this);
          if (!newEnv() && window) {
              window.addEventListener('resize', this._resizeHandler);
          }
      },

      _beforeUpdate: function(options, context) {
         this._pagingState.visible = context.ScrollData && context.ScrollData.pagingVisible && this._displayState.canScroll;
         this._updateStickyHeaderContext();
      },

      _afterUpdate: function() {
         var displayState = _private.calcDisplayState(this);

         if (!isEqual(this._displayState, displayState)) {
            this._displayState = displayState;
            this._updateStickyHeaderContext();

            this._forceUpdate();
         }
      },

      _beforeUnmount(): void {
         //TODO Compatibility на старых страницах нет Register, который скажет controlResize
         if (!newEnv() && window) {
            window.removeEventListener('resize', this._resizeHandler);
         }

         Bus.globalChannel().unsubscribe('MobileInputFocus', this._lockScrollPositionUntilKeyboardShown);
         this._lockScrollPositionUntilKeyboardShown = null;
      },

      _shadowVisible: function(position: POSITION) {

         // Do not show shadows on the scroll container if there are fixed headers. They display their own shadows.
         if (this._children.stickyController && this._children.stickyController.hasFixed(position)) {
            return false;
         }

         // On ipad with inertial scrolling due to the asynchronous triggering of scrolling and caption fixing  events,
         // sometimes it turns out that when the first event is triggered, the shadow must be displayed,
         // and immediately after the second event it is not necessary.
         // These conditions appear during scrollTop < 0. Just do not display the shadow when scrollTop < 0.
         if (Env.detection.isMobileIOS && position === POSITION.TOP &&
               _private.getScrollTop(this, this._children.content) < 0) {
            return false;
         }

         return this._displayState.shadowVisible[position];
      },

      _updateShadowMode(event, shadowVisibleObject): void {
         this._shadowVisibilityByInnerComponents = shadowVisibleObject;
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
         var computedStyle = getComputedStyle(this._children.content);
         var marginTop = parseInt(computedStyle.marginTop, 10);
         var marginRight = parseInt(computedStyle.marginRight, 10);

         this._contentStyles = this._styleHideScrollbar.replace(/-?\d+/g, function(found) {
            return parseInt(found, 10) + marginRight;
         });

         if (this._stickyHeaderContext.top !== -marginTop) {
            this._stickyHeaderContext.top = -marginTop;
            this._stickyHeaderContext.updateConsumers();
         }
      },

      _resizeHandler: function() {
         const displayState = _private.calcDisplayState(this);

         if (!isEqual(this._displayState, displayState)) {
            this._displayState = displayState;
         }

         _private.calcPagingStateBtn(this);
      },

      _scrollHandler: function(ev) {
         const scrollTop = _private.getScrollTop(this, this._children.content);

         if (this._scrollLockedPosition !== null) {
            this._children.content.scrollTop = this._scrollLockedPosition;

            // Проверяем, изменился ли scrollTop, чтобы предотвратить ложные срабатывания события.
            // Например, при пересчете размеров перед увеличением, плитка может растянуть контейнер между перерисовок,
            // и вернуться к исходному размеру.
            // После этого  scrollTop остается прежним, но срабатывает незапланированный нативный scroll
         } else if (this._scrollTop !== scrollTop) {
            if (!this._dragging) {
               this._scrollTop = scrollTop;
               this._notify('scroll', [this._scrollTop]);
            } else {
               // scrollTop нам во время перетаскивания могут проставить извне (например
               // восстановив скролл после подгрузки новых данных). Во время перетаскивания,
               // мы не меняем наш scrollTop, чтобы сам скролл и позиция ползунка не
               // перепрыгнули из под мышки пользователя, но запомним эту позицию,
               // возможно нужно будет установить ее после завершения перетаскивания
               this._scrollTopAfterDragEnd = scrollTop;
            }
            this._children.scrollDetect.start(ev, this._scrollTop);
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
               offset = scrollTop + 40;
            }
            if (ev.nativeEvent.which === Env.constants.key.pageUp) {
               offset = scrollTop - this._children.content.clientHeight;
            }
            if (ev.nativeEvent.which === Env.constants.key.up) {
               offset = scrollTop - 40;
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

      _scrollbarTaken: function() {
         if (this._showScrollbarOnHover && this._displayState.canScroll) {
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

      /**
       * TODO: убрать после выполнения https://online.sbis.ru/opendoc.html?guid=93779c1a-8d18-42fe-8dc8-1bab779d0943.
       * Переделать на bind в шаблоне и избавится от прокидывания опций.
       */
      _positionChangedHandler: function(event, position) {
         _private.setScrollTop(this, position);
      },

      _draggingChangedHandler: function(event, dragging) {
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

      /**
       * Update the context value of sticky header.
       * TODO: Плохой метод. Дублирование tmpl и вызов должен только в методе изменения видимости тени. Будет поправлено по https://online.sbis.ru/opendoc.html?guid=01c0fb63-9121-4ee4-a652-fe9c329eec8f
       * @param shadowVisible
       * @private
       */
      _updateStickyHeaderContext: function() {
         var
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
         return offset < this._children.content.scrollHeight - this._children.content.clientHeight;
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
       * Скроллит к низу контейнера
       * @function Controls/_scroll/Container#scrollToBottom
       */

      /*
       * Scrolls to the bottom of the container.
       * @function Controls/_scroll/Container#scrollToBottom
       */
      scrollToBottom: function() {
         _private.setScrollTop(this, _private.getScrollHeight(this._children.content) + this._topPlaceholderSize);
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

      _saveScrollPosition: function(e) {
         /**
          * Only closest scroll container should react to this event, so we have to stop propagation here.
          * Otherwise we can accidentally scroll a wrong element.
          */
         e.stopPropagation();
         // todo KINGO. Костыль с родословной из старых списков. Инерционный скролл приводит к дерганью: мы уже
         // восстановили скролл, но инерционный скролл продолжает работать и после восстановления, как итог - прыжки,
         // дерганья и лишняя загрузка данных.
         // Поэтому перед восстановлением позиции скрола отключаем инерционный скролл, а затем включаем его обратно.
         // https://popmotion.io/blog/20170704-manually-set-scroll-while-ios-momentum-scroll-bounces/
         if (Env.detection.isMobileIOS) {
            this.setOverflowScrolling('auto');
         }
      },

      _restoreScrollPosition: function(e: SyntheticEvent<Event>, position: number): void {
         /**
          * Only closest scroll container should react to this event, so we have to stop propagation here.
          * Otherwise we can accidentally scroll a wrong element.
          */
         e.stopPropagation();
         this._children.scrollWatcher.setScrollTop(position, true);
          // todo KINGO. Костыль с родословной из старых списков. Инерционный скролл приводит к дерганью: мы уже
         // восстановили скролл, но инерционный скролл продолжает работать и после восстановления, как итог - прыжки,
         // дерганья и лишняя загрузка данных.
         // Поэтому перед восстановлением позиции скрола отключаем инерционный скролл, а затем включаем его обратно.
         // https://popmotion.io/blog/20170704-manually-set-scroll-while-ios-momentum-scroll-bounces/
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
      }
   });

Scroll.getDefaultOptions = function() {
   return {
      topShadowVisibility: SHADOW_VISIBILITY.AUTO,
      bottomShadowVisibility: SHADOW_VISIBILITY.AUTO,
      scrollbarVisible: true
   };
};

Scroll.contextTypes = function() {
   return {
      ScrollData: ScrollData
   };
};

Scroll._private = _private;

export = Scroll;
