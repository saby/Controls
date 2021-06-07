import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls-demo/Slider/Range/TooltipVisible/Template');

class TooltipVisible extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _startValue: number;
    protected _endValue: number;
    protected _startValue2: number;
    protected _endValu2e: number;

    protected _beforeMount(): void {
        this._startValue = 40;
        this._endValue = 60;
        this._startValue2 = 50;
        this._endValu2e = 60;
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default TooltipVisible;
