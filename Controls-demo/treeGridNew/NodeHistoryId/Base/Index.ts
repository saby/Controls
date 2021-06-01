import {Control, TemplateFunction} from 'UI/Base';
import {HierarchicalMemory} from 'Types/source';

import * as Template from 'wml!Controls-demo/treeGridNew/NodeHistoryId/Base/Base';
import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: unknown[] = Flat.getColumns();

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            parentProperty: 'parent',
            keyProperty: 'id',
            data: Flat.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
