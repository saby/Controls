define(['Controls/popupTemplate', 'UI/Vdom'], (popupTemplate, Vdom) => {
   'use strict';
   describe('Controls/_popupTemplate/Stack/Stack', () => {
      it('maximize button title', () => {
         let Stack = new popupTemplate.Stack();
         Stack._beforeMount({
            stackMinWidth: 100,
            stackWidth: 700,
            stackMaxWidth: 1000
         });
         assert.equal(Stack._maximizeButtonTitle, 'Свернуть/Развернуть');
      });

      it('controlResize after update maximized options', () => {
         let Stack = new popupTemplate.Stack();
         let controlResizeNotified = false;
         Stack._notify = (event) => {
            controlResizeNotified = event === 'controlResize';
         };
         Stack._beforeMount({
            maximized: true
         });
         Stack._afterUpdate({
            maximized: false
         });

         assert.equal(controlResizeNotified, true);
         Vdom.Synchronizer.unMountControlFromDOM(Stack, {});
      });
   });
});
