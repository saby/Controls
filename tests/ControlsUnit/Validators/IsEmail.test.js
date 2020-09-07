define(
   [
      'Controls/validate'
   ],
   function (validate) {

      'use strict';

      var
         validEmails = [
            'email@example.com',
            'firstname.lastname@example.com',
            'email@subdomain.example.com',
            'firstname+lastname@example.com',
            '1234567890@example.com',
            'email@example-one.com',
            '_______@example.com',
            'email@example.name',
            'email@example.museum',
            'email@example.svnsmbl',
            'email@example.co.jp',
            'firstname-lastname@example.com',
            'тест@тест.рф',
            'тест@тест.йцу.рф',
            '',
            'NotCaseSensitive@test.com',
            'info@почта.рф',
            'e.lebedeva@sapiens.solutions',
            'petrov@certo.technology',
            'email@example@example.com',
            '.email@example.com',
            'email.@example.com',
            'email..email@example.com',
            'あいうえお@example.com',
            'email@example.com (Joe Smith)',
            'email@111.222.333.44444',
            'email@example..com',
            'Abc..123@example.com',
            'тест@example.com',
            'example@тест.com',
            'uuuu@uд.ru',
            'email@example.toomanysymbols',
            'Joe Smith <email@example.com>',
            '#@%^%#$@#$@#.com'
         ],
         invalidEmails = [
            'plainaddress',
            '@example.com',
            'email@example',
            'email.example.com'
         ];

      describe('Controls.Validators', function () {
         describe('IsEmail', function () {
            validEmails.forEach(function(item) {
               it('Valid "' + item + '"', function () {
                  assert.equal(validate.isEmail({
                     value: item
                  }), true);
               });
            });
            invalidEmails.forEach(function(item) {
               it('Invalid "' + item + '"', function () {
                  assert.notEqual(validate.isEmail({
                     value: item
                  }), true);
               });
            });
         });
      });
   }
);
