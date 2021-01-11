import {Control, TemplateFunction} from "UI/Base";
import controlTemplate = require('wml!Controls-demo/LookupNew/Input/SelectorTemplate/Index');
import selectorTemplate = require('wml!Controls-demo/LookupNew/Input/SelectorTemplate/resources/FlatListSelector');

export default class extends Control {
    protected _template: TemplateFunction = controlTemplate;
    protected _selectorTemplate: TemplateFunction = null;

    protected _beforeMount(): void {
        this._selectorTemplate = {
            templateName: selectorTemplate,
            templateOptions: {
                headingCaption: 'Выберите организацию'
            },
            popupOptions: {
                width: 500,
                height: 500
            },
            mode: 'dialog'
        };
    }
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
