define('Controls-demo/CompatibleDemo/Compat/DemoControls/TextBoxWrapper', [
   'Lib/Control/CompoundControl/CompoundControl',
   'wml!Controls-demo/CompatibleDemo/Compat/DemoControls/TextBoxWrapper'
], function(CompoundControl, template) {
   'use strict';
   var CompatibleDemo = CompoundControl.extend({
      _dotTplFn: template,

      init: function() {
         CompatibleDemo.superclass.init.call(this);
         var myTextBox = this.getChildControlByName('myTextBox');
         var self = this;
         myTextBox.subscribe('onTextChange', function(e, text) {
            self.getChildControlByName('myTextBox2').setText(text);
         });
      },
      destroy: function() {
         CompatibleDemo.superclass.destroy.apply(this, arguments);
      }
   });

   return CompatibleDemo;
});
