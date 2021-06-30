import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/RowSeparator/WithMultiHeader/WithMultiHeader';
import {Memory} from 'Types/source';
import {IColumn, IHeaderCell} from 'Controls/grid';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';
import {MultiHeader} from 'Controls-demo/gridNew/DemoHelpers/Data/MultiHeader';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Countries.getColumnsWithFixedWidths();
    protected _header: IHeaderCell[] = MultiHeader.getHeader1();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Countries.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
