define('Controls/Application/HeadDataContext', [
   'Core/DataContext',
   'Core/Deferred',
   'Core/cookie',
   'View/Logger'
], function(DataContext, Deferred, cookie, Logger) {

   var DEPTYPES = {
      BUNDLE: 1,
      SINGLE: 2
   };


   var bundles;
   try {
      bundles = require('json!WS.Core/ext/requirejs/bundlesRoute');
   } catch (e) {
      bundles = {};
   }

   var modDeps;
   try {
      modDeps = require('json!resources/module-dependencies');
   } catch (e) {
      modDeps = {links: {}, nodes: {}};
   }

   var contents;
   try {
      contents = require('json!resources/contents');
   } catch (e) {
      contents = {};
   }

   function isJs(key) {
      return key.split('!')[0] === key;
   }

   function isCss(key) {
      var keySplitted = key.split('!');
      return keySplitted[0] === 'css' && keySplitted.length > 1;
   }

   function isTmpl(key) {
      var keySplitted = key.split('!');
      return keySplitted[0] === 'tmpl' && keySplitted.length > 1;
   }

   function fixLinkSlash(link) {
      if (link.indexOf('/') !== 0) {
         return '/' + link;
      } else {
         return link;
      }
   }

   /**
    * Checks if dependency is a part of any bundle and remove from allDeps
    * @param allDeps
    * @returns {{}} Object, that contains all necessary bundles
    */
   function getPackages(allDeps) {
      var packages = {};
      for (var key in allDeps) {
         if (allDeps.hasOwnProperty(key)) {
            var bundleName = bundles[key];
            if (bundleName) {
               Logger.log('Custom packets logs', ['Module ' + key + ' in bundle ' + bundleName]);
               delete allDeps[key];
               packages[fixLinkSlash(bundleName)] = DEPTYPES.BUNDLE;
            }
         }
      }

      for (var key in allDeps) {
         if (allDeps.hasOwnProperty(key)) {
            if (modDeps.nodes[key]) {
               if (isJs(key) || isCss(key) || isTmpl(key)) {
                  packages[fixLinkSlash(modDeps.nodes[key].path)] = DEPTYPES.SINGLE;
               }
            }
         }
      }
      return packages;
   }

   function collectDependencies(deps, callback, buildNumber) {
      function recursiveWalker(allDeps, curNodeDeps) {
         if (curNodeDeps && curNodeDeps.length) {
            for (var i = 0; i < curNodeDeps.length; i++) {
               var node = curNodeDeps[i];
               var splitted = node.split('!');
               if (splitted[0] === 'optional' && splitted.length > 1) {
                  splitted.shift();
                  node = splitted.join('!');
               }
               if (!allDeps[node]) {
                  var nodeDeps = modDeps.links[node];
                  allDeps[node] = true;
                  recursiveWalker(allDeps, nodeDeps);
               }
            }
         }
      }

      var allDeps = {};
      recursiveWalker(allDeps, deps);
      var files = {js: [], css: []};
      if (cookie.get('s3debug') !== 'true' && contents.buildMode !== 'debug') {
         var packages = getPackages(allDeps); // Find all bundles, and removes dependencies that are included in bundles
         for (var key in packages) {
            if (packages.hasOwnProperty(key)) {
               if (key.slice(key.length - 3, key.length) === 'css') {
                  files.css.push(addBuildNumber(key, buildNumber));
                  var corrJs = key.replace(/.css$/, '.js');
                  if (!packages[corrJs] && packages[key] === DEPTYPES.BUNDLE) {
                     files.js.push(addBuildNumber(corrJs, buildNumber));
                  }
               } else if (key.slice(key.length - 2, key.length) === 'js') {
                  files.js.push(addBuildNumber(key, buildNumber));
               } else if (key.slice(key.length - 4, key.length) === 'tmpl') {
                  files.js.push(addBuildNumber(key, buildNumber));
               }
            }
         }
      }
      return callback(undefined, files);
   }

   function addBuildNumber(link, buildNumber) {
      if (buildNumber) {
         return link.replace(/\.(css|js|tmpl)$/, '.v' + buildNumber + '$&');
      } else {
         return link;
      }
   }

   return DataContext.extend({
      pushDepComponent: function(componentName) {
         this.depComponentsMap[componentName] = true;
      },
      addReceivedState: function(key, receivedState) {
         this.receivedStateArr[key] = receivedState;
      },
      pushWaiterDeferred: function(def) {
         var self = this;
         this.waiterDef = def;
         this.waiterDef.addCallback(function() {
            var components = Object.keys(self.depComponentsMap);
            collectDependencies(components, function(err, files) {
               if (err) {
                  self.err = err;
                  return;
               } else {
                  self.jsLinks = files.js;
                  self.cssLinks = files.css;
               }

               self.defRender.callback({
                  jsLinks: self.jsLinks || [],
                  cssLinks: self.cssLinks || [],
                  errorState: self.err,
                  receivedStateArr: self.receivedStateArr
               });
            }, self.buildNumber);
         });
      },
      constructor: function(theme, buildNumber) {
         this.theme = theme;
         this.defRender = new Deferred();
         this.depComponentsMap = {};
         this.receivedStateArr = {};
         this.buildNumber = buildNumber;
      },
      waitAppContent: function() {
         return this.defRender;
      }
   });
});
