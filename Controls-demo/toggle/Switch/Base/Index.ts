import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls-demo/toggle/Switch/Base/Template');
import captionTemplate = require('wml!Controls-demo/toggle/Switch/Base/resources/captionTemplate');

class Base extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _caption: TemplateFunction = captionTemplate;
    protected _value: boolean = false;
    protected _value2: boolean = false;
    protected _value3: boolean = false;

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default Base;
