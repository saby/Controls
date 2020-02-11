import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/DragNDrop/DragNDrop';
import {Memory} from 'Types/source';
import {DragNDrop} from '../DemoHelpers/DataCatalog';

import 'css!Controls-demo/Controls-demo';
import * as Dnd from "../../../Controls/dragnDrop";


export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _itemsReadyCallback = this._itemsReady.bind(this);
    protected _columns = DragNDrop().columns;
    protected _selectedKeys = [];
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

    protected _dragStart(event, items) {
        var firstItem = this._itemsFirst.getRecordById(items[0]);

        return new Dnd.ItemsEntity({
            items: items,
            title: firstItem.get('title'),
        });
    };
    protected _dragEnd(_, entity, target, position) {
        this._children.listMover.moveItems(entity.getItems(), target, position);
    }
    protected _onToggle() {
        this._multiselect = this._multiselect === 'visible' ? 'hidden' : 'visible';
    }


}
