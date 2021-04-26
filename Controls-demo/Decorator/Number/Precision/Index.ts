import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Decorator/Number/Precision/Template');
import 'css!Controls/CommonClasses';
import 'css!Controls-demo/Controls-demo';

class FractionSize extends Control<IControlOptions> {
    protected _value = '12345.67890';
    protected _template: TemplateFunction = controlTemplate;
}

export default FractionSize;
