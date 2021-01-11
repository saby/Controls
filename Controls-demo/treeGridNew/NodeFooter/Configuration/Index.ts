import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/NodeFooter/Configuration/Configuration';
import {HierarchicalMemory} from 'Types/source';
import {Gadgets} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';
import { INavigation } from 'Controls-demo/types';
import {SyntheticEvent} from 'Vdom/Vdom';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: IColumn[] = Gadgets.getGridColumnsForFlat();
    protected _hoveredCellIndex: number = -1;

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
    }

    private _toggleNodes(tree): void {
        tree.toggleExpanded(1).then(() => tree.toggleExpanded(11));
    }

    // tslint:disable-next-line
    protected _hoveredCellChanged(_: SyntheticEvent, item: any, itemContainer: any, cell: any): void {
        this._hoveredCellIndex = cell === null ? -1 : cell;
    }

    static _styles: string[] = [
        'Controls-demo/Controls-demo',
        'Controls-demo/treeGridNew/NodeFooter/Configuration/Configuration'
    ];
}
