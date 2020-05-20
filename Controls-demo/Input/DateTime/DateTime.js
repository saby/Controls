define('Controls-demo/Input/DateTime/DateTime', [
   'Core/Control',
   'wml!Controls-demo/Input/DateTime/DateTime',
], function(
   BaseControl,
   template
) {
   'use strict';

   var ModuleClass = BaseControl.extend({
      _template: template,
      _date: new Date(2017, 0, 1, 12, 15, 30, 123),
      _startTime: new Date(0, 0, 0, 10, 15, 0, 0),
      _endTime: new Date(0, 0, 0, 12, 40, 0, 0),

      _masks: [{
         title: 'Main date and time formats',
         masks: [
            'DD.MM.YYYY',
            'DD.MM.YY',
            'DD.MM',
            'YYYY',
            'HH:mm',
            'HH:mm:ss'
         ]
      }, {
         title: 'Additional date and time formats',
         masks: [
            'MM.YYYY'//,
            // 'HH:MM:SS.UUU'
         ]
      }, {
         title: 'Mixed date and time formats',
         masks: [
            'DD.MM HH:mm',
            'DD.MM HH:mm:ss',
            // 'DD.MM HH:mm:ss.UUU',
            'DD.MM.YY HH:mm',
            'DD.MM.YY HH:mm:ss',
            // 'DD.MM.YY HH:mm:ss.UUU',
            'DD.MM.YYYY HH:mm',
            'DD.MM.YYYY HH:mm:ss',
            // 'DD.MM.YYYY HH:mm:ss.UUU'
         ]
      }],

   });
   ModuleClass._styles = ['Controls-demo/Input/DateTime/DateTime'];

   return ModuleClass;
});
