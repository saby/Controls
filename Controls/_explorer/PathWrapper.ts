import {Control} from 'UI/Base';
import {EventUtils} from 'UI/Events';
import template = require('wml!Controls/_explorer/PathController/PathWrapper');
import * as GridIsEqualUtil from 'Controls/Utils/GridIsEqualUtil';

const _private = {
   needCrumbs: function(header, items, options) {
      if (options.breadcrumbsVisibility === 'hidden') {
         return false;
      }

      return !!items &&
          ((!_private.withoutBackButton(header) && items.length > 0) || items.length > 1) ||
          !!options.rootVisible;
   },
   withoutBackButton: function(header) {
      return header && header[0] && header[0].isBreadCrumbs;
   }
};

var PathWrapper = Control.extend({
   _template: template,
   _needCrumbs: false,
   _withoutBackButton: false,
   _items: null,

   _beforeMount: function(options) {
      return options.itemsAndHeaderPromise.then((params) => {
         this._items = params.items;
         this._needCrumbs = _private.needCrumbs(params.header, params.items, options);
         this._header = params.header;
         this._withoutBackButton = _private.withoutBackButton(this._header);
      });
   },

   _beforeUpdate: function(newOptions) {
      const isEqualsHeader = GridIsEqualUtil.isEqual(
          this._header,
          newOptions.header,
          {
              template: () => true,
              templateOptions: (oldOptions, newOptions) => {
                  return GridIsEqualUtil.isEqualObjects(oldOptions, newOptions, {
                      itemsAndHeaderPromise: () => true,
                      items: (oldItems, newItems) => {
                          return !!oldItems && !!newItems && oldItems.length === newItems.length &&
                              oldItems.reduce((prev, current, i) => prev && current.isEqual(newItems[i]), true);
                      }
                  });
              }
          }
       );

      if (this._items !== newOptions.items ||
          this._options.rootVisible !== newOptions.rootVisible || !isEqualsHeader) {
         this._items = newOptions.items;
         this._needCrumbs = _private.needCrumbs(newOptions.header,  this._items, newOptions);
      }

      if (this._options.breadcrumbsVisibility !== newOptions.breadcrumbsVisibility) {
         this._needCrumbs = _private.needCrumbs(newOptions.header,  this._items, newOptions);
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
