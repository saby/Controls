import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/Columns/TextOverflow/Ellipsis/Ellipsis"
import {Memory} from "Types/source"
import {getCountriesStats} from "../../../DemoHelpers/DataCatalog"

import 'css!Controls-demo/Controls-demo'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _header = getCountriesStats().getDefaultHeader().slice(1, 4);
    protected _columns = [
        {
            displayProperty: 'country',
            width: '100px',
            textOverflow: 'ellipsis'
        },
        {
            displayProperty: 'capital',
            width: '200px'
        },
        {
            displayProperty: 'population',
            width: '200px'
        }
    ];

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData().slice(0, 5)
        });
    }
}