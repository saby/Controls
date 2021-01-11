import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/EditInPlace/DragNDrop/DragNDrop';
import * as FirstColumn from 'wml!Controls-demo/gridNew/EditInPlace/DragNDrop/FirstColumn';
import {Memory} from 'Types/source';
import {getPorts} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Model} from 'Types/entity';
import * as Dnd from '../../../../Controls/dragnDrop';
import {Collection, TColspanCallbackResult} from 'Controls/display';
import {RecordSet} from 'Types/collection';
import {TItemsReadyCallback} from '../../../types';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = getPorts().getColumnsDND();
    protected _documentSignMemory: Memory;
    private data: object[] = getPorts().getData().map((cur) => this.getData(cur));
    protected selectedKey: number = 1;
    private _itemsFirst: RecordSet = null;
    protected _itemsReadyCallback: TItemsReadyCallback = this._itemsReady.bind(this);
    protected _selectedKeys: Number[] = [];

    private getData(data: object): object {
        for (const key in data) {
            if (data[key]) {
                data[key] = '' + data[key];
            } else {
                data[key] = '';
            }

        }
        return data;
    }

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this.data
        });

        this._documentSignMemory = new Memory({
            keyProperty: 'id',
            data: getPorts().getDocumentSigns()
        });

        this._columns[0].template = FirstColumn;
    }

    private onChange = (_: SyntheticEvent, name: string, item: Model, value: number): void => {
        item.set(name, value);
    };

    private _itemsReady(items: RecordSet): void {
        this._itemsFirst = items;
    }

    protected _colspanCallback(item, column, columnIndex, isEditing): TColspanCallbackResult {
        return isEditing ? 'end' : undefined;
    }

    protected _dragStart(_: SyntheticEvent, items: number[]): void {
        const firstItem = this._itemsFirst.getRecordById(items[0]);

        return new Dnd.ItemsEntity({
            items,
            title: firstItem.get('title')
        });
    }

    protected _dragEnd(_: SyntheticEvent, entity: Collection<Model>, target: unknown, position: string): void {
        this._selectedKeys = [];
        this._children.listMover.moveItems(entity.getItems(), target, position);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
