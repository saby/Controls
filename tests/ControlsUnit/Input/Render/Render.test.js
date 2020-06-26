define(
   [
      'Env/Env',
      'Controls/input'
   ],
   function(Env, input) {
      'use strict';

      describe('Controls.Input.Render', function() {
         var ctrl;

         beforeEach(function() {
            ctrl = new input.Render();
         });

         describe('Behavior', function() {
            describe('_getState', function() {
               it('Control in read mode.', function() {
                  ctrl._beforeMount({
                     readOnly: true,
                     multiline: false,
                     state: ''
                  });

                  assert.equal(ctrl._state, 'readonly');
               });
               it('Control in read mode and multiline.', function() {
                  ctrl._beforeMount({
                     readOnly: true,
                     multiline: true,
                     state: ''
                  });

                  assert.equal(ctrl._state, 'readonly-multiline');
               });
               it('Control in active mode.', function() {
                  ctrl._beforeMount({
                     state: '',
                     readOnly: false,
                     validationStatus: 'valid'
                  });
                  ctrl._options = {
                     state: ''
                  };
                  ctrl._setContentActive(true);

                  if (Env.detection.isIE) {
                     assert.equal(ctrl._state, 'valid-active');
                  } else {
                     assert.equal(ctrl._state, 'valid');
                  }
               });
               it('Control in inactive mode.', function() {
                  ctrl._beforeMount({
                     state: '',
                     readOnly: false,
                     validationStatus: 'valid'
                  });

                  assert.equal(ctrl._state, 'valid');
               });
            });
         });
      });
   }
);
