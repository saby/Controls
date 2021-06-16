import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Validate/withTimeout/Template');
import validationFunc from 'Controls-demo/Validate/withTimeout/validationFunc';

class Demo extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _value1: string = '';
    protected _value2: string = '';
    protected _validFunc: Function = validationFunc;

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Demo;
