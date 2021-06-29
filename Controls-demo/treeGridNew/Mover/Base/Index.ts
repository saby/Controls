import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/Mover/Base/Base';
import {CrudEntityKey, HierarchicalMemory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import {ISelectionObject} from 'Controls/interface';
import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: IColumn[];
    private _selectedKeys: CrudEntityKey[] = [];
    private _excludedKeys: CrudEntityKey[] = [];

    protected _beforeMount(): void {
        this._columns = [{
            displayProperty: 'title',
            width: ''
        }];
        this._viewSource = new HierarchicalMemory({
            parentProperty: 'parent',
            keyProperty: 'key',
            data: Flat.getData(),
            filter: (item, filter: {parent: Array<string| number>, title: string}) => {
                const parent = filter.hasOwnProperty('parent') ? filter.parent : null;
                if (parent && parent.forEach) {
                    for (let i = 0; i < parent.length; i++) {
                        if (item.get('parent') === parent[i]) {
                            return true;
                        }
                    }
                    return false;
                } else if ('title' in filter && !!filter.title) {
                    return item.get('title').toLowerCase().indexOf(filter.title.toLowerCase()) !== -1;
                } else {
                    return item.get('parent') === parent;
                }
            }
        });
    }

    protected _moveButtonClick(): void {
        if (this._selectedKeys.length) {
            const selection: ISelectionObject = {
                selected: this._selectedKeys,
                excluded: this._excludedKeys
            };
            this._children.treeGrid.moveItemsWithDialog(selection).then(() => {
                this._children.treeGrid.reload();
            });
        }
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
