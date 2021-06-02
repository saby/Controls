import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/DragNDrop/DragNDrop';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Collection} from 'Controls/display';
import {Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import { TItemsReadyCallback } from 'Controls-demo/types';
import {DnD} from "Controls-demo/gridNew/DemoHelpers/Data/DnD";
import {ItemsEntity} from "Controls/dragnDrop";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _itemsReadyCallback: TItemsReadyCallback = this._itemsReady.bind(this);
    protected _columns: IColumn[] = DnD.getColumns();
    protected _selectedKeys: Number[] = [];
    private _multiselect: 'visible'|'hidden' = 'hidden';
    private _itemsFirst: RecordSet = null;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: DnD.getData()
        });
    }

    private _itemsReady(items: RecordSet): void {
        this._itemsFirst = items;
    }

    protected _dragStart(_: SyntheticEvent, items: number[]): ItemsEntity {
        const firstItem = this._itemsFirst.getRecordById(items[0]);

        return new ItemsEntity({
            items,
            title: firstItem.get('title')
        });
    }

    protected _dragEnd(_: SyntheticEvent, entity: Collection<Model>, target: unknown, position: string): void {
        this._selectedKeys = [];
        this._children.listMover.moveItems(entity.getItems(), target, position);
    }
    protected _onToggle(): void {
        this._multiselect = this._multiselect === 'visible' ? 'hidden' : 'visible';
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
