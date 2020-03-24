import Control = require('Core/Control');
import template = require('wml!Controls/_explorer/PathController/HeadingPathBack');
import {ItemsUtil} from "../list";

var HeadingPathBack = Control.extend({
   _template: template,

   _getBackButtonCaption(items, displayProperty): string|null {
      return items && items.length ? ItemsUtil.getPropertyValue(items[items.length - 1], displayProperty) : null;
   },

   _beforeMount: function(options) {
      return options.itemsAndHeaderPromise.then(({ items }) => {
         this._needHeadingPathBack = !!items;
         if (this._needHeadingPathBack) {
            this._headingPathBackOptions = {
               ...options,
               counterCaption: items[items.length - 1].get('counterCaption'),
               backButtonClass: 'controls-BreadCrumbsPath__backButton__wrapper_inHeader',
               backButtonCaption: this._getBackButtonCaption(items, options.displayProperty)
            };
         }
      });
   },

   _beforeUpdate: function(newOptions) {
      if (newOptions.items !== this._options.items) {
         this._needHeadingPathBack = !!newOptions.items;
         if (this._needHeadingPathBack) {
            this._headingPathBackOptions = {
               ...newOptions,
               counterCaption: newOptions.items[newOptions.items.length - 1].get('counterCaption'),
               backButtonClass: 'controls-BreadCrumbsPath__backButton__wrapper_inHeader',
               backButtonCaption: this._getBackButtonCaption(newOptions.items, newOptions.displayProperty)
            };
         }
      }
   }
});
export = HeadingPathBack;
