define(
   [
      'Controls/decorator'
   ],
   function(decorator) {

      'use strict';

      describe('Controls.Utils.splitIntoTriads', function() {
         it('Tests', function() {
            assert.equal(decorator.splitIntoTriads.default('1'), '1');
            assert.equal(decorator.splitIntoTriads.default('11'), '11');
            assert.equal(decorator.splitIntoTriads.default('111'), '111');
            assert.equal(decorator.splitIntoTriads.default('1111'), '1 111');
            assert.equal(decorator.splitIntoTriads.default('11111'), '11 111');
            assert.equal(decorator.splitIntoTriads.default('111111'), '111 111');
            assert.equal(decorator.splitIntoTriads.default('-111'), '-111');
            assert.equal(decorator.splitIntoTriads.default('-111111'), '-111 111');
         });
      });
   }
);
