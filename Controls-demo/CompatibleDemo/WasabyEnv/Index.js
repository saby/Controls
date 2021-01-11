define('Controls-demo/CompatibleDemo/WasabyEnv/Index', [
   'UI/Base',
   'wml!Controls-demo/CompatibleDemo/WasabyEnv/Index',
   'Application/Initializer',
   'Application/Env',
   'Core/Deferred'
], function(Base, template, AppInit, AppEnv, Deferred) {
   'use strict';

   var ModuleClass = Base.Control.extend(
      {
         _template: template,
         _beforeMount: function() {
            this._title = this._getTitle();
            this._settigsController = {
               getSettings: function(ids) {
                  var storage = {};
                  storage[ids[0]] = 1000;
                  if (ids[0] === 'master111') {
                     storage[ids[0]] = 300;
                  }
                  return (new Deferred()).callback(storage);
               },
            };
         },
         _getTitle: function() {
            var location = this._getLocation();
            if (location) {
               var splitter = '%2F';
               var index = location.pathname.lastIndexOf(splitter);
               if (index > -1) {
                  var splittedName = location.pathname.slice(index + splitter.length)
                     .split('/');
                  var controlName = splittedName[0];
                  return this._replaceLastChar(controlName);
               }
            }
            return 'Wasaby';
         },
         _replaceLastChar: function(controlName) {
            if (controlName[controlName.length - 1] === '/') {
               return controlName.slice(0, -1);
            }
            return controlName;
         },
         _getLocation: function() {
            if (AppInit.isInit()) {
               return AppEnv.location;
            } if (typeof window !== 'undefined') {
               return window.location;
            }
            return null;
         },
         goHomeHandler: function() {
            window.location = "/Controls-demo%2FCompatibleDemo%2FWasabyEnv%2FDemo";
         }
      }
   );

   return ModuleClass;
});
