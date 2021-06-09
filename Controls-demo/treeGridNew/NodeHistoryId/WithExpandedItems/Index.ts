import {Control, TemplateFunction} from 'UI/Base';
import {HierarchicalMemory, CrudEntityKey} from 'Types/source';
import {SyntheticEvent} from 'Vdom/Vdom';

import * as Template from 'wml!Controls-demo/treeGridNew/NodeHistoryId/WithExpandedItems/WithExpandedItems';
import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: unknown[] = Flat.getColumns();
    protected _expandedItems: CrudEntityKey[] = [1];

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            parentProperty: 'parent',
            keyProperty: 'key',
            data: Flat.getData()
        });
    }

    protected _expandedItemsChanged(e: SyntheticEvent, expandedItems: []) {
        this._expandedItems = expandedItems;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
