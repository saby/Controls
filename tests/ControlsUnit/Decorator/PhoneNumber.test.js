/**
 * Created by ee.volkova1 on 14.06.2018.
 */
define(
   [
      'Controls/decorator'
   ],
   function(decorator) {

      'use strict';

      describe('Controls.Decorator.PhoneNumber', function() {
         var result;

         it('Empty number', function() {
            result = decorator.PhoneNumber._formatPhone('');
            assert.equal(result, '');
         });

         it('Only letters in number', function() {
            result = decorator.PhoneNumber._formatPhone('hhhhh');
            assert.equal(result, '');
         });

         it('City Number with 8', function() {
            result = decorator.PhoneNumber._formatPhone('84942228771');
            assert.equal(result, '8 (4942) 22-87-71');
         });

         it('City Number with +7', function() {
            result = decorator.PhoneNumber._formatPhone('+74942228772');
            assert.equal(result, '+7 (4942) 22-87-72');
         });

         it('Country Number with 8', function() {
            result = decorator.PhoneNumber._formatPhone('84943121750');
            assert.equal(result, '8 (49431) 2-17-50');
         });

         it('Country Number with +7', function() {
            result = decorator.PhoneNumber._formatPhone('+74943121751');
            assert.equal(result, '+7 (49431) 2-17-51');
         });

         it('Country Number with wrong hyphens', function() {
            result = decorator.PhoneNumber._formatPhone('+7494-3121-752');
            assert.equal(result, '+7 (49431) 2-17-52');
         });

         it('City Number with additional number', function() {
            result = decorator.PhoneNumber._formatPhone('84942228771112');
            assert.equal(result, '8 (4942) 22-87-71 доб. 112');
         });

         it('City Number with wrong hyphens, wrong round brackets and additional number', function() {
            result = decorator.PhoneNumber._formatPhone('84942-228771-(113)');
            assert.equal(result, '8 (4942) 22-87-71 доб. 113');
         });

         it('Country Number with letters', function() {
            result = decorator.PhoneNumber._formatPhone('84942ff228771');
            assert.equal(result, '8 (4942) 22-87-71');
         });

         it('Mobile number without 8 or +7', function() {
            result = decorator.PhoneNumber._formatPhone('9206469857');
            assert.equal(result, '(920)-646-98-57');
         });

         it('Mobile number with 8', function() {
            result = decorator.PhoneNumber._formatPhone('89206469857');
            assert.equal(result, '8 (920) 646-98-57');
         });

         it('Mobile number with +7', function() {
            result = decorator.PhoneNumber._formatPhone('+79206469858');
            assert.equal(result, '+7 (920) 646-98-58');
         });

         it('Foreign number with 1 symbol of code', function() {
            result = decorator.PhoneNumber._formatPhone('12555555555');
            assert.equal(result, '12555555555');
         });

         it('Foreign number with 2 symbols of code', function() {
            result = decorator.PhoneNumber._formatPhone('492555555555');
            assert.equal(result, '492555555555');
         });

         it('Foreign number with 3 symbols of code', function() {
            result = decorator.PhoneNumber._formatPhone('420055555555');
            assert.equal(result, '420055555555');
         });

         it('Little (less then 5 symbols) number without code', function() {
            result = decorator.PhoneNumber._formatPhone('8371');
            assert.equal(result, '8 (371)');
         });
      });
   }
);
