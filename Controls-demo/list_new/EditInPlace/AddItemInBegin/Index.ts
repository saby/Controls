import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/EditInPlace/AddItemInBegin/AddItemInBegin';
import {Memory} from 'Types/source';
import {generateData} from '../../DemoHelpers/DataCatalog';

interface IItem {
    title: string;
    id: number;
    keyProperty: string;
    count: number;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _itemsCount: number = 50;

    private dataArray: IItem[] = generateData({
        keyProperty: 'id',
        count: 50,
        beforeCreateItemCallback: (item: IItem) => {
            item.title = `Запись с ключом ${item.id}.`;
        }
    });

    protected _addItem(): void {
        const item = {
            id: ++this._itemsCount,
            title: `Запись с ключом ${this._itemsCount}.`
        };
        this._children.list.beginAdd({item});
    }

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this.dataArray
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
