define('Controls-demo/PendingRegistrator/PendingRegistrator', [
   'UI/Base',
   'wml!Controls-demo/PendingRegistrator/PendingRegistrator',
], function(Base, tmpl) {
   'use strict';

   var module = Base.Control.extend({
      _template: tmpl
   });

   module._styles = ['Controls-demo/PendingRegistrator/PendingRegistrator'];

   return module;
});
