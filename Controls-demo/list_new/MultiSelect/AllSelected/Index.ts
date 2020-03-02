import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/list_new/MultiSelect/AllSelected/AllSelected"
import {Memory} from "Types/source"
import {getFewCategories as getData} from "../../DemoHelpers/DataCatalog"
import 'css!Controls-demo/Controls-demo'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _selectedKeys: Array<null> = [null];
    protected _excludedKeys: Array<number> = [];

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
    }
}
