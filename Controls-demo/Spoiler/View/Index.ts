import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Spoiler/View/View');
import 'css!Controls-demo/Controls-demo';

class View extends Control<IControlOptions> {
    protected _expanded: boolean = false;

    protected _template: TemplateFunction = controlTemplate;
    static _theme: string[] = ['Controls/Classes'];
}
export default View;
