import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/ColumnScroll/Base2/Base';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';
import { IHeader } from 'Controls-demo/types';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithWidths();
    protected _header: IHeader[] = getCountriesStats().getDefaultHeader();

    private _columnScroll_1: boolean = true;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
    }

    _toggle() {
        this._columnScroll_1 = !this._columnScroll_1;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
