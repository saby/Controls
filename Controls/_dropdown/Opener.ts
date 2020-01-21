import {Sticky} from 'Controls/popup';
import Merge = require('Core/core-merge');
import getZIndex = require('Controls/Utils/getZIndex');

var _private = {
   setPopupOptions: function (self, popupOptions) {
      Merge(popupOptions.templateOptions, self._options.templateOptions);
      popupOptions.className = popupOptions.className || self._options.className;
      popupOptions.template = 'Controls/dropdownPopup:List';
      popupOptions.closeOnOutsideClick = true;
   }
};

/**
 * Контрол-опенер для открытия выпадающего списка.
 *
 * @class Controls/_dropdown/Opener
 * @mixes Controls/interface/IDropdownList
 * @extends Controls/_popup/Opener/Sticky
 * @control
 * @public
 * @author Красильников А.С.
 * @category Popup
 */

/*
 * Opener for dropdown menu.
 *
 * @class Controls/_dropdown/Opener
 * @mixes Controls/interface/IDropdownList
 * @extends Controls/_popup/Opener/Sticky
 * @control
 * @public
 * @author Красильников А.С.
 * @category Popup
 */

class DropdownOpener extends Sticky {
   open(popupOptions, opener) {
      _private.setPopupOptions(this, popupOptions);

      // To place zIndex in the old environment
      popupOptions.zIndex = getZIndex(this);
      super.open.apply(this, arguments);
   }
}

DropdownOpener._private = _private;

DropdownOpener.getDefaultOptions = function () {
   return Merge(
      Sticky.getDefaultOptions(), {
          actionOnScroll: 'close'
      });
};

export = DropdownOpener;
