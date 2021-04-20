import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/dropdown_new/Input/MaxVisibleItems/Index');
import {Memory} from 'Types/source';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;
    protected _selectedKeysMax: number[] = [1, 2, 3, 4, 5, 6, 7];
    protected _selectedKeys: number[] = [1, 2, 3, 4, 5, 6, 7];

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'key',
            data: [
                {key: 1, title: 'Ярославль'},
                {key: 2, title: 'Москва'},
                {key: 3, title: 'Санкт-Петербург'},
                {key: 4, title: 'Новосибирск'},
                {key: 5, title: 'Нижний новгород'},
                {key: 6, title: 'Кострома'},
                {key: 7, title: 'Рыбинск'},
                {key: 8, title: 'Тверь'},
                {key: 9, title: 'Киров'},
                {key: 10, title: 'Калининград'}
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/dropdown_new/Input/Index'];
}
