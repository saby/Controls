import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/Sorting/SortingButton/SortingButton"
import {Memory} from "Types/source"
import {getCountriesStats} from "../../DemoHelpers/DataCatalog"

import 'css!Controls-demo/Controls-demo'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _header = getCountriesStats().getHeaderWithSorting();
    private _columns = getCountriesStats().getColumnsWithWidths();
    private _sorting = [];

    protected _beforeMount() {
        this._header[3].align = 'left';
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
    }
}
