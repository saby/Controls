import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/treeGrid/NodeFooter/NodeFooterTemplate/NodeFooterTemplate"
import {HierarchicalMemory} from "Types/source"
import {Gadgets} from "../../DemoHelpers/DataCatalog"


export default class extends Control {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _viewSource: HierarchicalMemory;
    protected _columns = Gadgets.getColumnsForFlat();
    protected _expandedItems = [null];

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
