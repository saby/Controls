define(
   [
      'Controls/decorator'
   ],
   function(decorator) {
      'use strict';
      describe('Controls._decorator.numberToSring', function() {
         it('should return 3450', () => {
            const result = decorator.numberToString(3.45e3);
            assert.equal(result, 3450);
         });

         it('should return -0.00345', () => {
            const result = decorator.numberToString(-3.45e-3);
            assert.equal(result, -0.00345);
         });

         it('should return 0', () => {
            const result = decorator.numberToString(0);
            assert.equal(result, 0);
         });
      });
   }
);

