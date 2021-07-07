import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/Money/Base/Index');

class Index extends Control<IControlOptions> {
    protected _value1: string = '';
    protected _value2: string = '0.00';
    protected _value3: string = '0.00';
    protected _template: TemplateFunction = controlTemplate;
    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default Index;
