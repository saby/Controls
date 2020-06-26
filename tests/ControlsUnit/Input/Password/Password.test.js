define(
   [
      'Core/core-instance',
      'Controls/input'
   ],
   function(instance, input) {
      describe('Controls/_input/Password', function() {
         var ctrl, calls;

         beforeEach(function() {
            calls = [];
            ctrl = new input.Password();
            var beforeMount = ctrl._beforeMount;

            ctrl._beforeMount = function() {
               beforeMount.apply(this, arguments);

               ctrl._children[this._fieldName] = {
                  focus: function() {},
                  setSelectionRange: function(start, end) {
                     this.selectionStart = start;
                     this.selectionEnd = end;
                  }
               };
            };
         });

         it('Checking default values of options.', function() {
            assert.deepEqual(input.Password.getDefaultOptions(), {
               tooltip: '',
               style: 'info',
               inlineHeight: 'default',
               placeholder: '',
               spellCheck: true,
               revealable: true,
               textAlign: 'left',
               autoComplete: 'on',
               fontColorStyle: 'default',
               fontSize: 'm',
               selectOnClick: false,
               horizontalPadding: 'xs'
            });
         });
         it('Checking types of options.', function() {
            assert.deepEqual(Object.keys(input.Password.getOptionTypes()).sort(), [
               'value',
               'style',
               'tooltip',
               'tagStyle',
               'textAlign',
               'spellCheck',
               'revealable',
               'inputCallback',
               'selectOnClick',
               'horizontalPadding'
            ].sort());
         });
         it('The model belongs to the "Controls/_input/Password/ViewModel" class.', function() {
            ctrl._beforeMount({
               value: ''
            });

            assert.isTrue(instance.instanceOfModule(ctrl._viewModel, 'Controls/_input/Password/ViewModel'));
         });

         describe('The type attribute of the field when mounting.', function() {
            it('Auto-completion is disabled.', function() {
               ctrl._beforeMount({
                  value: '',
                  autoComplete: false
               });

               assert.equal(ctrl._type, 'text');
            });
            it('Auto-completion is enabled.', function() {
               ctrl._beforeMount({
                  value: '',
                  autoComplete: true
               });

               assert.equal(ctrl._type, 'password');
            });
         });
         describe('Mouse enter event.', function() {
            describe('Tooltip value.', function() {
               beforeEach(function() {
                  ctrl._beforeMount({
                     value: 'test value'
                  });
                  ctrl._options.tooltip = 'test tooltip';
               });

               var init = function(inst, passwordVisible, valueFits) {
                  inst._passwordVisible = passwordVisible;
                  inst._hasHorizontalScroll = function() {
                     return !valueFits;
                  };
                  inst._beforeUpdate({
                     value: 'test value'
                  });
               };

               it('The password is hidden and the value fits into the field.', function() {
                  init(ctrl, false, true);

                  ctrl._mouseEnterHandler();

                  assert.equal(ctrl._tooltip, '');
               });
               it('The password is hidden and the value no fits into the field.', function() {
                  init(ctrl, false, false);

                  ctrl._mouseEnterHandler();

                  assert.equal(ctrl._tooltip, '');
               });
               it('The password is visible and the value fits into the field.', function() {
                  init(ctrl, true, true);

                  ctrl._mouseEnterHandler();

                  assert.equal(ctrl._tooltip, 'test tooltip');
               });
               it('The password is visible and the value no fits into the field.', function() {
                  init(ctrl, true, false);

                  ctrl._mouseEnterHandler();

                  assert.equal(ctrl._tooltip, 'test value');
               });
            });
         });
         describe('The click event on the icon.', function() {
            it('Auto-completion is disabled.', function() {
               ctrl._autoComplete = 'off';
               ctrl._toggleVisibilityHandler();

               assert.equal(ctrl._type, 'text');
               assert.equal(ctrl._passwordVisible, true);

               ctrl._toggleVisibilityHandler();

               assert.equal(ctrl._type, 'text');
               assert.equal(ctrl._passwordVisible, false);
            });
            it('Auto-completion is enabled.', function() {
               ctrl._autoComplete = 'on';
               ctrl._toggleVisibilityHandler();

               assert.equal(ctrl._type, 'text');
               assert.equal(ctrl._passwordVisible, true);

               ctrl._toggleVisibilityHandler();

               assert.equal(ctrl._type, 'password');
               assert.equal(ctrl._passwordVisible, false);
            });
         });
      });
   }
);
