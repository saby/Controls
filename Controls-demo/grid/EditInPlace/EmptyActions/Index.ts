import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/EditInPlace/EmptyActions/EmptyActions"
import {Memory} from "Types/source"
import {getEditing} from "../../DemoHelpers/DataCatalog"
import 'wml!Controls-demo/grid/EditInPlace/EditingCell/_cellEditor';


export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns = getEditing().getEditingColumns();

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getEditing().getEditingData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
