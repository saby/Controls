define('Controls-demo/Example/Input/Number',
   [
      'UI/Base',
      'Controls-demo/Example/Input/SetValueMixin',
      'wml!Controls-demo/Example/Input/Number/Number',

      'Controls/input',
      'Controls-demo/Example/resource/BaseDemoInput'
   ],
   function(BaseMod, SetValueMixin, template) {
      'use strict';

      var ModuleClass = BaseMod.Control.extend([SetValueMixin], {
         _template: template,

         _rangeValue: 0,

         _fractionalValue: 0
      });
   
      ModuleClass._styles = ['Controls-demo/Example/resource/Base'];

      return ModuleClass;
});
