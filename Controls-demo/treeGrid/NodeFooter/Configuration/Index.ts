import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/NodeFooter/Configuration/Configuration';
import {HierarchicalMemory} from 'Types/source';
import {Gadgets} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/_grid/interface/IColumn';
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
            pagingMode: 'direct'
        }
    };

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            data: Gadgets.getFlatData()
        });
    }

    protected _hoveredCellChanged(_: SyntheticEvent, item: any, itemContainer: any, cell: any): void {
        this._hoveredCellIndex = cell === null ? -1 : cell;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
