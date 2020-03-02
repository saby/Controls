import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/list_new/MultiSelect/MultiSelectVisibility/Visible/Visible"
import {Memory} from "Types/source"
import {getFewCategories as getData} from "../../../DemoHelpers/DataCatalog"
import 'css!Controls-demo/Controls-demo'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _selectedKeys: Array<number> = [];

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
    }
}
