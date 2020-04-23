import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/Header/Default/Default"
import {Memory} from "Types/source"
import {getCountriesStats} from "../../DemoHelpers/DataCatalog"


export default class extends Control {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _viewSource: Memory;
    protected _header = getCountriesStats().getDefaultHeader();
    protected _columns = getCountriesStats().getColumnsWithWidths();

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData().slice(0, 10)
        });
    }
}