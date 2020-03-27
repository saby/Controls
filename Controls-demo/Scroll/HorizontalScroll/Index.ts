import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Scroll/HorizontalScroll/Template');
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Scroll/HorizontalScroll/Style';

export default class HorizontalScrollDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes'];
}
