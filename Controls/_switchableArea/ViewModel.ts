import {factory} from 'Types/chain';
import * as cClone from 'Core/core-clone';

export default class ViewModel {
    private _items: object;

    constructor(items, selectedKey) {
        this._updateItems(items);
        this._updateLoadStatus(selectedKey);
    }

    updateSelectedKey(selectedKey): void {
        this._updateLoadStatus(selectedKey);
    }

    updateItems(items): void {
        this._updateItems(items);
    }

    private _updateLoadStatus(selectedKey): void {
        this._items.find((item) => {
            return selectedKey === item.key;
        }).loaded = true;
    }

    private _updateItems(items): void {
        const loadedItems = [];

        // TODO https://online.sbis.ru/opendoc.html?guid=c206e7a9-9d96-4a20-b386-d44d0f8ef4dc.
        // Запоминаем все загруженные вкладки
        if (this._items) {
            factory(this._items).each(function(item) {
                if (item.get) {
                    if (item.get('loaded')) {
                        loadedItems.push(item.get('key'));
                    }
                } else {
                    if (item.loaded) {
                        loadedItems.push(item.key);
                    }
                }
            });
        }

        this._items = cClone(items);

        // TODO https://online.sbis.ru/opendoc.html?guid=c206e7a9-9d96-4a20-b386-d44d0f8ef4dc.
        //  Восстанавливаем все загруженные вкладки
        factory(this._items).each((item) => {
            if (item.get) {
                if (loadedItems.indexOf(item.get('key')) > -1) {
                    item.set('loaded', true);
                }
            } else {
                if (loadedItems.indexOf(item.key) > -1) {
                    item.loaded = true;
                }
            }
        });

    }
}
