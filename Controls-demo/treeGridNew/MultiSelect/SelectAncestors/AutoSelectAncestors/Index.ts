import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/MultiSelect/SelectAncestors/AutoSelectAncestors/AutoSelectAncestors';
import {Memory} from 'Types/source';
import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: object[] = Flat.getColumns();
    protected _selectedKeys: number[] = [];
    protected _excludedKeys: number[] = [];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Flat.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
