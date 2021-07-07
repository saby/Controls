/**
 * Created by kraynovdo on 02.11.2017.
 */
define([
   'Controls/_paging/Paging/DigitButtons'
], function(DigitButtons) {
   var DBClass = DigitButtons.default;
   describe('Controls.List.Paging.DigitButtons', function() {
      it('getDrawnDigits 10 pages', function() {
         var digits;
         digits = DBClass._getDrawnDigits(10, 1);
         assert.deepEqual([1, 2, 3, 4, '...', 10], digits, 'getDrawnDigits10 test case 1: WrongResult');

         digits = DBClass._getDrawnDigits(10, 2);
         assert.deepEqual([1, 2, 3, 4, 5, '...', 10], digits, 'getDrawnDigits10 test case 2: WrongResult');

         digits = DBClass._getDrawnDigits(10, 3);
         assert.deepEqual([1, 2, 3, 4, 5, 6, '...', 10], digits, 'getDrawnDigits10 test case 3: WrongResult');

         digits = DBClass._getDrawnDigits(10, 4);
         assert.deepEqual([1, 2, 3, 4, 5, 6, 7, '...', 10], digits, 'getDrawnDigits10 test case 4: WrongResult');

         digits = DBClass._getDrawnDigits(10, 5);
         assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], digits, 'getDrawnDigits10 test case 5: WrongResult');

         digits = DBClass._getDrawnDigits(10, 6);
         assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], digits, 'getDrawnDigits10 test case 6: WrongResult');

         digits = DBClass._getDrawnDigits(10, 7);
         assert.deepEqual([1, '...', 4, 5, 6, 7, 8, 9, 10], digits, 'getDrawnDigits10 test case 7: WrongResult');

         digits = DBClass._getDrawnDigits(10, 8);
         assert.deepEqual([1, '...', 5, 6, 7, 8, 9, 10], digits, 'getDrawnDigits10 test case 8: WrongResult');

         digits = DBClass._getDrawnDigits(10, 9);
         assert.deepEqual([1, '...', 6, 7, 8, 9, 10], digits, 'getDrawnDigits10 test case 9: WrongResult');

         digits = DBClass._getDrawnDigits(10, 10);
         assert.deepEqual([1, '...', 7, 8, 9, 10], digits, 'getDrawnDigits10 test case 10: WrongResult');
      });

      it('getDrawnDigits 15 pages', function() {
         var digits;
         digits = DBClass._getDrawnDigits(15, 7);
         assert.deepEqual([1, '...', 4, 5, 6, 7, 8, 9, 10, '...', 15], digits, 'getDrawnDigits15 test case 7: WrongResult');
      });

      it('getDrawnDigits 5 pages', function() {
         var digits;

         digits = DBClass._getDrawnDigits(5, 1);
         assert.deepEqual([1, 2, 3, 4, 5], digits, 'getDrawnDigits5 test case 1: WrongResult');

         digits = DBClass._getDrawnDigits(5, 2);
         assert.deepEqual([1, 2, 3, 4, 5], digits, 'getDrawnDigits5 test case 2: WrongResult');

         digits = DBClass._getDrawnDigits(5, 3);
         assert.deepEqual([1, 2, 3, 4, 5], digits, 'getDrawnDigits5 test case 3: WrongResult');

         digits = DBClass._getDrawnDigits(5, 4);
         assert.deepEqual([1, 2, 3, 4, 5], digits, 'getDrawnDigits5 test case 4: WrongResult');

         digits = DBClass._getDrawnDigits(5, 5);
         assert.deepEqual([1, 2, 3, 4, 5], digits, 'getDrawnDigits5 test case 5: WrongResult');
      });

       it('getDrawnDigits 10 pages in mode numbers', function () {
           var digits;
           digits = DBClass._getDrawnDigits(10, 1, 'numbers');
           assert.deepEqual([1, 2, 3, '...'], digits, 'getDrawnDigits10 test case 1: WrongResult');

           digits = DBClass._getDrawnDigits(10, 2, 'numbers');
           assert.deepEqual([1, 2, 3, '...'], digits, 'getDrawnDigits10 test case 2: WrongResult');

           digits = DBClass._getDrawnDigits(10, 3, 'numbers');
           assert.deepEqual([1, 2, 3, 4, '...'], digits, 'getDrawnDigits10 test case 3: WrongResult');

           digits = DBClass._getDrawnDigits(10, 4, 'numbers');
           assert.deepEqual(['...', 3, 4, 5, '...'], digits, 'getDrawnDigits10 test case 4: WrongResult');

           digits = DBClass._getDrawnDigits(10, 5, 'numbers');
           assert.deepEqual(['...', 4, 5, 6, '...'], digits, 'getDrawnDigits10 test case 5: WrongResult');

           digits = DBClass._getDrawnDigits(10, 6, 'numbers');
           assert.deepEqual(['...', 5, 6, 7, '...'], digits, 'getDrawnDigits10 test case 6: WrongResult');

           digits = DBClass._getDrawnDigits(10, 7, 'numbers');
           assert.deepEqual(['...', 6, 7, 8, '...'], digits, 'getDrawnDigits10 test case 7: WrongResult');

           digits = DBClass._getDrawnDigits(10, 8, 'numbers');
           assert.deepEqual(['...', 7, 8, 9, 10], digits, 'getDrawnDigits10 test case 8: WrongResult');

           digits = DBClass._getDrawnDigits(10, 9, 'numbers');
           assert.deepEqual(['...', 8, 9, 10], digits, 'getDrawnDigits10 test case 9: WrongResult');

           digits = DBClass._getDrawnDigits(10, 10, 'numbers');
           assert.deepEqual(['...', 8, 9, 10], digits, 'getDrawnDigits10 test case 10: WrongResult');
       });

       it('getDrawnDigits 15 pages in mode numbers', function () {
           var digits;
           digits = DBClass._getDrawnDigits(15, 7, 'numbers');
           assert.deepEqual(['...', 6, 7, 8, '...'], digits, 'getDrawnDigits15 test case 7: WrongResult');
       });

       it('getDrawnDigits 5 pages in mode numbers', function () {
           var digits;

           digits = DBClass._getDrawnDigits(5, 1, 'numbers');
           assert.deepEqual([1, 2, 3, '...'], digits, 'getDrawnDigits5 test case 1: WrongResult');

           digits = DBClass._getDrawnDigits(5, 2, 'numbers');
           assert.deepEqual([1, 2, 3, '...'], digits, 'getDrawnDigits5 test case 2: WrongResult');

           digits = DBClass._getDrawnDigits(5, 3, 'numbers');
           assert.deepEqual([1, 2, 3, 4, 5], digits, 'getDrawnDigits5 test case 3: WrongResult');

           digits = DBClass._getDrawnDigits(5, 4, 'numbers');
           assert.deepEqual(['...', 3, 4, 5], digits, 'getDrawnDigits5 test case 4: WrongResult');

           digits = DBClass._getDrawnDigits(5, 5, 'numbers');
           assert.deepEqual(['...', 3, 4, 5], digits, 'getDrawnDigits5 test case 5: WrongResult');
       });
   });
});
