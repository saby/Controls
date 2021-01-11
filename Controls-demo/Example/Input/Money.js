define('Controls-demo/Example/Input/Money',
   [
      'UI/Base',
      'Controls-demo/Example/Input/SetValueMixin',
      'wml!Controls-demo/Example/Input/Money/Money',

      'Controls/input',
      'Controls-demo/Example/resource/BaseDemoInput'
   ],
   function(BaseMod, SetValueMixin, template) {
      'use strict';

      var ModuleClass = BaseMod.Control.extend([SetValueMixin], {
         _template: template,

         _rightValue: '0.00',

         _leftValue: '0.00'
      });
   
      ModuleClass._styles = ['Controls-demo/Example/resource/Base'];

      return ModuleClass;
});
