define('Controls-demo/CompatibleDemo/WasabyEnv/DemoControls/Sbis3TextBoxWrapper', [
   'Lib/Control/CompoundControl/CompoundControl',
   'wml!Controls-demo/CompatibleDemo/WasabyEnv/DemoControls/Sbis3TextBoxWrapper'
], function(CompoundControl, template) {

   var CompatibleDemo = CompoundControl.extend({
      _dotTplFn: template,

      init: function() {
         CompatibleDemo.superclass.init.call(this);

         var myTextBox = this.getChildControlByName('TextBoxWrapper');

         myTextBox.subscribe('onTextChange', function(e, text) {
            this.getParent().getParent()._logicParent._setText(e, text);
         });
      },
      destroy: function() {
         CompatibleDemo.superclass.destroy.apply(this, arguments);
      }
   });

   return CompatibleDemo;
});
