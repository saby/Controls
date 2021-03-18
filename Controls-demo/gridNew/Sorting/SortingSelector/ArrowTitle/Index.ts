import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Sorting/SortingSelector/ArrowTitle/Template';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../../DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _sortingParams: object[] = [];
    private _sorting: object[] = [];
    protected _viewSource: Memory;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
        this._sortingParams = [
            {
                title: 'Без сортировки',
                paramName: null,
                icon: 'Controls/sortIcons:non_sort'
            },
            {
                title: 'По времени',
                paramName: 'time',
                icon: 'Controls/sortIcons:time',
                titleAsc: 'Сначала старые',
                titleDesc: 'Сначала новые'
            },
            {
                title: 'По оценкам',
                paramName: 'rating',
                icon: 'Controls/sortIcons:rating',
                titleAsc: 'Сначала худшие',
                titleDesc: 'Сначала лучшие'
            },
            {
                title: 'По цене',
                paramName: 'price',
                icon: 'Controls/sortIcons:price',
                titleAsc: 'Сначала дешевые',
                titleDesc: 'Сначала дорогие'
            }
        ];
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
