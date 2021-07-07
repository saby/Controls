define([
   'Controls/popup',
   'Core/Deferred'
], function(popup, Deferred) {
   describe('Controls/popup:Global', () => {
      it('Opening and closing of the infobox.', () => {
         let ctrl = new popup.Global({});
         ctrl._globalController = new popup.GlobalController();
         ctrl._globalController._getPopupConfig = config => (new Deferred()).callback(config);
         let event1 = {
            target: 1
         };
         let event2 = {
            target: 2
         };
         let event3 = {
            target: 3
         };
         let result = [];

         ctrl._globalController.openInfoBox = () => {
            result.push('open');
         };

         ctrl._globalController.closeInfoBox = () => {
            result.push('close');
         };

         ctrl._openInfoBoxHandler(event1);
         ctrl._openInfoBoxHandler(event2);
         ctrl._openInfoBoxHandler(event3);

         assert.deepEqual(result, ['open', 'open', 'open']);

         result = [];

         ctrl._openInfoBoxHandler(event1);
         ctrl._closeInfoBoxHandler(event1);
         ctrl._openInfoBoxHandler(event2);
         ctrl._closeInfoBoxHandler(event2);
         ctrl._openInfoBoxHandler(event3);
         ctrl._closeInfoBoxHandler(event3);

         assert.deepEqual(result, ['open', 'close', 'open', 'close', 'open', 'close']);

         result = [];

         ctrl._openInfoBoxHandler(event1);
         ctrl._closeInfoBoxHandler(event2);
         ctrl._closeInfoBoxHandler(event3);
         ctrl._closeInfoBoxHandler(event1);

         assert.deepEqual(result, ['open', 'close']);
      });
   });
});
