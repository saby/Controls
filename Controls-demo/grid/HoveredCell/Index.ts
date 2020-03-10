import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/HoveredCell/HoveredCell"
import {Memory} from "Types/source"
import {getCountriesStats} from "../DemoHelpers/DataCatalog"

import 'css!Controls-demo/Controls-demo'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _hoveredCell: string = 'null';
    private _columns = getCountriesStats().getColumnsWithFixedWidths();

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
    }

    protected _hoveredCellChanged(event, item, itemContainer, cell, cellContainer) {
        this._hoveredCell = item ? ('key: ' + item.getKey() + '; cell: ' + cell) : 'null';
    }
}
