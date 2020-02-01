/**
 * Created by rn.kondakov on 24.10.2018.
 */
define([
   'Controls/decorator',
   'Controls/_decorator/Markup/resources/template',
   'Controls/_decorator/Markup/resources/linkDecorateUtils',
   'Controls/Application',
   'UI/Base',
   'Env/Env'
], function(
   decorator,
   template,
   linkDecorateUtils,
   Application,
   Base,
   Env
) {
   'use strict';

   var global = (function() { return this || (0,eval)('this') })();

   // В окружении юнит тестирования на сервере нет объекта contents, а для теста headJson там должен быть Controls.
   if (!global.contents) {
      global.contents = {
         modules: {
            Controls: {}
         }
      };
   }

   var simpleNode = ['span', 'text'],
      deepNode = ['span',
         {
            'style': 'text-decoration: line-through;',
            'data-mce-style': 'text-decoration: line-through;'
         },
         'text',
         ['strong',
            'text',
            ['em',
               'text',
               ['span',
                  {
                     'style': 'text-decoration: underline;',
                     'data-mce-style': 'text-decoration: underline;'
                  },
                  'text'
               ],
               'text'
            ],
            'text'],
         'text'
      ],
      decoratedLinkFirstChildNode = ['a',
         {
            'href': 'https://ya.ru',
            'target': '_blank',
            'class': 'LinkDecorator__linkWrap',
            'rel': 'noreferrer noopener'
         },
         ['img',
            {
               'class': 'LinkDecorator__image',
               'alt': 'https://ya.ru',
               'src': (typeof location === 'object' ? location.protocol + '//' + location.host : '') + '/test/?method=LinkDecorator.DecorateAsSvg&params=eyJTb3VyY2VMaW5rIjoiaHR0cHM6Ly95YS5ydSJ9&id=0&srv=1'
            }
         ]
      ],
      attributedNode = ['span', { 'class': 'someClass' }, 'text'],
      linkNode = ['a',
         {
            'class': 'asLink',
            rel: 'noreferrer noopener',
            href: 'https://ya.ru',
            target: '_blank'
         },
         'https://ya.ru'
      ],
      httpLinkNode = ['a',
         {
            'class': 'asLink',
            rel: 'noreferrer noopener',
            href: 'http://ya.ru',
            target: '_blank'
         },
         'http://ya.ru'
      ],
      wwwLinkNode = ['a',
         {
            'class': 'asLink',
            rel: 'noreferrer noopener',
            href: 'http://www.ya.ru',
            target: '_blank'
         },
         'www.ya.ru'
      ],
      ftpLinkNode = ['a',
         {
            'class': 'asLink',
            rel: 'noreferrer noopener',
            href: 'ftp://ya.ru',
            target: '_blank'
         },
         'ftp://ya.ru'
      ],
      fileLinkNode = ['a',
         {
            'class': 'asLink',
            rel: 'noreferrer noopener',
            href: 'file://ya.ru',
            target: '_blank'
         },
         'file://ya.ru'
      ],
      smbLinkNode = ['a',
         {
            'class': 'asLink',
            rel: 'noreferrer noopener',
            href: 'smb://ya.ru',
            target: '_blank'
         },
         'smb://ya.ru'
      ],
      decoratedLinkService,
      currentVersion = '2',
      nbsp = String.fromCharCode(160),
      openTagRegExp = /(<[^/][^ >]* )([^>]*")(( \/)?>)/g,
      deepHtml = '<span style="text-decoration: line-through;" data-mce-style="text-decoration: line-through;">text<strong>text<em>text<span style="text-decoration: underline;" data-mce-style="text-decoration: underline;">text</span>text</em>text</strong>text</span>',
      linkHtml = '<a class="asLink" rel="noreferrer noopener" href="https://ya.ru" target="_blank">https://ya.ru</a>',
      decoratedLinkHtml = '<span class="LinkDecorator__wrap"><a class="LinkDecorator__linkWrap" rel="noreferrer noopener" href="https://ya.ru" target="_blank"><img class="LinkDecorator__image" alt="https://ya.ru" src="' + (typeof location === 'object' ? location.protocol + '//' + location.host : '') + '/test/?method=LinkDecorator.DecorateAsSvg&amp;params=eyJTb3VyY2VMaW5rIjoiaHR0cHM6Ly95YS5ydSJ9&amp;id=0&amp;srv=1" /></a></span>';

      function sortAttrs(html) {
         return html.replace(openTagRegExp, function(match, begin, attrs, end) {
            return begin + (attrs + ' ').split('" ').sort().join('" ') + end;
         });
      }

      function equalsHtml(html1, html2, message) {
         assert.equal(sortAttrs(html1), sortAttrs(html2), message);
      }

   describe('Controls.Decorator.Markup.Converter', function() {
      var fromNode = typeof document === 'undefined';
      var oldWindow;
      var oldDocument;
      var oldNode;
      before(function() {
         if (fromNode) {
            return new Promise(function (resolve) {
               require(['jsdom'], function (jsdom) {
                  oldDocument = global.document;
                  oldWindow = global.window;
                  oldNode = global.Node;
                  var browser = new jsdom.JSDOM('', {pretendToBeVisual: true});
                  global.window = browser.window;
                  global.document = window.document;
                  global.Node = window.Node;
                  resolve();
               });
            });
         }
      });

      after(function() {
         if (fromNode) {
            global.window = oldWindow;
            global.document = oldDocument;
            global.Node = oldNode;
         }
      });

      describe('deepCopyJson', function() {
         it('one big', function() {
            var json = [['p', 'text'], ['p', deepNode], ['p', attributedNode], ['p', linkNode], ['p', simpleNode]];
            var newJson = decorator.Converter.deepCopyJson(json);
            assert.notEqual(newJson, json);
            assert.deepEqual(newJson, json);
         });
      });

      describe('htmlToJson', function() {

         it('no first tag', function() {
            var html = 'some text without tag <span>and some text in tag</span> dot';
            var json = [[], 'some text without tag ', ['span', 'and some text in tag'], ' dot'];
            assert.deepEqual(decorator.Converter.htmlToJson(html), json);
         });
         it('only text no trim', function() {
            var html = '   some text without tag\t';
            var json = [[], '   some text without tag\t'];
            assert.deepEqual(decorator.Converter.htmlToJson(html), json);
         });
         it('basic', function() {
            var html = '<p>text&amp;</p><p>' + deepHtml + '</p><p><span class="someClass">text</span></p><p>' + linkHtml + '</p><p><span>text</span></p>';
            var json = [['p', { version: currentVersion }, 'text&'], ['p', deepNode], ['p', attributedNode], ['p', linkNode], ['p', simpleNode]];
            assert.deepEqual(decorator.Converter.htmlToJson(html), json);
         });
         it('version', function() {
            assert.deepEqual(decorator.Converter.htmlToJson('<p>No attributes</p>'), [
               ['p',
                  { version: currentVersion },
                  'No attributes'
               ]
            ]);
            assert.deepEqual(decorator.Converter.htmlToJson('<p style="text-align: center;">With attributes</p>'), [
               ['p',
                  { version: currentVersion, style: 'text-align: center;' },
                  'With attributes'
               ]
            ]);
            assert.deepEqual(decorator.Converter.htmlToJson(''), []);
            assert.deepEqual(decorator.Converter.htmlToJson('just a string'), [[], 'just a string']);
         });
         it('trim', function() {
            var html = '\n  \n<p>text&amp;</p><p>' + deepHtml + '</p><p><span class="someClass">text</span></p><p>' + linkHtml + '</p><p><span>text</span></p>  \n\n\n';
            var json = [['p', { version: currentVersion }, 'text&'], ['p', deepNode], ['p', attributedNode], ['p', linkNode], ['p', simpleNode]];
            assert.deepEqual(decorator.Converter.htmlToJson(html), json);
            assert.deepEqual(decorator.Converter.htmlToJson('   \n    \n   '), []);
         });

         it('undecorate link', function() {
            var html = '<p>' + decoratedLinkHtml + '</p>';
            var json = [['p', { version: currentVersion }, linkNode]];
            assert.deepEqual(decorator.Converter.htmlToJson(html), json);
         });

         it('long html', function() {
            var text = 'a'.repeat(2000);
            assert.deepEqual(decorator.Converter.htmlToJson('<p>' + text + '</p>'), [['p', { version: currentVersion }, text]]);
         }).timeout(1000);
      });

      describe('jsonToHtml', function() {
         var ILogger;
         var errorFunction;
         var errorArray;
         before(function() {
            ILogger = Env.IoC.resolve('ILogger');
            errorFunction = ILogger.error;
            ILogger.error = function() {
               errorArray.push(arguments);
            };
            errorArray = [];
         });
         after(function() {
            Env.IoC.resolve('ILogger').error = errorFunction;
         });
         beforeEach(function() {
            decoratedLinkService = Env.constants.decoratedLinkService;
            Env.constants.decoratedLinkService = '/test/';
         });
         afterEach(function() {
            Env.constants.decoratedLinkService = decoratedLinkService;
            while (errorArray.length) {
               errorFunction.apply(ILogger, errorArray.shift());
            }
         });
         it('empty', function() {
            equalsHtml(decorator.Converter.jsonToHtml([]), '');
            equalsHtml(decorator.Converter.jsonToHtml(), '');
            equalsHtml(decorator.Converter.jsonToHtml([[], 'some text']), '<div>some text</div>');
         });
         it('only text', function() {
            // TODO: remove case in https://online.sbis.ru/opendoc.html?guid=a8a904f8-6c0d-4754-9e02-d53da7d32c99.
            assert.equal(decorator.Converter.jsonToHtml(['']), '<div><p></p></div>');
            assert.equal(decorator.Converter.jsonToHtml(['some text']), '<div><p>some text</p></div>');
            assert.equal(decorator.Converter.jsonToHtml(['some\ntext']), '<div><p>some</p><p>\ntext</p></div>');
            assert.equal(decorator.Converter.jsonToHtml(['p', 'some text']), '<div><p>some text</p></div>');
         });
         it('escape', function() {
            var json = ['p', { title: '"&lt;<>' }, '&gt;&lt;><&#39;'];
            var vdomTemplate = template({ _options: { 'value': json } }, {}, undefined, true);
            equalsHtml(decorator.Converter.jsonToHtml(json), '<div><p title="&quot;&amp;lt;&lt;&gt;">&amp;gt;&amp;lt;&gt;&lt;&amp;#39;</p></div>');
            assert.equal(vdomTemplate[0].children[0].children[0].children, '&amp;gt;&amp;lt;><&amp;#39;');
            assert.equal(vdomTemplate[0].children[0].hprops.attributes.title, '"&amp;lt;<>');
         });
         it('one big', function() {
            var json = [['p', 'text&amp;'], ['p', deepNode], ['p', attributedNode], ['p', linkNode], ['p', simpleNode]];
            var html = '<div><p>text&amp;amp;</p><p>' + deepHtml + '</p><p><span class="someClass">text</span></p><p>' + linkHtml + '</p><p><span>text</span></p></div>';
            equalsHtml(decorator.Converter.jsonToHtml(json), html);
         });
         it('no XSS', function() {
            var
               json = [
                  ['p',
                     ['script', 'alert(123);']
                  ],
                  ['p',
                     { onclick: 'alert(123)' },
                     'click me'
                  ],
                  ['p',
                     ['iframe', { name: 'javascript:alert(123)', src: 'javascript:alert(123)' }]
                  ],
                  ['p',
                     ['a', { name: 'javascript:alert(123)', href: 'javascript:alert(123)' }, 'xss']
                  ],
                  ['p',
                     ['a', { href: '  javascript:alert(123)  ' }, 'leading spaces']
                  ],
                  ['p',
                     ['a', { href: 'jAvAsCrIpT:alert(123)' }, 'upper and lower case']
                  ],
                  ['p',
                     ['iframe', { src: 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==' }, 'base64 alert']
                  ],
               ],
               goodHtml = '<div>' +
                  '<p></p>' +
                  '<p>click me</p>' +
                  '<p><iframe name="javascript:alert(123)"></iframe></p>' +
                  '<p><a name="javascript:alert(123)">xss</a></p>' +
                  '<p><a>leading spaces</a></p>' +
                  '<p><a>upper and lower case</a></p>' +
                  '<p><iframe>base64 alert</iframe></p>' +
                  '</div>',
               checkHtml = decorator.Converter.jsonToHtml(json);
            equalsHtml(checkHtml, goodHtml);
         });

         it('not string attribute', function() {
            var json = [
               ['p',
                  {
                     'class': true
                  },
                  'some test'
               ]
            ];
            var goodHtml = '<div><p>some test</p></div>';
            var goodError = 'Ошибка разбора JsonML: Невалидное значение атрибута class, ожидается строковое значение. Ошибочный узел: {"class":true}';
            var checkHtml = decorator.Converter.jsonToHtml(json);
            var checkError = errorArray.shift()[1];
            equalsHtml(goodHtml, checkHtml);
            assert.ok(checkError.indexOf(goodError) !== -1);
         });

         it('invalid JsonML', function() {
            var json = [
               ['p',
                  {
                     'class': 'myClass'
                  },
                  {
                     'text': 'some text'
                  }
               ]
            ];
            var goodHtml = '<div><p class="myClass"></p></div>';
            var goodError = 'Ошибка разбора JsonML: Узел в JsonML должен быть строкой или массивом. Ошибочный узел: {"text":"some text"}';
            var checkHtml = decorator.Converter.jsonToHtml(json);
            var checkError = errorArray.shift()[1];
            equalsHtml(goodHtml, checkHtml);
            assert.ok(checkError.indexOf(goodError) !== -1);
         });

         it('link to id on current page', function () {
            var json = [
               ['a',
                  {
                     href: '#someId'
                  },
                  'goto'
               ]
            ];
            var goodHtml = '<div><a href="#someId">goto</a></div>';
            var checkHtml = decorator.Converter.jsonToHtml(json);
            assert.equal(goodHtml, checkHtml);
         });

         it('all valid tags and attributes', function() {
            var json = [
               ['p',
                  ['html',
                     ['head',
                        ['title', 'Test title'],
                        ['meta', { charset: 'utf-8' }],
                        ['script', 'alert("Test script");'],
                        ['style', '.testStyle { color: red; }'],
                        ['link', { rel: 'stylesheet', type: 'text/css', href: '/resources/WS.Core/css/core-min.css' }]
                     ],
                     ['body',
                        ['div', 'Test division'],
                        ['code', 'Test code'],
                        ['p', 'Test paragraph'],
                        ['span', 'Test span'],
                        ['img', { alt: 'Test image', src: '/test.gif', onclick: 'alert("Test")' }],
                        ['br'],
                        ['hamlet', 'Not to be: that is the answer'],
                        ['a', { rel: 'noreferrer noopener', target: '_blank' }, 'Test link'],
                        ['pre', 'Test pretty print'],
                        ['label', 'Test label'],
                        ['font', { color: 'red', face: 'verdana', size: '5' }, 'Test font'],
                        ['blockquote', { cite: 'http://www.worldwildlife.org/who/index.html' }, ['div', 'Test block quote']],
                        ['p', ['b', 'T'], ['strong', 'e'], ['i', 's'], ['em', 't'], ['u', ' '], ['s', 's'], ['strike', 't'], ['q', 'yles']],
                        ['p', ['h0', 'No!'], ['h1', 'head'], ['h2', 'head'], ['h3', 'head'], ['h4', 'head'], ['h5', 'head'], ['h6', 'head'], ['h7', 'No!']],
                        ['input', { id: 'testInput', type: 'text', value: 'Test input' }],
                        ['dl', ['dt', 'Test description list'], ['dd', 'Yes'], ['dt', 'Test filthy language'], ['dd', 'No']],
                        ['dir', ['li', 'Test'], ['li', 'directed'], ['li', 'titles']],
                        ['ol', ['li', 'Test'], ['li', 'ordered'], ['li', 'list']],
                        ['ul', ['li', 'Test'], ['li', 'unordered'], ['li', 'list']],
                        ['table',
                           ['caption', 'Test table'],
                           ['colgroup', ['col', { style: 'background-color: yellow;' }], ['col', { style: 'background-color: red;' }]],
                           ['thead', ['tr', ['th', 'Test'], ['th', 'head']]],
                           ['tbody', ['tr', ['td', 'Test'], ['td', 'body']]],
                           ['tfoot', ['tr', ['td', 'Test'], ['td', 'foot']]]
                        ]
                     ]
                  ]
               ],
               ['p',
                  {
                     alt: 'testAlt',
                     'class': 'testClass',
                     colspan: 'testColspan',
                     config: 'testConfig',
                     'data-vdomignore': 'true',
                     'data-random-ovdmxzme': 'testDataTwo',
                     'data-some-id': 'testDataThree',
                     hasmarkup: 'testHasmarkup',
                     height: 'testHeight',
                     href: 'http://www.testHref.com',
                     id: 'testId',
                     name: 'testName',
                     rel: 'testRel',
                     rowspan: 'testRowspan',
                     src: './testSrc',
                     style: 'testStyle',
                     tabindex: 'testTabindex',
                     target: 'testTarget',
                     title: 'testTitle',
                     width: 'testWidth'
                  },
                  'All valid attributes'
               ]
            ];
            var html = '<div>' +
               '<p>' +
               '<html>' +
               '<head></head>' +
               '<body>' +
               '<div>Test division</div>' +
               '<code>Test code</code>' +
               '<p>Test paragraph</p>' +
               '<span>Test span</span>' +
               '<img alt="Test image" src="/test.gif" />' +
               '<br />' +
               '<a rel="noreferrer noopener" target="_blank">Test link</a>' +
               '<pre>Test pretty print</pre>' +
               '<label>Test label</label>' +
               '<font>Test font</font>' +
               '<blockquote><div>Test block quote</div></blockquote>' +
               '<p><b>T</b><strong>e</strong><i>s</i><em>t</em><u> </u><s>s</s><strike>t</strike><q>yles</q></p>' +
               '<p><h1>head</h1><h2>head</h2><h3>head</h3><h4>head</h4><h5>head</h5><h6>head</h6></p>' +
               '<input id="testInput" />' +
               '<dl><dt>Test description list</dt><dd>Yes</dd><dt>Test filthy language</dt><dd>No</dd></dl>' +
               '<dir><li>Test</li><li>directed</li><li>titles</li></dir>' +
               '<ol><li>Test</li><li>ordered</li><li>list</li></ol>' +
               '<ul><li>Test</li><li>unordered</li><li>list</li></ul>' +
               '<table>' +
               '<caption>Test table</caption>' +
               '<colgroup><col style="background-color: yellow;" /><col style="background-color: red;" /></colgroup>' +
               '<thead><tr><th>Test</th><th>head</th></tr></thead>' +
               '<tbody><tr><td>Test</td><td>body</td></tr></tbody>' +
               '<tfoot><tr><td>Test</td><td>foot</td></tr></tfoot>' +
               '</table>' +
               '</body>' +
               '</html>' +
               '</p>' +
               '<p alt="testAlt" class="testClass" colspan="testColspan" config="testConfig" data-vdomignore="true" data-random-ovdmxzme="testDataTwo" data-some-id="testDataThree" hasmarkup="testHasmarkup" height="testHeight" href="http://www.testHref.com" id="testId" name="testName" rel="testRel" rowspan="testRowspan" src="./testSrc" style="testStyle" tabindex="testTabindex" target="testTarget" title="testTitle" width="testWidth">All valid attributes</p>' +
               '</div>';
            equalsHtml(decorator.Converter.jsonToHtml(json), html);
         });

         it('valid href - 1', function() {
            var
               json = [
                  ['a', { 'href': 'https://www.google.com/' }]
               ],
               checkHtml = decorator.Converter.jsonToHtml(json),
               goodHtml = '<div><a href="https://www.google.com/"></a></div>';
            equalsHtml(checkHtml, goodHtml);
         });

         it('valid href - 2', function() {
            var
               json = [
                  ['a', { 'href': 'hTtPs://www.google.com/' }]
               ],
               checkHtml = decorator.Converter.jsonToHtml(json),
               goodHtml = '<div><a href="hTtPs://www.google.com/"></a></div>';
            equalsHtml(checkHtml, goodHtml);
         });

         it('valid href - 3', function() {
            var
               json = [
                  ['a', { 'href': '/resources/some.html' }]
               ],
               checkHtml = decorator.Converter.jsonToHtml(json),
               goodHtml = '<div><a href="/resources/some.html"></a></div>';
            equalsHtml(checkHtml, goodHtml);
         });

         it('valid href - 4', function() {
            var
               json = [
                  ['a', { 'href': './resources/some.html' }]
               ],
               checkHtml = decorator.Converter.jsonToHtml(json),
               goodHtml = '<div><a href="./resources/some.html"></a></div>';
            equalsHtml(checkHtml, goodHtml);
         });

         it('invalid href - 1', function() {
            var
               json = [
                  ['a', { 'href': 'www.google.com' }]
               ],
               checkHtml = decorator.Converter.jsonToHtml(json),
               goodHtml = '<div><a></a></div>';
            equalsHtml(checkHtml, goodHtml);
         });

         it('invalid href - 2', function() {
            var
               json = [
                  ['a', { 'href': 'javascript:alert(123)' }]
               ],
               checkHtml = decorator.Converter.jsonToHtml(json),
               goodHtml = '<div><a></a></div>';
            equalsHtml(checkHtml, goodHtml);
         });

         it('invalid href - 3', function() {
            var
               json = [
                  ['a', { 'href': 'www.http.log.ru' }]
               ],
               checkHtml = decorator.Converter.jsonToHtml(json),
               goodHtml = '<div><a></a></div>';
            equalsHtml(checkHtml, goodHtml);
         });

         it('validate data- attributes - 1', function() {
            var
               json = [
                  ['p', { 'data-': 'value' }, 'text']
               ],
               checkHtml = decorator.Converter.jsonToHtml(json),
               goodHtml = '<div><p>text</p></div>';
            equalsHtml(checkHtml, goodHtml);
         });

         it('validate data- attributes - 2', function() {
            var
               json = [
                  ['p', { 'data-ewghierg': 'value' }, 'text']
               ],
               checkHtml = decorator.Converter.jsonToHtml(json),
               goodHtml = '<div><p data-ewghierg="value">text</p></div>';
            equalsHtml(checkHtml, goodHtml);
         });

         it('validate data- attributes - 3', function() {
            var
               json = [
                  ['p', { 'data-component': 'value' }, 'text']
               ],
               checkHtml = decorator.Converter.jsonToHtml(json),
               goodHtml = '<div><p>text</p></div>';
            equalsHtml(checkHtml, goodHtml);
         });

         it('validate data- attributes - 4', function() {
            var
               json = [
                  ['p', { 'data-component-style': 'value' }, 'text']
               ],
               checkHtml = decorator.Converter.jsonToHtml(json),
               goodHtml = '<div><p data-component-style="value">text</p></div>';
            equalsHtml(checkHtml, goodHtml);
         });

         it('validate data- attributes - 5', function() {
            var
               json = [
                  ['p', { 'data-key-': 'value' }, 'text']
               ],
               checkHtml = decorator.Converter.jsonToHtml(json),
               goodHtml = '<div><p>text</p></div>';
            equalsHtml(checkHtml, goodHtml);
         });

         it('validHtml option', function() {
            var
               validHtml = {
                  validNodes: {
                     any: true,
                     tag: true,
                     link: true,
                     additional: {
                        add: true
                     },
                     script: true
                  },
                  validAttributes: {
                     name: true,
                     value: true
                  }
               },
               json = [
                  ['p', '123'],
                  ['div', '456'],
                  ['any', { name: 'name', value: 'value', id: 'id' }],
                  ['tag', 'inner text'],
                  ['link'],
                  ['additional', { add: 'add', name: 'name', id: 'id' }],
                  ['script', 'alert(123);']
               ],
               goodHtml =
                  '<any name="name" value="value"></any>' +
                  '<tag>inner text</tag>' +
                  '<link />' +
                  '<additional add="add" name="name"></additional>' +
                  '<script>alert(123);</script>',
               checkHtml = template({
                  _options: {
                     value: json,
                     validHtml: validHtml,
                     tagResolver: decorator.noOuterTag
                  }
               }, {});
            equalsHtml(checkHtml, goodHtml);
         });

         it('with linkDecorate resolver', function() {
            // Link with length 1500.
            var longLink = 'https://ya.ru/' + 'a'.repeat(1486);
            var json = [
               ['p', linkNode],
               ['pre', linkNode],
               ['div', linkNode],
               ['p', linkNode, nbsp + nbsp + '   '],
               ['p', linkNode, '   ', decorator.Converter.deepCopyJson(linkNode)],
               ['p', linkNode, 'text '],
               ['pre', 'https://ya.ru\ntext'],
               ['p', linkNode, ['br'], 'text'],
               ['p', linkNode, '   ', ['br'], 'text'],
               ['p', ['strong', linkNode], 'text'],
               ['p',
                  ['a',
                     {
                        rel: 'noreferrer noopener',
                        href: 'https:\\\\ya.ru\\som"e'
                     },
                     'https:\\\\ya.ru\\som"e'
                  ]
               ],
               ['p',
                  'outer text one',
                  ['br'],
                  'outer text two',
                  ['p', 'inner text'],
                  'outer text three'
               ],
               ['p', ['a', { href: longLink }, longLink]],
               ['p', ['a', { href: 'https://ya.ru' }, 'text']]
            ];
            var htmlArray = [
               '<p>' + decoratedLinkHtml + '</p>',
               '<pre>' + decoratedLinkHtml + '</pre>',
               '<div>' + decoratedLinkHtml + '</div>',
               '<p>' + decoratedLinkHtml + '&nbsp;&nbsp;   </p>',
               '<p>' + decoratedLinkHtml + '   ' + decoratedLinkHtml + '</p>',
               '<p>' + linkHtml + 'text </p>',
               '<pre>' + decoratedLinkHtml + '\ntext</pre>',
               '<p>' + decoratedLinkHtml + '<br />text</p>',
               '<p>' + decoratedLinkHtml + '   <br />text</p>',
               '<p><strong>' + linkHtml + '</strong>text</p>',
               '<p><span class="LinkDecorator__wrap"><a class="LinkDecorator__linkWrap" rel="noreferrer noopener" href="https:\\\\ya.ru\\som&quot;e" target="_blank"><img class="LinkDecorator__image" alt="https:\\\\ya.ru\\som&quot;e" src="' + (typeof location === 'object' ? location.protocol + '//' + location.host : '') + '/test/?method=LinkDecorator.DecorateAsSvg&amp;params=eyJTb3VyY2VMaW5rIjoiaHR0cHM6XFxcXHlhLnJ1XFxzb21cImUifQ%3D%3D&amp;id=0&amp;srv=1" /></a></span></p>',
               '<p>outer text one<br />outer text two<p>inner text</p>outer text three</p>',
               '<p><a href="' + longLink + '">' + longLink + '</a></p>',
               '<p><a href="https://ya.ru">text</a></p>'
            ];
            for (var i = 0; i < json.length; ++i) {
               var checkHtml = decorator.Converter.jsonToHtml(json[i], decorator.linkDecorate);
               var goodHtml = '<div>' + htmlArray[i] + '</div>';
               equalsHtml(checkHtml, goodHtml, 'fail in index ' + i);
            }
         });

         it('with highlight resolver', function() {
            var json = [
               ['p', ['strong', 'BaBare;gjwergo'], 'aBaweruigerhw', ['em', 'aBa']],
               ['p', 'aba, abA, aBa, aBA, Aba, AbA, ABa, ABA'],
               ['p', 'abababababa'],
               ['p', 'no highlight']
            ];
            var html = '<div>' +
               '<p><strong>B<span class="controls-MarkupDecorator_highlight">aBa</span>re;gjwergo</strong><span class="controls-MarkupDecorator_highlight">aBa</span>weruigerhw<em><span class="controls-MarkupDecorator_highlight">aBa</span></em></p>' +
               '<p><span class="controls-MarkupDecorator_highlight">aba</span>, <span class="controls-MarkupDecorator_highlight">abA</span>, <span class="controls-MarkupDecorator_highlight">aBa</span>, <span class="controls-MarkupDecorator_highlight">aBA</span>, <span class="controls-MarkupDecorator_highlight">Aba</span>, <span class="controls-MarkupDecorator_highlight">AbA</span>, <span class="controls-MarkupDecorator_highlight">ABa</span>, <span class="controls-MarkupDecorator_highlight">ABA</span></p>' +
               '<p><span class="controls-MarkupDecorator_highlight">aba</span>b<span class="controls-MarkupDecorator_highlight">aba</span>b<span class="controls-MarkupDecorator_highlight">aba</span></p>' +
               '<p>no highlight</p>' +
               '</div>';
            equalsHtml(decorator.Converter.jsonToHtml(json, decorator._highlightResolver, { textToHighlight: 'aBa' }), html);
         });
         it('with innerText resolver', function() {
            var json = [['p', 'text&amp;', ['br'], 'more text'], ['p', deepNode], ['p'], ['p', attributedNode], ['p', linkNode], ['p', simpleNode]];
            assert.equal(decorator.Converter.jsonToHtml(json, decorator.InnerText), 'text&amp;\nmore text\ntexttexttexttexttexttexttext\n\ntext\nhttps://ya.ru\ntext\n');
         });
         it('with noOuterTag resolver', function() {
            var json = [['p', 'text&amp;'], ['p', deepNode], ['p', attributedNode], ['p', linkNode], ['p', simpleNode]];
            var html = '<p>text&amp;amp;</p><p>' + deepHtml + '</p><p><span class="someClass">text</span></p><p>' + linkHtml + '</p><p><span>text</span></p>';
            equalsHtml(decorator.Converter.jsonToHtml(json, decorator.noOuterTag), html);
            assert.equal(decorator.Converter.jsonToHtml([], decorator.noOuterTag), '');
         });

         it('with linkWrap resolver', function() {
            var json = [
               ['p', linkNode],
               ['p', 'https://ya.ru'],
               ['p', 'just text']
            ];
            var htmlArray = [
               '<p>' + linkHtml + '</p>',
               '<p>' + linkHtml + '</p>',
               '<p>just text</p>'
            ];
            for (var i = 0; i < json.length; ++i) {
               var checkHtml = decorator.Converter.jsonToHtml(json[i], decorator.linkWrapResolver);
               var goodHtml = '<div>' + htmlArray[i] + '</div>';
               equalsHtml(checkHtml, goodHtml, 'fail in index ' + i);
            }
         });
      });
   });

   describe('Controls.Decorator.Markup.resources.linkDecorateUtils', function() {
      describe('isDecoratedLink', function() {
         it('decorated link node', function() {
            assert.isTrue(linkDecorateUtils.isDecoratedLink('span', decoratedLinkFirstChildNode));
         });

         it('decorated link node two classes', function() {
            var decoratedLinkFirstChildNodeCopy = decorator.Converter.deepCopyJson(decoratedLinkFirstChildNode);
            decoratedLinkFirstChildNodeCopy[1].class += ' anotherClass';
            assert.ok(linkDecorateUtils.isDecoratedLink('span', decoratedLinkFirstChildNodeCopy));
         });

         it('decorated link node no classes', function() {
            var decoratedLinkFirstChildNodeCopy = decorator.Converter.deepCopyJson(decoratedLinkFirstChildNode);
            delete decoratedLinkFirstChildNodeCopy[1].class;
            assert.notOk(linkDecorateUtils.isDecoratedLink('span', decoratedLinkFirstChildNodeCopy));
         });

         it('wrong tag name', function() {
            assert.isFalse(linkDecorateUtils.isDecoratedLink('div', decoratedLinkFirstChildNode));
            assert.isFalse(linkDecorateUtils.isDecoratedLink('', decoratedLinkFirstChildNode));
         });
         it('have not first child', function() {
            assert.isFalse(linkDecorateUtils.isDecoratedLink('span'));
            assert.isFalse(linkDecorateUtils.isDecoratedLink('span', null));
            assert.isFalse(linkDecorateUtils.isDecoratedLink('span', []));
            assert.isFalse(linkDecorateUtils.isDecoratedLink('span', ''));
         });
         it('wrong class name first child', function() {
            assert.isFalse(linkDecorateUtils.isDecoratedLink('span', ['a',
               {
                  'href': 'https://ya.ru',
                  'target': '_blank',
                  'class': 'LinkDecorator__linkWrapOrNotLinkWrap'
               },
               ['img',
                  {
                     'class': 'LinkDecorator__image',
                     'alt': 'https://ya.ru',
                  }
               ]
            ]));
         });
         it('wrong have not href first child', function() {
            assert.isFalse(linkDecorateUtils.isDecoratedLink('span', ['a',
               {
                  'target': '_blank',
                  'class': 'LinkDecorator__linkWrap'
               },
               ['img',
                  {
                     'class': 'LinkDecorator__image',
                     'alt': 'https://ya.ru',
                  }
               ]
            ]));
         });
      });
      describe('getUndecoratedLink', function() {
         it('undecorate a decorated link', function() {
            assert.deepEqual(linkDecorateUtils.getUndecoratedLink(decoratedLinkFirstChildNode), linkNode);
         });
      });

      describe('wrapLinksInString', function() {
         it('with protocol - 1', function() {
            var parentNode = ['p', 'https://ya.ru'];
            var goodResultNode = [[], ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'https://ya.ru',
                  target: '_blank'
               },
               'https://ya.ru'
            ]];
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });

         it('with protocol - 2', function() {
            var parentNode = ['p', 'http://localhost:1025'];
            var goodResultNode = [[], ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'http://localhost:1025',
                  target: '_blank'
               },
               'http://localhost:1025'
            ]];
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });

         it('with protocol - 3', function() {
            var parentNode = ['p', 'http:\\\\localhost:1025'];
            var goodResultNode = [[], ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'http:\\\\localhost:1025',
                  target: '_blank'
               },
               'http:\\\\localhost:1025'
            ]];
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });

         it('with protocol - 4', function() {
            var parentNode = ['p', 'https://'];
            var goodResultNode = 'https://';
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });

         it('with protocol - 5', function() {
            var parentNode = ['p', 'http:\\localhost:1025'];
            var goodResultNode = 'http:\\localhost:1025';
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });

         it('with protocol in brackets', function() {
            var parentNode = ['p', '(http://localhost:1025)'];
            var goodResultNode = [[], '(', ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'http://localhost:1025',
                  target: '_blank'
               },
               'http://localhost:1025'
            ], ')'];
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });

         it('with protocol with capital letters', function() {
            var parentNode = ['p', 'HtTpS://ya.ru'];
            var goodResultNode = [[], ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'HtTpS://ya.ru',
                  target: '_blank'
               },
               'HtTpS://ya.ru'
            ]];
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });

         it('with \\n characters', function() {
            var parentNode = ['p', 'https://ya.ru\nsome\ntext'];
            var goodResultNode = [[],
               linkNode,
               '\nsome\ntext'
            ];
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });

         it('without protocol - 1', function() {
            var parentNode = ['p', 'usd-comp162.corp.tensor.ru:1025/?grep=Controls%5C.Decorator%5C.Markup'];
            var goodResultNode = [[], ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'http://usd-comp162.corp.tensor.ru:1025/?grep=Controls%5C.Decorator%5C.Markup',
                  target: '_blank'
               },
               'usd-comp162.corp.tensor.ru:1025/?grep=Controls%5C.Decorator%5C.Markup'
            ]];
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });

         it('without protocol - 2', function() {
            var parentNode = ['p', 'vk.com'];
            var goodResultNode = [[], ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'http://vk.com',
                  target: '_blank'
               },
               'vk.com'
            ]];
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });

         it('without protocol - 3', function() {
            var parentNode = ['p', 'market.yandex.ru'];
            var goodResultNode = [[], ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'http://market.yandex.ru',
                  target: '_blank'
               },
               'market.yandex.ru'
            ]];
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });

         it('without protocol - 4', function() {
            var parentNode = ['p', 'my page on vk.com is vk.com/id0'];
            var goodResultNode = [[],
               'my page on ',
               ['a',
                  {
                     'class': 'asLink',
                     rel: 'noreferrer noopener',
                     href: 'http://vk.com',
                     target: '_blank'
                  },
                  'vk.com'
               ],
               ' is ',
               ['a',
                  {
                     'class': 'asLink',
                     rel: 'noreferrer noopener',
                     href: 'http://vk.com/id0',
                     target: '_blank'
                  },
                  'vk.com/id0'
               ]
            ];
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });

         it('without protocol - 5', function() {
            var parentNode = ['p', 'yandex.ru.'];
            var goodResultNode = [[], ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'http://yandex.ru',
                  target: '_blank'
               },
               'yandex.ru'
            ], '.'];
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });

         it('without protocol - 6', function() {
            var parentNode = ['p', 'www.google.com'];
            var goodResultNode = [[], ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'http://www.google.com',
                  target: '_blank'
               },
               'www.google.com'
            ]];
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });

         it('without protocol in brackets', function() {
            var parentNode = ['p', '(www.google.com)'];
            var goodResultNode = [[],
               '(',
               ['a',
                  {
                     'class': 'asLink',
                     rel: 'noreferrer noopener',
                     href: 'http://www.google.com',
                     target: '_blank'
                  },
                  'www.google.com'
               ],
               ')'
            ];
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });

         it('without protocol wrong top level domain name - 1', function() {
            var parentNode = ['p', 'www.google.comma'];
            var goodResultNode = 'www.google.comma';
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });

         it('without protocol wrong top level domain name - 2', function() {
            var parentNode = ['p', 'vk.comma/id0'];
            var goodResultNode = 'vk.comma/id0';
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });

         it('without protocol wrong top level domain name - 3', function() {
            var parentNode = ['p', 'usd-comp162.corp.tensor.ur:1025/?grep=Controls%5C.Decorator%5C.Markup'];
            var goodResultNode = 'usd-comp162.corp.tensor.ur:1025/?grep=Controls%5C.Decorator%5C.Markup';
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });

         it('inside link', function() {
            var parentNode = ['a', 'https://ya.ru'];
            var goodResultNode = 'https://ya.ru';
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });

         it('email - 1', function() {
            var parentNode = ['p', 'rn.kondakov@tensor.ru'];
            var goodResultNode = [[], ['a',
               {
                  href: 'mailto:rn.kondakov@tensor.ru'
               },
               'rn.kondakov@tensor.ru'
            ]];
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });

         it('email - 2', function() {
            var parentNode = ['p', 'rweghjrewefij.rwe.gareg.123.32423.fswef@mail.ru'];
            var goodResultNode = [[], ['a',
               {
                  href: 'mailto:rweghjrewefij.rwe.gareg.123.32423.fswef@mail.ru'
               },
               'rweghjrewefij.rwe.gareg.123.32423.fswef@mail.ru'
            ]];
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });

         it('email in brackets', function() {
            var parentNode = ['p', 'text(rn.kondakov@tensor.ru)text'];
            var goodResultNode = [[], 'text(', ['a',
               {
                  href: 'mailto:rn.kondakov@tensor.ru'
               },
               'rn.kondakov@tensor.ru'
            ], ')text'];
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });

         it('email with wrong domain', function() {
            var parentNode = ['p', 'rn.kondakov@tensor.rux'];
            var goodResultNode = 'rn.kondakov@tensor.rux';
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });
      });

      describe('needDecorate', function() {
         beforeEach(function() {
            decoratedLinkService = Env.constants.decoratedLinkService;
            Env.constants.decoratedLinkService = '/test/';
            linkDecorateUtils.clearNeedDecorateGlobals();
         });
         afterEach(function() {
            Env.constants.decoratedLinkService = decoratedLinkService;
         });
         it('not a link', function() {
            var parentNode = ['p', ['b',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'https://ya.ru',
                  target: '_blank'
               },
               'https://ya.ru'
            ]];
            assert.isFalse(linkDecorateUtils.needDecorate(parentNode[1], parentNode));
         });
         it('parent node is not a paragraph', function() {
            var parentNode = ['span', ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'https://ya.ru',
                  target: '_blank'
               },
               'https://ya.ru'
            ]];
            assert.isFalse(linkDecorateUtils.needDecorate(parentNode[1], parentNode));
         });
         it('link href is not equal link value', function() {
            var parentNode = ['p', ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'https://ya.ru',
                  target: '_blank'
               },
               'not https://ya.ru'
            ]];
            assert.isFalse(linkDecorateUtils.needDecorate(parentNode[1], parentNode));
         });
         it('link haven\'t href', function() {
            var parentNode = ['p', ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  target: '_blank'
               },
               'https://ya.ru'
            ]];
            assert.isFalse(linkDecorateUtils.needDecorate(parentNode[1], parentNode));
         });
         it('link href length more then given maximum', function() {
            var maxLenght = linkDecorateUtils.getHrefMaxLength(),
               linkHref = 'https://ya.ru/';
            linkHref = linkHref + 'a'.repeat(maxLenght - linkHref.length + 1);
            var parentNode = ['p', ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: linkHref,
                  target: '_blank'
               },
               linkHref
            ]];
            assert.isFalse(linkDecorateUtils.needDecorate(parentNode[1], parentNode));
         });
         it('link href starts from "file://"', function() {
            var parentNode = ['p', ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'file://test-perfleakps/leaks/test/30_03_19/21_06_58.zip',
                  target: '_blank'
               },
               'file://test-perfleakps/leaks/test/30_03_19/21_06_58.zip'
            ]];
            assert.isFalse(linkDecorateUtils.needDecorate(parentNode[1], parentNode));
         });
         it('link href starts from "smb://"', function() {
            var parentNode = ['p', ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'smb://test-perfleakps/leaks/test/30_03_19/21_06_58.zip',
                  target: '_blank'
               },
               'smb://test-perfleakps/leaks/test/30_03_19/21_06_58.zip'
            ]];
            assert.isFalse(linkDecorateUtils.needDecorate(parentNode[1], parentNode));
         });
         it('link href starts from "file://" and has "http" inside', function() {
            var parentNode = ['p', ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'smb://test-perfleakps/leaks/http/30_03_19/21_06_58.zip',
                  target: '_blank'
               },
               'smb://test-perfleakps/leaks/http/30_03_19/21_06_58.zip'
            ]];
            assert.isFalse(linkDecorateUtils.needDecorate(parentNode[1], parentNode));
         });
         it('link is not in the end of paragraph', function() {
            var parentNode = ['p', ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'https://ya.ru',
                  target: '_blank'
               },
               'not https://ya.ru'
            ], 'some node after link'];
            assert.isFalse(linkDecorateUtils.needDecorate(parentNode[1], parentNode));
         });
         it('need decorate case - 1', function() {
            var parentNode = ['p', ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'https://ya.ru',
                  target: '_blank'
               },
               'https://ya.ru'
            ]];
            assert.isTrue(linkDecorateUtils.needDecorate(parentNode[1], parentNode));
         });
         it('need decorate case - 2', function() {
            var parentNode = ['p', ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'https://ya.ru',
                  target: '_blank'
               },
               'https://ya.ru'
            ], '       '];
            assert.isTrue(linkDecorateUtils.needDecorate(parentNode[1], parentNode));
         });
         it('need decorate case - 3', function() {
            var parentNode = ['p', ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'https://ya.ru',
                  target: '_blank'
               },
               'https://ya.ru'
            ], ['br']];
            assert.isTrue(linkDecorateUtils.needDecorate(parentNode[1], parentNode));
         });
         it('need decorate case - 4', function() {
            var parentNode = ['p', ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'https://ya.ru',
                  target: '_blank'
               },
               'https://ya.ru'
            ], '      ', ['br']];
            assert.isTrue(linkDecorateUtils.needDecorate(parentNode[1], parentNode));
         });
         it('need decorate case - 5', function() {
            var parentNode = ['pre', ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'https://ya.ru',
                  target: '_blank'
               },
               'https://ya.ru'
            ]];
            assert.isTrue(linkDecorateUtils.needDecorate(parentNode[1], parentNode));
         });
         it('need decorate case - 6', function() {
            var parentNode = ['div', ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'https://ya.ru',
                  target: '_blank'
               },
               'https://ya.ru'
            ]];
            assert.isTrue(linkDecorateUtils.needDecorate(parentNode[1], parentNode));
         });
         it('need decorate case - 7', function() {
            var parentNode = ['div', ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'http://ya.ru',
                  target: '_blank'
               },
               'http://ya.ru'
            ]];
            assert.isTrue(linkDecorateUtils.needDecorate(parentNode[1], parentNode));
         });
         it('need decorate with capital letters in protocol', function() {
            var parentNode = ['div', ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'HtTpS://ya.ru',
                  target: '_blank'
               },
               'HtTpS://ya.ru'
            ]];
            assert.isTrue(linkDecorateUtils.needDecorate(parentNode[1], parentNode));
         });
         it('only good links, separated by space chars', function() {
            var i,
               parentNode = ['p',
                  ['a', { href: 'http://a' }, 'http://a'],
                  ' https://ya.ru ',
                  ['a', { href: 'http://a' }, 'http://a'],
                  ' ',
                  ['a', { href: 'http://a' }, 'http://a'],
                  '   ' + nbsp + '\t',
                  ['a', { href: 'http://a' }, 'http://a'],
                  ['br'],
                  ['a', { href: 'http://a' }, 'http://a'],
                  '      ',
                  ['a', { href: 'http://a' }, 'http://a'],
               ],
               expectedNeedDecorate = [undefined,
                  true,
                  true,
                  true,
                  true,
                  true,
                  true,
                  true,
                  false,
                  true,
                  true,
                  true
               ],
               expectedFromStringArray = [
                  [[],
                     ' ',
                     ['span',
                        { 'class': 'LinkDecorator__wrap' },
                        decoratedLinkFirstChildNode
                     ],
                     ' '
                  ],
                  ' ',
                  '   ' + nbsp + '\t',
                  '      ',
               ],
               checkNeedDecorate;

            for (i = 1; i < parentNode.length; ++i) {
               checkNeedDecorate = linkDecorateUtils.needDecorate(parentNode[i], parentNode);
               assert.equal(checkNeedDecorate, expectedNeedDecorate[i], `fail in needDecorate[${i}]`);
            }
            while (expectedFromStringArray.length) {
               var checkFromString = linkDecorateUtils.getDecoratedLink('');
               var expectedFromString = expectedFromStringArray.shift();
               assert.deepEqual(checkFromString, expectedFromString);
            }
            assert.notOk(linkDecorateUtils.getDecoratedLink(''));
         });
         it('br tag as end of paragraph', function() {
            var i,
               parentNode = ['p',
                  ['a', { href: 'http://a' }, 'http://a'],
                  ['a', { href: 'http://a' }, 'http://a'],
                  ['br'],
                  ['a', { href: 'http://a' }, 'http://a'],
                  'some www.ya.ru link'
               ],
               expectedNeedDecorate = [undefined,
                  true,
                  true,
                  false,
                  false,
                  true
               ],
               expectedFromStringArray = [
                  [[],
                     'some ',
                     wwwLinkNode,
                     ' link'
                  ]
               ],
               checkNeedDecorate;

            for (i = 1; i < parentNode.length; ++i) {
               checkNeedDecorate = linkDecorateUtils.needDecorate(parentNode[i], parentNode);
               assert.equal(checkNeedDecorate, expectedNeedDecorate[i], `fail in needDecorate[${i}]`);
            }
            while (expectedFromStringArray.length) {
               var checkFromString = linkDecorateUtils.getDecoratedLink('');
               var expectedFromString = expectedFromStringArray.shift();
               assert.deepEqual(checkFromString, expectedFromString);
            }
            assert.notOk(linkDecorateUtils.getDecoratedLink(''));
         });

         it('string with "\\n" in the beginning as end of paragraph', function() {
            var i,
               parentNode = ['pre',
                  ['a', { href: 'http://a' }, 'http://a'],
                  ['a', { href: 'http://a' }, 'http://a'],
                  '\nsome text\n',
                  ['a', { href: 'http://a' }, 'http://a'],
                  ['a', { href: 'http://a' }, 'http://a'],
                  '        \nsome text\n',
                  ['a', { href: 'http://a' }, 'http://a'],
                  'some text'
               ],
               expectedNeedDecorate = [undefined,
                  true,
                  true,
                  true,
                  true,
                  true,
                  true,
                  false,
                  true
               ],
               expectedFromStringArray = [
                  '\nsome text\n',
                  '        \nsome text\n',
                  'some text'
               ],
               checkNeedDecorate;

            for (i = 1; i < parentNode.length; ++i) {
               checkNeedDecorate = linkDecorateUtils.needDecorate(parentNode[i], parentNode);
               assert.equal(checkNeedDecorate, expectedNeedDecorate[i], `fail in needDecorate[${i}]`);
            }
            while (expectedFromStringArray.length) {
               var checkFromString = linkDecorateUtils.getDecoratedLink('');
               var expectedFromString = expectedFromStringArray.shift();
               assert.deepEqual(checkFromString, expectedFromString);
            }
            assert.notOk(linkDecorateUtils.getDecoratedLink(''));
         });

         it('two links before text and two links after', function() {
            var i,
               parentNode = ['p',
                  ['a', { href: 'http://a' }, 'http://a'],
                  ['a', { href: 'http://a' }, 'http://a'],
                  'some text',
                  ['a', { href: 'http://a' }, 'http://a'],
                  ['a', { href: 'http://a' }, 'http://a']
               ],
               expectedNeedDecorate = [undefined,
                  false,
                  false,
                  true,
                  true,
                  true
               ],
               expectedFromStringArray = [
                  'some text'
               ],
               checkNeedDecorate;

            for (i = 1; i < parentNode.length; ++i) {
               checkNeedDecorate = linkDecorateUtils.needDecorate(parentNode[i], parentNode);
               assert.equal(checkNeedDecorate, expectedNeedDecorate[i], `fail in needDecorate[${i}]`);
            }
            while (expectedFromStringArray.length) {
               var checkFromString = linkDecorateUtils.getDecoratedLink('');
               var expectedFromString = expectedFromStringArray.shift();
               assert.deepEqual(checkFromString, expectedFromString);
            }
            assert.notOk(linkDecorateUtils.getDecoratedLink(''));
         });
         it('two links before tag with text and two links after', function() {
            var i,
               parentNode = ['p',
                  ['a', { href: 'http://a' }, 'http://a'],
                  ['a', { href: 'http://a' }, 'http://a'],
                  ['span', 'some text'],
                  ['a', { href: 'http://a' }, 'http://a'],
                  ['a', { href: 'http://a' }, 'http://a']
               ],
               expectedNeedDecorate = [undefined,
                  false,
                  false,
                  false,
                  true,
                  true
               ],
               checkNeedDecorate;

            for (i = 1; i < parentNode.length; ++i) {
               checkNeedDecorate = linkDecorateUtils.needDecorate(parentNode[i], parentNode);
               assert.equal(checkNeedDecorate, expectedNeedDecorate[i], `fail in needDecorate[${i}]`);
            }
         });
         it('good link, space, bad link, good link', function() {
            var i,
               parentNode = ['p',
                  ['a', { href: 'http://a' }, 'http://a'],
                  ' ',
                  ['a', { href: 'http://ResidentSleeper' }, 'http://a'],
                  ['a', { href: 'http://a' }, 'http://a']
               ],
               expectedNeedDecorate = [undefined,
                  false,
                  true,
                  false,
                  true
               ],
               checkNeedDecorate;

            for (i = 1; i < parentNode.length; ++i) {
               checkNeedDecorate = linkDecorateUtils.needDecorate(parentNode[i], parentNode);
               assert.equal(checkNeedDecorate, expectedNeedDecorate[i], `fail in needDecorate[${i}]`);
            }
         });
         it('spaces after link', function() {
            var i,
               parentNode = ['p',
                  ['a', { href: 'http://a' }, 'http://a'],
                  '  \t '
               ],
               expectedNeedDecorate = [undefined,
                  true,
                  true
               ],
               checkNeedDecorate;

            for (i = 1; i < parentNode.length; ++i) {
               checkNeedDecorate = linkDecorateUtils.needDecorate(parentNode[i], parentNode);
               assert.equal(checkNeedDecorate, expectedNeedDecorate[i], `fail in needDecorate[${i}]`);
            }
         });
         it('spaces with style after link', function() {
            var i,
               parentNode = ['p',
                  ['a', { href: 'http://a' }, 'http://a'],
                  ['span',
                     { style: 'text-decoration: underline' },
                     ['strong',
                        '        '
                     ]
                  ]
               ],
               expectedNeedDecorate = [undefined,
                  false,
                  false
               ],
               checkNeedDecorate;

            for (i = 1; i < parentNode.length; ++i) {
               checkNeedDecorate = linkDecorateUtils.needDecorate(parentNode[i], parentNode);
               assert.equal(checkNeedDecorate, expectedNeedDecorate[i], `fail in needDecorate[${i}]`);
            }
         });

         it('clear fake needDecorate attribute - 1', function() {
            var firstAttributesObject = { href: 'https://ya.ru' };
            var secondAttributesObject = { href: 'https://ya.ru' };
            var parentNode = ['p',
               ['a', firstAttributesObject, 'https://ya.ru'],
               ['a', secondAttributesObject, 'https://ya.ru']
            ];
            var firstNeedDecorate = linkDecorateUtils.needDecorate(parentNode[1], parentNode);
            var secondNeedDecorate = linkDecorateUtils.needDecorate(parentNode[2], parentNode);
            assert.ok(firstNeedDecorate);
            assert.ok(secondNeedDecorate);
            assert.notOk(firstAttributesObject.hasOwnProperty('__needDecorate'));
            assert.notOk(secondAttributesObject.hasOwnProperty('__needDecorate'));
         });

         it('clear fake needDecorate attribute - 2', function() {
            var firstAttributesObject = { href: 'https://ya.ru' };
            var secondAttributesObject = { href: 'https://ya.ru' };
            var parentNode = ['p',
               ['a', firstAttributesObject, 'Some text, not a href'],
               ['a', secondAttributesObject, 'Some text, not a href']
            ];
            var firstNeedDecorate = linkDecorateUtils.needDecorate(parentNode[1], parentNode);
            var secondNeedDecorate = linkDecorateUtils.needDecorate(parentNode[2], parentNode);
            assert.notOk(firstNeedDecorate);
            assert.notOk(secondNeedDecorate);
            assert.notOk(firstAttributesObject.hasOwnProperty('__needDecorate'));
            assert.notOk(secondAttributesObject.hasOwnProperty('__needDecorate'));
         });
      });
      describe('decorateLink', function() {
         beforeEach(function() {
            decoratedLinkService = Env.constants.decoratedLinkService;
            Env.constants.decoratedLinkService = '/test/';
            linkDecorateUtils.clearNeedDecorateGlobals();
         });
         afterEach(function() {
            Env.constants.decoratedLinkService = decoratedLinkService;
         });
         it('decorate a good link', function() {
            assert.deepEqual(linkDecorateUtils.getDecoratedLink(linkNode), ['span',
               { 'class': 'LinkDecorator__wrap' },
               decoratedLinkFirstChildNode
            ]);
         });
         it('wrap link in string without decorating', function() {
            var parentNode = ['span', 'see my link: https://ya.ru'];
            var expectedFromString = [[],
               'see my link: ',
               linkNode
            ];
            assert.ok(linkDecorateUtils.needDecorate(parentNode[1], parentNode));
            var checkFromString = linkDecorateUtils.getDecoratedLink(parentNode[1]);
            assert.deepEqual(expectedFromString, checkFromString);
         });
      });
   });
   describe('Controls.Application headJson options', function() {
      var realBuildnumber;
      var realResourceRoot;
      var realGetAppData;
      var app;

      before(function() {
         app = new Application();
         app._getResourceUrl = function (str) { return str + '?testversion'}
         realBuildnumber = global.contents.buildnumber;
         global.contents.buildnumber = '0';
         realResourceRoot = global.wsConfig.resourceRoot;
         global.wsConfig.resourceRoot = '/test/';
         realGetAppData = Base.AppData.getAppData;
         Base.AppData.getAppData = function() {
            return {};
         };
      });

      after(function() {
         global.contents.buildnumber = realBuildnumber;
         global.wsConfig.resourceRoot = realResourceRoot;
         Base.AppData.getAppData = realGetAppData;
      });

      it('script with module scr', function() {
         var json = [['script', { src: '/test/Controls/_decorator/Markup.js' }]];
         app._beforeMount({ headJson: json });
         var goodHtml = '<script src="/test/Controls/_decorator/Markup.js?testversion"></script>';
         var checkHtml = template({
            _options: {
               value: app.headJson[0],
               validHtml: app.headValidHtml,
               tagResolver: app.headTagResolver.bind(app)
            }
         }, {});
         equalsHtml(goodHtml, checkHtml);
      });

      it('link with module href', function() {
         var json = [['link', { href: '/test/Controls/_decorator/Markup/resolvers/highlight.css' }]];
         app._beforeMount({ headJson: json });
         var goodHtml = '<link href="/test/Controls/_decorator/Markup/resolvers/highlight.css?testversion" />';
         var checkHtml = template({
            _options: {
               value: app.headJson[0],
               validHtml: app.headValidHtml,
               tagResolver: app.headTagResolver.bind(app)
            }
         }, {});
         equalsHtml(goodHtml, checkHtml);
      });

      it('script with non-module scr', function() {
         var json = [['script', { src: 'https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js' }]];
         app._beforeMount({ headJson: json });
         var goodHtml = '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js?testversion"></script>';
         var checkHtml = template({
            _options: {
               value: app.headJson[0],
               validHtml: app.headValidHtml,
               tagResolver: app.headTagResolver.bind(app)
            }
         }, {});
         equalsHtml(goodHtml, checkHtml);
      });

      it('link with non-module href', function() {
         var json = [['link', { src: 'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css' }]];
         app._beforeMount({ headJson: json });
         var goodHtml = '<link src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css?testversion" />';
         var checkHtml = template({
            _options: {
               value: app.headJson[0],
               validHtml: app.headValidHtml,
               tagResolver: app.headTagResolver.bind(app)
            }
         }, {});
         equalsHtml(goodHtml, checkHtml);
      });

      it('module link in an attribute that is not a link', function() {
         var json = [['meta', {
            name: '/test/Controls/_decorator/Markup.js',
            content: 'yes'
         }]];
         app._beforeMount({ headJson: json });
         var goodHtml = '<meta name="/test/Controls/_decorator/Markup.js" content="yes" />';
         var checkHtml = template({
            _options: {
               value: app.headJson[0],
               validHtml: app.headValidHtml,
               tagResolver: app.headTagResolver.bind(app)
            }
         }, {});
         equalsHtml(goodHtml, checkHtml);
      });

      it('just a title', function() {
         var json = [['title', 'SABY']];
         app._beforeMount({ headJson: json });
         var goodHtml = '<title>SABY</title>';
         var checkHtml = template({
            _options: {
               value: app.headJson[0],
               validHtml: app.headValidHtml,
               tagResolver: app.headTagResolver.bind(app)
            }
         }, {});
         equalsHtml(goodHtml, checkHtml);
      });
   });
});
