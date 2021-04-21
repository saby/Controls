import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/NodeTypeProperty/AlignedByColumn/AlignedByColumn';
import {HierarchicalMemory} from 'Types/source';
import {data} from '../data/NodeTypePropertyData';
import {TColspanCallbackResult} from 'Controls/grid';
import {Model} from 'Types/entity';
import {TExpandOrColapsItems} from 'Controls-demo/types';

const NODE_TYPE_PROPERTY = 'nodeType';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _nodeTypeProperty: string = NODE_TYPE_PROPERTY;
    protected _expandedItems: TExpandOrColapsItems = [null];
    protected _collapsedItems: TExpandOrColapsItems = undefined;

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            data,
            filter: (): boolean => true
        });
    }

    protected _colspanCallback(item: Model, column, columnIndex: number, isEditing: boolean): TColspanCallbackResult {
        if (item.get(NODE_TYPE_PROPERTY) === 'group' && columnIndex === 0) {
            return 2;
        }
        return 1;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
