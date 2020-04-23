import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Scroll/ScrollbarVisible/Template');

export default class ScrollbarVisibleDemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Scroll/ScrollbarVisible/Style'];

    static _theme: string[] = ['Controls/Classes'];
}
