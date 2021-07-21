import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/Mover/RootLabelVisible/RootLabelVisible';
import {CrudEntityKey, HierarchicalMemory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import {ISelectionObject} from 'Controls/interface';
import {Flat} from 'Controls-demo/treeGridNew/DemoHelpers/Data/Flat';
import {memoryFilter as moverMemoryFilter} from 'Controls-demo/treeGridNew/DemoHelpers/Filter/memoryFilter';

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
            filter: moverMemoryFilter
        });
    }

    protected _moveButtonClick(): void {
        if (this._selectedKeys?.length) {
            const selection: ISelectionObject = {
                selected: this._selectedKeys,
                excluded: this._excludedKeys
            };
            this._children.treeGrid.moveItemsWithDialog(selection).then(() => {
                this._selectedKeys = [];
                this._children.treeGrid.reload();
            });
        }
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
