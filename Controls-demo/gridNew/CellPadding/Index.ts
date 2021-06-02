import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/CellPadding/CellPadding';
import {Memory} from 'Types/source';
import { IHeaderCell } from 'Controls/grid';
import {CellPadding} from "Controls-demo/gridNew/DemoHelpers/Data/CellPadding";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: unknown = CellPadding.getColumns();
    protected _header: IHeaderCell[] = CellPadding.getHeader();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: CellPadding.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
