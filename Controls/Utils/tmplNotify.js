define('Controls/Utils/tmplNotify', [
   'UI/Events',
   'Controls/Utils/OldUtilLogger'
], function(Events, oldUtilLogger) {
   oldUtilLogger.default('Controls/Utils/tmplNotify', 'UI/Events:EventUtils.tmplNotify');
   return Events.EventUtils.tmplNotify;
});
