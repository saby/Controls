import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/dateRange/ButtonsController/ButtonsController';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _startValue1: Date = new Date(2021, 0, 1);
    protected _endValue1: Date = new Date(2021, 0, 31);
    protected _startValue2: Date = new Date(2021, 0, 1);
    protected _endValue2: Date = new Date(2021, 0, 31);
    protected _startValue3: Date = new Date(2021, 0, 1);
    protected _endValue3: Date = new Date(2021, 0, 31);

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
