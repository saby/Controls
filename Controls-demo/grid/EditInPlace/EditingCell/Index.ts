import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/EditInPlace/EditingCell/EditingCell"
import {Memory} from "Types/source"
import {getEditing} from "../../DemoHelpers/DataCatalog"
import 'wml!Controls-demo/grid/EditInPlace/EditingCell/_cellEditor';

import 'css!Controls-demo/Controls-demo'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _columns = getEditing().getEditingColumns();

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getEditing().getEditingData()
        });
    }
}
