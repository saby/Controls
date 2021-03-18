import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Sorting/SortingSelector/SingleField/Template';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/gridNew';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _sortingParamsWithIcon: object[] = [];
    protected _sortingParamsWithoutIcon: object[] = [];
    private _sorting: object[] = [];
    protected _viewSource: Memory;
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithWidths();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
        this._sortingParamsWithIcon = [
            {
                title: 'По сумме',
                paramName: 'sum',
                icon: 'Controls/sortIcons:sum'
            }
        ];
        this._sortingParamsWithoutIcon = [
            {
                title: 'По сумме',
                paramName: 'sum',
            }
        ];
        this._sorting.push({sum: 'ASC'});
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
