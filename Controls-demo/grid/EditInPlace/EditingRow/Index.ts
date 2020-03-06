import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/EditInPlace/EditingRow/EditingRow"
import {Memory} from "Types/source"
import {getPorts} from "../../DemoHelpers/DataCatalog"
import 'wml!Controls-demo/grid/EditInPlace/EditingRow/_rowEditor';

import 'css!Controls-demo/Controls-demo'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _header = getPorts().getHeader();
    private _columns = getPorts().getColumns();
    private _documentSignMemory;

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getPorts().getData()
        });

        this._documentSignMemory = new Memory({
            keyProperty: 'id',
            data: getPorts().getDocumentSigns()
        });

    }
}
