import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!Controls-demo/list_new/ColumnsView/CustomTemplate/CustomTemplate');
import 'css!Controls-demo/Controls-demo';
import {Memory as MemorySource, Memory} from 'Types/source';
import {generateData} from '../../DemoHelpers/DataCatalog';

const NUMBER_OF_ITEMS = 50;

export default class RenderDemo extends Control {
    protected _template: TemplateFunction = template;

    private _viewSource: Memory;

    private _navigation: any;

    private _itemActions: [object];

    private _items: [object];

    private _dataArray: Array<{id: number, title: string, description: string}>;

    private deleteHandler(item) {
        const id = item.getId();
        const index = this._items.getIndex(item);
       // this._viewSource.destroy(id);
        this._items.removeAt(index);
    }
    private _itemsReadyCallback(items): void {
        this._items = items;
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
        this._itemsReadyCallback = this._itemsReadyCallback.bind(this);
        this._dataArray = generateData<{id: number, title: string, description: string, column: number}>({
            count: NUMBER_OF_ITEMS,
            entityTemplate: {title: 'string', description: 'lorem_alter'},
            beforeCreateItemCallback: (item) => {
                item.title = `Запись с id="${item.id}". ${item.title}`;
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
                pagingMode: 'direct'
            }
        };
    }
}
