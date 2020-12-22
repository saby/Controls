import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/dropdown_new/Button/FontColorStyle/Index');
import {Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'key',
            data: [
                {key: 1, title: 'Ярославль'},
                {key: 2, title: 'Москва'},
                {key: 3, title: 'Санкт-Петербург'}
            ]
        });
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
