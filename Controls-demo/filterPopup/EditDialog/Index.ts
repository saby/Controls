import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/filterPopup/EditDialog/Index';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _items: object[] = [
        {
            name: 'date',
            value: [1],
            textValue: 'Дата'
        },
        {
            name: 'Category',
            value: [1],
            textValue: 'Категория'
        }
    ];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
