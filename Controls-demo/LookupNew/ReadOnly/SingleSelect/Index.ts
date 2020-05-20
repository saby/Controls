import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/LookupNew/ReadOnly/SingleSelect/SingleSelect';
import {COMPANIES} from 'Controls-demo/LookupNew/resources/DataStorage';
import {Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _source: Memory = new Memory({
        keyProperty: 'id',
        data: COMPANIES
    });
    protected _selectedKeys: string[] = ['Иванова Зинаида Михайловна, ИП'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}