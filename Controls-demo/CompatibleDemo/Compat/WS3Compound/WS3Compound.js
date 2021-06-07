define('Controls-demo/CompatibleDemo/Compat/WS3Compound/WS3Compound', [
   'Lib/Control/CompoundControl/CompoundControl',
   'wml!Controls-demo/CompatibleDemo/Compat/WS3Compound/WS3Compound'
], function(CompoundControl, template) {
   'use strict';

   var WS3CompoundDemo = CompoundControl.extend({
      _dotTplFn: template,

      init: function() {
         WS3CompoundDemo.superclass.init.call(this);
      },
      destroy: function() {
         WS3CompoundDemo.superclass.destroy.apply(this, arguments);
      }

   });
   return WS3CompoundDemo;
});
