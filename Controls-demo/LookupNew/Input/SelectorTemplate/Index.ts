import {Control, TemplateFunction} from "UI/Base";
import controlTemplate = require('wml!Controls-demo/LookupNew/Input/SelectorTemplate/Index');
import dialogTemplate = require('wml!Controls-demo/LookupNew/Input/SelectorTemplate/resources/SelectorTemplate');
import {Memory} from 'Types/source';
import {COMPANIES} from 'Controls-demo/LookupNew/resources/DataStorage';

export default class extends Control {
    protected _template: TemplateFunction = controlTemplate;
    protected _selectorTemplate: TemplateFunction = null;
    protected _selectedKeys: string[] = ['Сбербанк-Финанс, ООО'];
    protected _source: Memory = null;
    protected _columns: object[] = null;

    protected _beforeMount(): void {
        this._source = new Memory({
            data: COMPANIES,
            keyProperty: 'id'
        });
        this._selectorTemplate = {
            templateName: 'Controls-demo/LookupNew/Input/SelectorTemplate/resources/SelectorTemplate',
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
