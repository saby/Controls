import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Sorting/SortingSelector/IconsSvg/Template';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _sortingParams: object[] = [];
    private _sorting: object[] = [];

    protected _beforeMount(): void {
        this._sortingParams = [
            {
                title: 'Без сортировки',
                paramName: null,
                icon: 'Controls/sortIcons:non_sort'
            },
            {
                title: 'По алфавиту (рус)',
                paramName: 'alphabet_ru',
                icon: 'Controls/sortIcons:alphabet_ru'
            },
            {
                title: 'По алфавиту (eng)',
                paramName: 'alphabet_en',
                icon: 'Controls/sortIcons:alphabet_en'
            },
            {
                title: 'По времени',
                paramName: 'time',
                icon: 'Controls/sortIcons:time'
            },
            {
                title: 'По дате',
                paramName: 'date',
                icon: 'Controls/sortIcons:date'
            },
            {
                title: 'По доглам',
                paramName: 'debt',
                icon: 'Controls/sortIcons:debt'
            },
            {
                title: 'По отклонению',
                paramName: 'deflection',
                icon: 'Controls/sortIcons:deflection'
            },
            {
                title: 'По количеству',
                paramName: 'number',
                icon: 'Controls/sortIcons:number'
            },
            {
                title: 'По людям',
                paramName: 'partner',
                icon: 'Controls/sortIcons:partner'
            },
            {
                title: 'По отзывам',
                paramName: 'recall',
                icon: 'Controls/sortIcons:recall'
            },
            {
                title: 'По проблемам',
                paramName: 'problem',
                icon: 'Controls/sortIcons:problem'
            },
            {
                title: 'По оценкам',
                paramName: 'rating',
                icon: 'Controls/sortIcons:rating'
            },
            {
                title: 'По сроку',
                paramName: 'timing',
                icon: 'Controls/sortIcons:timing'
            },
            {
                title: 'По сумме',
                paramName: 'sum',
                icon: 'Controls/sortIcons:sum'
            },
            {
                title: 'По цене',
                paramName: 'price',
                icon: 'Controls/sortIcons:price'
            },
            {
                title: 'По сложности',
                paramName: 'difficult_sort',
                icon: 'Controls/sortIcons:difficult_sort'
            },
            {
                title: 'По номеру',
                paramName: 'custom',
                icon: 'Controls/sortIcons:custom'
            }
        ];
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
