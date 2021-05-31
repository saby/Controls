import {Control, TemplateFunction} from 'UI/Base';
import {Model} from 'Types/entity';
import {CrudEntityKey, HierarchicalMemory} from 'Types/source';
import {TColspanCallbackResult} from 'Controls/grid';
import {IGroupNodeColumn} from 'Controls/treeGrid';

import {data} from '../data/NodeTypePropertyData';

import * as Template from 'wml!Controls-demo/treeGridNew/NodeTypeProperty/HideTheOnlyGroup/HideTheOnlyGroup';
import * as PriceColumnTemplate from 'wml!Controls-demo/treeGridNew/NodeTypeProperty/resources/PriceColumnTemplate';

const columns: IGroupNodeColumn[] = [
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
        align: 'right',
        template: PriceColumnTemplate
    }
];

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _expandedItems: CrudEntityKey[] = [1];
    protected _collapsedItems: CrudEntityKey[] = undefined;
    protected _columns: IGroupNodeColumn[] = columns;

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            data: data.slice(0, 4),
            filter: (): boolean => true
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
