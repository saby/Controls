define('Controls-demo/Example/Input/Font',
   [
      'Core/Control',
      'Controls-demo/Example/Input/SetValueMixin',
      'wml!Controls-demo/Example/Input/Font/Font',

      'Controls/input',
      'Controls-demo/Example/resource/BaseDemoInput'
   ],
   function(Control, SetValueMixin, template) {
      'use strict';

      var FILLED_VALUE = 'Text in the input field';
      var FILLED_MONEY_VALUE = '852.45';
      var FILLED_NUMBER_VALUE = 123.456;

      return Control.extend([SetValueMixin], {
         _template: template,
         _styles: ['Controls-demo/Example/resource/Base'],

         _filled1Value: FILLED_VALUE,
         _filled2Value: FILLED_VALUE,
         _filled3Value: FILLED_VALUE,
         _filledRMValue: FILLED_VALUE,
         _filledMoney1Value: FILLED_MONEY_VALUE,
         _filledMoney2Value: FILLED_MONEY_VALUE,
         _filledMoney3Value: FILLED_MONEY_VALUE,
         _filledMoneyRMValue: FILLED_MONEY_VALUE,
         _filledNumber1Value: FILLED_NUMBER_VALUE,
         _filledNumber2Value: FILLED_NUMBER_VALUE,
         _filledNumber3Value: FILLED_NUMBER_VALUE,
         _filledNumberRMValue: FILLED_NUMBER_VALUE
      });
   });
