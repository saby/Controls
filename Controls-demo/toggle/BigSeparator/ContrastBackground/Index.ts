import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/toggle/BigSeparator/ContrastBackground/ContrastBackground');

class Index extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _expanded: boolean = false;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Index;
