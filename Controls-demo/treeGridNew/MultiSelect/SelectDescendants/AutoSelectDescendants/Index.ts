import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/MultiSelect/SelectDescendants/AutoSelectDescendants/AutoSelectDescendants';
import {HierarchicalMemory} from 'Types/source';
import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: object[] = Flat.getColumns();
    protected _selectedKeys: number[] = [];
    protected _excludedKeys: number[] = [];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Flat.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
