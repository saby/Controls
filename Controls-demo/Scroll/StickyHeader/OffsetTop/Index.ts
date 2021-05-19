import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Scroll/StickyHeader/OffsetTop/Template');

export default class MultiHeaderDemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Scroll/StickyHeader/resources/style'];
}
