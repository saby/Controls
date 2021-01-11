define(
   [
      'Env/Event',
      'Env/Env',
      'Core/core-instance',
      'Core/helpers/Hcontrol/makeInstanceCompatible',
      'Controls/input',
      'ControlsUnit/resources/ProxyCall',
      'ControlsUnit/Input/Base/InputUtility',
      'ControlsUnit/resources/TemplateUtil',
      'Vdom/Vdom'
   ],
   function(EnvEvent, Env, instance, makeInstanceCompatible, inputMod, ProxyCall, InputUtility, TemplateUtil, Vdom) {
      describe('Controls/_input/Base', function() {
         var calls;
         var ctrl = new inputMod.Base();
         var _private = inputMod.Base._private;
         makeInstanceCompatible(ctrl);
         ctrl._beforeMount({});
         ctrl._template(ctrl);

         beforeEach(function() {
            calls = [];
            ctrl = new inputMod.Base();
            makeInstanceCompatible(ctrl);
            ctrl._notify = ProxyCall.apply(ctrl._notify, 'notify', calls, true);

            var beforeMount = ctrl._beforeMount;

            ctrl._beforeMount = function() {
               beforeMount.apply(this, arguments);

               ctrl._children[this._fieldName] = {
                  selectionStart: 0,
                  selectionEnd: 0,
                  value: '',
                  focus: function() {
                  },
                  setSelectionRange: function(start, end) {
                     this.selectionStart = start;
                     this.selectionEnd = end;
                  }
               };
            };
         });

         it('getDefault', function() {
            inputMod.Base.getOptionTypes();
            inputMod.Base.getDefaultOptions();
         });
         it('The model belongs to the "Controls/input:BaseViewModel" class.', function() {
            ctrl._beforeMount({
               value: ''
            });

            assert.isTrue(
               instance.instanceOfModule(ctrl._viewModel, 'Controls/input:BaseViewModel') ||
               instance.instanceOfModule(ctrl._viewModel, 'Controls/_input/Base/ViewModel')
            );
         });
         it('ViewModel _isEmptyValue', function() {
            const isEmptyValue = inputMod.NewBaseViewModel.prototype._isEmptyValue;

            let isEmpty = isEmptyValue('');
            assert.equal(isEmpty, true);

            isEmpty = isEmptyValue(null);
            assert.equal(isEmpty, true);

            isEmpty = isEmptyValue('123');
            assert.equal(isEmpty, false);

            isEmpty = isEmptyValue(123);
            assert.equal(isEmpty, false);
         });

         it('ViewModel setDisplayValue', function() {
            let value = '';
            inputMod.NewBaseViewModel.prototype._convertToDisplayValue = () => '123';
            inputMod.NewBaseViewModel.prototype._convertToValue = () => value;
            const model = new inputMod.NewBaseViewModel({}, '');
            model._emptyValue = null;
            model._setDisplayValue(value);
            assert.equal(model._value, null);

            value = '123';
            model._setDisplayValue(value);
            assert.equal(model._value, '123');

            model._emptyValue = '';
            value = null;
            model._setDisplayValue(value);
            assert.equal(model._value, '');
         });
         it('Pass null as the value option.', function() {
            ctrl._getActiveElement = function() {
               return ctrl._getField();
            };
            ctrl._beforeMount({
               value: null
            });
            ctrl._template(ctrl);

            assert.equal(ctrl._viewModel.value, null);
            assert.equal(ctrl._viewModel.displayValue, '');
            assert.equal(ctrl._viewModel.selection.start, 0);
            assert.equal(ctrl._viewModel.selection.end, 0);
         });

         describe('The _fieldName property value equal the name option value when mounting the control, if it defined.', function() {
            it('No.', function() {
               ctrl._beforeMount({
                  value: '',
                  autoComplete: true
               });

               assert.equal(ctrl._fieldName, 'input');
            });
            it('Yes.', function() {
               ctrl._beforeMount({
                  value: '',
                  name: 'test name',
                  autoComplete: true
               });

               assert.equal(ctrl._fieldName, 'test name');
            });
         });
         describe('Changing options in model.', function() {
            beforeEach(function() {
               ctrl._getViewModelOptions = function(options) {
                  return {
                     option: options.optionModel
                  };
               };
               ctrl._beforeMount({
                  value: '',
                  optionModel: 'test'
               });
               ctrl._viewModel = ProxyCall.set(ctrl._viewModel, ['options', 'value'], calls, true);
            });
            it('No change.', function() {
               ctrl._beforeUpdate({
                  value: '',
                  optionModel: 'test'
               });

               assert.equal(calls.length, 0);
            });

            it('There are changes.', function() {
               ctrl._beforeUpdate({
                  value: 'test value',
                  optionModel: 'test option'
               });

               assert.deepEqual(calls, [{
                  name: 'options',
                  value: {
                     option: 'test option'
                  }
               }, {
                  name: 'value',
                  value: 'test value'
               }]);
            });
         });
         describe('MouseEnter', function() {
            describe('Tooltip', function() {
               beforeEach(function() {
                  ctrl._beforeMount({
                     value: 'test value'
                  });
                  ctrl._options.tooltip = 'test tooltip';
               });
               it('The value fits in the field.', function() {
                  ctrl._hasHorizontalScroll = function() {
                     return false;
                  };
                  ctrl._getField().hasHorizontalScroll = function() {
                     return false;
                  };

                  ctrl._mouseEnterHandler();

                  assert.equal(ctrl._tooltip, 'test tooltip');
               });
               it('The value no fits in the field.', function() {
                  ctrl._hasHorizontalScroll = function() {
                     return true;
                  };
                  ctrl._getField().hasHorizontalScroll = function() {
                     return true;
                  };

                  ctrl._mouseEnterHandler();

                  assert.equal(ctrl._tooltip, 'test value');
               });
               it('The value fits in the field is read mode.', function() {
                  ctrl._options.readOnly = true;
                  ctrl._hasHorizontalScroll = function() {
                     return false;
                  };
                  ctrl._getField().hasHorizontalScroll = function() {
                     return false;
                  };

                  ctrl._mouseEnterHandler();

                  assert.equal(ctrl._tooltip, 'test tooltip');
               });
               it('The value no fits in the field is read mode.', function() {
                  ctrl._options.readOnly = true;
                  ctrl._hasHorizontalScroll = function() {
                     return true;
                  };
                  ctrl._getField().hasHorizontalScroll = function() {
                     return true;
                  };

                  ctrl._mouseEnterHandler();

                  assert.equal(ctrl._tooltip, 'test value');
               });
            });
         });
         describe('Change event', function() {
            it('Notification when input is complete.', function() {
               ctrl._beforeMount({
                  value: 'test value'
               });
               ctrl._notifyInputCompleted();

               assert.deepEqual(calls, [{
                  name: 'notify',
                  arguments: ['inputCompleted', ['test value', 'test value']]
               }]);

               ctrl._beforeUpdate({
                  value: ''
               });
               ctrl._notifyInputCompleted();

               assert.deepEqual(calls, [
                  {
                     name: 'notify',
                     arguments: ['inputCompleted', ['test value', 'test value']]
                  },
                  {
                     name: 'notify',
                     arguments: ['inputCompleted', ['', '']]
                  }
               ]);
            });
         });
         describe('Click event on the placeholder.', function() {
            beforeEach(function() {
               ctrl._beforeMount({
                  value: ''
               });
               ctrl._getField().focus = ProxyCall.apply(ctrl._getField().focus, 'focus', calls, true);
            });
            it('Not not focus the field through a script in not IE browser', function() {
               ctrl._ieVersion = null;

               ctrl._placeholderClickHandler();

               assert.equal(calls.length, 0);
            });

            it('Focus the field through a script in ie browser version 10.', function() {
               ctrl._ieVersion = 10;

               ctrl._placeholderClickHandler();

               assert.deepEqual(calls, [{
                  name: 'focus',
                  arguments: []
               }]);
            });
            it('Not focus the field through a script in ie browser version 12.', function() {
               ctrl._ieVersion = 12;

               ctrl._placeholderClickHandler();

               assert.equal(calls.length, 0);
            });
         });
         describe('hidePlaceholder', function() {
            it('The autoComplete equal "on".', function() {
               ctrl._hidePlaceholderUsingCSS = false;
               ctrl._beforeMount({
                  value: '',
                  autoComplete: 'on'
               });
               assert.equal(ctrl._hidePlaceholder, true);
               ctrl._afterMount();
               assert.equal(ctrl._hidePlaceholder, false);
            });
            it('The autoComplete equal "off".', function() {
               ctrl._hidePlaceholderUsingCSS = false;
               ctrl._beforeMount({
                  value: '',
                  autoComplete: 'off'
               });
               assert.equal(ctrl._hidePlaceholder, false);
               ctrl._afterMount();
               assert.equal(ctrl._hidePlaceholder, false);
            });
         });
      });
   }
);
