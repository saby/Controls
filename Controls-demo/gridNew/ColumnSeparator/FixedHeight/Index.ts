import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/ColumnSeparator/FixedHeight/FixedHeight';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';
import { IHeader } from 'Controls-demo/types';

const LASTITEM = 5;
const FIRSTITEM = 2;

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _header: IHeader[] = getCountriesStats().getDefaultHeader().slice(FIRSTITEM, LASTITEM);

    protected _columns: IColumn[] = getCountriesStats().getColumnsWithFixedWidths().slice(FIRSTITEM, LASTITEM);

    protected _rowSeparator1: boolean = false;
    protected _columnSeparator1: boolean = false;

    protected _rowSeparator2: boolean = true;
    protected _columnSeparator2: boolean = false;

    protected _rowSeparator3: boolean = true;
    protected _columnSeparator3: boolean = false;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData().splice(0, LASTITEM)
        });

    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
