import {Control, TemplateFunction} from 'UI/Base';
// @ts-ignore
import * as Template from 'wml!Controls-demo/toggle/Chips/displayProperty/Template';
import {RecordSet} from 'Types/collection';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _items1: RecordSet;
    protected _selectedKeys1: string = ['1'];
    protected _selectedKeys2: string = ['1'];

    protected _beforeMount(): void {
        this._items1 = new RecordSet({
            rawData: [
                {
                    id: '1',
                    caption: 'caption 1',
                    title: 'title 1'
                },
                {
                    id: '2',
                    caption: 'caption 2',
                    title: 'title 2'
                }
            ],
            keyProperty: 'id'
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}