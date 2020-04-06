import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Scroll/ScrollMode/Template');
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Scroll/ScrollMode/Style';

export default class HorizontalScrollDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes'];
}
