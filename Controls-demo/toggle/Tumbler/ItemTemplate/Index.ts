import {Control, TemplateFunction} from 'UI/Base';
import * as Template from "wml!Controls-demo/toggle/Tumbler/ItemTemplate/ItemTemplate";
import {RecordSet} from 'Types/collection';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _items: RecordSet;
    protected _selectedKey: string = '1';

    protected _beforeMount(): void {
        this._items = new RecordSet({
            rawData: [
                {
                    id: '1',
                    caption: 'Название 1',
                    count: 10,
                    counter: 15
                },
                {
                    id: '2',
                    caption: 'Название 2'
                }
            ],
            keyProperty: 'id'
        });
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
