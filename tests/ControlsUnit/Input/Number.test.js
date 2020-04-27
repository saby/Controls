define(
   [
      'Core/core-instance',
      'Controls/input',
      'ControlsUnit/resources/ProxyCall',
      'ControlsUnit/Input/Base/InputUtility',
      'Vdom/Vdom'
   ],
   function(instance, inputMod, ProxyCall, InputUtility, Vdom) {
      'use strict';

      describe('Controls/_input/Number', function() {
         var ctrl, calls;

         beforeEach(function() {
            calls = [];
            ctrl = new inputMod.Number();

            var beforeMount = ctrl._beforeMount;

            ctrl._beforeMount = function() {
               beforeMount.apply(this, arguments);

               ctrl._children[this._fieldName] = {
                  setSelectionRange: function(start, end) {
                     this.selectionStart = start;
                     this.selectionEnd = end;
                  }
               };
            };
            ctrl._notify = ProxyCall.apply(ctrl._notify, 'notify', calls, true);
         });

         it('Checking default values of options.', function() {
            assert.deepEqual(inputMod.Number.getDefaultOptions(), {
               tooltip: '',
               style: 'info',
               spellCheck: true,
               size: 'default',
               placeholder: '',
               useGrouping: true,
               textAlign: 'left',
               autoComplete: 'off',
               onlyPositive: false,
               fontStyle: 'default',
               selectOnClick: false,
               showEmptyDecimals: false
            });
         });
         it('Checking types of options.', function() {
            assert.deepEqual(Object.keys(inputMod.Number.getOptionTypes()).sort(), [
               'size',
               'value',
               'style',
               'tooltip',
               'tagStyle',
               'precision',
               'textAlign',
               'fontStyle',
               'spellCheck',
               'useGrouping',
               'onlyPositive',
               'selectOnClick',
               'inputCallback',
               'integersLength',
               'showEmptyDecimals'
            ].sort());
         });

         it('The model belongs to the "Controls/_input/Number/ViewModel" class.', function() {
            ctrl._beforeMount({
               value: 0
            });

            assert.isTrue(instance.instanceOfModule(ctrl._viewModel, 'Controls/_input/Number/ViewModel'));
         });
         describe('Change event', function() {
            beforeEach(function() {
               ctrl._beforeMount({
                  value: 0
               });
               ctrl._viewModel = ProxyCall.set(ctrl._viewModel, ['displayValue'], calls);
            });
            it('ShowEmptyDecimals option equal true. Trailing zeros are not trimmed.', function() {
               ctrl._options.showEmptyDecimals = true;

               ctrl._changeHandler();

               assert.deepEqual(calls, [{
                  name: 'notify',
                  arguments: ['inputCompleted', [0, '0']]
               }]);
            });
         });
         describe('User input.', function() {
            beforeEach(function() {
               ctrl._getActiveElement = function() {
                  return ctrl._getField();
               };
            });
            it('The display value divided into triads is correctly converted to a value.', function() {
               ctrl._beforeMount({
                  value: null,
                  useGrouping: true
               });

               ctrl._getField().value = '1111';
               ctrl._getField().selectionStart = 4;
               ctrl._getField().selectionEnd = 4;
               ctrl._inputHandler(new Vdom.SyntheticEvent({}));

               assert.deepEqual(calls, [{
                  name: 'notify',
                  arguments: ['valueChanged', [1111, '1 111']]
               }]);
            });
            it('Triad partitioning is disabled. Enter 123456', function() {
               ctrl._beforeMount({
                  value: null,
                  useGrouping: false
               });

               ctrl._getField().value = '123456';
               ctrl._getField().selectionStart = 6;
               ctrl._getField().selectionEnd = 6;
               ctrl._inputHandler(new Vdom.SyntheticEvent({}));

               assert.deepEqual(calls, [{
                  name: 'notify',
                  arguments: ['valueChanged', [123456, '123456']]
               }]);
            });
         });
      });
   }
);
