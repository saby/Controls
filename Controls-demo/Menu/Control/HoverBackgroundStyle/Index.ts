import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import controlTemplate = require('wml!Controls-demo/Menu/Control/HoverBackgroundStyle/Index');

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _items: object[];
    protected _source: Memory;

    protected _beforeMount(): void {
        this._items = [
            { key: 1, title: 'DNS' },
            { key: 2, title: 'M.Video' },
            { key: 3, title: 'Citilink' },
            { key: 4, title: 'Eldorado' },
            { key: 5, title: 'Wildberries' },
            { key: 6, title: 'Ozon' }
        ];

        this._source = this._createMemory(this._items);
    }

    private _createMemory(items: object[]): Memory {
        return new Memory({
            data: items,
            keyProperty: 'key'
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Menu/Menu'];
}
