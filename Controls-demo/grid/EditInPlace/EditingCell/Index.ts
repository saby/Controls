import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/EditInPlace/EditingCell/EditingCell"
import {Memory} from "Types/source"
import {getEditing} from "../../DemoHelpers/DataCatalog"
import {showType} from 'Controls/Utils/Toolbar';
import 'wml!Controls-demo/grid/EditInPlace/EditingCell/_cellEditor';
import {Model} from 'Types/entity';

import 'css!Controls-demo/Controls-demo'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _columns = getEditing().getEditingColumns();
    private _markedKey;
    private _dataLoadCallback = this._dataCallback.bind(this);
    private _items;
    private _lastId: number;
    private _selectedKeys: number[] = [];
    protected _viewModel;

    protected _itemActions = [{
        id: 1,
        icon: 'icon-Erase icon-error',
        title: 'delete',
        style: 'bordered',
        showType: showType.MENU_TOOLBAR,
        handler: function(item) {
            this._children.remover.removeItems([item.get('id')]);
        }.bind(this)
    }];

    protected _beforeMount() {
        const data = getEditing().getEditingData();
        this._viewSource = new Memory({
            keyProperty: 'id',
            data
        });
        this._lastId = data.length + 1;
    }

    protected _afterMount() {
        this._viewModel = this._children.list._children.listControl._children.baseControl.getViewModel();
    }

    private _dataCallback(items) {
        this._items = items;
    }

    protected _afterItemsRemove(e,i) {
        this._toggleAddButton();
    }

    protected _beginAdd() {
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

    private _toggleAddButton() {
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
}
