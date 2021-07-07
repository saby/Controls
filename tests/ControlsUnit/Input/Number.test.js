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

         it('The model belongs to the "Controls/_input/Number/ViewModel" class.', function() {
            ctrl._beforeMount({
               value: 0
            });

            assert.isTrue(instance.instanceOfModule(ctrl._viewModel, 'Controls/_input/Number/ViewModel'));
         });
         describe('showEmptyDecimals', function() {
            it('showEmptyDecimals=true, readOnly=false', function() {
               ctrl._beforeMount({
                  value: '1.10000',
                  showEmptyDecimals: true
               });
               assert.equal('1.10000', ctrl._viewModel.displayValue);
            });
            it('showEmptyDecimals=false, readOnly=false', function() {
               ctrl._beforeMount({
                  value: '1.10000',
                  showEmptyDecimals: false,
                  readOnly: false
               });
               assert.equal('1.10000', ctrl._viewModel.displayValue);
            });
            it('showEmptyDecimals=false, readOnly=true', function() {
               ctrl._beforeMount({
                  value: '1.10000',
                  showEmptyDecimals: false,
                  readOnly: true
               });
               assert.equal('1.1', ctrl._viewModel.displayValue);
            });
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

               ctrl._notifyInputCompleted();

               assert.deepEqual(calls, [{
                  name: 'notify',
                  arguments: ['inputCompleted', [0, '0']]
               }]);
            });
         });
      });
   }
);
