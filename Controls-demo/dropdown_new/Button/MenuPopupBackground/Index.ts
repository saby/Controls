import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/dropdown_new/Button/MenuPopupBackground/Index');
import {Memory} from 'Types/source';
import {IMenuPopupOptions} from 'Controls/menu';

export default class extends Control {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;
    protected menuPopupOptions: IMenuPopupOptions;

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'key',
            data: [
                {key: 1, title: 'Ярославль'},
                {key: 2, title: 'Москва'},
                {key: 3, title: 'Санкт-Петербург'}
            ]
        });
        this.menuPopupOptions = {
            templateOptions: {
                backgroundStyle: 'primary'
            }
        };
    }
    static _styles: string[] = [
        'Controls-demo/Controls-demo',
        'Controls-demo/dropdown_new/Button/MenuPopupBackground/Index'
    ];
}
