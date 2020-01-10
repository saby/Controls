import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/EditInPlace/EditingCell/EditingCell"
import {Memory} from "Types/source"
import {getEditing} from "../../DemoHelpers/DataCatalog"
import 'wml!Controls-demo/grid/EditInPlace/EditingCell/_cellEditor';

import 'css!Controls-demo/Controls-demo'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _columns = getEditing().getEditingColumns();
    private _markedKey;
    private _dataLoadCallback = this._dataCallback.bind(this);
    private _items;
    private _viewModel;
    private _showType = {
        //show only in Menu
        MENU: 0,
        //show in Menu and Toolbar
        MENU_TOOLBAR: 1,
        //show only in Toolbar
        TOOLBAR: 2
    };
    private _itemActions = [{
        id: 1,
        icon: 'icon-Erase icon-error',
        title: 'delete',
        style: 'bordered',
        showType: this._showType.MENU_TOOLBAR,
        handler: function(item) {
            this._children.remover.removeItems([item.get('id')]);
        }.bind(this)
    },]

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getEditing().getEditingData()
        });
    }

    protected _afterMount() {
        this._viewModel = this._children.list._children.listControl._children.baseControl.getViewModel();
    }

    private _dataCallback(items) {
        this._items = items;
    }

    private _afterItemsRemove(e,i) {
        this._toggleAddButton();
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
