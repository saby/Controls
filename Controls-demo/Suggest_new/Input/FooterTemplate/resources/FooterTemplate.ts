import {Control, TemplateFunction} from "UI/Base";
import controlTemplate = require('wml!Controls-demo/Suggest_new/Input/FooterTemplate/resources/FooterTemplate');

export default class extends Control{
    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Suggest_new/Index'];
    protected _clickHandler() {
            this._children.stackOpener.open({filter: {}});
    }
}
