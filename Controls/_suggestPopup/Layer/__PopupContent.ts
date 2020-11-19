import BaseLayer from './__BaseLayer';
import {constants, detection} from 'Env/Env';
import template = require('wml!Controls/_suggestPopup/Layer/__PopupContent');

var _private = {
   getBorderWidth: function(container) {
      return +getComputedStyle(container, null).getPropertyValue('border-left-width').replace('px', '') * 2;
   },
   getSuggestWidth(target: HTMLElement, container?: HTMLElement): number {
      return target.offsetWidth - (container ? _private.getBorderWidth(container) : 0);
   }
};

var __PopupContent = BaseLayer.extend({

   _template: template,
   _positionFixed: false,
   _popupOptions: null,
   _suggestWidth: null,
   _reverseList: false,
   _pendingShowContent: null,
   _showContent: false,
   _shouldScrollToBottom: false,

   _beforeUpdate(newOptions): void {
      __PopupContent.superclass._beforeUpdate.apply(this, arguments);

      const isPopupOpenedToTop = newOptions.stickyPosition && newOptions.stickyPosition.direction.vertical === 'top';

      if (!this._reverseList && isPopupOpenedToTop && !this._showContent) {
          // scroll after list render in  _beforePaint hook
         this._shouldScrollToBottom = true;
      }
      this._pendingShowContent = newOptions.showContent;

      if (isPopupOpenedToTop !== this._reverseList) {
         this._showContent = false;
         this._reverseList = isPopupOpenedToTop;
      }
   },

   _afterUpdate(oldOptions): void {
      // need to notify resize after show content, that the popUp recalculated its position
      if (this._options.showContent !== oldOptions.showContent) {
         this._notify('controlResize', [], {bubbling: true});
      }

      // Для Ipad'а фиксируем автодополнение, только если клавиатура уже отображается или
      // автодополнение отобразилось вверх, если оно отобразилось вниз,
      // то при появлении клавиатуры автодополнению может не хватить места тогда оно должно будет отобразиться сверху
      const allowFixPositionOnIpad = this._reverseList ||
                                     (constants.isBrowserPlatform && document.activeElement &&
                                         document.activeElement.tagName === 'INPUT');

      if (this._showContent && !this._positionFixed && (!detection.isMobileIOS || allowFixPositionOnIpad)) {
         this._positionFixed = true;
         this._notify('sendResult', [this._options.stickyPosition], {bubbling: true});
      }

      if (this._pendingShowContent) {
         this._showContent = this._pendingShowContent;
         this._pendingShowContent = null;
      }
   },

   _beforePaint(): void {
      if (this._shouldScrollToBottom) {
         this._children.scrollContainer.scrollToBottom();
         this._shouldScrollToBottom = false;
      }
   },

   _beforeMount(options): void {
      if (options.target) {
         this._suggestWidth = _private.getSuggestWidth(options.target[0] || options.target);
      }
      __PopupContent.superclass._beforeMount.apply(this, arguments);
   },

   _afterMount(): void {
      // fix _options.target[0] || _options.target
      // after https://online.sbis.ru/opendoc.html?guid=d7b89438-00b0-404f-b3d9-cc7e02e61bb3
      const target: HTMLElement = this._options.target[0] || this._options.target;
      const container: HTMLElement = this._container[0] || this._container;

      /* Width of the suggestion popup should set for template from suggestTemplate option,
         this is needed to make it possible to set own width for suggestions popup by user of control.
         Than user can set own width:
         <Controls.suggest:Input>
            <ws:suggestTemplate>
               <Controls.suggestPopup:ListContainer/>     <---- here you can set the width by the class with min-width
            </ws:suggestTemplate>
         <Controls.suggest:Input/> */
      this._suggestWidth = _private.getSuggestWidth(target, container);
      this._forceUpdate();
   },

   resize: function() {
      if (this._reverseList) {
         this._children.scrollContainer.scrollToBottom();
      }
   }
});
__PopupContent._theme = ['Controls/suggest', 'Controls/suggestPopup'];
__PopupContent._private = _private;

export default __PopupContent;
