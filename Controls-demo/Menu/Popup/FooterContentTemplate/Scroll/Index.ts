import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Menu/Popup/FooterContentTemplate/Scroll/Index');
import {Memory} from 'Types/source';

class FooterContentTemplateSimple extends Control {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;

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

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Menu/Menu'];

}
export default FooterContentTemplateSimple;
