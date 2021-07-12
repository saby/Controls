import {Control, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/Tabs/Buttons/WithPhoto/WithPhoto');
import {Memory} from 'Types/source';
import 'wml!Controls-demo/Tabs/Buttons/resources/photoContent';

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
                    title: 'Person card',
                    align: 'left',
                    carambola: 'wml!Controls-demo/Tabs/Buttons/resources/photoContent',
                    type: 'photo'
                },
                {
                    id: '2',
                    title: 'Documents',
                    align: 'left'
                },
                {
                    id: '3',
                    title: 'Photos',
                    align: 'left'
                },
                {
                    id: '4',
                    title: 'Groups',
                    align: 'left'
                },
                {
                    id: '5',
                    title: 'Meetings'
                },
                {
                    id: '6',
                    title: 'Videos'
                },
                {
                    id: '7',
                    title: '',
                    carambola: 'wml!Controls-demo/Tabs/Buttons/resources/photoContent',
                    type: 'photo'
                }
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Tabs/Buttons/Buttons', 'Controls-demo/Controls-demo'];
}
