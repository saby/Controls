define(
   [
      'Controls/decorator'
   ],
   function(formatter) {
      'use strict';

      describe('Controls._input.Base.formatter', function() {
         describe('paste', function() {
            it('In an empty string insert "test" to the zero position.', function() {
               assert.equal(formatter.paste('', 'test', 0), 'test');
            });
            it('In an empty string insert "test" to the tenth position.', function() {
               assert.equal(formatter.paste('', 'test', 10), 'test');
            });
            it('In "origin" insert "test" on the zero position.', function() {
               assert.equal(formatter.paste('origin', 'test', 0), 'testorigin');
            });
            it('In "origin" insert "test" on the third position.', function() {
               assert.equal(formatter.paste('origin', 'test', 3), 'oritestgin');
            });
            it('In "origin" insert "test" on the tenth position.', function() {
               assert.equal(formatter.paste('origin', 'test', 10), 'origintest');
            });
            it('In "origin" insert "test" minus the tenth position.', function() {
               assert.equal(formatter.paste('origin', 'test', -10), 'testorigin');
            });
         });
      });
   }
);
