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
         var event1 = {
            currentTarget: {}
         };
         var event2 = {
            currentTarget: {}
         };
         var originalMethod = EnvEvent.Bus.globalChannel().notify;

         beforeEach(function() {
            calls = [];
            controller = MobileFocusController.default;

            controller.blurHandler(event1);
            controller.blurHandler(event2);
            originalIsMobileIOS = Env.detection.isMobileIOS;
            EnvEvent.Bus.globalChannel().notify = ProxyCall.apply(originalMethod, 'notify', calls, true);
         });
         afterEach(function() {
            EnvEvent.Bus.globalChannel().notify = originalMethod;
            if (Env.constants.isBrowserPlatform) {
               Env.detection.isMobileIOS = originalIsMobileIOS;
            } else {
               Env.detection['test::isMobileIOS'] = originalIsMobileIOS;
            }
         });
         describe('isMobileIOS = true', function() {
            beforeEach(function() {
               if (Env.constants.isBrowserPlatform) {
                  Env.detection.isMobileIOS = true;
               } else {
                  Env.detection['test::isMobileIOS'] = true;
               }
            });
            it('focus -> touchStart -> blur', function() {
               controller.focusHandler(event1);
               assert.equal(calls.length, 0);

               controller.touchStartHandler(event1);
               assert.equal(calls.length, 1);
               assert.deepEqual(calls[0], {
                  name: 'notify',
                  arguments: ['MobileInputFocus']
               });

               controller.blurHandler(event1);
               assert.equal(calls.length, 2);
               assert.deepEqual(calls[1], {
                  name: 'notify',
                  arguments: ['MobileInputFocusOut']
               });
            });
            it('touchStart -> focus -> blur', function() {
               controller.touchStartHandler(event1);
               assert.equal(calls.length, 0);

               controller.focusHandler(event1);
               assert.equal(calls.length, 1);
               assert.deepEqual(calls[0], {
                  name: 'notify',
                  arguments: ['MobileInputFocus']
               });

               controller.blurHandler(event1);
               assert.equal(calls.length, 2);
               assert.deepEqual(calls[1], {
                  name: 'notify',
                  arguments: ['MobileInputFocusOut']
               });
            });
            it('touchStart -> focus -> blur', function() {
               controller.touchStartHandler(event1);
               assert.equal(calls.length, 0);

               controller.focusHandler(event1);
               assert.equal(calls.length, 1);
               assert.deepEqual(calls[0], {
                  name: 'notify',
                  arguments: ['MobileInputFocus']
               });

               controller.blurHandler(event1);
               assert.equal(calls.length, 2);
               assert.deepEqual(calls[1], {
                  name: 'notify',
                  arguments: ['MobileInputFocusOut']
               });
            });
            it('blur', function() {
               controller.blurHandler(event1);
               assert.equal(calls.length, 0);
            });
            it('User tap from field to field', function() {
               controller.touchStartHandler(event1);
               controller.focusHandler(event1);
               controller.touchStartHandler(event2);
               controller.blurHandler(event1);
               controller.focusHandler(event2);

               assert.deepEqual(calls, [
                  {
                     name: 'notify',
                     arguments: ['MobileInputFocus']
                  },
                  {
                     name: 'notify',
                     arguments: ['MobileInputFocusOut']
                  },
                  {
                     name: 'notify',
                     arguments: ['MobileInputFocus']
                  }
               ]);
            });
         });
         describe('isMobileIOS = false', function() {
            beforeEach(function() {
               if (Env.constants.isBrowserPlatform) {
                  Env.detection.isMobileIOS = false;
               } else {
                  Env.detection['test::isMobileIOS'] = false;
               }
            });
            it('touchStart -> blur', function() {
               controller.touchStartHandler(event1);
               assert.equal(calls.length, 0);

               controller.blurHandler(event1);
               assert.equal(calls.length, 0);
            });
            it('focus -> blur', function() {
               controller.focusHandler(event1);
               assert.equal(calls.length, 0);

               controller.blurHandler(event1);
               assert.equal(calls.length, 0);
            });
            it('touchStart -> focus -> blur', function() {
               controller.touchStartHandler(event1);
               assert.equal(calls.length, 0);

               controller.focusHandler(event1);
               assert.equal(calls.length, 0);

               controller.blurHandler(event1);
               assert.equal(calls.length, 0);
            });
            it('blur', function() {
               controller.blurHandler(event1);
               assert.equal(calls.length, 0);
            });
         });
      });
   }
);
