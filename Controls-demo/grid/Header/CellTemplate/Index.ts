import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/Header/CellTemplate/CellTemplate';
import * as PopulationTemplate from 'wml!Controls-demo/grid/Header/CellTemplate/populationDensity';
import * as SquareTemplate from 'wml!Controls-demo/grid/Header/CellTemplate/squareTemplate';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/gridOld';
import { IHeaderCell } from 'Controls/gridOld';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _header: IHeaderCell[] = getCountriesStats().getDefaultHeader();
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithWidths();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
        // tslint:disable
        this._header[this._header.length-2].template = SquareTemplate;
        this._header[this._header.length-1].template = PopulationTemplate;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
