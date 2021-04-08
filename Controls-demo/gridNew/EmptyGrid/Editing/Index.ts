import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/EmptyGrid/Editing/Editing';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';
import { IHeader } from 'Controls-demo/types';
import {Record as entityRecord} from 'Types/entity';
import * as editingCell from 'wml!Controls-demo/gridNew/EmptyGrid/Editing/cellEditor';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _fakeId = 1000;
    private _hasItems = false;
    private _isEditing = false;

    protected _header: IHeader[] = getCountriesStats().getDefaultHeader().slice(1);
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithFixedWidths().slice(1).map((c) => ({
        ...c,
        template: editingCell
    }));

    protected _beforeMount(): void {
        this._columns[0].width = '400px';
        this._columns[4].width = 'auto';
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: []
        });
    }

    protected _beginAdd() {
        const id = this._fakeId++;
        this._children.grid.beginAdd({
            item: new entityRecord({
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
        });
    }

    protected _onAfterBeginEnd() {
        this._isEditing = true;
    }
    protected _onBeforeEndEdit(e, item, commit) {
        this._isEditing = false;
        this._hasItems = this._hasItems || commit;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
