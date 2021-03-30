import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/toggle/Checkbox/Icon/Template');

class ViewModes extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _value1: boolean = false;
    protected _value2: boolean = false;
    protected _value3: boolean = false;
    protected _value4: boolean = false;

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default ViewModes;
