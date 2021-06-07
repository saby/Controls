import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/dropdown_new/Button/WithoutItems/LazyItemsLoading/Index');
import {Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'key',
            data: []
        });
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/dropdown_new/Button/Index'];
}
