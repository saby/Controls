define('Controls/Utils/Date', [
   'Controls/dateUtils',
   'Controls/Utils/OldUtilLogger'
], function(dateUtils, oldUtilLogger) {
   oldUtilLogger.default('Controls/Utils/Date', 'Controls/dateUtils:Base');
   return dateUtils.Base;
});
