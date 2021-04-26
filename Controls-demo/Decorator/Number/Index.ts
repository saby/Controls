import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Decorator/Number/Number');
import 'css!Controls/Classes';
import 'css!Controls-demo/Controls-demo';

class Number extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
}

export default Number;
