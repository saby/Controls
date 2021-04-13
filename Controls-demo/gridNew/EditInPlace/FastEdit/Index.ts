import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/EditInPlace/FastEdit/FastEdit';
import * as editingCellNumber from 'wml!Controls-demo/gridNew/EditInPlace/FastEdit/editingCellNumber';
import * as editingCellText from 'wml!Controls-demo/gridNew/EditInPlace/FastEdit/editingCellText';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[];
    private _fakeId: number = 100;

    protected _beforeMount(): void {
        this._itemsReadyCallback = this._itemsReadyCallback.bind(this);
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
        this._viewSource = new Memory({
            keyProperty: 'id',
            data
        });
    }

    protected _beforeBeginEdit(e, options, isAdd) {
        if (isAdd && options.item === undefined) {
            return {
                item: new Model({
                    keyProperty: 'id',
                    rawData: {
                        id: ++this._fakeId,
                        number: this._items.getCount() + 1,
                        country: '',
                        capital: '',
                        population: 0,
                        square: 0,
                        populationDensity: 0
                    }
                })
            };
        }
    }

    protected _itemsReadyCallback(items): void {
        this._items = items;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
