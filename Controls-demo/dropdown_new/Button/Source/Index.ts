import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/dropdown_new/Button/Source/Index');
import {Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'key',
            data: [
                {
                    key: '1',
                    icon: 'icon-EmptyMessage',
                    iconStyle: 'info',
                    title: 'Message'
                },
                {
                    key: '2',
                    title: 'Report'
                },
                {
                    key: '3',
                    icon: 'icon-TFTask',
                    title: 'Task'
                },
                {
                    key: '4',
                    title: 'News',
                    readOnly: true
                }
            ]
        });
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/dropdown_new/Button/Index'];
}
