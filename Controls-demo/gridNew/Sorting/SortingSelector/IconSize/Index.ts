import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Sorting/SortingSelector/IconSize/Template';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';

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
                title: 'По порядку',
                paramName: null,
                icon: 'Controls/sortIcons:custom'
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
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
