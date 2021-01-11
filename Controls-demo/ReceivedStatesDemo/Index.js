define('Controls-demo/ReceivedStatesDemo/Index',
   [
      'UI/Base',
      'wml!Controls-demo/ReceivedStatesDemo/Index'
   ],
   function(Base, template) {
      'use strict';

      return Base.Control.extend({
         _template: template
      });
   });
