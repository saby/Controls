import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/OpenUrl/Template';
import {Memory} from 'Types/source';

const DATA = [
    {
        key: 1,
        title: 'В этом списке',
        url: 'Controls-demo%2Flist_new%2FOpenUrl%2FPages%2FFirst'
    },
    {
        key: 2,
        title: 'При нажатии на записи',
        url: 'Controls-demo%2Flist_new%2FOpenUrl%2FPages%2FSecond'
    },
    {
        key: 3,
        title: 'Средней кнопкой',
        url: 'Controls-demo%2Flist_new%2FOpenUrl%2FPages%2FThird'
    },
    {
        key: 4,
        title: 'Открываются новые вкладки',
        url: 'Controls-demo%2Flist_new%2FOpenUrl%2FPages%2FFourth'
    }
];
export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: DATA
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
