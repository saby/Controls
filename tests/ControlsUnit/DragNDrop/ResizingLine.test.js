define([
   'Controls/dragnDrop',
   'ControlsUnit/resources/ProxyCall'
], function(dragnDrop) {
   'use strict';

   describe('Controls.dragnDrop.ResizingLine', () => {
      [{
         orientation: 'vertical',
         positions: ['top', 'bottom']
      }, {
         orientation: 'horizontal',
         positions: ['left', 'right']
      }].forEach((test) => {
         it(`_offset orientation: ${test.orientation}`, function() {
            let rlInstance = new dragnDrop.ResizingLine({});

            rlInstance._options = {
               minOffset: 300,
               maxOffset: 300,
               direction: 'direct',
               orientation: test.orientation
            };

            let offset = rlInstance._offset(100);
            assert.strictEqual(`${test.positions[0]}: 100%`, offset.style, 'Wrong offset');
            assert.strictEqual(100, offset.value, 'Wrong offset');

            offset = rlInstance._offset(400);
            assert.strictEqual(`${test.positions[0]}: 100%`, offset.style, 'Wrong offset');
            assert.strictEqual(300, offset.value, 'Wrong offset');

            offset = rlInstance._offset(-100);
            assert.strictEqual(`${test.positions[1]}: 0`, offset.style, 'Wrong offset');
            assert.strictEqual(-100, offset.value, 'Wrong offset');

            offset = rlInstance._offset(-400);
            assert.strictEqual(`${test.positions[1]}: 0`, offset.style, 'Wrong offset');
            assert.strictEqual(-300, offset.value, 'Wrong offset');

            rlInstance._options.direction = 'reverse';

            offset = rlInstance._offset(100);
            assert.strictEqual(`${test.positions[0]}: 0`, offset.style, 'Wrong offset');
            assert.strictEqual(-100, offset.value, 'Wrong offset');

            offset = rlInstance._offset(400);
            assert.strictEqual(`${test.positions[0]}: 0`, offset.style, 'Wrong offset');
            assert.strictEqual(-300, offset.value, 'Wrong offset');

            offset = rlInstance._offset(-100);
            assert.strictEqual(`${test.positions[1]}: 100%`, offset.style, 'Wrong offset');
            assert.strictEqual(100, offset.value, 'Wrong offset');

            offset = rlInstance._offset(-400);
            assert.strictEqual(`${test.positions[1]}: 100%`, offset.style, 'Wrong offset');
            assert.strictEqual(300, offset.value, 'Wrong offset');
         });
      });

      it('isResizing', () => {
         var ctrl = new dragnDrop.ResizingLine({});

         assert.isFalse(ctrl._isResizing(0, 0));
         assert.isTrue(ctrl._isResizing(100, 0));
         assert.isTrue(ctrl._isResizing(0, 100));
         assert.isTrue(ctrl._isResizing(100, 100));
      });

      it('endDrag', () => {
         const Line = new dragnDrop.ResizingLine({});
         const notifySpy = sinon.spy(Line, '_notify');
         const dragObject = {
            entity: {
               offset: {
                  value: 10
               }
            }
         };
         Line._onEndDragHandler(null, dragObject);
         let a = notifySpy.withArgs('offset', [10]).called;
         assert.isFalse(a);

         Line._dragging = true;
         Line._onEndDragHandler(null, dragObject);
         a = notifySpy.withArgs('offset', [10]).called;
         assert.isTrue(a);

         Line.destroy();
      });
   });
});
