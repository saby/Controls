import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls-demo/Slider/Base/ScaleLabelFormatter/Template');

class Base extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _value: number;

    protected _beforeMount(): void {
        this._value = 30;
    }

    protected _scaleLabelFormatter(value: number): string {
        return `${value}%`;
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Base;
