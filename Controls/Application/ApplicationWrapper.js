define('Controls/Application/ApplicationWrapper', [
   'UI/Base',
   'Env/Env',
   'wml!Controls/Application/ApplicationWrapper'
], function(Base, Env, template) {
   'use strict';

   var _private = {

      /**
       * @param {Location.search} search
       * @return {String|null}
       */
      calculateVersion: function(search) {
         var matchVersion = search.match(/(^\?|&)x_version=(.*)/);

         return matchVersion && matchVersion[2];
      }
   };

   var ModuleClass = Base.Control.extend({
      _template: template,

      _version: null,

      headJson: null,

      _beforeMount: function() {
         this.headJson = [
            ['link',
               {
                  rel: 'stylesheet',
                  type: 'text/css',
                  href: '/materials/resources/SBIS3.CONTROLS/themes/online/online.css'
               }
            ]
         ];

         /* eslint-disable */
         if (Env.constants.isBrowserPlatform) {
            this._version = _private.calculateVersion(window.location.search);
         }
         /* eslint-enable */
      }
   });
   ModuleClass._theme = ['Controls/application'];
   return ModuleClass;
});
