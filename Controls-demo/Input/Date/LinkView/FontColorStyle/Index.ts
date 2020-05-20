import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/Date/LinkView/FontColorStyle/Template');

class FontColorStyle extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    private _startValue: Date = new Date(2017, 0, 1);
    private _endValue: Date = new Date(2017, 0, 31);

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Input/Date/LinkView/FontColorStyle/Style'];
}

export default FontColorStyle;
