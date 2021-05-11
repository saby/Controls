define(
   [
      'UICommon/Events',
      'Controls/input'
   ],
   function(Events, input) {
      'use strict';

      const SyntheticEvent = Events.SyntheticEvent;

      describe('Controls/input:InsertFromDrop', function() {
         let inst;
         const data = {
            oldSelection: {
               start: 5,
               end: 5
            },
            newPosition: 10,
            oldValue: 'my my',
            newValue: 'my my test'
         };
         beforeEach(function() {
            inst = new input.__InsertFromDrop();
         });
         it('Перемещение значения в начало.', function() {
            const event = new SyntheticEvent({
               target: {
                  selectionStart: 0,
                  selectionEnd: 0
               }
            });
            inst.focusHandler(event);
            const res = inst.inputProcessing(data);
            assert.deepEqual(res, {
               oldSelection: {
                  start: 0,
                  end: 0
               },
               newPosition: 5,
               oldValue: 'my my',
               newValue: ' testmy my'
            });
         });
         it('Перемещение значения в начало. С отменой действия после фокусировки.', function() {
            const event = new SyntheticEvent({
               target: {
                  selectionStart: 0,
                  selectionEnd: 0
               }
            });
            inst.focusHandler(event);
            inst.cancel();
            const res = inst.inputProcessing(data);
            assert.equal(res, data);
         });
      });
   }
);
