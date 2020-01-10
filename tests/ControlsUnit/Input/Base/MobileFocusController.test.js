define(
   [
      'Env/Env',
      'Env/Event',
      'ControlsUnit/resources/ProxyCall',
      'Controls/_input/Base/MobileFocusController'
   ],
   function(Env, EnvEvent, ProxyCall, MobileFocusController) {
      describe('Controls.input:MobileFocusController', function() {
         var controller, calls, originalIsMobileIOS;
         var originalMethod = EnvEvent.Bus.globalChannel().notify;

         beforeEach(function() {
            calls = [];
            controller = MobileFocusController.default;

            originalIsMobileIOS = Env.detection.isMobileIOS;
            EnvEvent.Bus.globalChannel().notify = ProxyCall.apply(originalMethod, 'notify', calls, true);
         });
         afterEach(function() {
            EnvEvent.Bus.globalChannel().notify = originalMethod;
            Env.detection.isMobileIOS = originalIsMobileIOS;
         });
         describe('isMobileIOS = true', function() {
            beforeEach(function() {
               Env.detection.isMobileIOS = true;
            });
            it('focus -> touchStart -> blur', function() {
               controller.focusHandler();
               assert.equal(calls.length, 0);

               controller.touchStartHandler();
               assert.equal(calls.length, 1);
               assert.deepEqual(calls[0], {
                  name: 'notify',
                  arguments: ['MobileInputFocus']
               });

               controller.blurHandler();
               assert.equal(calls.length, 2);
               assert.deepEqual(calls[1], {
                  name: 'notify',
                  arguments: ['MobileInputFocusOut']
               });
            });
            it('touchStart -> focus -> blur', function() {
               controller.touchStartHandler();
               assert.equal(calls.length, 0);

               controller.focusHandler();
               assert.equal(calls.length, 1);
               assert.deepEqual(calls[0], {
                  name: 'notify',
                  arguments: ['MobileInputFocus']
               });

               controller.blurHandler();
               assert.equal(calls.length, 2);
               assert.deepEqual(calls[1], {
                  name: 'notify',
                  arguments: ['MobileInputFocusOut']
               });
            });
            it('touchStart -> focus -> blur', function() {
               controller.touchStartHandler();
               assert.equal(calls.length, 0);

               controller.focusHandler();
               assert.equal(calls.length, 1);
               assert.deepEqual(calls[0], {
                  name: 'notify',
                  arguments: ['MobileInputFocus']
               });

               controller.blurHandler();
               assert.equal(calls.length, 2);
               assert.deepEqual(calls[1], {
                  name: 'notify',
                  arguments: ['MobileInputFocusOut']
               });
            });
            it('blur', function() {
               controller.blurHandler();
               assert.equal(calls.length, 0);
            });
         });
         describe('isMobileIOS = false', function() {
            beforeEach(function() {
               Env.detection.isMobileIOS = false;
            });
            it('touchStart -> blur', function() {
               controller.touchStartHandler();
               assert.equal(calls.length, 0);

               controller.blurHandler();
               assert.equal(calls.length, 0);
            });
            it('focus -> blur', function() {
               controller.focusHandler();
               assert.equal(calls.length, 0);

               controller.blurHandler();
               assert.equal(calls.length, 0);
            });
            it('touchStart -> focus -> blur', function() {
               controller.touchStartHandler();
               assert.equal(calls.length, 0);

               controller.focusHandler();
               assert.equal(calls.length, 0);

               controller.blurHandler();
               assert.equal(calls.length, 0);
            });
            it('blur', function() {
               controller.blurHandler();
               assert.equal(calls.length, 0);
            });
         });
      });
   }
);
