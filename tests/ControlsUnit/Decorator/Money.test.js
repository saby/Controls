define(
   [
      'Controls/decorator'
   ],
   function(decorator) {

      'use strict';

      describe('Controls.Decorator.Money', function() {
         var ctrl;
         beforeEach(function() {
            ctrl = new decorator.Money();
         });

         describe('parseNumber', function() {
            it('value: null, useGrouping: false', function() {
               ctrl._beforeMount({
                  value: null,
                  useGrouping: false,
                  abbreviationType: 'none'
               });
               assert.deepEqual(ctrl._formattedNumber, {
                  number: '0.00',
                  integer: '0',
                  fraction: '.00'
               });
            });
            it('value: 0.035, useGrouping: false', function() {
               ctrl._beforeMount({
                  value: 0.035,
                  useGrouping: false,
                  abbreviationType: 'none'
               });
               assert.deepEqual(ctrl._formattedNumber, {
                  number: '0.03',
                  integer: '0',
                  fraction: '.03'
               });
            });
            it('value: 0.075, useGrouping: false', function() {
               ctrl._beforeMount({
                  value: 0.075,
                  useGrouping: false,
                  abbreviationType: 'none'
               });
               assert.deepEqual(ctrl._formattedNumber, {
                  number: '0.07',
                  integer: '0',
                  fraction: '.07'
               });
            });
            it('value: 20, useGrouping: false', function() {
               ctrl._beforeMount({
                  value: 20,
                  useGrouping: false,
                  abbreviationType: 'none'
               });
               assert.deepEqual(ctrl._formattedNumber, {
                  number: '20.00',
                  integer: '20',
                  fraction: '.00'
               });
            });
            it('value: 20.1, useGrouping: false', function() {
               ctrl._beforeMount({
                  value: 20.1,
                  useGrouping: false,
                  abbreviationType: 'none'
               });
               assert.deepEqual(ctrl._formattedNumber, {
                  number: '20.10',
                  integer: '20',
                  fraction: '.10'
               });
            });
            it('value: 20.18, useGrouping: false', function() {
               ctrl._beforeMount({
                  value: 20.18,
                  useGrouping: false,
                  abbreviationType: 'none'
               });
               assert.deepEqual(ctrl._formattedNumber, {
                  number: '20.18',
                  integer: '20',
                  fraction: '.18'
               });
            });
            it('value: 20.181, useGrouping: false', function() {
               ctrl._beforeMount({
                  value: 20.181,
                  useGrouping: false,
                  abbreviationType: 'none'
               });
               assert.deepEqual(ctrl._formattedNumber, {
                  number: '20.18',
                  integer: '20',
                  fraction: '.18'
               });
            });
            it('value: Infinity, useGrouping: false', function() {
               ctrl._beforeMount({
                  value: Infinity,
                  useGrouping: false,
                  abbreviationType: 'none'
               });
               assert.deepEqual(ctrl._formattedNumber, {
                  number: '0.00',
                  integer: '0',
                  fraction: '.00'
               });
            });
            it('value: 1000.00, useGrouping: false', function() {
               ctrl._beforeMount({
                  value: 1000.00,
                  useGrouping: false,
                  abbreviationType: 'none'
               });
               assert.deepEqual(ctrl._formattedNumber, {
                  number: '1000.00',
                  integer: '1000',
                  fraction: '.00'
               });
            });
            it('value: 1000.00, useGrouping: true', function() {
               ctrl._beforeMount({
                  value: 1000.00,
                  useGrouping: true,
                  abbreviationType: 'none'
               });
               assert.deepEqual(ctrl._formattedNumber, {
                  number: '1 000.00',
                  integer: '1 000',
                  fraction: '.00'
               });
            });
            it('value: -1000.00, useGrouping: false', function() {
               ctrl._beforeMount({
                  value: -1000.00,
                  useGrouping: false,
                  abbreviationType: 'none'
               });
               assert.deepEqual(ctrl._formattedNumber, {
                  number: '-1000.00',
                  integer: '-1000',
                  fraction: '.00'
               });
            });
            it('value: -1000.00, useGrouping: true', function() {
               ctrl._beforeMount({
                  value: -1000.00,
                  useGrouping: true,
                  abbreviationType: 'none'
               });
               assert.deepEqual(ctrl._formattedNumber, {
                  number: '-1 000.00',
                  integer: '-1 000',
                  fraction: '.00'
               });
            });
            it('value: 1234e20, useGrouping: true', function() {
               ctrl._beforeMount({
                  value: 1234e20,
                  useGrouping: true,
                  abbreviationType: 'none'
               });
               assert.deepEqual(ctrl._formattedNumber, {
                  number: '123 400 000 000 000 000 000 000.00',
                  integer: '123 400 000 000 000 000 000 000',
                  fraction: '.00'
               });
            });
         });
         describe('tooltip', function() {
            it('value: "0.00"', function() {
               ctrl._beforeMount({
                  value: '0.00',
                  abbreviationType: 'none'
               });
               assert.equal(ctrl._tooltip, '0.00');
            });
            it('value: "0.12"', function() {
               ctrl._beforeMount({
                  precision: 2,
                  value: '0.12',
                  abbreviationType: 'none'
               });
               assert.equal(ctrl._tooltip, '0.12');
            });
            it('value: "0.00", tooltip: ""', function() {
               ctrl._beforeMount({
                  value: '0.00',
                  tooltip: '',
                  abbreviationType: 'none'
               });
               assert.equal(ctrl._tooltip, '');
            });
            it('value: "0.00", tooltip: "tooltip"', function() {
               ctrl._beforeMount({
                  value: '0.00',
                  tooltip: 'tooltip',
                  abbreviationType: 'none'
               });
               assert.equal(ctrl._tooltip, 'tooltip');
            });
         });
         describe('isDisplayFractionPath', function() {
            it('value: ".00", showEmptyDecimals: false, decimalsVisibility: "visible"', function() {
               assert.isFalse(ctrl._isDisplayFractionPath('.00', false, 'visible'));
            });
            it('value: ".10", showEmptyDecimals: false, decimalsVisibility: "visible"', function() {
               assert.isTrue(ctrl._isDisplayFractionPath('.10', false, 'visible'));
            });
            it('value: ".00", showEmptyDecimals: true, decimalsVisibility: "visible"', function() {
               assert.isTrue(ctrl._isDisplayFractionPath('.00', true, 'visible'));
            });
            it('value: ".10", showEmptyDecimals: true, decimalsVisibility: "visible"', function() {
               assert.isTrue(ctrl._isDisplayFractionPath('.10', true, 'visible'));
            });
            it('value: ".00", showEmptyDecimals: true, decimalsVisibility: "hidden"', function() {
               assert.isFalse(ctrl._isDisplayFractionPath('.00', true, 'hidden'));
            });
            it('value: ".10", showEmptyDecimals: true, decimalsVisibility: "hidden"', function() {
               assert.isFalse(ctrl._isDisplayFractionPath('.10', true, 'hidden'));
            });
            it('value: ".00", showEmptyDecimals: true, decimalsVisibility: "hiddenIfEmpty"', function() {
               assert.isFalse(ctrl._isDisplayFractionPath('.00', true, 'hiddenIfEmpty'));
            });
            it('value: ".10", showEmptyDecimals: true, decimalsVisibility: "hiddenIfEmpty"', function() {
               assert.isTrue(ctrl._isDisplayFractionPath('.10', true, 'hiddenIfEmpty'));
            });
            it('value: ".00", showEmptyDecimals: false, decimalsVisibility: "hidden"', function() {
               assert.isFalse(ctrl._isDisplayFractionPath('.00', false, 'hidden'));
            });
            it('value: ".10", showEmptyDecimals: false, decimalsVisibility: "hidden"', function() {
               assert.isTrue(ctrl._isDisplayFractionPath('.10', false, 'hidden'));
            });
            it('value: ".00", showEmptyDecimals: false, decimalsVisibility: "hiddenIfEmpty"', function() {
               assert.isFalse(ctrl._isDisplayFractionPath('.00', false, 'hiddenIfEmpty'));
            });
            it('value: ".10", showEmptyDecimals: false, decimalsVisibility: "hiddenIfEmpty"', function() {
               assert.isTrue(ctrl._isDisplayFractionPath('.10', false, 'hiddenIfEmpty'));
            });
         });
      });
   }
);
