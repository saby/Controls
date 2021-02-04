import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/toggle/BigSeparator/Base/Index');

class Base extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _expanded: boolean = false;
    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default Base;
