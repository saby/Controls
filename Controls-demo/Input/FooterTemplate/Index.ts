import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Input/FooterTemplate/FooterTemplate');

class FooterTemplate extends Control<IControlOptions> {
    protected _placeholder: string = 'Tooltip';
    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default FooterTemplate;
