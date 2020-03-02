import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/treeGrid/ItemActions/ItemActionsNoHighlight/ItemActionsNoHighlight"
import {Memory} from "Types/source"
import {Gadgets} from "../../DemoHelpers/DataCatalog"
import {getActionsForContacts as getItemActions} from "../../../list_new/DemoHelpers/ItemActionsCatalog"

import 'css!Controls-demo/Controls-demo'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns = Gadgets.getColumnsWithFixedWidth().map((cur, i) => {
        if (i === 2) {
            return {
                ...cur,
                width: '350px'
            };
        }
        return cur;
    });
    protected _itemActions = getItemActions();

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Gadgets.getFlatData()
        });
    }
}
