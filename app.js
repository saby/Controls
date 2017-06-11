'use strict';
var express = require('express'),
    path = require('path'),
    https = require('https'),
    cookieParser = require('cookie-parser'),
    fs = require('fs'),
    spawn = require('child_process').spawn,
    bodyParser = require('body-parser'),
    app = express();


//Run testing server
require('./test-server');

app.use(bodyParser.json());
app.use(cookieParser())
app.use(express.static(path.resolve(__dirname)));

var port = process.env.PORT || 666;
app.listen(port);

console.log('app available on port ' + port);
console.log('collecting deps...');

var collectDeps = spawn('node', ['depencyCollector']);

collectDeps.stdout.pipe(process.stdout);
collectDeps.stderr.pipe(process.stderr);
collectDeps.on('close', function(code) {
    console.log('deps collected successfuly');
});

// Кошерный редирект на CDN, который РАБОТАЕТ
app.get('/cdn*', function(req, res) {
  res.redirect('https://test-inside.tensor.ru' + req.url);
});

app.post('/theme-preview/get-theme/', function(req, res)  {
  req.on('data', function(data) {
        var themeName = JSON.parse(data.toString()).name;
        if (!themeName) {
            res.send('err occured');
        }
        fs.readFile(process.cwd() + '/themes/' + themeName + '/variables.less', function(err, data) {
            res.send(data);
        });
    });
});

app.post('/theme-preview/apply-theme/', function(req, res)  {
    req.on('data', function(data) {
        var themeName = JSON.parse(data.toString()).themeName;
        var newRules = JSON.parse(data.toString()).rules;
        var variablesPath = process.cwd() +  '/themes/online/variables.less';
        fs.readFile(variablesPath, function(err, data) {
            var stringData = data.toString();
            for (var i in newRules) {
                var reg = new RegExp('@' + i + ':\\s+\\S+');
                stringData = stringData.replace(reg, '@' + i + ':      ' + newRules[i] + ';');
            };
            fs.writeFile(variablesPath, stringData, function(err) {
                if (err) {
                    console.error(err);
                }
                var grunt = spawn('grunt', ['css', '--theme=online']);
                grunt.stdout.pipe(process.stdout);
                grunt.stderr.pipe(process.stderr);
                grunt.on('close', function(code) {
                    console.log('child process exited with code: ' +  code);
                    res.send('фсё')
                });
            })
        });
    })
})





// Простой прокси для перенаправления запросов от демо к сервисам Sbis.ru
var simpleProxy = function (proxyParams, req, res) {
   var subReq = function (args, content, onResult) {
      args.host = proxyParams.host;
      args.hostname = proxyParams.host;
      args.port = req.port || 443;
      args.headers = args.headers || {};
      args.headers.host = proxyParams.host;
      args.headers.origin = 'https://' + proxyParams.host;
      args.headers.referer = 'https://' + proxyParams.host + '/';
      args.headers['x-requested-with'] = 'XMLHttpRequest';
      var data;
      if (content && typeof content === 'object' && Object.keys(content).length) {
         data = new Buffer(JSON.stringify(content));
         args.headers['content-type'] = 'application/json; charset=UTF-8';
         args.headers['content-length'] = data.length;
      }
      var rq = https.request(
         args,
         function (rs) {
            rs.on('data', function (data) {
                  onResult.call(null, rs.statusCode, rs.headers, data);
               }
            );
         });
      rq.on('error', function (err) {
         console.error('Subrequest error: ' + err);
         res.sendStatus(500);
      });
      rq.end(data);
   };

   var pass = function (cookies, setCookies) {
      subReq(
         {
            method: req.method,
            path: req.route.path.charAt(req.route.path.length - 1) === '/' && req.path.charAt(req.path.length - 1) !== '/' ? req.path + '/' : req.path,
            headers: Object.assign({}, req.headers, {
               cookie: Object.keys(cookies).map(function (n) { return n + '=' + cookies[n]; }).join('; ')
            })
         },
         req.body || null,
         function (status, headers, data) {
            if (setCookies) {
               var list = headers['set-cookie'] = headers['set-cookie'] || [];
               for (var i = 0; i < setCookies.length; i++) {
                  list.push(setCookies[i]);
               }
            }
            res.set(headers);
            res.status(status).send(data);
         }
      );
   };

   var cookies = proxyParams.cookies.reduce(function (acc, n) { var k = proxyParams.host + '-' + n; if (req.cookies[k]) { acc[n] = req.cookies[k]; } return acc;
   }, {});
   if (Object.keys(cookies).length === proxyParams.cookies.length) {
      pass(cookies);
      return;
   }
   subReq(
      {
         method: 'POST',
         path: '/auth/service/sbis-rpc-service300.dll',
         headers: Object.assign({}, req.headers, {
            cookie: '',
            'x-calledmethod': 'SAP.Authenticate',
            'x-originalmethodname': '0KHQkNCfLkF1dGhlbnRpY2F0ZQ=='
         })
      },
      {"jsonrpc":"2.0","protocol":4,"method":"САП.Authenticate","params":{"data":{"s":[{"t":"Строка","n":"login"},{"t":"Строка","n":"password"},{"t":"Строка","n":"machine_name"},{"t":"Строка","n":"machine_id"},{"t":"Логическое","n":"license_extended"},{"t":"Строка","n":"license_session_id"},{"t":"Логическое","n":"stranger"},{"t":"Логическое","n":"from_browser"}],"d":[proxyParams.user,proxyParams.password,process.env.COMPUTERNAME,null,false,null,false,true],"_mustRevive":true,"_type":"record"}},"id":1},
      function (status, headers, data) {
         var lines = [];
         var cookies = {};
         var re = /[\s]*(domain=[a-z0-9\-\.]*|secure|httponly);/gi;
         if (status === 200 && 'set-cookie' in headers) {
            for (var i = 0, ks = headers['set-cookie']; i < ks.length; i++) {
               var line = ks[i].replace(re, '');
               var j = line.indexOf('=');
               var n = line.substring(0, j);
               if (proxyParams.cookies.indexOf(n) !== -1) {
                  lines.push(line, proxyParams.host + '-' + line);
                  cookies[n] = line.substring(j + 1, line.indexOf(';', j + 1));
               }
            }
         }
         if (Object.keys(cookies).length === proxyParams.cookies.length) {
            pass(cookies, lines);
         }
         else {
            res.sendStatus(401);
         }
      }
   );
};



// Параметры, куда и как перенаправлять запросы
var PROXY_PARAMS = {
   host: 'test-online.sbis.ru',
   user: 'Демо',
   password: 'Демо123',
   cookies: ['sid', 's3su', 'CpsUserId', 'did', 's3tok-d1b2']
};

// Проксировать запросы по указанным роутам
app.get('/!hash/', simpleProxy.bind(null, PROXY_PARAMS));
app.post('/long-requests/service/', simpleProxy.bind(null, PROXY_PARAMS));
