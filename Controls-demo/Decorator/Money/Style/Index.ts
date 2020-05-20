import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Decorator/Money/Style/Style');

class Style extends Control<IControlOptions> {
    protected _value = '123.45';
    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes', 'Controls/list'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Style;
