import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/Header/AddButton/AddButton"
import {Memory} from "Types/source"
import {getCountriesStats} from "../../DemoHelpers/DataCatalog"
import 'wml!Controls-demo/grid/Header/AddButton/FirstHeaderCellTemplate'
import 'wml!Controls-demo/grid/Header/AddButton/Cell'
import 'css!Controls-demo/Controls-demo'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _gridCaption = 'Характеристики стран';
    private _header = getCountriesStats().getDefaultHeader().slice(1);
    protected _columns = getCountriesStats().getColumnsWithWidths().slice(1);

    protected _beforeMount() {

        this._header.forEach((hColumn) => {
            hColumn.template = 'wml!Controls-demo/grid/Header/AddButton/Cell';
        });

        this._header[0] = {
            ...this._header[0],
            template: 'wml!Controls-demo/grid/Header/AddButton/FirstHeaderCellTemplate',
            captionForGrid: this._gridCaption
        };


        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData().slice(0, 10)
        });
    }
}