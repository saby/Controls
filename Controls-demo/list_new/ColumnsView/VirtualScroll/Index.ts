import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!Controls-demo/list_new/ColumnsView/VirtualScroll/VirtualScroll');
import {Memory as MemorySource, Memory} from 'Types/source';
import {generateData} from '../../DemoHelpers/DataCatalog';
import { SyntheticEvent } from 'UI/Vdom';
import { ItemsEntity } from 'Controls/dragnDrop';
import {IVirtualScrollConfig} from 'Controls/list';
import {INavigationOptionValue, INavigationSourceConfig} from 'Controls/interface';

const NUMBER_OF_ITEMS = 1000;

export default class RenderDemo extends Control {
    protected _template: TemplateFunction = template;

    protected _viewSource: Memory;

    protected _navigation: INavigationOptionValue<INavigationSourceConfig>;

    protected _dataArray: Array<{id: number, title: string}>;

    protected _virtualScrollConfig: IVirtualScrollConfig;

    protected _beforeMount(): void {
        this._dataArray = generateData<{id: number, title: string}>({
            count: NUMBER_OF_ITEMS,
            entityTemplate: {title: 'string'},
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
        this._virtualScrollConfig = {
            pageSize: 100,
            segmentSize: 25,
            mode: 'remove'
        };
    }

    protected _dragStart(e: SyntheticEvent, items: string[]): ItemsEntity {
        return new ItemsEntity({ items });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
