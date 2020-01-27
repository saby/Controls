import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/treeGrid/NodeFooter/NodeFooterTemplate/NodeFooterTemplate"
import {HierarchicalMemory} from "Types/source"
import {Gadgets} from "../../DemoHelpers/DataCatalog"

import 'css!Controls-demo/Controls-demo'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: HierarchicalMemory;
    private _columns = Gadgets.getColumnsForFlat();
    private _expandedItems = [null];

    protected _beforeMount() {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            data: Gadgets.getFlatData(),
            filter: function () {
                return true;
            }
        });
    }
}
