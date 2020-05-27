import { IEditInPlaceCollection } from './interface';

import AddInPlaceStrategy from '../itemsStrategy/AddInPlace';
import { Model } from 'Types/entity';
import { IEditingConfig } from '../Collection';

export default class Controller {

    beginEdit(
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

    endEdit(collection: IEditInPlaceCollection): void {
        beginEdit(collection, null);
    }

    beginAdd(
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

    endAdd(collection: IEditInPlaceCollection): void {
        collection.removeStrategy(AddInPlaceStrategy);
    }

    isEditing(collection: IEditInPlaceCollection): boolean {
        return !!this.getEditedItem(collection);
    }

    getEditedItem(collection: IEditInPlaceCollection): IEditInPlaceItem {
        return collection.find((item) => item.isEditing());
    }
}

