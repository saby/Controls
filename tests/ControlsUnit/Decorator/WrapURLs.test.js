define(
   [
      'Controls/decorator',
      'ControlsUnit/resources/TemplateUtil'
   ],
   function(decorator, TemplateUtil) {
      'use strict';

      describe('Controls.Decorator.WrapURLs', function() {
         var result;

         describe('Template', function() {
            var template = TemplateUtil.clearTemplate(new decorator.WrapURLs({})._template);

            it('Text', function() {
               var parsedText = [{
                  type: 'plain',
                  value: 'test...'
               }];

               assert.equal(template({
                  _parsedText: parsedText
               }), '<div class="controls-DecoratorWrapURLs">test...</div>');
            });
         });

         describe('parseText', function() {
            var ctrl;
            beforeEach(function() {
               ctrl = new decorator.WrapURLs({});
            });

            it('Simple URL', function() {
               ctrl._beforeMount({
                  value: 'http://regexpal.com/'
               });
               assert.deepEqual(ctrl._parsedText, [{
                  type: 'link',
                  href: 'http://regexpal.com/',
                  scheme: 'http://'
               }]);
            });
            it('Simple URL with whitespaces', function() {
               ctrl._beforeMount({
                  value: '  http://regexpal.com/    '
               });
               assert.deepEqual(ctrl._parsedText, [
                  {
                     type: 'plain',
                     value: '  '
                  },
                  {
                     type: 'link',
                     href: 'http://regexpal.com/',
                     scheme: 'http://'
                  },
                  {
                     type: 'plain',
                     value: '    '
                  }
               ]);
            });
            it('Simple URL with params', function() {
               ctrl._beforeMount({
                  value: 'http://regexpal.com/home.php?request=q&theme=2'
               });
               assert.deepEqual(ctrl._parsedText, [{
                  type: 'link',
                  href: 'http://regexpal.com/home.php?request=q&theme=2',
                  scheme: 'http://'
               }]);
            });
            it('Ru link', function() {
               ctrl._beforeMount({
                  value: 'http://почта.рф/'
               });
               assert.deepEqual(ctrl._parsedText, [{
                  type: 'link',
                  href: 'http://почта.рф/',
                  scheme: 'http://'
               }]);
            });
            it('Link with port', function() {
               ctrl._beforeMount({
                  value: 'http://ya.ru:80'
               });
               assert.deepEqual(ctrl._parsedText, [{
                  type: 'link',
                  href: 'http://ya.ru:80',
                  scheme: 'http://'
               }]);
            });
            it('Link inside text', function() {
               ctrl._beforeMount({
                  value: 'find here: http://ya.ru/, please'
               });
               assert.deepEqual(ctrl._parsedText, [
                  {
                     type: 'plain',
                     value: 'find here: '
                  },
                  {
                     type: 'link',
                     href: 'http://ya.ru/',
                     scheme: 'http://'
                  },
                  {
                     type: 'plain',
                     value: ', please'
                  }
               ]);
            });
            it('Symbol \' inside link', function() {
               ctrl._beforeMount({
                  value: 'https://wiki.postgresql.org/wiki/What\'s_new_in_PostgreSQL_9.5'
               });
               assert.deepEqual(ctrl._parsedText, [{
                  type: 'link',
                  href: 'https://wiki.postgresql.org/wiki/What\'s_new_in_PostgreSQL_9.5',
                  scheme: 'https://'
               }]);
            });
            it('Link with anchor', function() {
               ctrl._beforeMount({
                  value: 'http://axure.tensor.ru/ereport/#p=реестр_по_приложению_№4'
               });
               assert.deepEqual(ctrl._parsedText, [{
                  type: 'link',
                  href: 'http://axure.tensor.ru/ereport/#p=реестр_по_приложению_№4',
                  scheme: 'http://'
               }]);
            });
            it('Link ends dot', function() {
               ctrl._beforeMount({
                  value: 'http://regexpal.com/home.php?request=q&theme=2.'
               });
               assert.deepEqual(ctrl._parsedText, [
                  {
                     type: 'link',
                     href: 'http://regexpal.com/home.php?request=q&theme=2',
                     scheme: 'http://'
                  },
                  {
                     type: 'plain',
                     value: '.'
                  }
               ]);
            });
            it('Simple mail', function() {
               ctrl._beforeMount({
                  value: 'e@mail.ru'
               });
               assert.deepEqual(ctrl._parsedText, [{
                  type: 'email',
                  address: 'e@mail.ru'
               }]);
            });
            it('Mail with seperators', function() {
               ctrl._beforeMount({
                  value: 'my-e.ma@il.ru'
               });
               assert.deepEqual(ctrl._parsedText, [{
                  type: 'email',
                  address: 'my-e.ma@il.ru'
               }]);
            });
            it('Ru mail', function() {
               ctrl._beforeMount({
                  value: 'почтальон@почта.рф'
               });
               assert.deepEqual(ctrl._parsedText, [{
                  type: 'email',
                  address: 'почтальон@почта.рф'
               }]);
            });
            it('Colon mail', function() {
               ctrl._beforeMount({
                  value: 'git@git.sbis.ru:'
               });
               assert.deepEqual(ctrl._parsedText, [
                  {
                     type: 'email',
                     address: 'git@git.sbis.ru'
                  },
                  {
                     type: 'plain',
                     value: ':'
                  }]);
            });
            it('After colon mail', function() {
               ctrl._beforeMount({
                  value: 'git@git.sbis.ru: abc'
               });
               assert.deepEqual(ctrl._parsedText, [
                  {
                     type: 'email',
                     address: 'git@git.sbis.ru'
                  },
                  {
                     type: 'plain',
                     value: ': abc'
                  }
               ]);
            });
            it('Top level domailn mail', function() {
               ctrl._beforeMount({
                  value: 'email@topleveldomain'
               });
               assert.deepEqual(ctrl._parsedText, [{
                  type: 'plain',
                  value: 'email@topleveldomain'
               }]);
            });
            it('www', function() {
               ctrl._beforeMount({
                  value: 'www.yandex.ru text after'
               });
               assert.deepEqual(ctrl._parsedText, [
                  {
                     type: 'link',
                     href: 'www.yandex.ru',
                     scheme: 'www.'
                  },
                  {
                     type: 'plain',
                     value: ' text after'
                  }
               ]);
            });
            it('Space after protocol before www', function() {
               ctrl._beforeMount({
                  value: 'https:// www.youtube.com/watch?v=_avffmEHKf8'
               });
               assert.deepEqual(ctrl._parsedText, [
                  {
                     type: 'plain',
                     value: 'https:// '
                  },
                  {
                     type: 'link',
                     href: 'www.youtube.com/watch?v=_avffmEHKf8',
                     scheme: 'www.'
                  }
               ]);
            });
            it('www without dot', function() {
               ctrl._beforeMount({
                  value: 'wwwanytext'
               });
               assert.deepEqual(ctrl._parsedText, [{
                  type: 'plain',
                  value: 'wwwanytext'
               }]);
            });
            it('Star url', function() {
               ctrl._beforeMount({
                  value: 'http://www.123assess.com/te/tbm/servlet?aid=gTXJuESfVsj7qTRkHepNsA**&mid=Olnl6KgvpofmSElvN69BeA**'
               });
               assert.deepEqual(ctrl._parsedText, [{
                  type: 'link',
                  href: 'http://www.123assess.com/te/tbm/servlet?aid=gTXJuESfVsj7qTRkHepNsA**&mid=Olnl6KgvpofmSElvN69BeA**',
                  scheme: 'http://'
               }]);
            });
            it('Url in double delimiters', function() {
               ctrl._beforeMount({
                  value: '(https://pre-test-online.sbis.ru/auth/?ret=%2F)'
               });
               assert.deepEqual(ctrl._parsedText, [
                  {
                     type: 'plain',
                     value: '('
                  },
                  {
                     type: 'link',
                     href: 'https://pre-test-online.sbis.ru/auth/?ret=%2F',
                     scheme: 'https://'
                  },
                  {
                     type: 'plain',
                     value: ')'
                  }
               ]);
            });
            it('Url in double delimiters in the middle of the text', function() {
               ctrl._beforeMount({
                  value: 'test test (https://pre-test-online.sbis.ru/auth/?ret=%2F) test test'
               });
               assert.deepEqual(ctrl._parsedText, [
                  {
                     type: 'plain',
                     value: 'test test ('
                  },
                  {
                     type: 'link',
                     href: 'https://pre-test-online.sbis.ru/auth/?ret=%2F',
                     scheme: 'https://'
                  },
                  {
                     type: 'plain',
                     value: ') test test'
                  }
               ]);
            });
         });
      });
   }
);
