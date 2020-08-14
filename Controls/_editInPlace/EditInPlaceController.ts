import {Collection, CollectionItem} from './../display';
import {entityRecord} from 'Types/entity';
import {RecordSet} from '../../application/Types/collection';

export const CONSTANTS = {
    CANCEL: 'Cancel',
    VALIDATION_FAILED: 'ValidationFailed'
};

interface IEditableItem {
    // должно быть true, а не boolean. Сделано так из за breadCrumbs, которые отнаследованы от CollectionItem.
    readonly '[Types/_interface/IEditableItem]': boolean;

    isEditing(): boolean;
    setEditing(isEditing: boolean);

    getContents(): entityRecord
}

interface IEditableCollection {
    setEditingItem(item: IEditableItem)
    getEditingItem(item: IEditableItem)
}

export interface IEditInPlaceControllerOptions {
    collection: Collection<entityRecord, CollectionItem<entityRecord> & IEditableItem> & IEditableCollection;
    addPosition?: 'top' | 'bottom'
}

export class EditInPlaceController {
    private _isAdd: boolean = false;
    private _options: IEditInPlaceControllerOptions;
    private _editingItem: IEditableItem & CollectionItem<entityRecord>;
    private _originalItemContents: entityRecord;

    constructor(options: IEditInPlaceControllerOptions) {
        this.updateOptions(options);
    }

    updateOptions(options: IEditInPlaceControllerOptions) {
        this._options = {
            ...options,
            addPosition: options.addPosition || 'bottom'
        }
    }

    isEditing(): boolean {
        return !!this._editingItem
    }

    isAdd(): boolean {
        return this._isAdd;
    }

    getOriginalItemContents(): entityRecord | null {
        return this._isAdd ? this._editingItem.getContents() : this._originalItemContents;
    }

    edit(item: entityRecord) {
        if (this._editingItem) {
            return;
        }

        this._isAdd = this._options.collection.getIndexByKey(item.getKey()) === -1;
        const itemKey = item.get(this._options.collection.getKeyProperty());

        if (this._isAdd) {
            const recordSet = this._options.collection.getCollection() as unknown as RecordSet;

            if(this._options.addPosition === 'top') {
                recordSet.prepend([item]);
            } else {
                recordSet.append([item]);
            }
            recordSet.acceptChanges();
            this._editingItem = this._options.collection.getItemBySourceKey(itemKey);
        } else {
            this._editingItem = this._options.collection.getItemBySourceKey(itemKey);
            this._originalItemContents = item.clone();
        }

        this._options.collection.setEditingItem(this._editingItem);
    }

    end(commit: boolean) {
        if (!this._editingItem) {
            return;
        }

        const recordSet = this._options.collection.getCollection() as unknown as RecordSet;

        if (!commit) {
            if (this._isAdd) {
                recordSet.remove(this._editingItem.getContents());
            } else {
                this._editingItem.setContents(this._originalItemContents);
            }
        }

        this._editingItem.getContents().acceptChanges();
        recordSet.acceptChanges();

        this._editingItem = null;
        this._originalItemContents = null;
        this._isAdd = false;
        this._options.collection.setEditingItem(null);
    }
}
