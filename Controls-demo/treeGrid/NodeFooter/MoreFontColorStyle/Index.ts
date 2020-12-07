import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/NodeFooter/MoreFontColorStyle/MoreFontColorStyle';
import {HierarchicalMemory} from 'Types/source';
import {Gadgets} from '../../DemoHelpers/DataCatalog';
import {IColumn} from 'Controls/grid';
import {INavigation} from 'Controls-demo/types';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: IColumn[] = Gadgets.getGridColumnsForFlat();

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

    protected _navigation: INavigation = {
        source: 'page',
        view: 'demand',
        sourceConfig: {
            pageSize: 1,
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
            data: [
                {
                    id: 1,
                    title: 'Apple',
                    country: 'США',
                    rating: '8.5',
                    parent: null,
                    type: true
                },
                {
                    id: 11,
                    title: 'Notebooks',
                    country: 'США',
                    rating: '8.5',
                    parent: 1,
                    type: false
                },
                {
                    id: 12,
                    title: 'IPhones',
                    country: 'США',
                    rating: '8.5',
                    parent: 1,
                    type: false
                },
                {
                    id: 121,
                    title: 'IPhone XS',
                    country: 'США',
                    rating: '8.5',
                    parent: 12,
                    type: null
                },
                {
                    id: 122,
                    title: 'IPhone X',
                    country: 'США',
                    rating: '8.5',
                    parent: 12,
                    type: null
                },
                {
                    id: 123,
                    title: 'IPhone XS Max',
                    country: 'США',
                    rating: '8.5',
                    parent: 12,
                    type: null
                },
                {
                    id: 124,
                    title: 'IPhone 8',
                    country: 'США',
                    rating: '8.5',
                    parent: 12,
                    type: null
                },
                {
                    id: 13,
                    title: 'iPad Air 2015',
                    country: 'США',
                    rating: '8.5',
                    parent: 1,
                    type: null
                },
                {
                    id: 14,
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
