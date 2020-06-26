import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/ColumnScroll/DragScrolling/DragScrolling';
import {Memory} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {SyntheticEvent} from 'Vdom/Vdom';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import * as Dnd from 'Controls/dragnDrop';
import { IColumn } from 'Controls/_grid/interface/IColumn';
import { IHeader } from 'Controls-demo/types';
import {Collection} from 'Controls/display';
import {Model} from 'Types/entity';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _itemsReadyCallback: (items: RecordSet) => void = this._itemsReady.bind(this);
    protected _header: IHeader[] = getCountriesStats().getMultiHeaderForDragScrolling();
    protected _columns: IColumn[] = getCountriesStats().getColumnsForDragScrolling();
    protected _selectedKeys: number[] = [];
    protected _itemsDragNDrop: boolean = true;
    protected _dragScrolling: boolean = true;
    protected _itemsFirst: RecordSet;
    protected _dndDelay: number = 250;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
    }

    private _itemsReady(items: RecordSet): void {
        this._itemsFirst = items;
    }

    protected _dragStart(_: SyntheticEvent, draggedKeys: number[]): any {
        let title = '';

        draggedKeys.forEach((draggedItemKey) => {
            title += this._itemsFirst.getRecordById(draggedItemKey).get('country') + ', ';
        });

        return new Dnd.ItemsEntity({
            items: draggedKeys,
            title: title.trim().slice(0, title.length - 2)
        });
    };
    protected _dragEnd(_: SyntheticEvent, entity: Collection<Model>, target: unknown, position: string): void {
        this._selectedKeys = [];
        this._children.listMover.moveItems(entity.getItems(), target, position);
    }

    static _styles: string[] = ['Controls-demo/grid/ColumnScroll/DragScrolling/DragScrolling', 'Controls-demo/Controls-demo'];
}
