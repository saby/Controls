import {Control, TemplateFunction} from 'UI/Base';
import {CrudEntityKey, HierarchicalMemory} from 'Types/source';
import {IColumn, TColspanCallbackResult} from 'Controls/grid';
import {IItemAction} from 'Controls/_itemActions/interface/IItemAction';
import {IGroupNodeColumn} from 'Controls/_treeGrid/interface/IGroupNodeColumn';

import {extendedData as data} from './data/NodeTypePropertyData';

import * as PriceColumnTemplate from 'wml!Controls-demo/explorerNew/NodeTypeProperty/resources/PriceColumnTemplate';
import * as Template from 'wml!Controls-demo/explorerNew/NodeTypeProperty/NodeTypeProperty';
import {Model} from "Types/entity";

const columns: IGroupNodeColumn[] = [
    {
        width: '300px',
        displayProperty: 'title',
        groupNodeConfig: {
            textAlign: 'center'
        }
    },
    {
        width: '100px',
        displayProperty: 'count',
        align: 'right'
    },
    {
        width: '100px',
        displayProperty: 'price',
        align: 'right',
        template: PriceColumnTemplate
    },
    {
        width: '100px',
        displayProperty: 'price1',
        align: 'right',
        template: PriceColumnTemplate
    },
    {
        width: '100px',
        displayProperty: 'price2',
        align: 'right',
        template: PriceColumnTemplate
    },
    {
        width: '50px',
        displayProperty: 'tax',
        align: 'right'
    },
    {
        width: '100px',
        displayProperty: 'price3',
        align: 'right',
        template: PriceColumnTemplate,
        fontSize: 's'
    }
];

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: IColumn[] = columns;
    protected _root: CrudEntityKey = null;
    protected _expandedItems: CrudEntityKey[] = [1, 2, 3];
    protected _collapsedItems: CrudEntityKey[] = [];

    protected _itemActions: IItemAction[] = [
        {
            id: 0,
            icon: 'icon-Erase',
            iconStyle: 'danger',
            title: 'delete pls',
            showType: 0,
            handler: (item) => {
                this._children.explorerView.removeItems({
                    selectedKeys: [item.getKey()],
                    excludedKeys: []
                });
            }
        }
    ];

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data
        });
    }

    protected _colspanCallback(item: Model, column: IGroupNodeColumn, columnIndex: number, isEditing: boolean): TColspanCallbackResult {
        if (item.get('nodeType') === 'group' && columnIndex === 0) {
            return 3;
        }
        return 1;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
