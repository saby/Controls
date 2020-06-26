import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/ColumnSeparator/WithMultiHeader/WithMultiHeader';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import * as clone from 'Core/core-clone';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header: unknown[];
    protected _columns: unknown[];

    protected _rowSeparator: boolean = false;
    protected _columnSeparator: boolean = true;

    protected _beforeMount(): void {
        let columnData = clone(getCountriesStats().getColumnsWithFixedWidths());
        columnData = [...columnData.slice(0, 2), ...columnData.slice(3, 6)];
        columnData[2].align = 'center';
        columnData[3].align = 'center';
        columnData[4].align = 'center';

        this._columns = clone(columnData);

        this._header = [
            { startRow: 1, endRow: 3, startColumn: 1, endColumn: 2, title: '#' },
            { startRow: 1, endRow: 3, startColumn: 2, endColumn: 3, title: 'Страна' },
            { startRow: 1, endRow: 2, startColumn: 3, endColumn: 5, align: 'center', title: 'Характеристики' },
            { startRow: 2, endRow: 3, startColumn: 3, endColumn: 4, align: 'center', title: 'Население' },
            { startRow: 2, endRow: 3, startColumn: 4, endColumn: 5, align: 'center', title: 'Площадь' },
            { startRow: 1, endRow: 3, startColumn: 5, endColumn: 6, align: 'center', title: 'Плотность' }
        ];

        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData().splice(0, 5)
        });

    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
