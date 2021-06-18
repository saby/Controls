import {Control, TemplateFunction} from 'UI/Base';
import * as Template from "wml!Controls-demo/treeGridNew/NodeTypeProperty/SearchNew/Search";
import {HierarchicalMemory} from 'Types/source';
import * as MemorySource from 'Controls-demo/explorerNew/ExplorerMemory';
import {IColumn} from 'Controls/grid';
import {TRoot} from 'Controls-demo/types';
import {IItemAction} from 'Controls/_itemActions/interface/IItemAction';
import {IGroupNodeColumn} from 'Controls/_treeGrid/interface/IGroupNodeColumn';
import * as PriceColumnTemplate from 'wml!Controls-demo/treeGridNew/NodeTypeProperty/resources/PriceColumnTemplate';
import {data} from '../data/NodeTypePropertyData';

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
    protected _root: TRoot = 1;
    protected _startingWith: 'root' | 'current' = 'root';
    protected _startingWithBtnCaption: 'root' | 'current' = 'current';
    protected _startingWithSource: HierarchicalMemory = null;
    private _multiselect: 'visible' | 'hidden' = 'hidden';
    // tslint:disable-next-line
    protected _filter: object = {demo: 123};
    protected _dedicatedItemProperty: string;

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
                this._children.remover.removeItems([item.getKey()]);
            }
        },
    ];

    protected _beforeMount(): void {
        this._viewSource = new MemorySource({
            keyProperty: 'id',
            data
        });
        this._startingWithSource = new HierarchicalMemory({
            parentProperty: 'parent',
            keyProperty: 'id',
            data: [
                {
                    id: 'root', title: 'root'
                },
                {
                    id: 'current', title: 'current'
                }
            ]
        });
    }

    protected _onToggle(): void {
        this._multiselect = this._multiselect === 'visible' ? 'hidden' : 'visible';
    }

    protected _onToggleDedicatedItemProperty(): void {
        this._dedicatedItemProperty = !this._dedicatedItemProperty ? 'SearchResult' : undefined;
    }

    protected _updateStartingWith(): void {
        this._startingWithBtnCaption = this._startingWith;
        this._startingWith = this._startingWith === 'root' ? 'current' : 'root';
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
