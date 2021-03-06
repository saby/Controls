import {Control, TemplateFunction} from 'UI/Base';
// @ts-ignore
import * as Template from 'wml!Controls-demo/toggle/Chips/ItemTemplate/itemTemplate';
import {RecordSet} from 'Types/collection';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _items1: RecordSet;
    protected _selectedKeys1: string[] = ['1'];

    protected _beforeMount(): void {
        this._items1 = new RecordSet({
            rawData: [
                {
                    id: '1',
                    caption: 'Кнопка',
                    counter: 5
                },
                {
                    id: '2',
                    caption: 'Кнопка',
                    counter: 10,
                    color: 'danger'
                },
                {
                    id: '3',
                    caption: 'Кнопка',
                    counter: 20,
                    color: 'info'
                }
            ],
            keyProperty: 'id'
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
