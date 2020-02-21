import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/EditInPlace/Toolbar/Toolbar';
import * as editingCellNumber from 'wml!Controls-demo/grid/EditInPlace/Toolbar/editingCellNumber';
import * as editingCellText from 'wml!Controls-demo/grid/EditInPlace/Toolbar/editingCellText';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import 'css!Controls-demo/Controls-demo';
import {SyntheticEvent} from 'sbis3-ws/Vdom/Vdom';
import {showType} from 'Controls/Utils/Toolbar';

export default class extends Control {
    private _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _fakeItemId: number;
    private _columns;
    private _itemActions = [
        {
            id: 1,
            icon: 'icon-Erase icon-error',
            title: 'delete',
            style: 'bordered',
            showType: showType.MENU_TOOLBAR,
            handler: function(item) {
                this._children.remover.removeItems([item.getId()]);
            }.bind(this)
        }
    ];

    protected _beforeMount() {
        this._columns = getCountriesStats().getColumnsWithFixedWidths().map((column, index) => {
            const resultColumn = column;
            if (index !== 0) {
                resultColumn.template = index < 3 ? editingCellText : editingCellNumber;
            }
            return resultColumn;
        });

        const data = getCountriesStats().getData().slice(0, 5);
        this._fakeItemId = data[data.length - 1].id;
        this._viewSource = new Memory({keyProperty: 'id', data});
    }

    _beforeBeginEdit(e: SyntheticEvent<null>, options: { item: Model }, isAdd: boolean): { item: Model } | void {
        if (isAdd) {
            const id = ++this._fakeItemId;
            return {
                item: new Model({
                    keyProperty: 'id',
                    rawData: {
                        id,
                        number: id + 1,
                        country: null,
                        capital: null,
                        population: null,
                        square: null,
                        populationDensity: null
                    }
                })
            };
        }
    }

    _afterItemsRemove() {
        this._children.grid.reload();
    }
}
