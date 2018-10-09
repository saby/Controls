define(
   [
      'Controls/Input/Number'
   ],
   function(Number) {
      'use strict';

      describe('Controls.Input.Number', function() {
         it('trimEmptyDecimals ("000" at the end of string)', function() {
            var
               res;
            Number._private.trimEmptyDecimals({
               _options: {
                  showEmptyDecimals: false
               },
               _numberViewModel: {
                  getValue: function() {
                     return '123.000';
                  },
                  getDisplayValue: function() {
                     return '123.000';
                  },
                  updateValue: function(processedVal) {
                     res = processedVal;
                  }
               }
            }, {});

            assert.equal(res, '123');
         });

         it('trimEmptyDecimals ("." at the end of string)', function() {
            var
               res;
            Number._private.trimEmptyDecimals({
               _options: {
                  showEmptyDecimals: false
               },
               _numberViewModel: {
                  getValue: function() {
                     return '123.';
                  },
                  getDisplayValue: function() {
                     return '123.';
                  },
                  updateValue: function(processedVal) {
                     res = processedVal;
                  }
               }
            }, {});

            assert.equal(res, '123');
         });

         it('trimEmptyDecimals ("456" at the end of string)', function() {
            var
               res;
            Number._private.trimEmptyDecimals({
               _options: {
                  showEmptyDecimals: false
               },
               _numberViewModel: {
                  getValue: function() {
                     return '123.456';
                  },
                  getDisplayValue: function() {
                     return '123.456';
                  },
                  updateValue: function(processedVal) {
                     res = processedVal;
                  }
               }
            }, {});

            assert.equal(res, '123.456');
         });

         it('trimEmptyDecimals (single zero, no dot)', function() {
            var
               res;
            Number._private.trimEmptyDecimals({
               _options: {
                  showEmptyDecimals: false
               },
               _numberViewModel: {
                  getValue: function() {
                     return '0';
                  },
                  getDisplayValue: function() {
                     return '0';
                  },
                  updateValue: function(processedVal) {
                     res = processedVal;
                  }
               }
            }, {});

            assert.equal(res, '0');
         });
         it('_beforeMount( value null)', function() {
            var config = {
               value: null
            };
            let num = new Number(config);
            num._beforeMount(config);
            assert.equal(num._numberViewModel.getDisplayValue(), '');
         });
      });
   }
);
