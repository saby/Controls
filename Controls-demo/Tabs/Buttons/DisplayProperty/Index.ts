import {Control, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/Tabs/Buttons/DisplayProperty/DisplayProperty');
import {Memory} from 'Types/source';

export default class TabButtonsDemo extends Control {
    protected _template: TemplateFunction = template;

    protected SelectedKey: string = '1';
    protected _source: Memory | null = null;

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: '1',
                    carambola: 'Person card',
                    align: 'left'
                },
                {
                    id: '2',
                    carambola: 'Photos'
                },
                {
                    id: '3',
                    carambola: 'Videos'
                },
                {
                    id: '4',
                    carambola: 'Groups'
                },
                {
                    id: '5',
                    carambola: 'Documents'
                },
                {
                    id: '6',
                    carambola: 'Meetings'
                }
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Tabs/Buttons/Buttons', 'Controls-demo/Controls-demo'];
}
