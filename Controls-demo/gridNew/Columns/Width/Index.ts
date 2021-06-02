import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Columns/Width/Width';
import {Memory} from 'Types/source';
import { IHeaderCell } from 'Controls/grid';
import { IColumn } from 'Controls/grid';
import {CrossBrowserWidths} from "Controls-demo/gridNew/DemoHelpers/Data/CrossbrowserWidths";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header: IHeaderCell[] = CrossBrowserWidths.getHeader();
    protected _columns: IColumn[] = CrossBrowserWidths.getColumns();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: CrossBrowserWidths.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
