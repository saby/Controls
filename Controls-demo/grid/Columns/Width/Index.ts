import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/Columns/Width/Width"
import {Memory} from "Types/source"
import {forShowWidths} from "../../DemoHelpers/DataCatalog"


export default class extends Control {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _viewSource: Memory;

    protected _header = forShowWidths().getHeader();
    protected _columns = forShowWidths().getColumns1();

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: forShowWidths().getData()
        });
    }
}