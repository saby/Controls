import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/NodeFooter/ExpanderIconNone/ExpanderIconNone';
import {HierarchicalMemory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import {INavigationOptionValue, INavigationSourceConfig} from 'Controls/interface';
import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

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
    protected _navigation: INavigationOptionValue<INavigationSourceConfig> = {
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
            keyProperty: 'key',
            data: Flat.getData(),
            parentProperty: 'parent'
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
