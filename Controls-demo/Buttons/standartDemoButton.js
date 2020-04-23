define('Controls-demo/Buttons/standartDemoButton', [
   'Core/Control',
   'wml!Controls-demo/Buttons/standartDemoButton',
   'Controls/buttons'
], function(Control, template) {
   'use strict';


   var ModuleClass = Control.extend(
      {
         _template: template,
         _styles: ['Controls-demo/Buttons/standartDemoButton'],
         toggleState: false,
         toggleState2: false,
         toggleState3: false,
         toggleState4: false,
         toggleState5: false,
         toggleState6: false,
         toggleState7: false,
         toggleState8: false,
         toggleState9: false,
         toggleState10: false,
         toggleState11: false,
         toggleState12: false,
         toggleState13: false,
         toggleState14: false,
         toggleState15: false,
         toggleState16: false,
         toggleState17: false,
         toggleState18: false,
         toggleState19: false,
         toggleState20: false,
         toggleState21: false,
         toggleState22: false,
         toggleState23: false,
         toggleState24: false,
         toggleState25: false,
         toggleState26: false,
         toggleState27: false,
         toggleState28: false,

         clickHandler: function(e) {
            this.count++;
         },

         clickChangeState: function(e, toggleButtonIndex, value) {
            switch (toggleButtonIndex) {
               case 16:
                  this.toggleState16 = value;
                  break;
               case 17:
                  this.toggleState17 = value;
                  break;
               case 18:
                  this.toggleState18 = value;
                  break;
               case 19:
                  this.toggleState19 = value;
                  break;
               case 20:
                  this.toggleState20 = value;
                  break;
               case 21:
                  this.toggleState21 = value;
                  break;
            }
         }
      });
   return ModuleClass;
});