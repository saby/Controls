import {Control, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/dateRange/WeekdayFormatter/WeekdayFormatter');

class DemoControl extends Control {
    protected _template: TemplateFunction = template;
    protected _value: Date = new Date(2021, 1, 1);

    protected _changeDate(event: Event, delta: number): void {
        this._value = new Date(this._value.getFullYear(), this._value.getMonth(), this._value.getDay() + delta);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default DemoControl;
