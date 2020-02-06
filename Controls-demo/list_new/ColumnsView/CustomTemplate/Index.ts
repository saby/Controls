import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!Controls-demo/list_new/ColumnsView/CustomTemplate/CustomTemplate');
import 'css!Controls-demo/Controls-demo';
import {Memory as MemorySource, Memory} from 'Types/source';
import {generateData} from '../../DemoHelpers/DataCatalog';
import {getActionsForContacts as getItemActions} from "../../DemoHelpers/ItemActionsCatalog";

const NUMBER_OF_ITEMS = 1000;

export default class RenderDemo extends Control {
    protected _template: TemplateFunction = template;

    protected _viewSource: Memory;

    protected _navigation: any;

    protected _itemActions = getItemActions();

    private _dataArray: Array<{id: number, title: string, description: string}>;

    protected _beforeMount(): void {
        this._dataArray = generateData<{id: number, title: string, description: string}>({
            count: NUMBER_OF_ITEMS,
            entityTemplate: {title: 'string', description: 'lorem_alter'},
            beforeCreateItemCallback: (item) => {
                item.title = `Запись с id="${item.id}". ${item.title}`;
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
                pageSize: 100,
                hasMore: false
            }
        };
    }
}
