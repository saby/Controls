import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Scroll/Paging/End/Template');
import * as scroll from 'Controls/scroll';

export default class DefaultScrollDemo extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Scroll/Paging/Basic/Style'];
}
