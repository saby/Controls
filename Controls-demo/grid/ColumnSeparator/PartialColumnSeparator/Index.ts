import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/ColumnSeparator/PartialColumnSeparator/PartialColumnSeparator';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import * as clone from 'Core/core-clone';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _header: unknown[];
    private _columns1: unknown[];
    private _columns2: unknown[];
    private _columns3: unknown[];

    private _rowSeparator1: boolean = false;
    private _columnSeparator1: boolean = true;

    private _rowSeparator2: boolean = false;
    private _columnSeparator2: boolean = true;

    private _rowSeparator3: boolean = false;
    private _columnSeparator3: boolean = true;

    protected _beforeMount(): void {
        let columnData = clone(getCountriesStats().getColumnsWithFixedWidths());
        columnData = [...columnData.slice(0, 2), ...columnData.slice(3, 6)];
        columnData[2].align = 'center';
        columnData[3].align = 'center';
        columnData[4].align = 'center';

        this._columns1 = clone(columnData);
        this._columns2 = clone(columnData);
        this._columns3 = clone(columnData);


        this._columns1[2].columnSeparatorSize = {left: 's'};
        this._columns1[3].columnSeparatorSize = {right: 's'};

        this._columns2[2].columnSeparatorSize = {right: null};

        this._columns3[3].columnSeparatorSize = {left: null};

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

    protected _togglePartialColumnSeparator(e, value) {
        const newColumns = clone(this._columns1);
        if (value) {
            newColumns[2].columnSeparatorSize = {left: 's'};
            newColumns[3].columnSeparatorSize = {right: 's'};
        } else {
            delete newColumns[2].columnSeparatorSize;
            delete newColumns[3].columnSeparatorSize;
        }
        this._columns1 = newColumns;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
