define('Controls-demo/CompatibleDemo/WasabyEnv/Demo',
   [
      'UI/Base',
      'wml!Controls-demo/CompatibleDemo/WasabyEnv/Demo',
   ],
   function(Base, template) {
      'use strict';

      var CompatibleDemo = Base.Control.extend({
         _template: template,
      });
      CompatibleDemo._styles = ['Controls-demo/CompatibleDemo/CompatibleDemo'];

      return CompatibleDemo;
   }
);
