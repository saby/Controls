define('Controls-demo/PendingRegistrator/PendingRegistrator', [
   'Core/Control',
   'wml!Controls-demo/PendingRegistrator/PendingRegistrator',
], function(Control, tmpl) {
   'use strict';

   var module = Control.extend({
      _template: tmpl
   });

   module._styles = ['Controls-demo/PendingRegistrator/PendingRegistrator'];

   return module;
});
