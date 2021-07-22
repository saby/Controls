import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/MoreButtonTemplate/MoreButtonTemplate';
import {HierarchicalMemory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import {SyntheticEvent} from 'Vdom/Vdom';
import {INavigationOptionValue, INavigationSourceConfig} from 'Controls/interface';
import {Flat} from 'Controls-demo/treeGridNew/DemoHelpers/Data/Flat';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: IColumn[] = Flat.getColumns().map((c) => ({...c, compatibleWidth: '150px'}));
    protected _hoveredCellIndex: number = -1;

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
            parentProperty: 'parent',
            data: Flat.getData()
        });
    }

    protected _afterMount(): void {
        this._toggleNodes(this._children.tree2);
    }

    private _toggleNodes(tree): void {
        tree.toggleExpanded(1).then(() => tree.toggleExpanded(11)).then(() => tree.toggleExpanded(12));
    }

    // tslint:disable-next-line
    protected _hoveredCellChanged(_: SyntheticEvent, item: any, itemContainer: any, cell: any): void {
        this._hoveredCellIndex = cell === null ? -1 : cell;
    }

    static _styles: string[] = [
        'Controls-demo/Controls-demo'
    ];
}
