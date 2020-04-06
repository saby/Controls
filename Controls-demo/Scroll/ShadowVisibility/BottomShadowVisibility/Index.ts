import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Scroll/ShadowVisibility/BottomShadowVisibility/Template');
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Scroll/ShadowVisibility/Style';

export default class BottomShadowVisibility extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes'];
}
