import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls-demo/Slider/Base/ScaleStep/Template');

class ScaleStep extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _value: number;

    protected _beforeMount(): void {
        this._value = 30;
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default ScaleStep;
