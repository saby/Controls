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

      return Control.extend([SetValueMixin], {
         _template: template,
         _styles: ['Controls-demo/Example/resource/Base'],

         _rangeValue: 0,

         _fractionalValue: 0
      });
   });
