import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/progress/StateIndicator/Extended/Template';
import * as popupTemplate from 'wml!Controls-demo/progress/StateIndicator/Extended/template/template';

class Base extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _data: object;
    protected _dataWithUser: object;
    protected _dataWithThreeCategories: object;

    protected _beforeMount(): void {
        this._data = [
            {value: 33, className: '', title: 'Положительно'},
            {value: 33, className: '', title: 'В работе'},
            {value: 33, className: '', title: 'Отрицательно'},
            {value: 1, className: 'controls-StateIndicator__emptySector', title: 'Не обработано'}
        ];
        this._dataWithUser = [
            {value: 20, className: '', title: 'Первый'},
            {value: 20, className: '', title: 'Второй'},
            {value: 20, className: '', title: 'Третий'}
        ];
    }

    protected _mouseEnterHandler(e?: any, _item?: HTMLElement): void {
        const config = {
            target: _item,
            targetSide: 'top',
            alignment: 'start',
            showDelay: 1000,
            template: popupTemplate,
            templateOptions: {data: this._dataWithUser}
        };
        this._children.IBOpener.open(config);
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Base;
