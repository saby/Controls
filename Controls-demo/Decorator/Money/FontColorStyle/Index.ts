import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Decorator/Money/FontColorStyle/FontColorStyle');

class FontColorStyle extends Control<IControlOptions> {
    private _value: string = '123.45';
    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];

    static _theme: string[] = ['Controls/Classes'];
}

export default FontColorStyle;
