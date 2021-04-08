import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Sorting/SortingSelector/SingleField/Template';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _sortingParamsWithIcon: object[] = [];
    protected _sortingParamsWithoutIcon: object[] = [];
    private _sorting: object[] = [];

    protected _beforeMount(): void {
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
