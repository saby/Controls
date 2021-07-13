import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';

import * as Template from 'wml!Controls-demo/gridNew/Ladder/BasicLadder/Template';

const DATA = [
    {
        key: 1,
        string: 'Лесенка',
        number: 123456789,
        money: 100.5
    }, {
        key: 2,
        string: 'Лесенка',
        number: 1000000,
        money: 25.99
    }, {
        key: 3,
        string: 'без использования',
        number: 1000000,
        money: 25.99
    }, {
        key: 4,
        string: 'прикладных',
        number: 300,
        money: 25.99
    }, {
        key: 5,
        string: 'прикладных',
        number: 300,
        money: 14999.90
    }, {
        key: 6,
        string: 'шаблонов.',
        number: 100500,
        money: 14999.90
    }
];
export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: object[] = [
            {
                displayProperty: 'key',
                width: '150px'
            },
            {
                displayProperty: 'string',
                displayType: 'string',
                width: '150px'
            },
            {
                displayProperty: 'number',
                displayType: 'number',
                width: '150px'
            },
            {
                displayProperty: 'money',
                displayType: 'money',
                width: '150px'
            }
        ];
    protected _ladderProperties: string[] = ['string', 'number', 'money'];
    protected _header: object[] = [
        { title: 'Ключ' },
        { title: 'Строка' },
        { title: 'Число' },
        { title: 'Деньги' }
    ];

    protected _beforeMount(options?: {}, contexts?: object, receivedState?: void): Promise<void> | void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: DATA
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
