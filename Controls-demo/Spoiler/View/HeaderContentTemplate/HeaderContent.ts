import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Spoiler/View/HeaderContentTemplate/HeaderContent');
import {EventUtils} from 'UI/Events';

class HeaderContent extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _tmplNotify: Function = EventUtils.tmplNotify;

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
export default HeaderContent;
