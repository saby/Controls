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
      _startValueBind: new Date(2018, 0, 1),
      _endValueBind: new Date(2018, 0, 31),
      _startValue: new Date(2018, 0, 1),
      _endValue: new Date(2018, 0, 31),
      _startValueQuarter: new Date(2018, 0, 1),
      _endValueQuarter: new Date(2018, 2, 31),
      _startValueHalfYear: new Date(2018, 0, 1),
      _endValueHalfYear: new Date(2018, 5, 30),
      _startValueYear: new Date(2018, 0, 1),
      _endValueYear: new Date(2018, 11, 31),
      _displayDateBind: new Date(2019, 0, 1),

      _captionFormatter: function() {
         return 'Custom range format';
      }
   });
   ModuleClass._styles = ['Controls-demo/Input/Date/RangeLink'];

   return ModuleClass;
});
