define('Controls-demo/Input/Date/RangeLinkLiteCustom', [
   'UI/Base',
   'Controls/dateRange',
   'wml!Controls-demo/Input/Date/RangeLinkLiteCustom',
   'wml!Controls-demo/Input/Date/RangeLinkLiteCustomMonth'
], function(
   Base,
   dateRange,
   template
) {
   'use strict';

   var ModuleClass = Base.Control.extend({
      _template: template,
      _year: new Date(2017, 0, 1),
      _startValue: new Date(2017, 0, 1),
      _endValue: new Date(2017, 1, 0),

      captionFormatter: function(startValue, endValue, emptyCaption) {
         return dateRange.Utils.formatDateRangeCaption(startValue, endValue, emptyCaption) + ' !';
      }
   });
   return ModuleClass;
});
