import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/Sorting/SortingSelector/SortingSelectorWithHeader/SortingSelectorWithHeader';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../../DemoHelpers/DataCatalog';


export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _sortingParams: object[] = [];
    private _sorting: object[] = [];
    protected _viewSource: Memory;
    protected _menuHeader: string = 'Сортировать';
    protected _columns: object[] = getCountriesStats().getColumnsWithWidths();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });

        this._sortingParams = [
            {
                title: 'По населению',
                paramName: 'population'
            },
            {
                title: 'По площади',
                paramName: 'square'
            },
            {
                title: 'По плотности населения',
                paramName: 'populationDensity'
            }
        ];
        this._sorting.push({population: 'ASC'});
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
