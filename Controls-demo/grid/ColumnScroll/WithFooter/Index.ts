import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/ColumnScroll/WithFooter/WithFooter';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/gridOld';
import { IHeaderCell } from 'Controls/gridOld';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithWidths();
    protected _columns2: IColumn[] = getCountriesStats().getColumnsWithWidths();
    protected _header: IHeaderCell[] = getCountriesStats().getDefaultHeader();

    protected _beforeMount(): void {
        this._columns2[1].width = '200px';
        this._viewSource = new Memory({
            keyProperty: 'id',
            // tslint:disable-next-line
            data: getCountriesStats().getData().slice(0, 3)
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
