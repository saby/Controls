import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/DragNDrop/DragNDrop';
import * as ListEntity from 'Controls-demo/DragNDrop/ListEntity';
import {HierarchicalMemory} from 'Types/source';
import {Gadgets} from '../DemoHelpers/DataCatalog';
import {RecordSet} from 'Types/collection';
import { TRoot, TItemsReadyCallback } from 'Controls-demo/types';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Collection} from 'Controls/display';
import {Model} from 'Types/entity';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: HierarchicalMemory;
    protected _columns = Gadgets.getGridColumnsForFlat();
    protected _viewMode: string = 'table';
    protected _root: TRoot = null;
    protected _selectedKeys: Number[] = [];
    protected _itemsReadyCallback: TItemsReadyCallback = this._itemsReady.bind(this);
    private _multiselect: 'visible'|'hidden' = 'hidden';
    private _items: RecordSet;

    protected _beforeMount(): void {
        this._viewSource = new HierarchicalMemory({
            keyProperty: 'id',
            data: Gadgets.getFlatData(),
            parentProperty: 'parent'
        });
    }

    private _itemsReady(items: RecordSet): void {
        this._items = items;
    }

    protected _dragStart(_, items: number[]): ListEntity {
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

    protected _dragEnd(_: SyntheticEvent, entity: Collection<Model>, target: unknown, position: string): void {
        this._children.listMover.moveItems(entity.getItems(), target, position);
    }
    protected _onToggle(): void {
        this._multiselect = this._multiselect === 'visible' ? 'hidden' : 'visible';
    }


    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
