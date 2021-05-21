import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/ColumnScroll/AddColumns2/AddColumns';
import * as newColTmpl from 'wml!Controls-demo/gridNew/ColumnScroll/AddColumns2/ColumnTemplate';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';
import { IHeader } from 'Controls-demo/types';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithWidths();
    protected _header: IHeader[] = getCountriesStats().getDefaultHeader();
    private _newColumnWidth: string = '100px';
    private _collIndex: number = 0;
    private _tableWidthTemp: string = '600px';
    protected _tableWidth: string = '600px';
    private _fakeIndex: number = 0;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
    }

    protected addColumn = (ignore): void => {
        const title = 'new column' + this._collIndex;
        const column = {
            displayProperty: title,
            width: this._newColumnWidth,
            compatibleWidth: this._newColumnWidth,
            template: newColTmpl
        };
        this._columns = [...this._columns, column];
        this._header = [...this._header, { title }];
        this._collIndex++;
        if (!ignore) {
            this._forceUpdate();
        }
    };

    protected changeWidth = (): void => {
        this._tableWidth = this._tableWidthTemp;
        const columns = this._columns.map((cur) => ({ ...cur, fakeIndex: this._fakeIndex }));
        this._columns = [...columns];
        this._fakeIndex++;
        this._forceUpdate();
    };

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
