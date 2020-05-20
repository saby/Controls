import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/ColumnSeparator/FixedHeight/FixedHeight';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _header: unknown[] = getCountriesStats().getDefaultHeader().slice(2, 5);
    private _columns: unknown[] = getCountriesStats().getColumnsWithFixedWidths().slice(2, 5);

    private _rowSeparator1: boolean = false;
    private _columnSeparator1: boolean = false;

    private _rowSeparator2: boolean = true;
    private _columnSeparator2: boolean = false;

    private _rowSeparator3: boolean = true;
    private _columnSeparator3: boolean = false;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData().splice(0, 5)
        });

    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
