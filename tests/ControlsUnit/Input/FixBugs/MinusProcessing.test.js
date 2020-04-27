define(
   [
      'Controls/input'
   ],
   function(input) {
      'use strict';

      describe('Controls/input:MinusProcessing', function() {
         let inst;
         beforeEach(function() {
            inst = new input.__MinusProcessing();
         });
         it('Ввод двух минусов подряд.', function() {
            let res = inst.inputProcessing({
               oldValue: 'test',
               oldSelection: {
                  start: 4,
                  end: 4
               },
               newValue: 'test-',
               newPosition: 5
            });
            assert.deepEqual(res, {
               oldSelection: {
                  start: 4,
                  end: 4
               },
               newPosition: 5,
               oldValue: 'test',
               newValue: 'test-'
            });
            res = inst.inputProcessing({
               oldValue: 'test-',
               oldSelection: {
                  start: 5,
                  end: 5
               },
               newValue: 'test—',
               newPosition: 5
            });
            assert.deepEqual(res, {
               oldSelection: {
                  start: 5,
                  end: 5
               },
               newPosition: 5,
               oldValue: 'test-',
               newValue: 'test—'
            });
         });
         it('Ввод двух минусов подряд. Первый минус удаляется после обработки ввода.', function() {
            let res = inst.inputProcessing({
               oldValue: 'test',
               oldSelection: {
                  start: 4,
                  end: 4
               },
               newValue: 'test-',
               newPosition: 5
            });
            assert.deepEqual(res, {
               oldSelection: {
                  start: 4,
                  end: 4
               },
               newPosition: 5,
               oldValue: 'test',
               newValue: 'test-'
            });
            res = inst.inputProcessing({
               oldValue: 'test-',
               oldSelection: {
                  start: 5,
                  end: 5
               },
               newValue: 'test—',
               newPosition: 5
            });
            assert.deepEqual(res, {
               oldSelection: {
                  start: 5,
                  end: 5
               },
               newPosition: 5,
               oldValue: 'test-',
               newValue: 'test—'
            });
         });
      });
   }
);
