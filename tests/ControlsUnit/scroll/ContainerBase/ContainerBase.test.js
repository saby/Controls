define([
   'Controls/_scroll/ContainerBase'
], function(
   containerBase
) {
   'use strict';

   describe('Controls/scroll:ContainerBase', function() {
      describe('_afterUpdate', function() {
         let control;
         const content = {
            scrollTop: 10,
            scrollLeft: 20,
            clientHeight: 30,
            scrollHeight: 40,
            clientWidth: 50,
            scrollWidth: 60,
            getBoundingClientRect: sinon.fake()
         };

         beforeEach(() => {
            control = new containerBase.default();
            control._state = {
            };
            control._children = {
               content: content
            };
            sinon.stub(control, '_observeContentSize');
            sinon.stub(control, '_unobserveDeleted');
            sinon.stub(control, '_sendByRegistrar');
            sinon.stub(control, '_sendByListScrollRegistrar');
            sinon.stub(control, '_sendScrollMoveAsync');
         });

         afterEach(() => {
            sinon.restore();
            control = null;
         });

         it('should update state from dom if resize observer unavailable', () => {
            control._resizeObserverSupported = false;
            control._afterUpdate();

            assert.strictEqual(control._state.scrollTop, content.scrollTop);
            assert.strictEqual(control._state.scrollLeft, content.scrollLeft);
            assert.strictEqual(control._state.clientHeight, content.clientHeight);
            assert.strictEqual(control._state.scrollHeight, content.scrollHeight);
            assert.strictEqual(control._state.clientWidth, content.clientWidth);
            assert.strictEqual(control._state.scrollWidth, content.scrollWidth);
         });

         it("should't update state from dom if resize observer unavailable", () => {
            control._resizeObserverSupported = true;
            control._afterUpdate();

            assert.isUndefined(control._state.scrollTop);
            assert.isUndefined(control._state.scrollLeft);
            assert.isUndefined(control._state.clientHeight);
            assert.isUndefined(control._state.scrollHeight);
            assert.isUndefined(control._state.clientWidth);
            assert.isUndefined(control._state.scrollWidth);
         });
      });

      describe('updateState', function() {
         it('should not update state if unchanged state arrives', function() {
            var inst = new containerBase.default();
            inst._state = {
               scrollTop: 0
            };
            assert.isFalse(inst._updateState({ scrollTop: 0 }));
         });

         it('should update state if changed state arrives', function() {
            var inst = new containerBase.default();
            const sandBox = sinon.createSandbox();
            sandBox.stub(inst, '_updateCalculatedState');
            inst._state = {
               scrollTop: 0
            };
            assert.isTrue(inst._updateState({ scrollTop: 1 }));
            sandBox.restore();
         });
      });
   });
});
