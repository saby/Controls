import Control = require('Core/Control');
import template = require('wml!Controls/_explorer/PathController/HeadingPathBack');
import {calculatePath} from 'Controls/dataSource';

var HeadingPathBack = Control.extend({
   _template: template,

   _beforeMount: function(options) {
      return options.itemsAndHeaderPromise.then(({ items }) => {
         this._needHeadingPathBack = !!items;
         if (this._needHeadingPathBack) {
            this._headingPathBackOptions = {
               ...options,
               counterCaption: items[items.length - 1].get('counterCaption'),
               backButtonClass: 'controls-BreadCrumbsPath__backButton__wrapper_inHeader',
               backButtonCaption: calculatePath(items, options.displayProperty).backButtonCaption
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
               backButtonCaption: calculatePath(newOptions.items, newOptions.displayProperty).backButtonCaption
            };
         }
      }
   }
});
export = HeadingPathBack;
