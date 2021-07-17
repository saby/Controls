import {Control, TemplateFunction} from 'UI/Base';
import {RecordSet} from 'Types/collection';
import template = require('wml!Controls-demo/Tabs/Buttons/ItemAlign/ItemAlign');
import {Memory} from 'Types/source';
import 'wml!Controls-demo/Tabs/Buttons/resources/mainTemplate';

export default class TabButtonsDemo extends Control {
    protected _template: TemplateFunction = template;

    protected SelectedKey1: string = '1';
    protected SelectedKey2: string = '1';
    protected SelectedKey3: string = '1';
    protected SelectedKeyLeft: string = '1';
    protected _items: RecordSet | null = null;
    protected _sourceLeft: Memory | null = null;
    protected _source2: Memory | null = null;
    protected _source3: Memory | null = null;

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

        this._sourceLeft = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: '1',
                    title: 'Document',
                    align: 'left'
                },
                {
                    id: '2',
                    title: 'Files',
                    align: 'left'
                },
                {
                    id: '3',
                    align: 'left',
                    title: 'Orders'
                }
            ]
        });
        this._source2 = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: '1',
                    title: 'Задача в разработку №1263182638123681268716831726837182368172631239999',
                    align: 'left',
                    itemTemplate: 'wml!Controls-demo/Tabs/Buttons/resources/mainTemplate'
                },
                {
                    id: '2',
                    title: 'Photos'
                },
                {
                    id: '3',
                    title: 'Videos'
                },
                {
                    id: '4',
                    title: 'Groups'
                },
                {
                    id: '5',
                    title: 'Documents'
                },
                {
                    id: '6',
                    title: 'Meetings'
                }
            ]
        });
        this._source3 = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: '1',
                    title: 'Meetings',
                    align: 'left',
                    itemTemplate: 'wml!Controls-demo/Tabs/Buttons/resources/mainTemplate'
                },
                {
                    id: '2',
                    align: 'left',
                    title: 'Photos'
                },
                {
                    id: '3',
                    align: 'left',
                    title: 'Videos'
                },
                {
                    id: '4',
                    title: 'Groups'
                }
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Tabs/Buttons/Buttons', 'Controls-demo/Controls-demo'];
}
