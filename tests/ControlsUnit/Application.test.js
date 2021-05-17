/**
 * Created by dv.zuev on 27.12.2017.
 */
define([
   'Controls/Application'
], function(Application) {
   describe('Controls.Application', function() {
      it('_tplConfig init', function(done) {
         /* Пока не ясно, как мокать контексты */
         this.skip();
         var cfg = {
               templateConfig: { prop1: 123 },
               content: Application
            },
            ctrl = new Application(cfg);

         ctrl._beforeMount(cfg).addCallback(function(conf) {
            assert.equal(ctrl.templateConfig, cfg.templateConfig, 'Property templateConfig is incorrect before mounting');
            done();
         });
      });
      describe('Classes touch, drag and hover.', function() {
         var application;
         var getTrueTouch = function() {
            return true;
         };
         var getFalseTouch = function() {
            return false;
         };

         beforeEach(function() {
            application = new Application.default();
            application._touchController = {};
         });

         it('ws-is-no-touch ws-is-no-drag ws-is-hover', function() {
            application._bodyClassesState.drag = false;
            application._touchController.isTouch = getFalseTouch;

            application._updateTouchClass();

            assert.equal(application._bodyClassesState.touch, false);
            assert.equal(application._bodyClassesState.drag, false);
            assert.equal(application._bodyClassesState.hover, true);
         });
         it('ws-is-touch ws-is-no-drag ws-is-no-hover', function() {
            application._bodyClassesState.drag = false;
            application._touchController.isTouch = getTrueTouch;

            application._updateTouchClass();

            assert.equal(application._bodyClassesState.touch, true);
            assert.equal(application._bodyClassesState.drag, false);
            assert.equal(application._bodyClassesState.hover, false);
         });
         it('ws-is-no-touch ws-is-drag ws-is-no-hover', function() {
            application._bodyClassesState.drag = true;
            application._touchController.isTouch = getFalseTouch;

            application._updateTouchClass();

            assert.equal(application._bodyClassesState.touch, false);
            assert.equal(application._bodyClassesState.drag, true);
            assert.equal(application._bodyClassesState.hover, false);
         });
         it('ws-is-touch ws-is-drag ws-is-no-hover', function() {
            application._bodyClassesState.drag = false;
            application._touchController.isTouch = getTrueTouch;

            application._updateTouchClass();

            assert.equal(application._bodyClassesState.touch, true);
            assert.equal(application._bodyClassesState.drag, true);
            assert.equal(application._bodyClassesState.hover, false);
         });
      });
   });
});
