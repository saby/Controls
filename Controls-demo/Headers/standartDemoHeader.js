define('Controls-demo/Headers/standartDemoHeader', [
   'Core/Control',
   'wml!Controls-demo/Headers/standartDemoHeader',
], function(Control, template) {
   'use strict';


   var ModuleClass = Control.extend(
      {
         _template: template,
         _styles: ['Controls-demo/Headers/standartDemoHeader'],
         _iconValue1: false,
         _iconValue2: false,
         _iconValue3: false,
         _iconValue4: false,
         _iconValue5: false,
         _iconValue6: false,
         _iconValue7: false,
         _iconValue8: false,
         _iconValue9: false,
         _iconValue10: false,
         _iconValue11: false,
         _iconValue12: false,
         _iconValue13: false,
         _iconValue14: false,
         _iconValue15: false,

         clickHeaderAction: function(e) {
            alert('click to header');
         },
         clickIcon: function(e, buttonIndex) {
            switch (buttonIndex) {
               case 1:
                  this._iconValue1 = !this._iconValue1;
                  break;
               case 2:
                  this._iconValue2 = !this._iconValue2;
                  break;
               case 3:
                  this._iconValue3 = !this._iconValue3;
                  break;
               case 4:
                  this._iconValue4 = !this._iconValue4;
                  break;
               case 5:
                  this._iconValue5 = !this._iconValue5;
                  break;
               case 6:
                  this._iconValue6 = !this._iconValue6;
                  break;
               case 7:
                  this._iconValue7 = !this._iconValue7;
                  break;
               case 8:
                  this._iconValue8 = !this._iconValue8;
                  break;
               case 9:
                  this._iconValue9 = !this._iconValue9;
                  break;
               case 10:
                  this._iconValue10 = !this._iconValue10;
                  break;
               case 11:
                  this._iconValue11 = !this._iconValue11;
                  break;
               case 12:
                  this._iconValue12 = !this._iconValue12;
                  break;
               case 13:
                  this._iconValue13 = !this._iconValue13;
                  break;
               case 14:
                  this._iconValue14 = !this._iconValue14;
                  break;
               case 15:
                  this._iconValue15 = !this._iconValue15;
                  break;
            }
         }
      });
   return ModuleClass;
});