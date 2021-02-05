import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as controlTemplate from 'wml!Controls-demo/PopupTemplate/Dialog/headerBorderVisible/headerBorderVisible';

class FooterTemplate extends Control<IControlOptions> {
    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _template: TemplateFunction = controlTemplate;
}

export default FooterTemplate;
