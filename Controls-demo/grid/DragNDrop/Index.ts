import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/DragNDrop/DragNDrop';
import * as ListEntity from 'Controls-demo/DragNDrop/ListEntity';
import {Memory} from 'Types/source';
import {DragNDrop} from '../DemoHelpers/DataCatalog';

import 'css!Controls-demo/Controls-demo';
import * as Dnd from "../../../Controls/dragnDrop";


export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _itemsReadyCallback = this._itemsReady.bind(this);
    private _columns = DragNDrop().columns;
    private _selectedKeys = [];
    private _multiselect: 'visible'|'hidden' = 'hidden';

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: DragNDrop().data,
        });
    }

    private _itemsReady(items) {
        this._itemsFirst = items;
    };

    private _dragStart(event, items) {
        var firstItem = this._itemsFirst.getRecordById(items[0]);

        return new Dnd.ItemsEntity({
            items: items,
            title: firstItem.get('title'),
        });
    };
    private _dragEnd(_, entity, target, position) {
        this._children.listMover.moveItems(entity.getItems(), target, position);
    }
    private _onToggle() {
        this._multiselect = this._multiselect === 'visible' ? 'hidden' : 'visible';
    }


}
