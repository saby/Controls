define('Controls/Utils/DateRangeUtil', [
   'Controls/dateUtils',
   'Controls/Utils/OldUtilLogger'
], function(dateUtils, oldUtilLogger) {
   oldUtilLogger.default('Controls/Utils/DateRangeUtil', 'Controls/dateUtils:Range');
   return dateUtils.Range;
});
