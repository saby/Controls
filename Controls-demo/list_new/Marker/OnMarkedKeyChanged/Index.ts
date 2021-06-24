import {Control, TemplateFunction} from 'UI/Base';
import {RecordSet} from 'Types/collection';
import {Memory, CrudEntityKey} from 'Types/source';
import {SyntheticEvent} from 'Vdom/Vdom';

import * as Template from 'wml!Controls-demo/list_new/Marker/OnMarkedKeyChanged/OnMarkedKeyChanged';

const data = [
    {
        id: 1,
        title: 'На записи разрешена установка маркера',
        markable: true
    },
    {
        id: 2,
        title: 'На записи запрещена установка маркера',
        markable: false
    },
    {
        id: 3,
        title: 'На записи разрешена установка маркера',
        markable: true
    }
];

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _markedKey: CrudEntityKey;
    protected _boundItemsReadyCallback: Function;
    protected _items: RecordSet;

    protected _beforeMount(): void {
        this._boundItemsReadyCallback = this._itemsReadyCallback.bind(this);
        this._viewSource = new Memory({
            keyProperty: 'id',
            data
        });
    }

    _onMarkedKeyChanged(event: SyntheticEvent, key: CrudEntityKey): void {
        const item = this._items.getRecordById(key);
        if (item && item.get('markable') === true) {
            this._markedKey = key;
        }
    }

    _itemsReadyCallback(items: RecordSet): void {
        this._items = items;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
