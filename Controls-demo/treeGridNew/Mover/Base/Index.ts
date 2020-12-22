import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/Mover/Base/Base';
import {HierarchicalMemory} from 'Types/source';
import {Gadgets} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';
import {TExpandOrColapsItems} from 'Controls-demo/types';
import {ISelectionObject} from 'Controls/interface';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: IColumn[];
    private _selectedKeys: [];
    private _excludedKeys: TExpandOrColapsItems;

    protected _beforeMount(): void {
        this._columns = [{
            displayProperty: 'title',
            width: ''
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
