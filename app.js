const global = (function() {
   return this || (0, eval)('this');
})();

// for test in ci. do not merge!!!

const root = process.cwd();
const fs = require('fs');
const path = require('path');

const hasPathToResources = process.argv[2] && process.argv[2].includes('--applicationRoot=');
const pathToResources = hasPathToResources ? process.argv[2].replace('--applicationRoot=', '') : 'application';

const requirejs = require(path.join('saby-units', 'lib', 'requirejs', 'r.js'));
global.requirejs = requirejs;

// Configuring requirejs]
global.wsConfig = {};
wsConfig.versioning = false;
const createConfig = require(path.join(root, pathToResources, 'WS.Core', 'ext', 'requirejs', 'config.js'));
const config = createConfig(
   path.join(root, pathToResources),
   path.join(root, pathToResources, 'WS.Core'),
   path.join(root, pathToResources)
);
requirejs.config(config);

/**
 * Look ma, it cp -R.
 * @param {string} src The path to the thing to copy.
 * @param {string} dest The path to the new copy.
 */
function copyRecursiveSync(src, dest) {
   const exists = fs.existsSync(src);
   const stats = exists && fs.statSync(src);
   const isDirectory = exists && stats.isDirectory();

   if (exists && isDirectory) {
      if (!fs.existsSync(dest)) {
         fs.mkdirSync(dest);
      }

      fs.readdirSync(src).forEach(function(childItemName) {
         copyRecursiveSync(
            path.join(src, childItemName),
            path.join(dest, childItemName)
         );
      });
   } else if (!fs.existsSync(dest)) {
      fs.linkSync(src, dest);
   }
}

function initEnv(req) {
   var Env = require('Env/Env');
   Env.constants.resourceRoot = '/';
   require(path.join(root, pathToResources, 'contents'));
   Env.constants.modules = contents.modules;
}


const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const serveStatic = require('serve-static');
const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use('/', serveStatic(pathToResources));


const port = process.env.PORT || 777;
app.listen(port);

console.log('app available on port ' + port);

global.require = global.requirejs = require = requirejs;

console.log('start init');
require(['Core/core-init'], function(){
   initEnv();
   console.log('core init success');
}, function(err){
   console.log(err);
   console.log('core init failed');
});

/*server side render*/
app.get('/:moduleName/*', function(req, res){

   req.compatible = false;

   if (!process.domain) {
      process.domain = {
         enter: function(){},
         exit: function(){}
      };
   }

   process.domain.req = req;
   process.domain.res = res;

   const tpl = require('wml!Controls/Application/Route');

   let pathRoot = req.originalUrl.split('/');
   let cmp;
   if(!pathRoot) {
      console.error('Incorrect url. Couldn\'t resolve path to root component');
   } else {
      cmp = '';
   }
   pathRoot = pathRoot.filter(function(el) {
      return el.length > 0;
   });
   if(~pathRoot.indexOf('app')) {
      cmp = pathRoot[0] + '/Index';
   } else {
      cmp = pathRoot.join('/') + '/Index';
   }
   try {
      require(cmp);
   } catch(error){
      res.writeHead(404, {
         'Content-Type': 'text/html'
      });
      res.end('');

      return;
   }

   const html = tpl({
      lite: true,
      wsRoot: '/WS.Core/',
      resourceRoot: '/',
      application: cmp,
      appRoot: '/',
      _options: {
         preInitScript: 'window.wsConfig.debug = true;window.wsConfig.userConfigSupport = false;'
      }
   });

   if (html.addCallback) {
      html.addCallback(function(htmlres) {
         res.writeHead(200, {
            'Content-Type': 'text/html'
         });
         res.end(htmlres);
      });
   } else {
      res.writeHead(200, {
         'Content-Type': 'text/html'
      });
      res.end(html);
   }
});

// support localization
app.get('/loadConfiguration', (req, res) => {
   require(['I18n/i18n'], (i18n) => {
      const locale = req.query.locale || req.cookies.lang;

      i18n.Loader.loadConfiguration(locale).then((configuration) => {
         if (typeof req.query.v !== 'undefined') {
            res.set('Cache-Control', 'public, max-age=315360000, immutable');
         }

         res.json(configuration);
      }, (err) => {
         res.status(404).send(err);
      });
   });
});

app.get('/loadDictionary', (req, res) => {
   require(['Core/i18n/Loader'], (Loader) => {
      const module = req.query.module;
      const locale = req.query.locale || req.cookies.lang;

      Loader.default.dictionary(module, locale).then((dictionary) => {
         if (typeof req.query.v !== 'undefined') {
            res.set('Cache-Control', 'public, max-age=315360000, immutable');
         }

         res.json(dictionary);
      }, (err) => {
         res.status(404).send(err);
      });
   });
});
