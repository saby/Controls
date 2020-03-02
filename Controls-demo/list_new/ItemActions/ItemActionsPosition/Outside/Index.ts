import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/list_new/ItemActions/ItemActionsPosition/Outside/Outside"
import {Memory} from "Types/source"
import {getContactsCatalog as getData} from "../../../DemoHelpers/DataCatalog"
import {getActionsForContacts as getItemActions} from "../../../DemoHelpers/ItemActionsCatalog"
import 'css!Controls-demo/Controls-demo'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _itemActions = getItemActions();

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
    }
}