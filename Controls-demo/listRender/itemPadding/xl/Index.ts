import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/listRender/itemPadding/xl/xl';
import {generateSimpleData} from '../../data';
import { RecordSet } from 'Types/collection';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _items: RecordSet;
    protected _itemPadding: {} = {
        left: 'xl',
        right: 'xl',
        top: 'xl',
        bottom: 'xl'
    };

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