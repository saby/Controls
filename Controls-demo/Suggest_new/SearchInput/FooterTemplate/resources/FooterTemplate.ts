import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Suggest_new/SearchInput/FooterTemplate/resources/FooterTemplate');

export default class extends Control {
    protected _template: TemplateFunction = controlTemplate;
    protected _clickHandler(): void {
            this._children.stackOpener.open({filter: {}});
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Suggest_new/Index'];
}
