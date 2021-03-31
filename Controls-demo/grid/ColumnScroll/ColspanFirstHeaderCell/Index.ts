import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/ColumnScroll/Base/Base';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/gridOld';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import {IHeader} from 'Controls-demo/types';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithWidths();
    protected _header: IHeader[] = getCountriesStats().getHeaderWithFirstColspan();
    private _selectedKeys: number[] = [];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
