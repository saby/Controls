import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/toggle/BigSeparator/SeparatorSize/Index');

class Size extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _expanded1: boolean = false;
    protected _expanded2: boolean = false;
    protected _expanded3: boolean = false;
    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/toggle/BigSeparator/SeparatorSize/Index'];
}
export default Size;
