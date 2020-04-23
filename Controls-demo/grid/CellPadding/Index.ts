import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/CellPadding/CellPadding"
import {Memory} from "Types/source"
import {cellPadding} from "../DemoHelpers/DataCatalog"


export default class extends Control {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _viewSource: Memory;
    protected _columns = cellPadding().getCollumns();
    protected _header = cellPadding().getCellPaddingHeader();

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: cellPadding().getData().slice(0, 5)
        });
    }
}
