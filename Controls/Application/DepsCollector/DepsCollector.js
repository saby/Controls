define('Controls/Application/DepsCollector/DepsCollector', [
   'View/Logger',
   'Core/helpers/getResourceUrl',
   'Core/core-extend'
], function(Logger, getResourceUrl, coreExtend) {

   var DEPTYPES = {
      BUNDLE: 1,
      SINGLE: 2
   };

   function getLinkWithAppRoot(value, appRoot) {
      if (appRoot) {
         value = appRoot + value;
         value = value.replace('//', '/');
      }
      return value;
   }

   function getLinkWithBuildNumber(link, buildnumber) {
      if (buildnumber) {
         return link.replace(/\.(css|js|tmpl)$/, '$&?x_version=' + buildnumber);
      } else {
         return link;
      }
   }

   function checkResourcesPrefix(link) {
      var path = link.split('/');
      if (path[0] === '') {
         path.shift();
      }
      if (path[0] !== 'resources') {
         path.unshift('resources');
      }
      var res = path.join('/');
      return '/' + res;
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
    * Checks if dependency is a part of any bundle and removes from allDeps
    * @param allDeps
    * @returns {{}} Object, that contains all bundles for pre-load
    */
   function getPackages(allDeps, modInfo, bundlesRoute) {
      var packages = {};
      for (var key in allDeps) {
         if (allDeps.hasOwnProperty(key)) {
            var bundleName = bundlesRoute[key];
            if (bundleName) {
               Logger.log('Custom packets logs', ['Module ' + key + ' in bundle ' + bundleName]);
               delete allDeps[key];
               packages[fixLinkSlash(bundleName)] = DEPTYPES.BUNDLE;
            }
         }
      }

      for (var key in allDeps) {
         if (allDeps.hasOwnProperty(key)) {
            if (modInfo[key]) {
               if (isJs(key) || isCss(key) || isTmpl(key)) {
                  packages[fixLinkSlash(modInfo[key].path)] = DEPTYPES.SINGLE;
               }
            }
         }
      }
      return packages;
   }

   function recursiveWalker(allDeps, curNodeDeps, modDeps) {
      if (curNodeDeps && curNodeDeps.length) {
         for (var i = 0; i < curNodeDeps.length; i++) {
            var node = curNodeDeps[i];
            var splitted = node.split('!');
            if (splitted[0] === 'optional' && splitted.length > 1) { // OPTIONAL BRANCH
               splitted.shift();
               node = splitted.join('!');
            }
            if (!allDeps[node]) { // If module can be pre-loaded BRANCH
               var nodeDeps = modDeps[node];
               allDeps[node] = true;
               recursiveWalker(allDeps, nodeDeps, modDeps);
            }
         }
      }
   }

   var DepsCollector = coreExtend.extend([], {


      /**
       * @param modDeps - object, contains all nodes of dependency tree
       * @param modInfo - contains info about path to module files
       * @param bundlesRoute - contains info about custom packets with modules
       */
      constructor: function(modDeps, modInfo, bundlesRoute, buildNumber, appRoot) {
         this.modDeps = modDeps;
         this.modInfo = modInfo;
         this.bundlesRoute = bundlesRoute;
         this.buildNumber = buildNumber;
         this.appRoot = appRoot;
      },
      collectDependencies: function(deps) {
         var files = {js: [], css: []};
         var allDeps = {};
         recursiveWalker(allDeps, deps, this.modDeps);
         var packages = getPackages(allDeps, this.modInfo, this.bundlesRoute); // Find all bundles, and removes dependencies that are included in bundles
         for (var key in packages) {
            if (packages.hasOwnProperty(key)) {
               if (key.slice(key.length - 3, key.length) === 'css') {
                  files.css.push(this.fixLink(key));
                  var corrJs = key.replace(/.css$/, '.js');
                  if (!packages[corrJs] && packages[key] === DEPTYPES.BUNDLE) {
                     files.js.push(this.fixLink(corrJs));
                  }
               } else if (key.slice(key.length - 2, key.length) === 'js') {
                  files.js.push(this.fixLink(key));
               } else if (key.slice(key.length - 4, key.length) === 'tmpl') {
                  files.js.push(this.fixLink(key));
               }
            }
         }
         return files;
      },
      fixLink: function fixLinkName(link) {
         var res = link;
         res = checkResourcesPrefix(res);
         res = getLinkWithBuildNumber(res, this.buildNumber);
         res = getLinkWithAppRoot(res, this.appRoot);
         res = getResourceUrl(res);
         return res;
      }
   });

   return DepsCollector;
});
