import {Control, TemplateFunction} from "UI/Base";
import controlTemplate = require('wml!Controls-demo/Suggest_new/SearchInput/FooterTemplate/resources/FooterTemplate');
import 'css!Controls-demo/Controls-demo';

export default class extends Control{
    protected _template: TemplateFunction = controlTemplate;
    protected _clickHandler() {
            this._children.stackOpener.open({filter: {}});
    }
}
