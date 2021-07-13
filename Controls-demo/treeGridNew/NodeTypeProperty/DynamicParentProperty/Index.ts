import {Control, TemplateFunction} from 'UI/Base';
import {CrudEntityKey, HierarchicalMemory} from 'Types/source';
import {Model} from 'Types/entity';
import {TColspanCallbackResult} from 'Controls/grid';
import {IGroupNodeColumn} from 'Controls/treeGrid';

import {dynamicParentData as data} from '../data/NodeTypePropertyData';
import {DynamicParentModelName} from './DynamicParentModel';

import * as Template from 'wml!Controls-demo/treeGridNew/NodeTypeProperty/DynamicParentProperty/DynamicParentProperty';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _expandedItems: CrudEntityKey[] = [null];
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
            displayProperty: 'count',
            width: '100px',
            align: 'right'
        },
        {
            displayProperty: 'price',
            width: '100px',
            align: 'right'
        }
    ];

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'key',
            data,
            model: DynamicParentModelName,
            parentProperty: 'parent'
        });
    }

    protected _colspanCallback(item: Model, column: IGroupNodeColumn, columnIndex: number, isEditing: boolean): TColspanCallbackResult {
        if (typeof item === 'string' || item.get('nodeType') === 'group') {
            return 'end';
        }
        return 1;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
