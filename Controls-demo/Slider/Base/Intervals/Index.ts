import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls-demo/Slider/Base/Intervals/Template');

class Base extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _intervals: unknown;
    protected _value: number;

    protected _beforeMount(): void {
        this._value = 30;
        this._intervals = [{
            start: 0,
            end: 10,
            color: 'primary'
        }, {
            start: 30,
            end: 70,
            color: 'danger'
        }];
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Base;
