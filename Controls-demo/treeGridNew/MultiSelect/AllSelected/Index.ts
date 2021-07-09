import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/MultiSelect/AllSelected/AllSelected';
import {CrudEntityKey, HierarchicalMemory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: IColumn[] = Flat.getColumns();
    protected _excludedKeys: CrudEntityKey[] = [];
    protected readonly _selectedKeys: CrudEntityKey[] = [null];

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'key',
            data: Flat.getData(),
            parentProperty: 'parent'
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
