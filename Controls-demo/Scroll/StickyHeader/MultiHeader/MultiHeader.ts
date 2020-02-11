import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Scroll/StickyHeader/MultiHeader/MultiHeader');
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Scroll/StickyHeader/MultiHeader/MultiHeader';

export default class MultiHeaderDemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes'];
}
