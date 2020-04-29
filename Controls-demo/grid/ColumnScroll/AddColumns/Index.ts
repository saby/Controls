import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/ColumnScroll/AddColumns/AddColumns"
import {Memory} from "Types/source"
import {getCountriesStats} from "../../DemoHelpers/DataCatalog"


export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns = getCountriesStats().getColumnsWithWidths();
    protected _header = getCountriesStats().getDefaultHeader();
    private _newColumnWidth: string = '100px';
    private _collIndex: number = 0;
    private _tableWidthTemp: string = '600px';
    private _tableWidth: string = '600px';
    private _fakeIndex: number = 0;

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
    }

    private addColumn = () => {
        const title = 'new column' + this._collIndex;
        const column = {
            displayProperty: title,
            width: this._newColumnWidth,
            compatibleWidth: this._newColumnWidth
        }
        this._columns = [...this._columns, column];
        this._header = [...this._header, { title }];
        this._collIndex++;
        this._forceUpdate();
    }

    private changeWidth = () => {
        this._tableWidth = this._tableWidthTemp;
        const columns = this._columns.map((cur) => ({ ...cur, fakeIndex: this._fakeIndex }))
        this._columns = [...columns];
        this._fakeIndex++;
        this._forceUpdate();
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
