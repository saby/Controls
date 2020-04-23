import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Menu/Popup/FooterContentTemplate/Index');
import {Memory} from 'Types/source';

class FooterContentTemplate extends Control {
    protected _template: TemplateFunction = controlTemplate;
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Menu/Menu'];
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

}
export default FooterContentTemplate;
