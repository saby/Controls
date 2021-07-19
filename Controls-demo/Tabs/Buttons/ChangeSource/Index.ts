import {Control, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/Tabs/Buttons/ChangeSource/ChangeSource');
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
                    title:
                        'Task number 12345678901234567890'
                },
                {
                    id: '2',
                    title: 'News',
                    align: 'left'
                },
                {
                    id: '3',
                    title: 'Meetings'
                }
            ]
        });
    }

    protected _setSource(): void {
        this._source = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: '1',
                    title: 'Videos'
                },
                {
                    id: '2',
                    title: 'Groups'
                },
                {
                    id: '3',
                    title: 'Photos'
                }
            ]
        });
        this._source.destroy();
    }

    static _styles: string[] = ['Controls-demo/Tabs/Buttons/Buttons', 'Controls-demo/Controls-demo'];
}
