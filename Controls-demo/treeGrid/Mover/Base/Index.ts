import {Control, TemplateFunction} from "UI/Base";
import * as Template from "wml!Controls-demo/treeGrid/Mover/Base/Base";
import {HierarchicalMemory} from "Types/source";
import {Gadgets} from "../../DemoHelpers/DataCatalog";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _viewSource: HierarchicalMemory;
    protected _columns: object[];
    private _selectedKeys: [];
    private _excludedKeys: [];
    private _filter: object;

    protected _beforeMount(): any {
        this._columns = [{
            displayProperty: 'title'
        }];
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            data: Gadgets.getFlatData(),
            filter: (item, filter) => {
                const parent = filter.hasOwnProperty('parent') ? filter.parent : null;
                if (parent && parent.forEach) {
                    for (let i = 0; i < parent.length; i++) {
                        if (item.get('parent') === parent[i]) {
                            return true;
                        }
                    }
                    return false;
                } else {
                    return item.get('parent') === parent;
                }
            }
        });
    }

    protected _moveButtonClick(): void {
        if (this._selectedKeys.length) {
            this._children.listMover.moveItemsWithDialog({
                selectedKeys: this._selectedKeys,
                excludedKeys: this._excludedKeys,
                filter: this._filter
            });
        }
    }

    protected _afterItemsMove(): void {
        this._children.treeGrid.reload();
    }

}
