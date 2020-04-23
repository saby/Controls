import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/ColumnScroll/Base/Base"
import {Memory} from "Types/source"
import {getCountriesStats} from "../../DemoHelpers/DataCatalog"


export default class extends Control {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _viewSource: Memory;
    protected _columns = getCountriesStats().getColumnsWithWidths();
    protected _header = getCountriesStats().getDefaultHeader();

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
    }
}
