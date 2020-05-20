import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/Search/Search"
import {Memory} from "Types/source"
import {getCountriesStats} from "../DemoHelpers/DataCatalog"


export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _filter = {};
    // private _searchStartingWith: string = 'country';
    protected _columns = getCountriesStats().getColumnsWithFixedWidths();

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
