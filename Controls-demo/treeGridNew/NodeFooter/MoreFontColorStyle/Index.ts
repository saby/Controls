import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/NodeFooter/MoreFontColorStyle/MoreFontColorStyle';
import {HierarchicalMemory} from 'Types/source';
import {IColumn} from 'Controls/grid';
import {INavigationOptionValue, INavigationSourceConfig} from 'Controls/interface';
import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: IColumn[] = Flat.getColumns();

    private _expandedItems1 = [];
    private _expandedItems2 = [];
    private _expandedItems3 = [];
    private _expandedItems4 = [];
    private _expandedItems5 = [];
    private _expandedItems6 = [];
    private _expandedItems7 = [];
    private _expandedItems8 = [];
    private _expandedItems9 = [];
    private _expandedItems10 = [];
    private _expandedItems11 = [];

    protected _navigation: INavigationOptionValue<INavigationSourceConfig> = {
        source: 'page',
        view: 'demand',
        sourceConfig: {
            pageSize: 3,
            page: 0,
            hasMore: false
        },
        viewConfig: {
            pagingMode: 'direct'
        }
    };

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'key',
            parentProperty: 'parent',
            data: [
                {
                    key: 1,
                    title: 'Apple',
                    country: 'США',
                    rating: '8.5',
                    parent: null,
                    type: true
                },
                {
                    key: 11,
                    title: 'Notebooks',
                    country: 'США',
                    rating: '8.5',
                    parent: 1,
                    type: false
                },
                {
                    key: 12,
                    title: 'IPhones',
                    country: 'США',
                    rating: '8.5',
                    parent: 1,
                    type: false
                },
                {
                    key: 121,
                    title: 'IPhone XS',
                    country: 'США',
                    rating: '8.5',
                    parent: 12,
                    type: null
                },
                {
                    key: 122,
                    title: 'IPhone X',
                    country: 'США',
                    rating: '8.5',
                    parent: 12,
                    type: null
                },
                {
                    key: 123,
                    title: 'IPhone XS Max',
                    country: 'США',
                    rating: '8.5',
                    parent: 12,
                    type: null
                },
                {
                    key: 124,
                    title: 'IPhone 8',
                    country: 'США',
                    rating: '8.5',
                    parent: 12,
                    type: null
                },
                {
                    key: 13,
                    title: 'iPad Air 2015',
                    country: 'США',
                    rating: '8.5',
                    parent: 1,
                    type: null
                },
                {
                    key: 14,
                    title: 'iPad Air 2017',
                    country: 'США',
                    rating: '8.5',
                    parent: 1,
                    type: null
                }
            ]
        });
    }

    protected _afterMount(): void {
        this._toggleNodes(this._children.tree1);
        this._toggleNodes(this._children.tree2);
        this._toggleNodes(this._children.tree3);
        this._toggleNodes(this._children.tree4);
        this._toggleNodes(this._children.tree5);
        this._toggleNodes(this._children.tree6);
        this._toggleNodes(this._children.tree7);
        this._toggleNodes(this._children.tree8);
        this._toggleNodes(this._children.tree9);
        this._toggleNodes(this._children.tree10);
        this._toggleNodes(this._children.tree11);
    }

    private _toggleNodes(tree) {
        tree.toggleExpanded(1);
        setTimeout(() => {
            tree.toggleExpanded(11);
        }, 50);
    }

    static _styles: string[] = [
        'Controls-demo/Controls-demo',
    ];
}
