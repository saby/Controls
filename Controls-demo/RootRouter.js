/**
 * Created by kraynovdo on 25.01.2018.
 */
define('Controls-demo/RootRouter', [
   'UI/Base',
   'wml!Controls-demo/RootRouter',
   'Application/Initializer',
   'Application/Env',
   'Core/Deferred'
], function(Base,
   template,
   AppInit,
   AppEnv,
   Deferred) {
   'use strict';

   var ModuleClass = Base.Control.extend(
      {
         _template: template,
         isReloading: false,
         pathName: 'Controls-demo/app/Controls-demo%2FIndexOld',
         sourceUrl: null,
         reload: function() {
            this.isReloading = true;
         },
         reloadDemo: function() {
            this.reload();
            // При обновлении демки сбрасываем все что лежит в settingsController (задается на application);
            window.localStorage.setItem('controlSettingsStorage', '{}');
         },
         _beforeMount: function(options, context, receivedState) {
            var _state = {
               sourceUrl: (receivedState && receivedState.sourceUrl) || options.sourceUrl
            };
            this.sourceUrl = _state.sourceUrl;
            return new Deferred().callback(_state);
         },

         _afterMount: function() {
            window.reloadDemo = this.reloadDemo.bind(this);
         },

         _afterUpdate: function() {
            this.isReloading = false;
         },

         _isMenuButtonVisible: function() {
            var location = this._getLocation();
            if (location) {
               return location.pathname !== this._options.appRoot + this.pathName;
            }
            return null;
         },

         backClickHdl: function() {
            window.history.back();
         },

         goHomeHandler: function() {
            window.location = this._options.appRoot + this.pathName;
         },
         _getLocation: function() {
            if (AppInit.isInit()) {
               return AppEnv.location;
            } if (typeof window !== 'undefined') {
               return window.location;
            }
            return null;
         }
      }
   );

   ModuleClass._styles = ['Controls-demo/RootRouter'];

   return ModuleClass;
});
