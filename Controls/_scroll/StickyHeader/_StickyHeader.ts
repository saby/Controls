import Control = require('Core/Control');
import Env = require('Env/Env');
import entity = require('Types/entity');
import Context = require('Controls/_scroll/StickyHeader/Context');
import {getNextId, getOffset} from 'Controls/_scroll/StickyHeader/Utils';
import IntersectionObserver = require('Controls/Utils/IntersectionObserver');
import Model = require('Controls/_scroll/StickyHeader/_StickyHeader/Model');
import template = require('wml!Controls/_scroll/StickyHeader/_StickyHeader/StickyHeader');
import tmplNotify = require('Controls/Utils/tmplNotify');
import 'css!theme?Controls/scroll';



/**
 * Ensures that content sticks to the top of the parent container when scrolling down.
 * Occurs at the moment of intersection of the upper part of the content and the parent container.
 *
 * @private
 * @extends Core/Control
 * @class Controls/_scroll/StickyHeader
 * @css @background-color_StickyHeader Background color of StickyHeader.
 */

/**
 * @name Controls/_scroll/StickyHeader#content
 * @cfg {Function} Sticky header content.
 */

/**
 * @event Controls/_scroll/StickyHeader#fixed Change the fixation state.
 * @param {Vdom/Vdom:SyntheticEvent} event Event descriptor.
 * @param {Controls/_scroll/StickyHeader/Types/InformationFixationEvent.typedef} information Information about the fixation event.
 */

var _private = {
   getComputedStyle: function(self) {
      let container = _private._getNormalizedContainer(self);
      if (self._cssClassName !== container.className) {
         self._cssClassName = container.className;
         self._cachedStyles = getComputedStyle(container);
      }
      return self._cachedStyles;
   },

   _getNormalizedContainer: function(self) {
      //TODO remove after complete https://online.sbis.ru/opendoc.html?guid=7c921a5b-8882-4fd5-9b06-77950cbe2f79
      // There's no container at first building of template.
      if (!self._container) {
         return;
      }
      return self._container.get ? self._container.get(0) : self._container;
   },

   _isSafari13: function(): boolean {
      // TODO remove after complete https://online.sbis.ru/opendoc.html?guid=14d98228-de34-4ad3-92a3-4d7fe8770097
      if (Env.detection.safari) {
         const safariVersionMatching = Env.detection.userAgent.match(/Version\/([0-9\.]*)/);
         if (safariVersionMatching) {
            return parseInt(safariVersionMatching[1], 10) >= 13;
         }
      }
      // Check chrome ang safari on ios 13.
      if (Env.detection.isMobileIOS && Env.detection.IOSVersion >= 13) {
         return true;
      }
      return false;
   }
};

// For android, use a large patch, because 1 pixel is not enough. For all platforms we use the minimum values since
// there may be layout problems if the headers will have paddings, margins, etc.
const
    ANDROID_GAP_FIX_OFFSET = 2,
    MOBILE_GAP_FIX_OFFSET = 1;

var StickyHeader = Control.extend({

   /**
    * @type {Function} Component display template.
    * @private
    */
   _template: template,

   /**
    * @type {IntersectionObserver}
    * @private
    */
   _observer: null,

   /**
    * type {Boolean} Determines whether the component is built on the Android mobile platform.
    * @private
    */
   _isMobilePlatform: Env.detection.isMobilePlatform,
   _isMobileAndroid: Env.detection.isMobileAndroid,
   _isSafari13: _private._isSafari13(),

   _shadowVisible: true,
   _stickyHeadersHeight: null,

   _index: null,

   _height: 0,

   _reverseOffsetStyle: null,
   _minHeight: 0,
   _cachedStyles: null,
   _cssClassName: null,

   _notifyHandler: tmplNotify,

   _bottomShadowStyle: '',

   constructor: function() {
      StickyHeader.superclass.constructor.apply(this, arguments);
      this._observeHandler = this._observeHandler.bind(this);
      this._index = getNextId();
      this._stickyHeadersHeight = {
         top: 0,
         bottom: 0
      };
   },

   _afterUpdate: function() {
      this._updateBottomShadowStyle();
   },

   _afterMount: function() {
      var children = this._children;

      this._notify('stickyRegister', [{
         id: this._index,
         inst: this,
         position: this._options.position,
         mode: this._options.mode
      }, true], { bubbling: true });
      this._observer = new IntersectionObserver(this._observeHandler);
      this._model = new Model({
         topTarget: children.observationTargetTop,
         bottomTarget: children.observationTargetBottom,
         position: this._options.position,
      });

      this._observer.observe(children.observationTargetTop);
      this._observer.observe(children.observationTargetBottom);

      this._updateBottomShadowStyle();
   },

   _beforeUnmount: function() {
      this._model.destroy();
      this._stickyDestroy = true;

      // его может и не быть, если контрол рушится не успев замаунтиться
      if (this._observer) {
          this._observer.disconnect();
      }

      //Let the listeners know that the element is no longer fixed before the unmount.
      this._fixationStateChangeHandler('', this._model.fixedPosition);
      this._observeHandler = undefined;
      this._observer = undefined;
      this._notify('stickyRegister', [{ id: this._index }, false], { bubbling: true });
   },

   getOffset: function(parentElement, position) {
      return getOffset(parentElement, this._container, position);
   },

   get height() {
      //TODO remove after complete https://online.sbis.ru/opendoc.html?guid=7c921a5b-8882-4fd5-9b06-77950cbe2f79
      const container = (this._container && this._container.get) ? this._container.get(0) : this._container;
      // If the header is hidden we cannot calculate its current height.
      // Use the height that it had before it was hidden.
      if (container.offsetParent !== null) {
         this._height = container.offsetHeight;
      }
      return this._height;
   },

   get top() {
      return this._stickyHeadersHeight.top;
   },

   set top(value) {
      if (this._stickyHeadersHeight.top !== value) {
         this._stickyHeadersHeight.top = value;
         this._forceUpdate();
      }
   },

   get bottom() {
      return this._stickyHeadersHeight.bottom;
   },

   set bottom(value) {
      if (this._stickyHeadersHeight.bottom !== value) {
         this._stickyHeadersHeight.bottom = value;
         this._forceUpdate();
      }
   },

   _resizeHandler: function() {
      this._notify('stickyHeaderResize', [], {bubbling: true});
   },

   /**
    * Handles changes to the visibility of the target object of observation at the intersection of the root container.
    * @param {IntersectionObserverEntry[]} entries The intersections between the target element and its root container at a specific moment of transition.
    * @private
    */
   _observeHandler: function(entries) {
      /**
       * Баг IntersectionObserver на Mac OS: сallback может вызываться после отписки от слежения. Отписка происходит в
       * _beforeUnmount. Устанавливаем защиту.
       */
      if (this._stickyDestroy) {
         return;
      }
      // FIXME: this._container - jQuery element in old controls envirmoment https://online.sbis.ru/opendoc.html?guid=d7b89438-00b0-404f-b3d9-cc7e02e61bb3
      let container = this._container;
      let popupContainer = container.closest('.controls-Popup__template');

      // Stack popups can be hidden when child popup has a large width.
      // In this case don't start observable handler.
      if (popupContainer && popupContainer.classList.contains('ws-hidden')) {
         return;
      }
      var fixedPosition = this._model.fixedPosition;

      this._model.update(entries);

      if (this._model.fixedPosition !== fixedPosition) {
         this._fixationStateChangeHandler(this._model.fixedPosition, fixedPosition);
         this._forceUpdate();
      }
   },

   /**
    * To inform descendants about the fixing status. To update the state of the instance.
    * @private
    */
   _fixationStateChangeHandler: function(newPosition, prevPosition) {
      // If the header is hidden we cannot calculate its current height.
      // Use the height that it had before it was hidden.
      if (this._container.offsetParent !== null) {
         this._offsetHeight = this._container.offsetHeight;
      }
      var information = {
         id: this._index,
         fixedPosition: newPosition,
         offsetHeight: this._offsetHeight,
         prevPosition: prevPosition,
         mode: this._options.mode
      };

      this._shadowVisible = !!newPosition;
      this._notify('fixed', [information], {bubbling: true});
   },

   _getStyle: function() {
      var
         offset = 0,
         container,
         top,
         bottom,
         fixedPosition,
         styles,
         style = '',
         minHeight;

      /**
       * On android and ios there is a gap between child elements.
       * When the header is fixed, there is a space between the container, relative to which it is fixed,
       * and the header, through which you can see the scrolled content. Its size does not exceed one pixel.
       * https://jsfiddle.net/tz52xr3k/3/
       *
       * As a solution, move the header up and increase its size by an offset, using padding.
       * In this way, the content of the header does not change visually, and the free space disappears.
       * The offset must be at least as large as the free space. Take the nearest integer equal to one.
       */
      if (this._isMobileAndroid) {
         offset = ANDROID_GAP_FIX_OFFSET;
      } else if (this._isMobilePlatform) {
         offset = MOBILE_GAP_FIX_OFFSET;
      }

      fixedPosition = this._model ? this._model.fixedPosition : undefined;

      if (this._options.position.indexOf('top') !== -1) {
         // todo Сейчас stickyHeader не умеет работать с многоуровневыми Grid-заголовками, это единственный вариант их фиксировать
         // поправим по задаче: https://online.sbis.ru/opendoc.html?guid=2737fd43-556c-4e7a-b046-41ad0eccd211
         const offsetTop = this._options.offsetTop;
         top = this._stickyHeadersHeight.top;

         if (offsetTop) {
            top = offsetTop + top;
         }

         if (this._context.stickyHeader) {
            top += this._context.stickyHeader.top;
         }

         style += 'top: ' + (top - (fixedPosition ? offset : 0))  + 'px;';
      }

      if (this._options.position.indexOf('bottom') !== -1) {
         bottom = this._stickyHeadersHeight.bottom;
         const offsetBottom = this._options.offsetBottom;
         if (offsetBottom) {
            bottom += offsetBottom;
         }
         if (this._context.stickyHeader) {
            bottom += this._context.stickyHeader.bottom;
         }
         style += 'bottom: ' + (bottom - offset) + 'px;';
      }

      if (fixedPosition) {
         if (offset) {
            container = _private._getNormalizedContainer(this);

            styles = _private.getComputedStyle(this);
            minHeight = parseInt(styles.minHeight, 10);
            // Increasing the minimum height, otherwise if the content is less than the established minimum height,
            // the height is not compensated by padding and the header is shifted. If the minimum height is already
            // set by the style attribute, then do not touch it.
            if (styles.boxSizing === 'border-box' && minHeight && !container.style.minHeight) {
               this._minHeight = minHeight + offset;
            }
            if (this._minHeight) {
               style += 'min-height:' + this._minHeight + 'px;';
            }
            // Increase border or padding by offset.
            // If the padding or border is already set by the style attribute, then don't change it.
            if (this._reverseOffsetStyle === null) {
               const borderWidth: number = parseInt(styles['border-' + fixedPosition + '-width'], 10);

               if (borderWidth) {
                  this._reverseOffsetStyle = 'border-' + fixedPosition + '-width:' + (borderWidth + offset) + 'px;';
               } else {
                  this._reverseOffsetStyle = 'padding-' + fixedPosition + ':' + (parseInt(styles.paddingTop, 10) + offset) + 'px;';
               }
            }

            style += this._reverseOffsetStyle;
            style += 'margin-' + fixedPosition + ': -' + offset + 'px;';
         }

         style += 'z-index: ' + this._options.fixedZIndex + ';';
      }

      //убрать по https://online.sbis.ru/opendoc.html?guid=ede86ae9-556d-4bbe-8564-a511879c3274
      if (this._options.task1177692247 && this._options.fixedZIndex) {
         style += 'z-index: ' + this._options.fixedZIndex + ';';
      }

      return style;
   },

   _getObserverStyle: function(position) {
      // The top observer has a height of 1 pixel. In order to track when it is completely hidden
      // beyond the limits of the scrollable container, taking into account round-off errors,
      // it should be located with an offset of -3 pixels from the upper border of the container.
      let coord = this._stickyHeadersHeight[position] + 3;
      if (position === 'top' && this._options.offsetTop && this._options.shadowVisibility === 'visible') {
         coord += this._options.offsetTop;
      }

      // "bottom" and "right" styles does not work in list header control on ios 13. Use top instead.
      const container = _private._getNormalizedContainer(this);
      if (this._isSafari13 && position === 'bottom') {
         return 'top: ' + (coord + (container ? container.offsetHeight : 0)) + 'px;';
      }

      return position + ': -' + coord + 'px;';
   },

   _updateBottomShadowStyle: function(): string {
      if (this._isSafari13) {
         const container = _private._getNormalizedContainer(this);
         // "bottom" and "right" styles does not work in list header control on ios 13. Use top instead.
         // There's no container at first building of template.
         if (container) {
            this._bottomShadowStyle = 'bottom: unset; right: unset; top:' + container.offsetHeight + 'px;' +
                'width:' + container.offsetWidth + 'px;';
         }
      }
   },

   _updateStickyShadow: function(e, ids) {
      const shadowVisible = ids.indexOf(this._index) !== -1;
      if (this._shadowVisible !== shadowVisible) {
         this._shadowVisible = shadowVisible;
         this._forceUpdate();
      }
   },

   _isShadowVisible: function(shadowPosition) {
      //The shadow from above is shown if the element is fixed from below, from below if the element is fixed from above.
      var fixedPosition = shadowPosition === 'top' ? 'bottom' : 'top';

      return (!this._context.stickyHeader || this._context.stickyHeader.shadowPosition.indexOf(fixedPosition) !== -1) &&
          (this._model && this._model.fixedPosition === fixedPosition) && this._options.shadowVisibility === 'visible' &&
          (this._options.mode === 'stackable' || this._shadowVisible);
   }
});

StickyHeader._index = 1;

StickyHeader._private = _private;

StickyHeader.contextTypes = function() {
   return {
      stickyHeader: Context
   };
};

StickyHeader.getDefaultOptions = function() {
   return {

      //TODO: https://online.sbis.ru/opendoc.html?guid=a5acb7b5-dce5-44e6-aa7a-246a48612516
      fixedZIndex: 2,
      shadowVisibility: 'visible',
      backgroundVisible: true,
      mode: 'replaceable',
      position: 'top'
   };
};

StickyHeader.getOptionTypes = function() {
   return {
      shadowVisibility: entity.descriptor(String).oneOf([
         'visible',
         'hidden'
      ]),
      backgroundVisible: entity.descriptor(Boolean),
      mode: entity.descriptor(String).oneOf([
         'replaceable',
         'stackable'
      ]),
      position: entity.descriptor(String).oneOf([
         'top',
         'bottom',
         'topbottom'
      ])
   };
};

export = StickyHeader;
