import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/listRender/itemTemplate/highlightOnHover/highlightOnHover';
import {generateSimpleData} from '../../data';
import { RecordSet } from 'Types/collection';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _items: RecordSet;

    protected _beforeMount(): void {
        this._items = new RecordSet({
            rawData: generateSimpleData({
                count: 3,
                keyProperty: 'key',
                displayProperty: 'caption'
            }),
            keyProperty: 'key'
        });
    }
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
