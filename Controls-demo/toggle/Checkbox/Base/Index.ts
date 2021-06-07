import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/toggle/Checkbox/Base/Template');
import captionTemplate = require('wml!Controls-demo/toggle/Checkbox/Base/resources/Caption');

class ViewModes extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _value1: boolean = false;
    protected _value2: boolean = true;
    protected _caption: TemplateFunction = captionTemplate;

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default ViewModes;
