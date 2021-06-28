import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Decorator/Money/OnlyPositive/OnlyPositive');
import 'css!Controls/CommonClasses';
import 'css!Controls-demo/Controls-demo';

class OnlyPositive extends Control<IControlOptions> {
    private _value = '-123.45';
    protected _template: TemplateFunction = controlTemplate;
}

export default OnlyPositive;
