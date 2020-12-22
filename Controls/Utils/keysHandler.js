define('Controls/Utils/keysHandler', [
   'UI/Events',
   'Controls/Utils/OldUtilLogger'
], function(Events, oldUtilLogger) {
   oldUtilLogger.default('Controls/Utils/keysHandler', 'UI/Events:EventUtils.keysHandler');
   return Events.EventUtils.keysHandler;
});
