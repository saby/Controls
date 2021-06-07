/**
 * Created by am.gerasimov on 18.04.2018.
 */
import { Control } from 'UI/Base';
import template = require('wml!Controls/_suggestPopup/Layer/__ContentLayer');
import 'css!Controls/suggestPopup';
import 'css!Controls/suggest';

var _private = {
   getSizes(self, dropDownContainer?: HTMLElement): object {
      const boundingClientToJSON = (bc) => {
         let resultObj = {};

         // firefox bug, clientRect object haven't method toJSON
         if (bc.toJSON) {
            resultObj = bc.toJSON();
         } else {
            for (const i in bc) {
               // hasOwnProperty does not work correctly on clientRect object in FireFox and IE (not all versions)
               if (Object.getPrototypeOf(bc).hasOwnProperty(i)) {
                  resultObj[i] = bc[i];
               }
            }
         }

         return resultObj;
      };
      let result;

      let container = self._container;
      let targetContainer = self._options.target;

      //TODO https://online.sbis.ru/opendoc.html?guid=d7b89438-00b0-404f-b3d9-cc7e02e61bb3
      if (container.get) {
         container = container.get(0);
      }
      if (targetContainer.get) {
         targetContainer = targetContainer.get(0);
      }

      const oldHeight = container.style.height;

      //reset height to get real height of content
      //the only solution is to get height avoiding synchronization
      container.style.height = '';

      const suggestBCR = boundingClientToJSON(container.getBoundingClientRect());
      const containerBCR =  boundingClientToJSON(targetContainer.getBoundingClientRect());
      const dropDownContainerBCR = _private.getDropDownContainerSize(dropDownContainer);

      /* because dropDownContainer can have height smaller, than window height */
      const fixSizesByDDContainer = (size) => {
         size.top -= dropDownContainerBCR.top;
         size.bottom -= dropDownContainerBCR.top;
         return size;
      };

      result = {
         suggest: fixSizesByDDContainer(suggestBCR),
         container: fixSizesByDDContainer(containerBCR)
      };

      //after reset height need to return old height, new height will be set by VDOM after synchronization
      container.style.height = oldHeight;
      return result;
   },

   getDropDownContainerSize(container?: HTMLElement): DOMRect {
      const dropdownContainer = container ||
         document.getElementsByClassName('controls-Popup__stack-target-container')[0] || document.body;
      return dropdownContainer.getBoundingClientRect();
   },

   updateHeight(self): void {
      const height = _private.calcHeight(self);
      const heightChanged = self._height !== height;

      if (heightChanged) {
         self._height = height;
         self._controlResized = true;
      }
   },

   determineOpenDirection(self): void {
      const sizes = _private.getSizes(self);
      const dropDownContainerSize = _private.getDropDownContainerSize();
      const suggestSize = sizes.suggest;

      const targetSizes = self._options.target.getBoundingClientRect();

      self._openDirection = (targetSizes.left + suggestSize.width > dropDownContainerSize.width) ? 'left' : 'right';
   },

   /**
    * calculate height of suggestions container by orient and suggestions container sizes
    * @param self
    * @param sizes size of suggestions container and input container
    * @param dropDownContainer container for dropDown
    * @returns {string}
    */
   calcHeight(self, dropDownContainer): string {
      const sizes = _private.getSizes(self, dropDownContainer);
      const dropDownContainerSize = _private.getDropDownContainerSize(dropDownContainer);
      const suggestSize = sizes.suggest;
      let height = self._height;
      const optionValue = suggestSize.top;
      const suggestBottomSideCoord = optionValue + suggestSize.height;

      if (suggestBottomSideCoord < 0) {
         height = suggestSize.height + suggestBottomSideCoord + 'px';
      } else if (suggestBottomSideCoord >= dropDownContainerSize.height) {
         height = dropDownContainerSize.height - suggestSize.top + 'px';
      } else if (height) {
         height = 'auto';
      }
      return height;
   },

   updateMaxHeight(self): void {
      const dropDownContainerBCR = _private.getDropDownContainerSize();
      if (dropDownContainerBCR !== self._dropDownContainerBCR) {
         self._dropDownContainerBCR = dropDownContainerBCR;
         const suggestBCR = self._container.getBoundingClientRect();
         self._maxHeight = dropDownContainerBCR.height - suggestBCR.top + 'px';
      }
   }
};

var __ContentLayer = Control.extend({

   _template: template,
   _height: '0px',
   _openDirection: 'right',
   _maxHeight: 'none',
   _minWidth: '',
   _showContent: false,

   _afterMount(): void {
      _private.updateHeight(this);
      this._minWidth = this._getMinWidth();
   },

   _afterUpdate(): void {
      /* 1) checking suggestionsContainer in children, because suggest initializing asynchronously
       2) do not change orientation of suggest, if suggest already showed or data loading now */
      _private.updateMaxHeight(this);
      if (this._options.showContent) {
         const needNotifyControlResizeEvent = this._controlResized;

         _private.updateHeight(this);
         _private.determineOpenDirection(this);

         this._showContent = this._options.showContent;
         if (needNotifyControlResizeEvent) {
            this._children.resize.start();
            this._controlResized = false;
         }
      }
   },

   _resize(): void {
      _private.updateMaxHeight(this);
      _private.updateHeight(this);
      _private.determineOpenDirection(this);
   },

   _getMinWidth(): string {
      return this._options.target.offsetWidth +
             this._children.closeButton._container.offsetWidth +
             Math.abs(this._container.offsetLeft) * 2 +
             'px';
   },

   close(): void {
      this._notify('close', [], {bubbling: true});
   }

});
__ContentLayer._private = _private;

export default __ContentLayer;
