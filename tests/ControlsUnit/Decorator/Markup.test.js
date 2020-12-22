define([
   'Controls/decorator',
   'Controls/_decorator/Markup/resources/template',
   'Controls/_decorator/Markup/resources/linkDecorateUtils',
   'Env/Env'
], function(
   decorator,
   template,
   linkDecorateUtils,
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
      wwwLinkNode = ['a',
         {
            'class': 'asLink',
            rel: 'noreferrer noopener',
            href: 'http://www.ya.ru',
            target: '_blank'
         },
         'www.ya.ru'
      ],
      decoratedLinkService,
      decoratedLinkHost,
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

      describe('deepCopyJson', function() {
         it('one big', function() {
            var json = [['p', 'text'], ['p', deepNode], ['p', attributedNode], ['p', linkNode], ['p', simpleNode]];
            var newJson = decorator.Converter.deepCopyJson(json);
            assert.notEqual(newJson, json);
            assert.deepEqual(newJson, json);
         });
      });

      describe('htmlToJson', function() {
         var isNode = typeof document === 'undefined';

         before(function() {
            if (isNode) {
               Env.constants.isBrowserPlatform = true;
               var browser = new jsdom.JSDOM('', { pretendToBeVisual: false });
               global.window = browser.window;
               global.document = window.document;
               global.Node = window.Node;
            }
         });

         after(function() {
            if (isNode) {
               Env.constants.isBrowserPlatform = false;
               global.window = undefined;
               global.document = undefined;
               global.Node = undefined;
            }
         });

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
         var errorStub;
         var errorArray;

         function errorFunction(){
            errorArray.push(arguments);
         }

         before(function() {
            ILogger = Env.IoC.resolve('ILogger');
            errorStub = sinon.stub(ILogger, 'error').callsFake(errorFunction);
            errorArray = [];
         });
         after(function() {
            errorStub.restore();
         });
         beforeEach(function() {
            decoratedLinkService = Env.constants.decoratedLinkService;
            decoratedLinkHost = Env.constants.decoratedLinkHost;
            Env.constants.decoratedLinkService = '/test/';
            Env.constants.decoratedLinkHost = '';
         });
         afterEach(function() {
            Env.constants.decoratedLinkService = decoratedLinkService;
            Env.constants.decoratedLinkHost = decoratedLinkHost;
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
            var json = ['p', { title: '"&lt;<>' }, '&gt;&lt;><&#39;&#'];
            var vdomTemplate = template({ _options: { 'value': json } }, {}, undefined, true);
            equalsHtml(decorator.Converter.jsonToHtml(json), '<div><p title="&quot;&amp;lt;&lt;&gt;">&amp;gt;&amp;lt;&gt;&lt;&amp;#39;&amp;#</p></div>');
            assert.equal(vdomTemplate[0].children[0].children[0].children, '&gt;&lt;><&#39;&#');
            assert.equal(vdomTemplate[0].children[0].hprops.attributes.title, '"&lt;<>');
         });
         it('without escape', () => {
            const json = ['p', {style: 'background: url("source.com/param1=1&param2=2");'}];
            equalsHtml(decorator.Converter.jsonToHtml(json), `<div><p style="background: url("source.com/param1=1&param2=2");"></p></div>`)
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
                  ['p',
                     ['a', { href: 'tel:+78142332211', rel: 'nofollow' }, '+7(814)-233-22-11']
                  ],
                  ['p',
                     ['a', { href: 'viber://pa?chatURI=aliceinsbiswonderland', rel: 'noreferrer noopener', target: '_blank' }, 'viber://pa?chatURI=aliceinsbiswonderland']
                  ]
               ],
               goodHtml = '<div>' +
                  '<p></p>' +
                  '<p>click me</p>' +
                  '<p><iframe name="javascript:alert(123)"></iframe></p>' +
                  '<p><a name="javascript:alert(123)">xss</a></p>' +
                  '<p><a>leading spaces</a></p>' +
                  '<p><a>upper and lower case</a></p>' +
                  '<p><iframe>base64 alert</iframe></p>' +
                  '<p><a href="tel:+78142332211" rel="nofollow">+7(814)-233-22-11</a></p>' +
                  '<p><a href="viber://pa?chatURI=aliceinsbiswonderland" rel="noreferrer noopener" target="_blank">viber://pa?chatURI=aliceinsbiswonderland</a></p>' +
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
                        ],
                        ['bdi', 'Test bdi'],
                        ['dialog', 'Test dialog'],
                        ['mark', 'Test mark'],
                        ['meter', 'Test meter'],
                        ['progress', 'Test progress'],
                        ['ruby',
                           ['rp', 'Test rp'],
                           ['rt', 'Test rt']
                        ],
                        ['details', ['summary', 'Test summary']],
                        ['wbr'],
                        ['datalist', ['option', 'Test option']],
                        ['select', ['option', 'Test option']],
                        ['keygen'],
                        ['output', 'Test output'],
                        ['audio', ['track', {src: '/testAudio.mp3'} ]],
                        ['video', ['track', {src: '/testVideo.mp4'} ]]
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
               '<head><title>Test title</title><link href="/resources/WS.Core/css/core-min.css" rel="stylesheet" /></head>' +
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
               '<font color="red" face="verdana" size="5">Test font</font>' +
               '<blockquote cite="http://www.worldwildlife.org/who/index.html"><div>Test block quote</div></blockquote>' +
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
               '<bdi>Test bdi</bdi>' +
               '<dialog>Test dialog</dialog>' +
               '<mark>Test mark</mark>' +
               '<meter>Test meter</meter>' +
               '<progress>Test progress</progress>' +
               '<ruby><rp>Test rp</rp><rt>Test rt</rt></ruby>' +
               '<details><summary>Test summary</summary></details>' +
               '<wbr />' +
               '<datalist><option>Test option</option></datalist>' +
               '<select><option>Test option</option></select>' +
               '<keygen />' +
               '<output>Test output</output>' +
               '<audio><track src="/testAudio.mp3" /></audio>' +
               '<video><track src="/testVideo.mp4" /></video>' +
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

         it('long link', () => {
            const goodStr = 'https://ya.ru/' + 'a'.repeat(500);
            const parentNode = ['p', goodStr];
            const checkStr = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.equal(goodStr, checkStr);
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

         it('with emoji and protocol', function() {
            var parentNode = ['p', 'https://ya.ru/😊'];
            var goodResultNode = [[],
               ['a',
                  {
                     'class': 'asLink',
                     rel: 'noreferrer noopener',
                     href: 'https://ya.ru/',
                     target: '_blank'
                  },
                  'https://ya.ru/'
               ],
               '😊'
            ];
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });

         it('with emoji and without protocol', function() {
            var parentNode = ['p', 'vk.com/😊'];
            var goodResultNode = [[],
               ['a',
                  {
                     'class': 'asLink',
                     rel: 'noreferrer noopener',
                     href: 'http://vk.com/',
                     target: '_blank'
                  },
                  'vk.com/'
               ],
               '😊'
            ];
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
            var parentNode = ['p', 'sm.body@tensor.ru'];
            var goodResultNode = [[], ['a',
               {
                  href: 'mailto:sm.body@tensor.ru'
               },
               'sm.body@tensor.ru'
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
            var parentNode = ['p', 'text(sm.body@tensor.ru)text'];
            var goodResultNode = [[], 'text(', ['a',
               {
                  href: 'mailto:sm.body@tensor.ru'
               },
               'sm.body@tensor.ru'
            ], ')text'];
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });

         it('email with wrong domain', function() {
            var parentNode = ['p', 'sm.body@tensor.rux'];
            var goodResultNode = 'sm.body@tensor.rux';
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });

         it('email with an emoji', function() {
            var parentNode = ['p', 'sm.body@tensor😊.ru'];
            var goodResultNode = 'sm.body@tensor😊.ru';
            var checkResultNode = linkDecorateUtils.wrapLinksInString(parentNode[1], parentNode);
            assert.deepEqual(goodResultNode, checkResultNode);
         });
      });

      describe('needDecorate', function() {
         beforeEach(function() {
            decoratedLinkService = Env.constants.decoratedLinkService;
            decoratedLinkHost = Env.constants.decoratedLinkHost;
            Env.constants.decoratedLinkService = '/test/';
            Env.constants.decoratedLinkHost = '';
            linkDecorateUtils.clearNeedDecorateGlobals();
         });
         afterEach(function() {
            Env.constants.decoratedLinkService = decoratedLinkService;
            Env.constants.decoratedLinkHost = decoratedLinkHost;
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
         it('link href starts from "viber://"', function() {
            var parentNode = ['p', ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'viber://pa?chatURI=aliceinsbiswonderland',
                  target: '_blank'
               },
               'viber://pa?chatURI=aliceinsbiswonderland'
            ]];
            assert.isFalse(linkDecorateUtils.needDecorate(parentNode[1], parentNode));
         });
         it('link href start from "sbisplugin://"', function() {
               var parentNode = ['p', ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: 'sbisplugin://Screenshot-0.0.0.0?1111|1111',
                  target: '_blank'
               },
               'sbisplugin://Screenshot-0.0.0.0?1111|1111'
            ]];
            assert.isFalse(linkDecorateUtils.needDecorate(parentNode[1], parentNode));
         });
         it('link href starts from "data:image" (base64)', function() {
            const src = 'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAOoAAAA4CAYAAADzYmRqAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADJmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMwMTQgNzkuMTU2Nzk3LCAyMDE0LzA4LzIwLTA5OjUzOjAyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo4MEIwRUE3NjMxMTQxMUU1QjIwNDg3Mjg2Rjc1RjZFMyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo4MEIwRUE3NTMxMTQxMUU1QjIwNDg3Mjg2Rjc1RjZFMyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNCAoV2luZG93cykiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoyQjQ1QkEwREVGMzYxMUU0QUFFRUUyQzJGOTE1ODI3OCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoyQjQ1QkEwRUVGMzYxMUU0QUFFRUUyQzJGOTE1ODI3OCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRG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';
            var parentNode = ['p', ['img',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: src,
                  target: '_blank'  
               },
               src
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

         it('need decorate uncoded href', function() {
            var href = 'https://pre-test-online.sbis.ru/call/user/любитель_взг/';
            var parentNode = ['div', ['a',
               {
                  'class': 'asLink',
                  rel: 'noreferrer noopener',
                  href: decodeURI(href),
                  target: '_blank'
               },
               href
            ]];
            assert.ok(linkDecorateUtils.needDecorate(parentNode[1], parentNode));
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
            decoratedLinkHost = Env.constants.decoratedLinkHost;
            Env.constants.decoratedLinkService = '/test/';
            Env.constants.decoratedLinkHost = '';
            linkDecorateUtils.clearNeedDecorateGlobals();
         });
         afterEach(function() {
            Env.constants.decoratedLinkService = decoratedLinkService;
            Env.constants.decoratedLinkHost = decoratedLinkHost;
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
});
