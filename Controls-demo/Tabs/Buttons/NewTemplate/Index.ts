import {Control, TemplateFunction} from 'UI/Base';
import {RecordSet} from 'Types/collection';
import {data} from '../tabsItems';
import template = require('wml!Controls-demo/Tabs/Buttons/NewTemplate/Template');

export default class TabButtonsDemo extends Control {
    protected _template: TemplateFunction = template;

    protected SelectedKey1: string = '1';
    protected SelectedKey2: string =  '1';
    protected SelectedKey3: string =  '1';
    protected SelectedKey4: string =  '1';
    protected _items1: RecordSet | null = null;
    protected _items3: RecordSet | null = null;
    protected _items4: RecordSet | null = null;
    protected _items5: RecordSet | null = null;
    protected _items6: RecordSet | null = null;
    protected _items7: RecordSet | null = null;
    protected _items8: RecordSet | null = null;

    protected _beforeMount(): void {
        this._items1 = new RecordSet({
            keyProperty: 'id',
            rawData: data.getItems1()
        });
        this._items3 = new RecordSet({
            keyProperty: 'id',
            rawData: data.getItems3()
        });
        this._items4 = new RecordSet({
            keyProperty: 'id',
            rawData: data.getItems4()
        });
        this._items5 = new RecordSet({
            keyProperty: 'id',
            rawData: data.getItems5()
        });
        this._items6 = new RecordSet({
            keyProperty: 'id',
            rawData: data.getItems6()
        });
        this._items7 = new RecordSet({
            keyProperty: 'id',
            rawData: data.getItems7()
        });
        this._items8 = new RecordSet({
            keyProperty: 'id',
            rawData: data.getItems8()
        });
    }

    static _styles: string[] = ['Controls-demo/Tabs/Buttons/Buttons', 'Controls-demo/Controls-demo'];
}
