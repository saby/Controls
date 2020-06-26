import {Control, TemplateFunction} from 'UI/Base'
import * as Template from "wml!Controls-demo/grid/Sorting/SortingButtonTextOverflow/SortingButtonTextOverflow"
import {Memory} from 'Types/source'
import {getCountriesStats} from "../../DemoHelpers/DataCatalog"
import { IColumn } from 'Controls/_grid/interface/IColumn';
import { IHeader } from 'Controls-demo/types';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header: IHeader[] = getCountriesStats().getHeaderWithSorting('ellipsis');
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithWidthsForSortingDemo();
    protected _sorting: any[] = [];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
