define([
   'Core/core-merge',
   'Controls/scroll',
   'ControlsUnit/Calendar/Utils'
], function(
   cMerge,
   scroll,
   calendarTestUtils
) {
   'use strict';

   const options = {
      data: 'some data',
      observerName: 'observerName'
   };

   describe('Controls/scroll:IntersectionObserverContainer', function() {

      describe('itemClick', function() {
         it('should return event result', function() {
            const container = new scroll.Container(options);
            const event = {
               type: "itemclick",
               _bubbling: true,
               stopped: false,
               propagating: () => false,
            };
            var result = container.itemClick(event);
            assert.isUndefined(result);
            event.result = 'result';
            result = container.itemClick(event);
            assert.equal(result, 'result');
         });
      });
      describe('_afterMount', function() {
         it('should notify intersectionObserverRegister event', function() {
            const
               sandbox = sinon.createSandbox(),
               component = calendarTestUtils.createComponent(scroll.IntersectionObserverContainer, options);

            sandbox.stub(component, '_notify');
            component._afterMount();
            sinon.assert.calledWith(
               component._notify,
               'intersectionObserverRegister',
               [sinon.match({
                  instId: component.getInstanceId(),
                  observerName: options.observerName,
                  element: component._container,
                  data: options.data
               })],
               { bubbling: true }
            );
            sandbox.restore();
         });
      });
      describe('_beforeUnmount', function() {
         it('should notify intersectionObserverUnregister event', function() {
            const
               sandbox = sinon.createSandbox(),
               component = calendarTestUtils.createComponent(scroll.IntersectionObserverContainer, options);

            sandbox.stub(component, '_notify');
            component._beforeUnmount();
            sinon.assert.calledWith(
               component._notify,
               'intersectionObserverUnregister',
               [component.getInstanceId()],
               { bubbling: true }
            );
            sandbox.restore();
         });
      });
   });
});
