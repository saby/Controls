/**
 * Created by kraynovdo on 25.01.2018.
 */
import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import { Controller, MaskResolver  } from 'Router/router';

import * as template from 'wml!Controls-demo/IndexOld';
import 'css!Controls-demo/IndexOld';

export default class ModuleClass extends Control<IControlOptions> {
   protected _urlToGo: string;
   protected _template: TemplateFunction = template;
   protected _successfullyMounted: boolean;

   protected _afterMount(options?: IControlOptions, contexts?: any): void {
      this._successfullyMounted = true;
      this._forceUpdate();
   }

   /**
    * Переход к относительному URL из строки в верхней части разводящей, чтобы не рисовать всякий раз "%2F" вместо "/"
    * @private
    */
   protected _openRelativePath(): void {
      const url = MaskResolver.calculateHref('Controls-demo/app/:app', {app: this._urlToGo});
      Controller.navigate({ state: url });
   }
}
