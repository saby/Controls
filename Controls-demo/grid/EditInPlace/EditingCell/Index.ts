import {Control, TemplateFunction} from 'UI/Base'
import * as Template from "wml!Controls-demo/grid/EditInPlace/EditingCell/EditingCell"
import {Memory} from 'Types/source'
import {getEditing, IColumnRes} from "../../DemoHelpers/DataCatalog"
import {showType} from 'Controls/Utils/Toolbar';
import 'wml!Controls-demo/grid/EditInPlace/EditingCell/_cellEditor';
import {Model} from 'Types/entity';
import { TItemsReadyCallback } from 'Controls-demo/types';
import {RecordSet} from 'Types/collection';
import { IItemAction } from 'Controls/itemActions';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumnRes[] = getEditing().getEditingColumns();
    protected _markedKey: number;
    protected _dataLoadCallback: TItemsReadyCallback = this._dataCallback.bind(this);
    protected _items: any;
    protected _lastId: number;
    protected _selectedKeys: number[] = [];
    protected _viewModel: any;

    protected _itemActions: any = [{
        id: 1,
        icon: 'icon-Erase icon-error',
        title: 'delete',
        style: 'bordered',
        showType: showType.TOOLBAR,
        handler: function(item) {
            this._children.remover.removeItems([item.get('id')]);
        }.bind(this)
    }];

    protected _beforeMount(): void {
        const data = getEditing().getEditingData();
        this._viewSource = new Memory({
            keyProperty: 'id',
            data
        });
        this._lastId = data.length + 1;
    }

    protected _afterMount(): void {
        this._viewModel = this._children.list._children.listControl._children.baseControl.getViewModel();
    }

    private _dataCallback(items: RecordSet): void {
        this._items = items;
    }

    protected _afterItemsRemove() {
        this._toggleAddButton();
    }

    protected _beginAdd(): void {
        this._children.list.beginAdd({
           item: new Model({
              keyProperty: 'id',
              rawData: {
                 id: this._lastId++,
                 title: '',
                 description: '',
                 price: '',
                 balance: '',
                 balanceCostSumm: '',
                 reserve: '',
                 costPrice: ''
              }
           })
        });
    }

    private _toggleAddButton(): void {
        const self = this;
        this._viewSource.query().addCallback((items) => {
            const rawData = items.getRawData();
            const getSumm = (title) => rawData.items.reduce((acc, cur) => {
                acc += parseInt(cur[title], 10) || 0;
                return acc;
            }, 0)
            const newColumns = self._columns.map((cur) => {
                if (cur.results || cur.results === 0) {
                    return {
                        ...cur, results: getSumm(cur.displayProperty)
                    };
                }
                return cur;
            })
            self._columns = newColumns;
            return items;
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
