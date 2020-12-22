import Control = require('Core/Control');
import {EventUtils} from 'UI/Events';
import template = require('wml!Controls/_explorer/PathController/PathWrapper');
import * as GridIsEqualUtil from 'Controls/Utils/GridIsEqualUtil';

var _private = {
   needCrumbs: function(header, items, rootVisible) {
      return !!items && ((!_private.withoutBackButton(header) && items.length > 0) || items.length > 1) || !!rootVisible;
   },
   withoutBackButton: function(header) {
      return header && header[0] && header[0].isBreadCrumbs;
   },
};

var PathWrapper = Control.extend({
   _template: template,
   _needCrumbs: false,
   _items: null,

   _beforeMount: function(options) {
      return options.itemsAndHeaderPromise.then((params) => {
         this._items = params.items;
         this._needCrumbs = _private.needCrumbs(params.header, params.items, options.rootVisible);
         this._header = params.header;
         this._withoutBackButton = _private.withoutBackButton(this._header);
      });
   },

   _beforeUpdate: function(newOptions) {
      let isEqualsHeader =
          GridIsEqualUtil.isEqualWithSkip(this._header, newOptions.header, { template: true });
      if (this._items !== newOptions.items ||
          this._options.rootVisible !== newOptions.rootVisible || !isEqualsHeader) {
         this._items = newOptions.items;
         this._needCrumbs = _private.needCrumbs(newOptions.header,  this._items, newOptions.rootVisible);
      }
      if (!isEqualsHeader) {
         this._header = newOptions.header;
         this._withoutBackButton = _private.withoutBackButton(this._header);
      }
   },

   _notifyHandler: EventUtils.tmplNotify

});
PathWrapper._private = _private;
export = PathWrapper;
