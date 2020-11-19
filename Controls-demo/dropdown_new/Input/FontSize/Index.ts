import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/dropdown_new/Input/FontSize/Index';
import {Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _source: Memory;
    protected _selectedKeys: number[] = [1];

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'key',
            data: [
                {key: 1, title: 'Ярославль'},
                {key: 2, title: 'Москва'},
                {key: 3, title: 'Санкт-Петербург'}
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
