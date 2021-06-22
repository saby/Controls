define(
   [
      'Controls/decorator'
   ],
   function(decorator) {

      'use strict';

      describe('Controls.Decorator.Money', function() {
         var ctrl;
         beforeEach(function() {
            ctrl = decorator.MoneyFunctions;
         });

         describe('parseNumber', function() {
            it('value: null, useGrouping: false', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(null, false, 'none'), {
                  number: '0.00',
                  integer: '0',
                  fraction: '.00'
               });
            });
            it('value: 0.035, useGrouping: false', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(0.035, false, 'none'), {
                  number: '0.03',
                  integer: '0',
                  fraction: '.03'
               });
            });
            it('value: 0.075, useGrouping: false', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(0.075, false, 'none'), {
                  number: '0.07',
                  integer: '0',
                  fraction: '.07'
               });
            });
            it('value: 20, useGrouping: false', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(20, false, 'none'), {
                  number: '20.00',
                  integer: '20',
                  fraction: '.00'
               });
            });
            it('value: 20.1, useGrouping: false', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(20.1, false, 'none'), {
                  number: '20.10',
                  integer: '20',
                  fraction: '.10'
               });
            });
            it('value: 20.18, useGrouping: false', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(20.18, false, 'none'), {
                  number: '20.18',
                  integer: '20',
                  fraction: '.18'
               });
            });
            it('value: 20.181, useGrouping: false', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(20.181, false, 'none'), {
                  number: '20.18',
                  integer: '20',
                  fraction: '.18'
               });
            });
            it('value: Infinity, useGrouping: false', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(Infinity, false, 'none'), {
                  number: '0.00',
                  integer: '0',
                  fraction: '.00'
               });
            });
            it('value: 1000.00, useGrouping: false', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(1000.00, false, 'none'), {
                  number: '1000.00',
                  integer: '1000',
                  fraction: '.00'
               });
            });
            it('value: 1000.00, useGrouping: true', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(1000.00, true, 'none'), {
                  number: '1 000.00',
                  integer: '1 000',
                  fraction: '.00'
               });
            });
            it('value: -1000.00, useGrouping: false', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(-1000.00, false, 'none'), {
                  number: '- 1000.00',
                  integer: '- 1000',
                  fraction: '.00'
               });
            });
            it('value: -1000.00, useGrouping: true', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(-1000.00, true, 'none'), {
                  number: '- 1 000.00',
                  integer: '- 1 000',
                  fraction: '.00'
               });
            });
            it('value: 1234e20, useGrouping: true', function() {
               assert.deepEqual(ctrl.calculateFormattedNumber(1234e20, true, 'none'), {
                  number: '123 400 000 000 000 000 000 000.00',
                  integer: '123 400 000 000 000 000 000 000',
                  fraction: '.00'
               });
            });
         });
         describe('tooltip', function() {
            it('value: "0.00"', function() {
               assert.equal(ctrl.calculateTooltip({number: '0.00'}, {}), '0.00');
            });
            it('value: "0.12"', function() {
               assert.equal(ctrl.calculateTooltip({number: '0.12'}, {}), '0.12');
            });
            it('value: "0.00", tooltip: "tooltip"', function() {
               assert.equal(ctrl.calculateTooltip({number: '0.00'}, {tooltip: 'tooltip'}), 'tooltip');
            });
         });
         describe('isDisplayFractionPath', function() {
            it('Test1', function() {
               assert.isFalse(ctrl.isDisplayFractionPath('.00', false));
            });
            it('Test2', function() {
               assert.isTrue(ctrl.isDisplayFractionPath('.10', false));
            });
            it('Test3', function() {
               assert.isTrue(ctrl.isDisplayFractionPath('.00', true));
            });
            it('Test4', function() {
               assert.isTrue(ctrl.isDisplayFractionPath('.10', true));
            });
         });
      });
   }
);
