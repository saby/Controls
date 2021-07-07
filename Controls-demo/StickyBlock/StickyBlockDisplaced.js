define('Controls-demo/StickyBlock/StickyBlockDisplaced',
   [
      'UI/Base',
      'Controls/scroll',
      'wml!Controls-demo/StickyBlock/StickyBlockDisplaced',

   ],
   function(Base, scrollLib, template) {

      'use strict';

      var StickyBlock = Base.Control.extend({
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

      StickyBlock._styles = ['Controls-demo/StickyBlock/StickyBlock'];

      return StickyBlock;
   }
);
