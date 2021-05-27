import {Control, TemplateFunction} from 'UI/Base';
// @ts-ignore
import * as Template from 'wml!Controls-demo/toggle/ButtonGroup/AllowEmptySelection/AllowEmptySelection';
import {RecordSet} from 'Types/collection';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _items: RecordSet;
    protected _selectedKey1: string = '1';
    protected _selectedKey2: string = '1';

    protected _beforeMount(): void {
        this._items = new RecordSet({
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

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}