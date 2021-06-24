import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import { AppData } from 'UI/State';
import * as template from 'wml!Controls/Application/Core';
import {setStore, getStore} from 'Application/Env';
import {getThemeController} from 'UI/theme/controller';
import { HeadData } from 'UI/Base';

export = class Core extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;
   protected ctxData: object;
   private _application: string;
   private _applicationForChange: string;

   coreTheme: string = '';

   constructor(cfg) {
      super(cfg);
      try {
         /* TODO: set to presentation service */
         process.domain.req.compatible = false;
      } catch (e) {
      }

      const headData = new HeadData([], true);

      // Временно положим это в HeadData, потом это переедет в константы реквеста
      // Если запуск страницы начинается с Controls/Application/Core, значит мы находимся в новом окружении
      headData.isNewEnvironment = true;
      setStore('HeadData', headData);

      AppData.initAppData(cfg);
      this.ctxData = new AppData.getAppData();

      // Put Application/Core instance into the current request where
      // other modules can get it from
      setStore('CoreInstance', { instance: this });
   }

   protected _beforeMount(cfg): void {
      this._application = cfg.application;
   }
   protected _beforeUpdate(cfg): void {
      if (this._applicationForChange) {
         this._application = this._applicationForChange;
         this._applicationForChange = null;
      } else {
         this._application = cfg.application;
      }
   }

   setTheme(ev, theme): void {
      this.coreTheme = theme;
      getThemeController().setTheme(theme).catch((e) => {
         require(['UI/Utils'], (Utils) => {
            Utils.Logger.error(e.message);
         });
      });
   }
   changeApplicationHandler(e, app): boolean {
      let result: boolean;
      if (this._application !== app) {
         this._applicationForChange = app;
         const headData = getStore('HeadData');
         headData?.resetRenderDeferred();
         this._forceUpdate();
         result = true;
      } else {
         result = false;
      }
      return result;
   }
};
