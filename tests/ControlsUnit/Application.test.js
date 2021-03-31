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
            return 'ws-is-touch';
         };
         var getFalseTouch = function() {
            return 'ws-is-no-touch';
         };

         beforeEach(function() {
            application = new Application.default();
            application._touchController = {};
         });

         it('ws-is-no-touch ws-is-no-drag ws-is-hover', function() {
            application._bodyClasses.dragClass = 'ws-is-no-drag';
            application._touchController.getClass = getFalseTouch;

            application._updateTouchClass();

            assert.equal(application._bodyClasses.touchClass, 'ws-is-no-touch');
            assert.equal(application._bodyClasses.dragClass, 'ws-is-no-drag');
            assert.equal(application._bodyClasses.hoverClass, 'ws-is-hover');
         });
         it('ws-is-touch ws-is-no-drag ws-is-no-hover', function() {
            application._bodyClasses.dragClass = 'ws-is-no-drag';
            application._touchController.getClass = getTrueTouch;

            application._updateTouchClass();

            assert.equal(application._bodyClasses.touchClass, 'ws-is-touch');
            assert.equal(application._bodyClasses.dragClass, 'ws-is-no-drag');
            assert.equal(application._bodyClasses.hoverClass, 'ws-is-no-hover');
         });
         it('ws-is-no-touch ws-is-drag ws-is-no-hover', function() {
            application._bodyClasses.dragClass = 'ws-is-drag';
            application._touchController.getClass = getFalseTouch;

            application._updateTouchClass();

            assert.equal(application._bodyClasses.touchClass, 'ws-is-no-touch');
            assert.equal(application._bodyClasses.dragClass, 'ws-is-drag');
            assert.equal(application._bodyClasses.hoverClass, 'ws-is-no-hover');
         });
         it('ws-is-touch ws-is-drag ws-is-no-hover', function() {
            application._bodyClasses.dragClass = 'ws-is-drag';
            application._touchController.getClass = getTrueTouch;

            application._updateTouchClass();

            assert.equal(application._bodyClasses.touchClass, 'ws-is-touch');
            assert.equal(application._bodyClasses.dragClass, 'ws-is-drag');
            assert.equal(application._bodyClasses.hoverClass, 'ws-is-no-hover');
         });
      });
   });
});
