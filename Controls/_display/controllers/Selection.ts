import { IBaseCollection, TItemKey } from '../interface';
import { Model } from 'Types/entity';

export interface ISelectionItem {
    getContents(): Model;
    setSelected(selected: boolean, silent?: boolean): void;
    isSelected(): boolean;
}

export interface ISelectionCollection extends IBaseCollection<ISelectionItem> {
    each(cb: (item: ISelectionItem) => void): void;
}

export type TSelectionMap = Map<TItemKey, boolean>;

export function selectItems(
    collection: ISelectionCollection,
    selection: TSelectionMap
): void {
    collection.each((item: ISelectionItem) => {
        const itemId: TItemKey = item.getContents().getKey();
        let selected: boolean = false;

        if (selection.has(itemId)) {
            selected = selection.get(itemId);
        }

        item.setSelected(selected, true);
    });
    collection.nextVersion();
}

export function selectItem(
    collection: ISelectionCollection,
    key: TItemKey,
    state: boolean
): void {
    const item = collection.getItemBySourceKey(key);
    if (item) {
        item.setSelected(state, true);
        collection.nextVersion();
    }
}
