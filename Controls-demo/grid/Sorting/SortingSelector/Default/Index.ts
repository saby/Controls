import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/Sorting/SortingSelector/Default/Default';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../../DemoHelpers/DataCatalog';

import 'css!Controls-demo/Controls-demo';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _sortingParams: object[] = [];
    private _sorting: object[] = [];
    private _viewSource: Memory;
    private _columns: object[] = getCountriesStats().getColumnsWithWidths();

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
}
