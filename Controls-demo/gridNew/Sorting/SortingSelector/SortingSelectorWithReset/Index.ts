import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Sorting/SortingSelector/SortingSelectorWithReset/SortingSelectorWithReset';
import {Memory} from 'Types/source';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _sortingParams: object[] = [];
    protected _sorting: object[] = [];
    protected _viewSource: Memory;
    protected _columns: object[] = Countries.getColumnsWithWidths();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Countries.getData()
        });
        this._sortingParams = [
            {
                title: 'Без сортировки',
                paramName: null
            },
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
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
