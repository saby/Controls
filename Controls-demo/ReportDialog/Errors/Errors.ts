import {Control, TemplateFunction} from "UI/Base";
import * as controlTemplate from 'wml!Controls-demo/ReportDialog/Errors/Errors';
import 'css!Controls-demo/Controls-demo';

export default class extends Control {
   protected _template: TemplateFunction = controlTemplate;
   protected _errors: string[] = null;

   protected _beforeMount(): void {
      this._errors = [
          'Ошибка1: информация с описанием ошибки 1',
          'Ошибка2: информация с описанием ошибки 2',
          'Ошибка3: информация с описанием ошибки 3'
      ];
   }
}