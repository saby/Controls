import { TItemKey, IBaseCollection, IStrategyCollection } from '../interface';

import AddInPlaceStrategy from '../itemsStrategy/AddInPlace';
import { Model } from 'Types/entity';
import { IEditingConfig } from '../Collection';

export interface IEditInPlaceItem {
    setEditing(editing: boolean, editingContents?: unknown): void;
    isEditing(): boolean;
}

export interface IEditInPlaceCollection
    extends IBaseCollection<IEditInPlaceItem>, IStrategyCollection<IEditInPlaceItem> {
    getEditingConfig(): IEditingConfig;
}

export function beginEdit(
    collection: IEditInPlaceCollection,
    key: TItemKey,
    editingContents?: unknown
): void {
    const oldEditItem = getEditedItem(collection);
    const newEditItem = collection.getItemBySourceKey(key);

    if (oldEditItem) {
        oldEditItem.setEditing(false);
    }
    if (newEditItem) {
        newEditItem.setEditing(true, editingContents);
    }

    collection.nextVersion();
}

export function endEdit(collection: IEditInPlaceCollection): void {
    beginEdit(collection, null);
}

export function beginAdd(
    collection: IEditInPlaceCollection,
    record: Model
): void {
    const editingConfig = collection.getEditingConfig();

    // TODO support tree
    const addIndex = editingConfig?.addPosition === 'top' ? 0 : Number.MAX_SAFE_INTEGER;

    collection.appendStrategy(AddInPlaceStrategy, {
        contents: record,
        addIndex
    });
}

export function endAdd(collection: IEditInPlaceCollection): void {
    collection.removeStrategy(AddInPlaceStrategy);
}

export function isEditing(collection: IEditInPlaceCollection): boolean {
    return !!getEditedItem(collection);
}

export function getEditedItem(collection: IEditInPlaceCollection): IEditInPlaceItem {
    return collection.find((item) => item.isEditing());
}
