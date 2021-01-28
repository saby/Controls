import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/GetPrevGetNext/GetPrevGetNext';
import {Memory} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {DemoGetNextGetPrev as Data} from '../DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: unknown[] = Data.getColumns();
    protected _expandedItems = [];
    protected _items: RecordSet;
    protected _markedKey = null;
    protected _leafPosition: string = 'first';

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Data.getData(),
            filter: () => true
        });
        this._itemsReadyCallback = this._itemsReadyCallback.bind(this);
    }
    protected _itemsReadyCallback(items) {
        this._items = items;
    }
    protected _onMarkedKeyChanged(e, newMarkedKey) {
        const item = this._items.getRecordById(newMarkedKey);
        if (item && item.get('nodeType') === null) {
            this._markedKey = newMarkedKey;
        }
    }
    protected _onLeafPositionChanged(e, newLeafPosition) {
        this._leafPosition = newLeafPosition;
    }
    protected _goToNext(): void {
        this._children.tree.goToNext();
    }
    protected _goToPrev(): void {
        this._children.tree.goToPrev();
    }
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
