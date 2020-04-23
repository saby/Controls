define('Controls-demo/Popup/resources/MyTextBox',
   [
      'Lib/Control/CompoundControl/CompoundControl',
      'wml!Controls-demo/Popup/resources/MyTextBox/MyTextBox',
      'SBIS3.CONTROLS/TextBox'
   ], function(CompoundControl, dotTplFn) {
      var moduleClass = CompoundControl.extend({
         _dotTplFn: dotTplFn,
         _styles: ['Controls-demo/Popup/resources/MyTextBox/MyTextBox'],
         $protected: {
            _options: {

            }
         },
         $constructor: function() {
         },
         init: function() {
            moduleClass.superclass.init.call(this);
         }
      });
      return moduleClass;
   });
