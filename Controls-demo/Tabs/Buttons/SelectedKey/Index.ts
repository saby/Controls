import {Control, TemplateFunction} from 'UI/Base';
import {RecordSet} from 'Types/collection';
import template = require('wml!Controls-demo/Tabs/Buttons/SelectedKey/SelectedKey');

export default class TabButtonsDemo extends Control {
    protected _template: TemplateFunction = template;

    protected SelectedKey: string | null = null;
    protected _items: RecordSet | null = null;

    protected _beforeMount(): void {
        this._items = new RecordSet({
            keyProperty: 'id',
            rawData: [
                {
                    id: '1',
                    title: 'Document'
                },
                {
                    id: '2',
                    title: 'Files'
                },
                {
                    id: '3',
                    title: 'Orders'
                }
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Tabs/Buttons/Buttons', 'Controls-demo/Controls-demo'];
}
