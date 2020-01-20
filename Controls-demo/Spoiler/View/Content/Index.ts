import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Spoiler/View/Content/Content');
import 'css!Controls-demo/Controls-demo';

class Content extends Control<IControlOptions> {
    private _expanded: boolean = true;

    protected _template: TemplateFunction = controlTemplate;
    static _theme: string[] = ['Controls/Classes'];
}
export default Content;
