import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/Input/Date/Range');

class Range extends Control<IControlOptions> {
   protected _template: TemplateFunction = template;
   static _theme: string[] = ['Controls/Classes'];
   protected _startDate: Date =  new Date(2017, 0, 1, 12, 15, 30, 123);
   protected _endDate: Date =  new Date(2017, 0, 2, 12, 15, 30, 123);

   protected _afterMount(): void {
        this._children.input0.activate();
   }
   protected _masks: Array<string> = [
       'DD.MM.YY',
       'DD.MM.YYYY'
       ];

   static _styles: string[] = ['Controls-demo/Input/Date/Range'];
}
export default Range;
