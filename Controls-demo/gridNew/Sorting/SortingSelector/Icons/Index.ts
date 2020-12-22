import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Sorting/SortingSelector/Icons/Template';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/_grid/interface/IColumn';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _sortingParams: object[] = [];
    private _sorting: object[] = [];
    protected _viewSource: Memory;
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithWidths();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
        this._sortingParams = [
            {
                title: 'По населению',
                paramName: 'population',
                icon: 'icon-Attach',
                iconSize: 's'
            },
            {
                title: 'По площади',
                paramName: 'square',
                icon: 'icon-1c',
                iconSize: 's'
            },
            {
                title: 'По плотности населения',
                paramName: 'populationDensity',
                icon: 'icon-Vacation',
                iconSize: 's'
            }
        ];
        this._sorting.push({population: 'ASC'});
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
