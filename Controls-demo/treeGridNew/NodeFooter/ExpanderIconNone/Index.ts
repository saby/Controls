import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/NodeFooter/ExpanderIconNone/ExpanderIconNone';
import {HierarchicalMemory} from 'Types/source';
import {Gadgets} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';
import { INavigation } from 'Controls-demo/types';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: IColumn[] = [
        {
            displayProperty: 'title',
            width: ''
        }
    ];
    protected _expandedItems: number[] = [];
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
            data: Gadgets.getFlatData()
        });
    }
    protected _afterMount(): void {
        this._children.tree1.toggleExpanded(1);
        this._children.tree2.toggleExpanded(1);
        this._children.tree3.toggleExpanded(1);
        this._children.tree4.toggleExpanded(1);
    }

    protected _toggleExpanded(): void {
        this._children.tree1.toggleExpanded(1);
        this._children.tree2.toggleExpanded(1);
        this._children.tree3.toggleExpanded(1);
        this._children.tree4.toggleExpanded(1);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
