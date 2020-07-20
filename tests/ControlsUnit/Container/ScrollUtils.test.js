define(
   [
      'Env/Env',
      'Controls/_scroll/Scroll/ScrollWidthUtil',
      'Controls/_scroll/Scroll/ScrollHeightFixUtil'
   ],
   function(Env, ScrollWidthUtil, ScrollHeightFixUtil) {

      'use strict';

      var
         mockEnv = function(envField) {
            oldEnvValue = Env.detection[envField];
            Env.detection[envField] = true;
         },
         restoreEnv = function(envField) {
            if (typeof window === 'undefined') {
               Env.detection[envField] = undefined;
            } else {
               Env.detection[envField] = oldEnvValue;
            }
         },
         oldEnvValue;

      describe('Controls.Container.Scroll.Utils', function() {
         var detection, result;

         describe('calcOverflow', function() {
            var container;
            it('chrome', function() {
               mockEnv('chrome');

               result = ScrollHeightFixUtil.calcHeightFix();
               assert.equal(result, false);
               restoreEnv('chrome');
            });
            it('firefox', function() {
               mockEnv('firefox');

               container = {
                  offsetHeight: 10,
                  scrollHeight: 10
               };
               result = ScrollHeightFixUtil.calcHeightFix(container);
               if (window) {
                  assert.equal(result, true);
               } else {
                  assert.equal(result, undefined);
               }

               container = {
                  offsetHeight: 40,
                  scrollHeight: 40
               };
               result = ScrollHeightFixUtil.calcHeightFix(container);
               if (window) {
                  assert.equal(result, false);
               } else {
                  assert.equal(result, undefined);
               }
               restoreEnv('firefox');
            });

            it('calcStyleHideScrollbar', () => {
               result = ScrollWidthUtil._private.calcStyleHideScrollbar(0, {}, {});
               assert.equal(result, '');

               result = ScrollWidthUtil._private.calcStyleHideScrollbar(17, 'vertical', {}, {});
               assert.equal(result, 'margin: 0 -17px -0px 0;');

               result = ScrollWidthUtil._private.calcStyleHideScrollbar(17, 'verticalHorizontal', {}, {});
               assert.equal(result, 'margin: 0 -17px -17px 0;');
            });
         });
      });
   }
);
