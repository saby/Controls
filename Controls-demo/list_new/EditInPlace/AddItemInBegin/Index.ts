import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/EditInPlace/AddItemInBegin/AddItemInBegin';
import {Memory} from 'Types/source';
import {generateData} from '../../DemoHelpers/DataCatalog';

interface IItem {
    title: string;
    key: number;
    keyProperty: string;
    count: number;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _itemsCount: number = 50;

    private dataArray: IItem[] = generateData({
        keyProperty: 'key',
        count: 50,
        beforeCreateItemCallback: (item: IItem) => {
            item.title = `Запись с ключом ${item.key}.`;
        }
    });

    protected _addItem(): void {
        const item = {
            key: ++this._itemsCount,
            title: `Запись с ключом ${this._itemsCount}.`
        };
        this._children.list.beginAdd({item});
    }

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: this.dataArray
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
