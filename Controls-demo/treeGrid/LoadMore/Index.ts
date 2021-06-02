import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/LoadMore/LoadMore';
import {HierarchicalMemory} from 'Types/source';
import {Gadgets} from '../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';
import {INavigationOptionValue, INavigationSourceConfig} from 'Controls/interface';


export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns: IColumn[] = Gadgets.getGridColumnsForFlat();
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
            keyProperty: 'id',
            parentProperty: 'parent',
            data: Gadgets.getFlatData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
