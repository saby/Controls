import {Control, TemplateFunction} from 'UI/Base'
import * as Template from "wml!Controls-demo/grid/ColumnScroll/LoadMore/LoadMore"
import {Memory} from 'Types/source'
import {getCountriesStats} from "../../DemoHelpers/DataCatalog"
import { IColumn } from 'Controls/_grid/interface/IColumn';
import { IHeader, INavigation } from 'Controls-demo/types';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithWidths();
    protected _header: IHeader[] = getCountriesStats().getDefaultHeader();
    protected _navigation: INavigation = {
        source: 'page',
        view: 'pages',
        sourceConfig: {
            pageSize: 5,
            page: 0,
            hasMore: false
        },
        viewConfig: {
            pagingMode: 'pagingMode'
        }
    };

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
