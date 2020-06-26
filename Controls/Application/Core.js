/**
 * Created by dv.zuev on 01.02.2018.
 */
define('Controls/Application/Core',
   [
      'Core/Control',
      'wml!Controls/Application/Core',
      'Application/Initializer',
      'Application/Env',
      'Controls/Application/StateReceiver',
      'UI/theme/controller',
      'UI/Base',
      'Controls/Application/HeadData',
      'native-css',
      'Core/css-resolve'
   ],
   function(Control,
      template,
      AppInit,
      AppEnv,
      StateReceiver,
      controller,
      UIBase,
      HeadData) {
      'use strict';
      /* eslint-disable */
      var AppCore = Control.extend({
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

            // __hasRequest - для совместимости, пока не смержено WS. Нужно чтобы работало
            // и так и сяк
            if (!AppInit.isInit()) {
               var stateReceiverInst = new StateReceiver();
               AppInit.default(cfg, void 0, stateReceiverInst);

               if (typeof window === 'undefined' || window.__hasRequest === undefined) {
                  // need create request for SSR
                  // on client request will create in app-init.js
                  if (typeof window !== 'undefined' && window.receivedStates) {
                     stateReceiverInst.deserialize(window.receivedStates);
                  }
               }
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
