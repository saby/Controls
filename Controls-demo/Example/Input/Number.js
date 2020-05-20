define('Controls-demo/Example/Input/Number',
   [
      'Core/Control',
      'Controls-demo/Example/Input/SetValueMixin',
      'wml!Controls-demo/Example/Input/Number/Number',

      'Controls/input',
      'Controls-demo/Example/resource/BaseDemoInput'
   ],
   function(Control, SetValueMixin, template) {
      'use strict';

      var ModuleClass = Control.extend([SetValueMixin], {
         _template: template,

         _rangeValue: 0,

         _fractionalValue: 0
      });
   
      ModuleClass._styles = ['Controls-demo/Example/resource/Base'];

      return ModuleClass;
});
