import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/EditInPlace/Toolbar/Toolbar';
import * as editingCellNumber from 'wml!Controls-demo/gridNew/EditInPlace/Toolbar/editingCellNumber';
import * as editingCellText from 'wml!Controls-demo/gridNew/EditInPlace/Toolbar/editingCellText';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import {SyntheticEvent} from 'Vdom/Vdom';
import {showType} from 'Controls/toolbars';
import { IColumn } from 'Controls/grid';
import {IItemAction} from 'Controls/itemActions';

export default class extends Control {
    protected _template: TemplateFunction = Template;

    protected _viewSource: Memory;
    protected _fakeItemId: number;
    protected _columns: IColumn[];
    protected _itemActions: IItemAction[] = [
        {
            id: 1,
            icon: 'icon-Erase icon-error',
            title: 'Удалить',
            style: 'bordered',
            showType: showType.MENU_TOOLBAR,
            handler: this._removeItem.bind(this)
        },
        {
            id: 2,
            icon: 'icon-Phone icon-success',
            title: 'Позвонить',
            style: 'bordered',
            showType: showType.MENU_TOOLBAR
        }
    ];

    protected _beforeMount(): void {
        this._columns = getCountriesStats().getColumnsWithFixedWidths().map((column, index) => {
            const resultColumn = column;
            // tslint:disable-next-line
            if (index !== 0) {
                // tslint:disable-next-line
                resultColumn.template = index < 3 ? editingCellText : editingCellNumber;
            }
            return resultColumn;
        });
        // tslint:disable-next-line
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

    private _beginAdd(): void {
        this._children.grid.beginAdd();
    }

    private _removeItem(item: Model): void {
        this._viewSource.destroy([item.getKey()]).then(() => {
            this._children.grid.reload();
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
