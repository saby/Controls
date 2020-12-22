define(
   [
      'Controls/decorator'
   ],
   function(decorator) {

      'use strict';

      describe('Controls.Utils.splitIntoTriads', function() {
         it('Tests', function() {
            assert.equal(decorator.splitIntoTriads('1'), '1');
            assert.equal(decorator.splitIntoTriads('11'), '11');
            assert.equal(decorator.splitIntoTriads('111'), '111');
            assert.equal(decorator.splitIntoTriads('1111'), '1 111');
            assert.equal(decorator.splitIntoTriads('11111'), '11 111');
            assert.equal(decorator.splitIntoTriads('111111'), '111 111');
            assert.equal(decorator.splitIntoTriads('-111'), '-111');
            assert.equal(decorator.splitIntoTriads('-111111'), '-111 111');
         });
      });
   }
);
