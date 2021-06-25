import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Sorting/SortingSelector/ViewMode/Template';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _sortingParams: object[] = [];
    private _sorting: object[] = [];

    protected _beforeMount(): void {
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
