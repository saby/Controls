import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/toggle/Checkbox/Tristate/Template');

class ViewModes extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _value1: boolean = false;
    protected _value2: boolean = false;

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default ViewModes;
