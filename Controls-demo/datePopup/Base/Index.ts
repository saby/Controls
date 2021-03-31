import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/datePopup/Base/Base';

export default class extends Control {
    protected _template: TemplateFunction = template;
    protected _startValue: Date = new Date(2019, 4, 3);
    protected _endValue: Date = new Date(2019, 5, 0);
    protected _date: Date = new Date(2021, 0, 27);
}
