import {Control, TemplateFunction} from 'UI/Base';
import {RecordSet} from 'Types/collection';
import template = require('wml!Controls-demo/Tabs/Buttons/HorizontalScroll/Template');

export default class TabButtonsDemo extends Control {
    protected _template: TemplateFunction = template;

    protected _selectedKey: string;
    protected _items: RecordSet | null = null;

    protected _beforeMount(): void {
        const rawData = [{
            id: '1',
            title: 'Info',
            isMainTab: true,
            align: 'left'
        }, {
            id: '2',
            title: 'Files',
            align: 'left'
        }, {
            id: '3',
            title: 'Orders',
            align: 'left'
        }, {
            id: '4',
            title: 'Document',
            align: 'left'
        }, {
            id: '5',
            title: 'Team',
            align: 'left'
        }];

        this._selectedKey = rawData[0].id;

        this._items = new RecordSet({
            keyProperty: 'id',
            rawData: rawData
        });
    }

    static _styles: string[] = ['Controls-demo/Tabs/Buttons/Buttons', 'Controls-demo/Controls-demo'];
}
