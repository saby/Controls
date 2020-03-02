import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Explorer_new/DragNDropWithTile/DragNDropWithTile';
import * as ListEntity from 'Controls-demo/DragNDrop/ListEntity';
import * as MemorySource from 'Controls-demo/Explorer/ExplorerMemory';
import {Gadgets} from '../DataHelpers/DataCatalog';

import 'css!Controls-demo/Controls-demo';


export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource;
    protected _columns = Gadgets.getColumns();
    protected _viewMode: string = 'tile';
    protected _root = null;
    protected _selectedKeys = [];
    protected _itemsReadyCallback = this._itemsReady.bind(this);
    private _multiselect: 'visible'|'hidden' = 'hidden';

    protected _beforeMount() {
        this._viewSource = new MemorySource({
            keyProperty: 'id',
            data: Gadgets.getData(),
            parentProperty: 'parent'
        });
    }

    private _itemsReady(items) {
        this._items = items;
    }

    protected _dragStart(_, items) {
        let hasBadItems = false;
        const firstItem = this._items.getRecordById(items[0]);

        items.forEach(function(item) {
            if (item === 0) {
                hasBadItems = true;
            }
        });
        return hasBadItems ? false : new ListEntity({
            items: items,
            mainText: firstItem.get('title'),
            image: firstItem.get('image'),
            additionalText: firstItem.get('additional')
        });
    }

    protected _dragEnd(_, entity, target, position) {
        this._children.listMover.moveItems(entity.getItems(), target, position);
    }

    protected _onToggle() {
        this._multiselect = this._multiselect === 'visible' ? 'hidden' : 'visible';
    }

}
