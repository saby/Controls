import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Menu/Control/ItemActions/Index');
import {Memory} from 'Types/source';

class EmptyText extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _items: object[];
    protected _source: Memory;
    protected _itemActions: any[];

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

        this._itemActions = [
            {
                id: 1,
                icon: 'icon-Edit',
                iconStyle: 'secondary',
                title: 'edit',
                showType: 2,
                handler: (item) => alert(`Edit clicked at ${item.getId()}`)
            },
            {
                id: 2,
                icon: 'icon-Erase',
                iconStyle: 'danger',
                title: 'delete',
                showType: 2,
                handler: (item) => {
                    if (this._items.length <= 2) {
                        this._itemActions = null;
                    }
                    const index = this._items.findIndex((actionItem) => {
                        return actionItem.key === item.getId();
                    });
                    this._items.splice(index, 1);
                    this._source = this._createMemory(this._items);
                }
            }
        ];
    }

    private _createMemory(items: object[]): Memory {
        return new Memory({
            data: items,
            keyProperty: 'key'
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Menu/Menu'];
}
export default EmptyText;