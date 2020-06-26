import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/HoveredCell/HoveredCell';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/_grid/interface/IColumn';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _hoveredCell: string = 'null';
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithFixedWidths();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
    }

    protected _hoveredCellChanged(_, item: any, __: any, cell: number): void {
        this._hoveredCell = item ? ('key: ' + item.getKey() + '; cell: ' + cell) : 'null';
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
