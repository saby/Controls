import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/Ladder/Sticky/Sticky"
import {Memory} from "Types/source"
import {getTasks} from "../../DemoHelpers/DataCatalog"

import 'css!Controls-demo/Controls-demo'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _columns = getTasks().getColumns();
    protected _ladderProperties = ['photo', 'date'];

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getTasks().getData()
        });
        this._columns[0].stickyProperty = 'photo';
        this._columns[2].stickyProperty = 'date';
    }
}