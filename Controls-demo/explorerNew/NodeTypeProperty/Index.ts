import {Control, TemplateFunction} from 'UI/Base';
import {CrudEntityKey} from 'Types/source';
import * as MemorySource from 'Controls-demo/explorerNew/ExplorerMemory';
import {IColumn} from 'Controls/grid';
import {IItemAction} from 'Controls/_itemActions/interface/IItemAction';
import {IGroupNodeColumn} from 'Controls/_treeGrid/interface/IGroupNodeColumn';

import {extendedData as data} from './data/NodeTypePropertyData';

import * as PriceColumnTemplate from 'wml!Controls-demo/explorerNew/NodeTypeProperty/resources/PriceColumnTemplate';
import * as Template from 'wml!Controls-demo/explorerNew/NodeTypeProperty/NodeTypeProperty';

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
    protected _viewSource: MemorySource;
    protected _columns: IColumn[] = columns;
    protected _root: CrudEntityKey = null;

    protected _selectedKeys: [] = [];
    protected _excludedKeys: [] = [];

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
        this._viewSource = new MemorySource({
            keyProperty: 'id',
            data
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
