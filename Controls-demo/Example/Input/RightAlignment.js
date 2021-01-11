define('Controls-demo/Example/Input/RightAlignment',
   [
      'UI/Base',
      'Controls-demo/Example/Input/SetValueMixin',
      'wml!Controls-demo/Example/Input/RightAlignment/RightAlignment',

      'Controls/input',
      'Controls-demo/Example/resource/BaseDemoInput'
   ],
   function(Base, SetValueMixin, template) {
      'use strict';

      var FILLED_VALUE = 'Text in the input field';
      var FILLED_MONEY_VALUE = '852.45';
      var FILLED_NUMBER_VALUE = 123.456;

      return Base.Control.extend([SetValueMixin], {
         _template: template,

         _filledValue: FILLED_VALUE,
         _filledRMValue: FILLED_VALUE,
         _filledMoneyValue: FILLED_MONEY_VALUE,
         _filledMoneyRMValue: FILLED_MONEY_VALUE,
         _filledNumberValue: FILLED_NUMBER_VALUE,
         _filledNumberRMValue: FILLED_NUMBER_VALUE
      });
   });
