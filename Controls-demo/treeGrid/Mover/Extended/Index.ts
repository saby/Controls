import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/Mover/Extended/Extended';
import {HierarchicalMemory, CrudEntityKey} from 'Types/source';
import {Gadgets} from '../../DemoHelpers/DataCatalog';
import {TColumns} from 'Controls/grid';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    private _selectedKeys: [] = [];
    private _excludedKeys: CrudEntityKey[] = [];
    private _filter: object = {};
    protected _columns: TColumns;
    protected _beforeItemsMoveText: string = '';

    protected _beforeMount(): void {
        this._columns = [{
            displayProperty: 'title',
            width: '1fr',
            textOverflow: 'ellipsis'
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

    protected _beforeItemsMove(e, movedItems, target, position) {
        this._beforeItemsMoveText = `Перемещены элементы с id: ${movedItems.selectedKeys.toString()}`;
    }

    protected _afterItemsMove(): void {
        this._children.treeGrid.reload();
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
