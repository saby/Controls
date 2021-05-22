import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/NodeHistoryId/Groups/Groups';
import {CrudEntityKey, HierarchicalMemory} from 'Types/source';
import { Gadgets } from '../../DemoHelpers/DataCatalog';
import {TColspanCallbackResult} from 'Controls/grid';
import {Model} from 'Types/entity';
import {INavigation} from 'Controls-demo/types';

const preparedData = Gadgets.getFlatData().map((item) => {
    item.nodeType = (item.parent === null && item.type ? 'group' : '');
    return item;
});

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _expandedItems: CrudEntityKey[] = [];
    protected _collapsedItems: CrudEntityKey[] = undefined;

    protected _navigation: INavigation = {
        source: 'page',
        view: 'demand',
        sourceConfig: {
            pageSize: 3,
            page: 0,
            hasMore: false
        },
        viewConfig: {
            pagingMode: 'basic'
        }
    };

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            data: preparedData,
            parentProperty: 'parent'
        });
    }

    protected _colspanCallback(item: Model, column, columnIndex: number, isEditing: boolean): TColspanCallbackResult {
        if (item.get('nodeType') === 'group' || typeof item === 'string') {
            return 'end';
        }
        return 1;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
