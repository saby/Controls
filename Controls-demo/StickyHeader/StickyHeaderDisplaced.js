define('Controls-demo/StickyHeader/StickyHeaderDisplaced',
   [
      'UI/Base',
      'Controls/scroll',
      'wml!Controls-demo/StickyHeader/StickyHeaderDisplaced',

   ],
   function(Base, scrollLib, template) {

      'use strict';

      var StickyHeader = Base.Control.extend({
         _template: template,
         _headerVisible: false,
         _headersHeight: 0,

         _addButtonClickHandler: function() {
            this._headerVisible = !this._headerVisible;
         },

         _updateHeadersHeight: function() {
             this._headersHeight = scrollLib.getStickyHeadersHeight(this._children.containerForHeadersHeight, 'top', 'allFixed');
         }
      });

      StickyHeader._styles = ['Controls-demo/StickyHeader/StickyHeader'];

      return StickyHeader;
   }
);
