import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/DragNDrop/DragNDrop';
import {Memory} from 'Types/source';
import {DragNDrop} from '../DemoHelpers/DataCatalog';
import * as Dnd from "../../../Controls/dragnDrop";
import { IColumn } from 'Controls/_grid/interface/IColumn';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Collection} from 'Controls/display';
import {Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _itemsReadyCallback: any = this._itemsReady.bind(this);
    protected _columns: IColumn[] = DragNDrop().columns;
    protected _selectedKeys: Number[] = [];
    private _multiselect: 'visible'|'hidden' = 'hidden';
    private _itemsFirst: any = null;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: DragNDrop().data,
        });
    }

    private _itemsReady(items: RecordSet): void {
        this._itemsFirst = items;
    };

    protected _dragStart(_, items: number[]): void {
        var firstItem = this._itemsFirst.getRecordById(items[0]);

        return new Dnd.ItemsEntity({
            items: items,
            title: firstItem.get('title'),
        });
    };
    protected _dragEnd(_: SyntheticEvent, entity: Collection<Model>, target: unknown, position: string): void {
        this._selectedKeys = [];
        this._children.listMover.moveItems(entity.getItems(), target, position);
    }
    protected _onToggle(): void {
        this._multiselect = this._multiselect === 'visible' ? 'hidden' : 'visible';
    }



    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
