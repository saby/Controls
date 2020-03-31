import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/list_new/VirtualScroll/ItemsChange/ItemsChange';
import {Memory} from 'Types/source';
import {generateData} from 'Controls-demo/list_new/DemoHelpers/DataCatalog';
import 'css!Controls-demo/Controls-demo';
import {RecordSet} from 'Types/collection';

interface IItem {
    id: number;
    title: string;
}

type IEdge = 'start' | 'end';

export default class extends Control {
    protected _template: TemplateFunction = template;
    protected _source: Memory;

    private _items: RecordSet;
    private _newItemsOrderNumber: number = 99;
    private _dataArray: IItem[] = generateData<IItem>({
        count: 100,
        entityTemplate: {title: 'number'},
        beforeCreateItemCallback: (item) => {
            item.title = `Запись #${item.id}`;
        }
    });

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'id',
            data: this._dataArray
        });
    }

    private _itemsReadyCallback = (items: RecordSet): void => {
        this._items = items;
    }

    protected _addItem(event: Event, edge: IEdge): void {
        this._newItemsOrderNumber++;
        this._items[edge === 'start' ? 'prepend' : 'append'](new RecordSet({
            rawData: [{
                id: this._newItemsOrderNumber,
                title: `Новая запись #${this._newItemsOrderNumber}`
            }]
        }));
    }

    protected _removeItem(event: Event, edge: IEdge): void {
        this._items.removeAt(edge === 'start' ? 0 : this._items.getCount() - 1);
    }
}
