import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/MultiSelect/CustomPosition/CustomPosition';
import {HierarchicalMemory} from 'Types/source';
import * as cellTemplate from 'wml!Controls-demo/treeGridNew/MultiSelect/CustomPosition/CellTemplate';
import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: HierarchicalMemory;
    private _columns = [
        { displayProperty: 'title', width: '200px', template: cellTemplate },
        { displayProperty: 'country', width: '200px' }
    ];
    private _selectedKeys = [];

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'key',
            data: Flat.getData(),
            parentProperty: 'parent'
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
