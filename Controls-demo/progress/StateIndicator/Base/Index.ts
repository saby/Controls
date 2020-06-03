import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls-demo/progress/StateIndicator/Base/Template');

class Base extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _data: object;
    protected _dataWithTwoCategories: object;
    protected _dataWithThreeCategories: object;

    protected _beforeMount(): void {
        this._data = [{value: 50, className: '', title: 'Положительно'}];
        this._dataWithTwoCategories = [
            {value: 50, className: '', title: 'Положительно'},
            {value: 20, className: '', title: 'В работе'}
        ];
        this._dataWithThreeCategories = [
            {value: 10, className: '', title: 'Положительно'},
            {value: 30, className: '', title: 'В работе'},
            {value: 50, className: '', title: 'Отрицательно'}
        ];
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Base;
