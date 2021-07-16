import {Control, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/Tabs/Buttons/UserContent/UserContent');
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
                    title: 'Document',
                    align: 'left',
                    contentTab: true

                },
                {
                    id: '2',
                    title: 'Files',
                    align: 'left'
                },
                {
                    id: '3',
                    title: 'Orders',
                    align: 'left'
                }
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Tabs/Buttons/Buttons', 'Controls-demo/Controls-demo'];
}
