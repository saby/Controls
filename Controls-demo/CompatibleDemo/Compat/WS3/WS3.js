define('Controls-demo/CompatibleDemo/Compat/WS3/WS3', [
   'Lib/Control/CompoundControl/CompoundControl',
   'wml!Controls-demo/CompatibleDemo/Compat/WS3/WS3',
], function(CompoundControl, template) {
   'use strict';

   var WS3Demo = CompoundControl.extend({
      _dotTplFn: template,
      _styles: ['Controls-demo/CompatibleDemo/CompatibleDemo'],

      init: function() {
         WS3Demo.superclass.init.call(this);
         var myTextBox = this.getChildControlByName('myTextBox');
         var self = this;
         myTextBox.subscribe('onTextChange', function(e, text) {
            self.getChildControlByName('validateText')
               .setCaption(text);
         });
      },
      destroy: function() {
         WS3Demo.superclass.destroy.apply(this, arguments);
      }
   });
   return WS3Demo;
});
