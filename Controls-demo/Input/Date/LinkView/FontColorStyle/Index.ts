import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/Date/LinkView/FontColorStyle/Template');
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Input/Date/LinkView/FontColorStyle/Style';

class FontColorStyle extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    private _startValue: Date = new Date(2017, 0, 1);
    private _endValue: Date = new Date(2017, 0, 31);

    static _theme: string[] = ['Controls/Classes'];
}

export default FontColorStyle;
