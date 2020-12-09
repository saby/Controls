define([
   'Controls/scroll'
], function(scroll) {
   describe('Controls.Utils.getScrollbarWidth', function() {
      const constWidthScrollbar = 20;
      const getScrollbarWidthByMeasuredBlock = scroll.ScrollbarWidth.getScrollbarWidthByMeasuredBlock;
      let detection, result;
      beforeEach(function() {
         scroll.ScrollbarWidth.getScrollbarWidthByMeasuredBlock = function() {
            return constWidthScrollbar;
         };
      });
      afterEach(function() {
         scroll.ScrollbarWidth.getScrollbarWidthByMeasuredBlock = getScrollbarWidthByMeasuredBlock;
      });
      it('webKit', function() {
         detection = {
            webkit: true
         };

         result = scroll.ScrollbarWidth.getScrollbarWidth(detection);
         assert.equal(result, 0);
      });
      it('ie12', function() {
         detection = {
            isIE12: true
         };

         detection.IEVersion = 16;
         result = scroll.ScrollbarWidth.getScrollbarWidth(detection);
         assert.equal(result, 12);

         detection.IEVersion = 17;
         result = scroll.ScrollbarWidth.getScrollbarWidth(detection);
         assert.equal(result, 16);
      });
      it('ie11', function() {
         detection = {
            isIE11: true
         };

         result = scroll.ScrollbarWidth.getScrollbarWidth(detection);
         assert.equal(result, 17);
      });
      it('ie10', function() {
         detection = {
            isIE10: true
         };

         result = scroll.ScrollbarWidth.getScrollbarWidth(detection);
         assert.equal(result, 17);
      });
      it('firefox', function() {
         detection = {
            firefox: true
         };

         result = scroll.ScrollbarWidth.getScrollbarWidth(detection);
         if (typeof window === 'undefined') {
            assert.equal(result, undefined);
         } else {
            assert.equal(result, 20);
         }
      });
   });
});
