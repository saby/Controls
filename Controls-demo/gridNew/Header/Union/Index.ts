import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Header/Union/Union';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import { IHeaderCell } from 'Controls/grid';
import {getCountriesStats} from "Controls-demo/gridNew/DemoHelpers/DataCatalog";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header: IHeaderCell[] = [
        {
            title: '#',
            startColumn: 1,
            endColumn: 2
        },
        {
            title: 'Географические данные',
            startColumn: 2,
            endColumn: 4,
            align: 'center'
        },
        {
            title: 'Цифры',
            startColumn: 4,
            endColumn: 7,
            align: 'center'
        }
    ];
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithWidths();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
