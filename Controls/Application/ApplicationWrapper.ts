import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/Application/ApplicationWrapper';
import {constants} from 'Env/Env';
import 'css!Controls/application';
import 'css!Controls/Application/ApplicationWrapper';

export = class ApplicationWrapper extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;
   protected _version: string;
   protected headJson: unknown;

   protected _beforeMount(): void {
      this.headJson = [
         ['link',
            {
               rel: 'stylesheet',
               type: 'text/css',
               href: '/materials/resources/SBIS3.CONTROLS/themes/online/online.css'
            }
         ]
      ];

      if (constants.isBrowserPlatform) {
         this._version = ApplicationWrapper._calculateVersion(window.location.search);
      }
   }

   private static _calculateVersion(search: string): string {
      const matchVersion = search.match(/(^\?|&)x_version=(.*)/);
      return matchVersion && matchVersion[2];
   }
};
