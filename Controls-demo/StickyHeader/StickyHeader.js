define('Controls-demo/StickyHeader/StickyHeader',
   [
      'UI/Base',
      'wml!Controls-demo/StickyHeader/StickyHeader',

      'Controls/scroll'
   ],
   function(Base, template) {

      'use strict';

      var StickyHeader = Base.Control.extend({
         _template: template
      });

      StickyHeader._styles = ['Controls-demo/StickyHeader/StickyHeader'];

      return StickyHeader;
   }
);
