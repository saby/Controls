import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/Header/Multiheader/AddButton/AddButton"
import {Memory} from "Types/source"
import {getCountriesStats} from "../../../DemoHelpers/DataCatalog"
import 'wml!Controls-demo/grid/Header/Multiheader/AddButton/GridCaptionHeaderCell'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _viewSource: Memory;
    private _header = getCountriesStats().getMultiHeaderVar2();
    private _columns = getCountriesStats().getColumnsWithWidths().slice(1);

    protected _beforeMount() {
        this._header[0].template = 'wml!Controls-demo/grid/Header/Multiheader/AddButton/GridCaptionHeaderCell';
        this._columns[0].width = '350px';

        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
    }
}