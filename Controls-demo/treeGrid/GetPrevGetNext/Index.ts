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
    protected _currentItem;
    protected _tempItem;
    protected _items: RecordSet = null;
    protected _doAfterItemExpanded = null;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Data.getData(),
            filter: () => true
        });
        this._itemsReadyCallback = this._itemsReadyCallback.bind(this);
    }
    
    protected _itemsReadyCallback(items): void {
        this._items = items;
    }

    protected _afterMount(): void {
        let current = this._items.getRecordById(this._currentItem);
        if (current.get('nodeType')) {
            this._expand(current);
            this._tempItem = current.getKey();
            this._doAfterItemExpanded = () => {
                this._doAfterItemExpanded = null;
                this._goToNext();
            }
        }
    }
    protected _drawItemsHandler(): void {
        if (this._doAfterItemExpanded) {
            this._doAfterItemExpanded();
            this._doAfterItemExpanded;
        }
    }

    protected _expand(item): boolean {
        if (item.get('nodeType')) {
            const key = item.getKey();
            if (this._expandedItems.indexOf(key) === -1) {
                this._expandedItems = [...this._expandedItems, key];
                return true;
            }
        }
    }
    protected _goToNext(): void {
        let item = this._children.tree.getNextItem(this._tempItem || this._currentItem);
        if (item) {
            this._tempItem = item.getKey();
            if (item.get('nodeType')) {
                this._doAfterItemExpanded = () => {
                    this._doAfterItemExpanded = null;
                    this._goToNext();
                }
                if (!this._expand(item)) {
                    this._doAfterItemExpanded();
                }
            } else {
                this._currentItem = this._tempItem;
                this._tempItem = null;
            }
        } else {
            this._tempItem = null;
        }
    }
    protected _goToPrev(): void {
        let item = this._children.tree.getPrevItem(this._tempItem || this._currentItem);
        if (item) {
            this._tempItem = item.getKey();
            if (item.get('nodeType')) {
                this._doAfterItemExpanded = () => {
                    this._doAfterItemExpanded = null;
                    this._goToPrev();
                }
                if (!this._expand(item)) {
                    this._doAfterItemExpanded();
                }
            } else {
                this._currentItem = this._tempItem;
                this._tempItem = null;
            }
        } else {
            this._tempItem = null;
        }
    }
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
