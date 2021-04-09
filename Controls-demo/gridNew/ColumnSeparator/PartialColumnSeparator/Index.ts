import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/ColumnSeparator/PartialColumnSeparator/PartialColumnSeparator';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import * as clone from 'Core/core-clone';
import { IColumn } from 'Controls/grid';
import { IHeader } from 'Controls-demo/types';
import {SyntheticEvent} from 'Vdom/Vdom';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header: IHeader[];
    protected _columns1: IColumn[];
    protected _columns2: IColumn[];
    protected _columns3: IColumn[];

    protected _rowSeparator1: boolean = false;
    protected _columnSeparator1: boolean = true;

    protected _rowSeparator2: boolean = false;
    protected _columnSeparator2: boolean = true;

    protected _rowSeparator3: boolean = false;
    protected _columnSeparator3: boolean = true;

    protected _beforeMount(): void {
        let columnData = clone(getCountriesStats().getColumnsWithFixedWidths());
        // tslint:disable-next-line
        columnData = [...columnData.slice(0, 2), ...columnData.slice(3, 6)];
        // tslint:disable-next-line
        columnData[2].align = 'center';
        // tslint:disable-next-line
        columnData[3].align = 'center';
        // tslint:disable-next-line
        columnData[4].align = 'center';

        this._columns1 = clone(columnData);
        this._columns2 = clone(columnData);
        this._columns3 = clone(columnData);
        // tslint:disable-next-line
        this._columns1[2].columnSeparatorSize = {left: 's'};
        // tslint:disable-next-line
        this._columns1[3].columnSeparatorSize = {right: 's'};
        // tslint:disable-next-line
        this._columns2[2].columnSeparatorSize = {right: null};
        // tslint:disable-next-line
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
            // tslint:disable-next-line
            data: getCountriesStats().getData().splice(0, 5)
        });

    }

    protected _togglePartialColumnSeparator(e: SyntheticEvent, value: unknown): void {
        const newColumns = clone(this._columns1);
        if (value) {
            // tslint:disable-next-line
            newColumns[2].columnSeparatorSize = {left: 's'};
            // tslint:disable-next-line
            newColumns[3].columnSeparatorSize = {right: 's'};
        } else {
            // tslint:disable-next-line
            delete newColumns[2].columnSeparatorSize;
            // tslint:disable-next-line
            delete newColumns[3].columnSeparatorSize;
        }
        this._columns1 = newColumns;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
