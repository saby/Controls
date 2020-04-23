import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Collection} from 'Controls/display';
import {getFewCategories as getData} from '../DemoHelpers/DataCatalog';

import * as Template from 'wml!Controls-demo/list_new/DragNDrop/DragNDrop';

import * as Dnd from '../../../Controls/dragnDrop';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _viewSource: Memory;
    protected _itemsReadyCallback: (items: RecordSet) => void = this._itemsReady.bind(this);
    protected _selectedKeys: number[] = [];

    private _itemsFirst: RecordSet;
    private _multiselect: 'visible' | 'hidden' = 'hidden';

    protected _beforeMount(options?: {}, contexts?: object, receivedState?: void): Promise<void> | void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
    }

    private _itemsReady(items: RecordSet): void {
        this._itemsFirst = items;
    }

    protected _dragStart(_: SyntheticEvent, items: number[]): void {
        const firstItem = this._itemsFirst.getRecordById(items[0]);

        return new Dnd.ItemsEntity({
            items,
            title: firstItem.get('title'),
        });
    }

    protected _dragEnd(_: SyntheticEvent, entity: Collection<Model>, target: unknown, position: string): void {
        this._children.listMover.moveItems(entity.getItems(), target, position);
    }

    protected _onToggle(): void {
        this._multiselect = this._multiselect === 'visible' ? 'hidden' : 'visible';
    }

}
