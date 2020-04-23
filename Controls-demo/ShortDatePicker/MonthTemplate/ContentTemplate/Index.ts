import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require("wml!Controls-demo/ShortDatePicker/MonthTemplate/ContentTemplate/ContentTemplate");
import {date as formatDate} from "Types/formatter";

class DemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];

    private _formatMonth(date: Date): string {
        return date ? formatDate(date, formatDate.FULL_MONTH) : '';
    }
}

export default DemoControl;
