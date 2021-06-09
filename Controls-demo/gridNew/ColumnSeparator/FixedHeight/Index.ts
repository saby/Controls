import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/ColumnSeparator/FixedHeight/FixedHeight';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import { IHeaderCell } from 'Controls/grid';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';

const LASTITEM = 5;
const FIRSTITEM = 2;

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _header: IHeaderCell[] = Countries.getHeader().slice(FIRSTITEM, LASTITEM);

    protected _columns: IColumn[] = Countries.getColumnsWithFixedWidths().slice(FIRSTITEM, LASTITEM);

    protected _rowSeparator1: boolean = false;
    protected _columnSeparator1: boolean = false;

    protected _rowSeparator2: boolean = true;
    protected _columnSeparator2: boolean = false;

    protected _rowSeparator3: boolean = true;
    protected _columnSeparator3: boolean = false;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Countries.getData().splice(0, LASTITEM)
        });

    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
