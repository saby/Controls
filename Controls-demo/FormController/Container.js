define('Controls-demo/FormController/Container', [
   'Env/Env',
   'UI/Base',
   'wml!Controls-demo/FormController/Container'
], function(Env, Base, tmpl) {
   'use strict';

   var module = Base.Control.extend({
      _template: tmpl,
      _afterUpdate: function (cfg) {
         Env.IoC.resolve('ILogger').info(cfg.record);
      }
   });

   return module;
});
