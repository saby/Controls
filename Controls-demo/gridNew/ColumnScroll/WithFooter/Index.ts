import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/ColumnScroll/WithFooter/WithFooter';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import { IHeaderCell } from 'Controls/grid';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Countries.getColumnsWithWidths();
    protected _columns2: IColumn[] = Countries.getColumnsWithWidths();
    protected _header: IHeaderCell[] = Countries.getHeader();

    protected _beforeMount(): void {
        this._columns2[1].width = '200px';
        this._viewSource = new Memory({
            keyProperty: 'key',
            // tslint:disable-next-line
            data: Countries.getData().slice(0, 3)
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
