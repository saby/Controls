import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/ColumnScroll/DragScrolling/DragScrolling';
import {Memory} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import * as Dnd from 'Controls/dragnDrop';


export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _itemsReadyCallback: (items: RecordSet) => void = this._itemsReady.bind(this);
    private _header = getCountriesStats().getMultiHeaderForDragScrolling();
    private _columns = getCountriesStats().getColumnsForDragScrolling();
    private _selectedKeys = [];
    private _itemsDragNDrop: boolean = true;
    private _dragScrolling: boolean = true;
    private _itemsFirst: RecordSet;
    private _dndDelay: number = 250;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData().slice(0, 10)
        });
    }

    private _itemsReady(items: RecordSet): void {
        this._itemsFirst = items;
    }

    protected _dragStart(_, draggedKeys) {
        let title = '';

        draggedKeys.forEach((draggedItemKey) => {
            title += this._itemsFirst.getRecordById(draggedItemKey).get('country') + ', ';
        });

        return new Dnd.ItemsEntity({
            items: draggedKeys,
            title: title.trim().slice(0, title.length - 2)
        });
    };
    protected _dragEnd(_, entity, target, position) {
        this._selectedKeys = [];
        this._children.listMover.moveItems(entity.getItems(), target, position);
    }

    static _styles: string[] = ['Controls-demo/grid/ColumnScroll/DragScrolling/DragScrolling', 'Controls-demo/Controls-demo'];
}
