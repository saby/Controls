define('Controls-demo/StickyBlock/StickyBlock',
   [
      'UI/Base',
      'wml!Controls-demo/StickyBlock/StickyBlock',

      'Controls/scroll'
   ],
   function(Base, template) {

      'use strict';

      var StickyBlock = Base.Control.extend({
         _template: template
      });

      StickyBlock._styles = ['Controls-demo/StickyBlock/StickyBlock'];

      return StickyBlock;
   }
);
