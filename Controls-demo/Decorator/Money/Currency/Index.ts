import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Decorator/Money/Currency/Currency');
import 'css!Controls/Classes';
import 'css!Controls-demo/Controls-demo';

class Value extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
}

export default Value;
