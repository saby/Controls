define('Controls-demo/StickyHeader/StickyHeaderDisplaced',
   [
      'Core/Control',
      'wml!Controls-demo/StickyHeader/StickyHeaderDisplaced',

   ],
   function(Control, template) {

      'use strict';

      var StickyHeader = Control.extend({
         _template: template,
         _headerVisible: false,
         _addButtonClickHandler: function() {
            this._headerVisible = !this._headerVisible;
         }
      });

      StickyHeader._styles = ['Controls-demo/StickyHeader/StickyHeader'];

      return StickyHeader;
   }
);
