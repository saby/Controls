import {Control, TemplateFunction} from 'UI/Base';
import {Model} from 'Types/entity';
import {CrudEntityKey, HierarchicalMemory} from 'Types/source';
import {TColspanCallbackResult} from 'Controls/grid';
import {IGroupNodeColumn} from 'Controls/treeGrid';

import { Gadgets } from '../../DemoHelpers/DataCatalog';

import * as Template from 'wml!Controls-demo/treeGridNew/NodeHistoryId/NodeHistoryType/NodeHistoryType';

const preparedData = Gadgets.getFlatData().map((item) => {
    item.nodeType = (item.parent === null && item.type ? 'group' : '');
    return item;
});

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _expandedItems: CrudEntityKey[] = [];
    protected _collapsedItems: CrudEntityKey[] = undefined;

    protected _columns: IGroupNodeColumn[] = [
        {
            displayProperty: 'title',
            width: '300px',
            groupNodeConfig: {
                textAlign: 'center'
            }
        },
        {
            displayProperty: 'rating',
            width: '100px'
        },
        {
            displayProperty: 'country',
            width: '100px'
        }
    ];

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            data: preparedData,
            parentProperty: 'parent'
        });
    }

    protected _colspanCallback(item: Model, column: IGroupNodeColumn, columnIndex: number, isEditing: boolean): TColspanCallbackResult {
        if (item.get('nodeType') === 'group' || typeof item === 'string') {
            return 'end';
        }
        return 1;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
