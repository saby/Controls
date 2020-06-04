import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/treeGrid/NodeFooter/Configuration/Configuration"
import {HierarchicalMemory} from "Types/source"
import {Gadgets} from "../../DemoHelpers/DataCatalog"


export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns = Gadgets.getGridColumnsForFlat();
    private _hoveredCellIndex = -1;
    protected _navigation = {
        source: 'page',
        view: 'demand',
        sourceConfig: {
            pageSize: 3,
            page: 0,
            hasMore: false
        },
        viewConfig: {
            pagingMode: 'direct'
        }
    };

    protected _beforeMount() {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            data: Gadgets.getFlatData()
        });
    }

    protected _hoveredCellChanged(event, item, itemContainer, cell, cellContainer) {
        this._hoveredCellIndex = cell === null ? -1 : cell;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
