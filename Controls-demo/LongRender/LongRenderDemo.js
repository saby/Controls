define('Controls-demo/LongRender/LongRenderDemo',
   [
      'UI/Base',
      'Env/Env',
      'wml!Controls-demo/LongRender/LongRenderDemo'
   ],
   function(Base, Env, template) {
      'use strict';

      var LongRenderDemoModule = Base.Control.extend({
         _template: template,

      });
      return LongRenderDemoModule;
   }
);
