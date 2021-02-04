import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/dateRange/Input/dateRangeInput';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _date: Date = new Date(2021, 0, 27);

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
