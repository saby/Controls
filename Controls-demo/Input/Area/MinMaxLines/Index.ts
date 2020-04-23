import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/Area/MinMaxLines/Index');

class ViewModes extends Control<IControlOptions> {
    protected _value1: string;
    protected _value2: string;
    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    static _theme: string[] = ['Controls/Classes'];
}
export default ViewModes;
