import {Control, TemplateFunction} from 'UI/Base';
import {HierarchicalMemory} from 'Types/source';
import {TExpandOrColapsItems} from 'Controls-demo/types';

import { Gadgets } from '../DemoHelpers/DataCatalog';

import * as Template from 'wml!Controls-demo/treeGridNew/NodeHistoryId/NodeHistoryId';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: unknown[] = Gadgets.getGridColumnsForFlat();
    protected _collapsedItems: TExpandOrColapsItems = undefined;
    protected _expandedItems: TExpandOrColapsItems = [1];

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            parentProperty: 'parent',
            keyProperty: 'id',
            data: Gadgets.getFlatData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
