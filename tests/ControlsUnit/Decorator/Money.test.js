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
                  useGrouping: false
               });
               assert.deepEqual(ctrl._parsedNumber, {
                  number: '0.00',
                  integer: '0',
                  fraction: '.00'
               });
            });
            it('value: 0.035, useGrouping: false', function() {
               ctrl._beforeMount({
                  value: 0.035,
                  useGrouping: false
               });
               assert.deepEqual(ctrl._parsedNumber, {
                  number: '0.03',
                  integer: '0',
                  fraction: '.03'
               });
            });
            it('value: 0.075, useGrouping: false', function() {
               ctrl._beforeMount({
                  value: 0.075,
                  useGrouping: false
               });
               assert.deepEqual(ctrl._parsedNumber, {
                  number: '0.07',
                  integer: '0',
                  fraction: '.07'
               });
            });
            it('value: 20, useGrouping: false', function() {
               ctrl._beforeMount({
                  value: 20,
                  useGrouping: false
               });
               assert.deepEqual(ctrl._parsedNumber, {
                  number: '20.00',
                  integer: '20',
                  fraction: '.00'
               });
            });
            it('value: 20.1, useGrouping: false', function() {
               ctrl._beforeMount({
                  value: 20.1,
                  useGrouping: false
               });
               assert.deepEqual(ctrl._parsedNumber, {
                  number: '20.10',
                  integer: '20',
                  fraction: '.10'
               });
            });
            it('value: 20.18, useGrouping: false', function() {
               ctrl._beforeMount({
                  value: 20.18,
                  useGrouping: false
               });
               assert.deepEqual(ctrl._parsedNumber, {
                  number: '20.18',
                  integer: '20',
                  fraction: '.18'
               });
            });
            it('value: 20.181, useGrouping: false', function() {
               ctrl._beforeMount({
                  value: 20.181,
                  useGrouping: false
               });
               assert.deepEqual(ctrl._parsedNumber, {
                  number: '20.18',
                  integer: '20',
                  fraction: '.18'
               });
            });
            it('value: Infinity, useGrouping: false', function() {
               ctrl._beforeMount({
                  value: Infinity,
                  useGrouping: false
               });
               assert.deepEqual(ctrl._parsedNumber, {
                  number: '0.00',
                  integer: '0',
                  fraction: '.00'
               });
            });
            it('value: 1000.00, useGrouping: false', function() {
               ctrl._beforeMount({
                  value: 1000.00,
                  useGrouping: false
               });
               assert.deepEqual(ctrl._parsedNumber, {
                  number: '1000.00',
                  integer: '1000',
                  fraction: '.00'
               });
            });
            it('value: 1000.00, useGrouping: true', function() {
               ctrl._beforeMount({
                  value: 1000.00,
                  useGrouping: true
               });
               assert.deepEqual(ctrl._parsedNumber, {
                  number: '1 000.00',
                  integer: '1 000',
                  fraction: '.00'
               });
            });
            it('value: -1000.00, useGrouping: false', function() {
               ctrl._beforeMount({
                  value: -1000.00,
                  useGrouping: false
               });
               assert.deepEqual(ctrl._parsedNumber, {
                  number: '-1000.00',
                  integer: '-1000',
                  fraction: '.00'
               });
            });
            it('value: -1000.00, useGrouping: true', function() {
               ctrl._beforeMount({
                  value: -1000.00,
                  useGrouping: true
               });
               assert.deepEqual(ctrl._parsedNumber, {
                  number: '-1 000.00',
                  integer: '-1 000',
                  fraction: '.00'
               });
            });
            it('value: 1234e20, useGrouping: true', function() {
               ctrl._beforeMount({
                  value: 1234e20,
                  useGrouping: true
               });
               assert.deepEqual(ctrl._parsedNumber, {
                  number: '123 400 000 000 000 000 000 000.00',
                  integer: '123 400 000 000 000 000 000 000',
                  fraction: '.00'
               });
            });
         });
         describe('tooltip', function() {
            it('value: "0.00"', function() {
               ctrl._beforeMount({
                  value: '0.00'
               });
               assert.equal(ctrl._tooltip, '0');
            });
            it('value: "0.12"', function() {
               ctrl._beforeMount({
                  value: '0.12'
               });
               assert.equal(ctrl._tooltip, '0.12');
            });
            it('value: "0.00", tooltip: ""', function() {
               ctrl._beforeMount({
                  value: '0.00',
                  tooltip: ''
               });
               assert.equal(ctrl._tooltip, '');
            });
            it('value: "0.00", tooltip: "tooltip"', function() {
               ctrl._beforeMount({
                  value: '0.00',
                  tooltip: 'tooltip'
               });
               assert.equal(ctrl._tooltip, 'tooltip');
            });
         });
         describe('isDisplayFractionPath', function() {
            it('Test1', function() {
               assert.isFalse(ctrl._isDisplayFractionPath('.00', false));
            });
            it('Test2', function() {
               assert.isTrue(ctrl._isDisplayFractionPath('.10', false));
            });
            it('Test3', function() {
               assert.isTrue(ctrl._isDisplayFractionPath('.00', true));
            });
            it('Test4', function() {
               assert.isTrue(ctrl._isDisplayFractionPath('.10', true));
            });
         });
      });
   }
);
