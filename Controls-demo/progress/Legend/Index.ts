import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import Template = require('wml!Controls-demo/progress/Legend/Template');
import popupTemplate = require('wml!Controls-demo/progress/Legend/popupTemplate');

class Legend extends Control<IControlOptions> {
    protected _template: TemplateFunction = Template;
    protected _data: object;
    protected _dataWithTwoCategories: object;

    protected _beforeMount(): void {
        this._dataWithTwoCategories = [
            {value: 50, className: '', title: 'Положительно'},
            {value: 20, className: '', title: 'В работе'}
        ];
    }

    protected _mouseEnterHandler(e?: any, _item?: HTMLElement): void {
        const config = {
            target: _item,
            targetSide: 'top',
            alignment: 'start',
            showDelay: 1000,
            template: popupTemplate,
            templateOptions: {data: this._dataWithTwoCategories}
        };
        this._children.stateIndicatorLegend.open(config);
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default Legend;
