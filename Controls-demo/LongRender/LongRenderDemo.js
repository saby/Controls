define('Controls-demo/LongRender/LongRenderDemo',
   [
      'Core/Control',
      'Env/Env',
      'wml!Controls-demo/LongRender/LongRenderDemo'
   ],
   function(Control, Env, template) {
      'use strict';

      var LongRenderDemoModule = Control.extend({
         _template: template,

      });
      return LongRenderDemoModule;
   }
);
