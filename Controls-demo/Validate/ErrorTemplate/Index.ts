import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Validate/ErrorTemplate/ErrorTemplate');

class ErrorTemplate extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _value1: string = '';
    protected _value2: string = '';


    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default ErrorTemplate;
