define('Controls/Utils/getWidth', [
   'Controls/sizeUtils',
   'Controls/Utils/OldUtilLogger'
], function(sizeUtils, oldUtilLogger) {
   oldUtilLogger.default('Controls/Utils/getWidth', 'Controls/sizeUtils:getWidth');
   return sizeUtils.getWidth;
});
