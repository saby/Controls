import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/MultiSelect/MultiSelectVisibility/Visible/Visible';
import {HierarchicalMemory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    // tslint:disable-next-line
    private _viewSource: HierarchicalMemory;
    // tslint:disable-next-line
    private _columns: IColumn[] = Flat.getColumns();
    // tslint:disable-next-line
    private _selectedKeys: number[] = null;
    // tslint:disable-next-line
    private _excludedKeys: number[] = null;

    protected _beforeMount(): void {
        this._selectedKeys = [];
        this._excludedKeys = [];
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'key',
            data: Flat.getData(),
            parentProperty: 'parent'
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
