import {Control, TemplateFunction} from "UI/Base";
import controlTemplate = require('wml!Controls-demo/Suggest_new/Input/FooterTemplate/resources/FooterTemplate');
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Suggest_new/Index';

export default class extends Control{
    protected _template: TemplateFunction = controlTemplate;
    protected _clickHandler() {
            this._children.stackOpener.open({filter: {}});
    }
}
