import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls-demo/Slider/Range/Precision/Template');

class Precision extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _startValue: number;
    protected _endValue: number;

    protected _beforeMount(): void {
        this._startValue = 40;
        this._endValue = 60;
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Precision;
