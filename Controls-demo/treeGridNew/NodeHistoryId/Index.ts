import {Control, TemplateFunction} from 'UI/Base';
import {HierarchicalMemory} from 'Types/source';
import {TExpandOrColapsItems} from 'Controls-demo/types';
import {UserConfig} from 'EnvConfig/Config';

import { Gadgets } from '../DemoHelpers/DataCatalog';

import * as Template from 'wml!Controls-demo/treeGridNew/NodeHistoryId/NodeHistoryId';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: unknown[] = Gadgets.getGridColumnsForFlat();
    protected _nodeHistoryId: string = 'MY_NEWS';
    protected _collapsedItems: TExpandOrColapsItems = undefined;
    protected _expandedItems: TExpandOrColapsItems = undefined;
    protected readonly NODE_HISTORY_ID_NAME: string = 'MY_NEWS';

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            parentProperty: 'parent',
            keyProperty: 'id',
            data: Gadgets.getFlatData()
        });
    }

    onClickToggle(event: object): void {
        this._nodeHistoryId = this._nodeHistoryId !== '' ? '' : this.NODE_HISTORY_ID_NAME;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
