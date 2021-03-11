define('Controls-demo/Input/Date/RangeLink', [
   'UI/Base',
   'wml!Controls-demo/Input/Date/RangeLink',
], function(
   Base,
   template
) {
   'use strict';

   var ModuleClass = Base.Control.extend({
      _template: template,
      _startValueBind: new Date(2020, 2, 30),
      _endValueBind: new Date(2020, 3, 20),
      _startValue: new Date(2020, 2, 30),
      _endValue: new Date(2020, 3, 20),
      _startValueQuarter: new Date(2020, 2, 30),
      _endValueQuarter: new Date(2020, 3, 20),
      _startValueHalfYear: new Date(2020, 2, 30),
      _endValueHalfYear: new Date(2020, 3, 20),
      _startValueYear: new Date(2020, 2, 30),
      _endValueYear: new Date(2020, 3, 20),
      _displayDateBind: new Date(2019, 0, 1),
      _date: new Date(2021, 0, 27),

      _captionFormatter: function() {
         return 'Custom range format';
      }
   });
   ModuleClass._styles = ['Controls-demo/Input/Date/RangeLink'];

   return ModuleClass;
});
