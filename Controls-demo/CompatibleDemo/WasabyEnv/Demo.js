define('Controls-demo/CompatibleDemo/WasabyEnv/Demo',
   [
      'Core/Control',
      'wml!Controls-demo/CompatibleDemo/WasabyEnv/Demo',
   ],
   function(Control, template) {
      'use strict';

      var CompatibleDemo = Control.extend({
         _template: template,
      });
      CompatibleDemo._styles = ['Controls-demo/CompatibleDemo/CompatibleDemo'];

      return CompatibleDemo;
   }
);
