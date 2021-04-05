import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/Sorting/SortingSelector/Icons/Template';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/gridOld';

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
                icon: 'Controls/sortIcons:partner'
            },
            {
                title: 'По площади',
                paramName: 'square',
                icon: 'Controls/sortIcons:deflection'
            },
            {
                title: 'По плотности населения',
                paramName: 'populationDensity',
                icon: 'Controls/sortIcons:difficult_sort'
            }
        ];
        this._sorting.push({population: 'ASC'});
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
