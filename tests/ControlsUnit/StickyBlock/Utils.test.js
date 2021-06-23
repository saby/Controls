define([
   'Controls/scroll'
], function(
   scroll
) {

   'use strict';

   describe('Controls/scroll:Utils', function() {
      describe('getNextId', function() {
         it('should return increasing ids', function() {
            const
               id1 = scroll.getNextStickyId(),
               id2 = scroll.getNextStickyId();

            assert.strictEqual(id2, id1 + 1);
         });
      });

   });

});
