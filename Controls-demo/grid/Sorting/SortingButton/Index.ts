import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/Sorting/SortingButton/SortingButton"
import {Memory} from "Types/source"
import {getCountriesStats} from "../../DemoHelpers/DataCatalog"


export default class extends Control {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _viewSource: Memory;
    protected _header = getCountriesStats().getHeaderWithSorting();
    protected _columns = getCountriesStats().getColumnsWithWidthsForSortingDemo();
    protected _sorting = [];

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
    }
}
