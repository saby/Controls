import {Control, TemplateFunction} from "UI/Base";
import * as Template from "wml!Controls-demo/toggle/Tumbler/Template";
import {RecordSet} from 'Types/collection';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _items1: RecordSet;
    protected _items2: RecordSet;
    protected _selectedKey1: string = '1';
    protected _selectedKey2: string = '5';
    protected _beforeMount(): void {
        this._items1 = new RecordSet({
            rawData: [
                {
                    id: '1',
                    caption: 'Название 1'
                },
                {
                    id: '2',
                    caption: 'Название 2'
                }
            ],
            keyProperty: 'id'
        });
        this._items2 = new RecordSet({
            rawData: [
                {
                    id: '1',
                    caption: 'Название 1'
                },
                {
                    id: '2',
                    caption: 'Название 2'
                },
                {
                    id: '3',
                    caption: 'Название 3'
                },
                {
                    id: '4',
                    caption: '4'
                },
                {
                    id: '5',
                    caption: 'Название 5'
                }
            ],
            keyProperty: 'id'
        });
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
