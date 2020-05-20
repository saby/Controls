import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/Number/Base/Index');

class Index extends Control<IControlOptions> {
    protected _value1: number = null;
    protected _value2: number = null;
    protected _value3: number = null;
    protected _template: TemplateFunction = controlTemplate;
    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default Index;
