import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/Test/Test');
import 'css!Controls-demo/Controls-demo';

class InputTest extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _value1: string = 'text';
    protected _value2: string = null;
    static _theme: string[] = ['Controls/Classes'];
}
export default InputTest;
