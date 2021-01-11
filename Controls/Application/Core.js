/**
 * Created by dv.zuev on 01.02.2018.
 */
define('Controls/Application/Core',
   [
      
      'wml!Controls/Application/Core',
      'Application/Env',
      'UI/theme/controller',
      'UI/Base',
      'Controls/Application/HeadData'
   ],
   function(
      template,
      AppEnv,
      controller,
      UIBase,
      HeadData) {
      'use strict';
      /* eslint-disable */
      var AppCore = UIBase.Control.extend({
         _template: template,
         ctxData: null,
         _beforeMount: function(cfg) {
            this._application = cfg.application;
         },
         _beforeUpdate: function(cfg) {
            if (this._applicationForChange) {
               this._application = this._applicationForChange;
               this._applicationForChange = null;
            } else {
               this._application = cfg.application;
            }
         },
         constructor: function(cfg) {
            try {
               /* TODO: set to presentation service */
               process.domain.req.compatible = false;
            } catch (e) {
            }

            var headData = new HeadData([], true);

            // Временно положим это в HeadData, потом это переедет в константы реквеста
            // Если запуск страницы начинается с Controls/Application/Core, значит мы находимся в новом окружении
            headData.isNewEnvironment = true;
            AppEnv.setStore('HeadData', headData);

            AppCore.superclass.constructor.apply(this, arguments);

            UIBase.AppData.initAppData(cfg);
            this.ctxData = new UIBase.AppData.getAppData();

            // Put Application/Core instance into the current request where
            // other modules can get it from
            AppEnv.setStore('CoreInstance', { instance: this });
         },
         coreTheme: '',
         setTheme: function(ev, theme) {
            this.coreTheme = theme;
            controller.getThemeController().setTheme(theme).catch(function (e) {
               require(['UI/Utils'], function (Utils) {
                  Utils.Logger.error(e.message);
               });
            });
         },
         changeApplicationHandler: function(e, app) {
            var result;
            if (this._application !== app) {
               this._applicationForChange = app;
               var headData = AppEnv.getStore('HeadData');
               headData && headData.resetRenderDeferred();
               this._forceUpdate();
               result = true;
            } else {
               result = false;
            }
            return result;
         }

      });
      /* eslint-enable */

      return AppCore;
   });
