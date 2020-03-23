define(
   [
      'Controls/_input/Base/Delay'
   ],
   function(Delay) {
      describe('Controls.input:Delay', function() {
         var delay;
         var hasCallCallback;
         var callback = function() {
            hasCallCallback = true;
         };

         beforeEach(function() {
            hasCallCallback = false;
            delay = new Delay.default();
            delay.callback = callback;
         });
         it('No update', function() {
            delay.run();
            assert.isTrue(hasCallCallback);
         });
         it('Update', function() {
            delay.lock();
            delay.run();
            assert.isFalse(hasCallCallback);
            delay.unlock();
            assert.isTrue(hasCallCallback);
         });
      });
   }
);
