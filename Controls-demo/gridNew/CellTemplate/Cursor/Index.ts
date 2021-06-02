import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/CellTemplate/Cursor/Cursor';
import * as NumberCellTemplate from 'wml!Controls-demo/gridNew/CellTemplate/Cursor/NumberCell';
import * as CountryCellTemplate from 'wml!Controls-demo/gridNew/CellTemplate/Cursor/CountryCell';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import { IHeaderCell } from 'Controls/grid';
import {Countries} from "Controls-demo/gridNew/DemoHelpers/Data/Countries";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header: IHeaderCell[] = Countries.getHeader();
    protected _columns: IColumn[] = [
        {
            displayProperty: 'number',
            width: '40px',
            template: NumberCellTemplate
        },
        {
            displayProperty: 'country',
            width: '300px',
            template: CountryCellTemplate
        },
        {
            displayProperty: 'population',
            width: 'max-content',
            compatibleWidth: '118px'
        },
        {
            displayProperty: 'square',
            width: 'max-content',
            compatibleWidth: '156px'
        }
    ];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Countries.getData().splice(0, 5)
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
