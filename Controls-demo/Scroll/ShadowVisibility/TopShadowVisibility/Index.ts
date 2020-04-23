import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Scroll/ShadowVisibility/TopShadowVisibility/Template');

export default class BottomShadowVisibility extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Scroll/ShadowVisibility/Style'];

    static _theme: string[] = ['Controls/Classes'];
}
