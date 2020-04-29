define('Controls-demo/StickyHeader/StickyHeader',
   [
      'Core/Control',
      'wml!Controls-demo/StickyHeader/StickyHeader',

      'Controls/scroll'
   ],
   function(Control, template) {

      'use strict';

      var StickyHeader = Control.extend({
         _template: template
      });

      StickyHeader._styles = ['Controls-demo/StickyHeader/StickyHeader'];

      return StickyHeader;
   }
);
