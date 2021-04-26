import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Decorator/Money/FontWeight/FontWeight');
import 'css!Controls/Classes';
import 'css!Controls-demo/Controls-demo';

class FontWeight extends Control<IControlOptions> {
    private _value = '123.45';
    protected _template: TemplateFunction = controlTemplate;
}

export default FontWeight;
