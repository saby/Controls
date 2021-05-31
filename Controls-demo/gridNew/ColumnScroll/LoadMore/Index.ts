import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/ColumnScroll/LoadMore/LoadMore';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';
import { IHeaderCell } from 'Controls/grid';
import {INavigationOptionValue, INavigationSourceConfig} from 'Controls/interface';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithWidths();
    protected _header: IHeaderCell[] = getCountriesStats().getDefaultHeader();
    protected _navigation: INavigationOptionValue<INavigationSourceConfig> = {
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
            keyProperty: 'key',
            data: getCountriesStats().getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
