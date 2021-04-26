import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Decorator/Money/FontSize/FontSize');
import 'css!Controls/Classes';
import 'css!Controls-demo/Controls-demo';

class FontSize extends Control<IControlOptions> {
    private _value: string = '123.45';
    protected _template: TemplateFunction = controlTemplate;
}

export default FontSize;
