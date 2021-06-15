import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as controlTemplate from 'wml!Controls-demo/Validate/Highlighter/Highlighter';

class Demo extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _value: string = '';

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Demo;
