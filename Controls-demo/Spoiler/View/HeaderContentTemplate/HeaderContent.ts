import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Spoiler/View/HeaderContentTemplate/HeaderContent');
import * as tmplNotify from 'Controls/Utils/tmplNotify';

class HeaderContent extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _tmplNotify: Function = tmplNotify;

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default HeaderContent;
