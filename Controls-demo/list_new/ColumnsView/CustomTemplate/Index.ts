import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!Controls-demo/list_new/ColumnsView/CustomTemplate/CustomTemplate');
import {Memory as MemorySource, Memory} from 'Types/source';
import {generateData} from '../../DemoHelpers/DataCatalog';
import {RecordSet} from 'Types/collection';
import {INavigation} from 'Controls-demo/types';

const NUMBER_OF_ITEMS = 50;

export default class RenderDemo extends Control {
    protected _template: TemplateFunction = template;

    protected _viewSource: Memory;

    protected _navigation: INavigation;

    protected _itemActions: [object];

    protected _items: RecordSet;

    protected _selectedKeys: [];

    private _dataArray: Array<{id: number, title: string, description: string}>;
    // tslint:disable-next-line
    private deleteHandler(item: any): void {
        const id = item.getId();
        const index = this._items.getIndex(item);
        this._items.removeAt(index);
    }
    private _itemsReadyCallback(items: RecordSet): void {
        this._items = items;
    }
    private removeItems(): void {
        let items = this._selectedKeys;
        let item;
        for (var i = 0; i < items.length; i++) {
            item = this._items.getRecordById(items[i]);
            if (item) {
                this._items.remove(item);
            }
        }
        this._selectedKeys = [];
    }
    protected _beforeMount(): void {
        this._itemActions = [{
            id: 1,
            icon: 'icon-Erase',
            iconStyle: 'danger',
            title: 'delete',
            showType: 2,
            handler: this.deleteHandler.bind(this)
        }];
        this._selectedKeys = [];
        this._itemsReadyCallback = this._itemsReadyCallback.bind(this);
        this._dataArray = generateData<{id: number, title: string, description: string, column: number}>({
            count: NUMBER_OF_ITEMS,
            entityTemplate: {title: 'string', description: 'lorem_alter'},
            beforeCreateItemCallback: (item) => {
                item.title = `Запись с id="${item.id}". ${item.title}`;
                // tslint:disable-next-line
                item.column = item.id < 10 ? 0 : (item.id > 23 ? 1 : 2);
            }
        });
        this._viewSource = new MemorySource({
            data: this._dataArray,
            keyProperty: 'id'
        });
        this._navigation = {
            source: 'page',
            view: 'infinity',
            sourceConfig: {
                page: 0,
                pageSize: 50,
                hasMore: false
            },
            viewConfig: {
                pagingMode: 'basic'
            }
        };
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
