define('Controls-demo/Example/Input/Money',
   [
      'Core/Control',
      'Controls-demo/Example/Input/SetValueMixin',
      'wml!Controls-demo/Example/Input/Money/Money',

      'Controls/input',
      'Controls-demo/Example/resource/BaseDemoInput'
   ],
   function(Control, SetValueMixin, template) {
      'use strict';

      var ModuleClass = Control.extend([SetValueMixin], {
         _template: template,

         _rightValue: '0.00',

         _leftValue: '0.00'
      });
   
      ModuleClass._styles = ['Controls-demo/Example/resource/Base'];

      return ModuleClass;
});
