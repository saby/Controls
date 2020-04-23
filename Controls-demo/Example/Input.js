define('Controls-demo/Example/Input',
   [
      'Env/Env',
      'Core/Control',
      'Controls/Utils/scrollToElement',
      'wml!Controls-demo/Example/Input',

      'Controls/Application',
      'Controls-demo/Example/Input/Area',
      'Controls-demo/Example/Input/Label',
      'Controls-demo/Example/Input/Font',
      'Controls-demo/Example/Input/Mask',
      'Controls-demo/Example/Input/Money',
      'Controls-demo/Example/Input/Number',
      'Controls-demo/Example/Input/Password',
      'Controls-demo/Example/Input/Phone',
      'Controls-demo/Example/Input/PositionLabels',
      'Controls-demo/Example/Input/RightAlignment',
      'Controls-demo/Example/Input/Suggest',
      'Controls-demo/Example/Input/Tag',
      'Controls-demo/Example/Input/Text',
      'Controls-demo/Example/Input/TimeInterval',
   ],
   function(Env, Control, scrollToElement, template) {
      'use strict';

      return Control.extend({
         _template: template,
         _styles: ['Controls-demo/Example/resource/Base'],

         _afterMount: function() {
            if (Env.constants.isBrowserPlatform) {
               var activeElement = window.location.hash.replace(/.*#/, '');

               if (this._children[activeElement]) {
                  scrollToElement(this._children[activeElement]._container);
               }
            }
         },

         /**
          * @param demo
          * @variant Area(dynamic, fixed)
          * @variant Label(default1, default2, required1, required2, required3, required4)
          * @variant Font(default1, default2, default3, filled1, filled2, filled3, filledRM,
          * filledNumber1, filledNumber2, filledNumber3, filledNumberRM, filledMoney1, filledMoney2,
          * filledMoney3, filledMoneyRM)
          * @variant Mask(snils, cardNumber, mobilePhone)
          * @variant Money(left, right)
          * @variant Number(default, range, fractional)
          * @variant Password(default, revealable)
          * @variant Phone(phoneNumber)
          * @variant PositionLabels(left1, left2, left3, right1, right2, right3)
          * @variant RightAlignment(default, filled, filledRM, filledNumber, filledNumberRM, filledMoney, filledMoneyRM)
          * @variant Suggest(default)
          * @variant Tag(secondary, success, warning, danger, info, primary)
          * @variant Text(default)
          * @variant TimeInterval(default1, default2, default3, default4)
          * @param value
          */
         setValue: function(demo, field, value) {
            this._children[demo].setValue(field, value);
         }
      });
   });
