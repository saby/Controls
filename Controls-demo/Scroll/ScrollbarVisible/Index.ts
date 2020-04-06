import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Scroll/ScrollbarVisible/Template');
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Scroll/ScrollbarVisible/Style';

export default class ScrollbarVisibleDemoControl extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes'];
}
