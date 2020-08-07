import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Spoiler/View/HeaderContentTemplate/HeaderContentTemplate');
import 'css!Controls-demo/Controls-demo';

class HeaderContentTemplate extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _theme: string[] = ['Controls/Classes'];
}
export default HeaderContentTemplate;
