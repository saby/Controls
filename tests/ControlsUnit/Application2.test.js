/**
 * Created by dv.zuev on 27.12.2017.
 */
define([
   'Env/Env',
   'Controls/Application'
], function(Env, Application) {
   describe('Controls.Application2', function() {

      describe('popup logic', function() {
         it('not mobile', function () {
            let
               ctrl = new Application({});

            ctrl._popupCreatedHandler();
            assert.equal(ctrl._scrollingClass, '');

            ctrl._popupDestroyedHandler(null, null, {
               getCount: () => {
                  return 0;
               }
            });
            assert.equal(ctrl._scrollingClass, '');

            ctrl._suggestStateChangedHandler(null, true);
            assert.equal(ctrl._scrollingClass, '');
            ctrl._suggestStateChangedHandler(null, false);
            assert.equal(ctrl._scrollingClass, '');
         });

         it('ios', function () {
            let ctrl = new Application({}),
               oldIsMobileIOS = Env.detection.isMobileIOS;

            Env.detection.isMobileIOS = true;
            ctrl._popupCreatedHandler();
            assert.equal(ctrl._scrollingClass, 'controls-Scroll_webkitOverflowScrollingAuto');

            ctrl._popupDestroyedHandler(null, null, {
               getCount: () => {
                  return 0;
               }
            });
            assert.equal(ctrl._scrollingClass, 'controls-Scroll_webkitOverflowScrollingTouch');

            ctrl._suggestStateChangedHandler(null, true);
            assert.equal(ctrl._scrollingClass, 'controls-Scroll_webkitOverflowScrollingAuto');
            ctrl._suggestStateChangedHandler(null, false);
            assert.equal(ctrl._scrollingClass, 'controls-Scroll_webkitOverflowScrollingTouch');


            if (typeof window === 'undefined') {
               Env.detection.isMobileIOS = undefined;
            } else {
               Env.detection.isMobileIOS = oldIsMobileIOS;
            }
         });
      });
   });
});
