import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/LookupNew/ReadOnly/MultiSelect/MultiSelect';
import {COMPANIES} from 'Controls-demo/LookupNew/resources/DataStorage';
import {Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _source: Memory = new Memory({
        keyProperty: 'id',
        data: COMPANIES
    });
    protected _selectedKeys: string[] = ['Иванова Зинаида Михайловна, ИП', 'Все юридические лица', 'Наша компания',
        'Сбербанк-Финанс, ООО', 'Петросоюз-Континент, ООО', 'Альфа Директ сервис, ОАО', 'АК "ТРАНСНЕФТЬ", ОАО', 'Ромашка, ООО'];
}