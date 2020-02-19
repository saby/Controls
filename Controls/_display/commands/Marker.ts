import { IBaseCollection, ICollectionCommand, TItemKey } from '../interface';

export interface IMarkerItem {
    setMarked(marked: boolean): void;
    isMarked(): boolean;
}

export class Mark implements ICollectionCommand<IMarkerItem> {
    constructor(private key: TItemKey) {}

    execute(collection: IBaseCollection<IMarkerItem>): void {
        const oldMarkedItem = collection.find((item) => item.isMarked());
        const newMarkedItem = collection.getItemBySourceKey(this.key);

        if (oldMarkedItem) {
            oldMarkedItem.setMarked(false);
        }
        if (newMarkedItem) {
            newMarkedItem.setMarked(true);
        }

        collection.nextVersion();
    }
}

export class MarkNext implements ICollectionCommand<IMarkerItem> {
    execute(collection: IBaseCollection<IMarkerItem>): void {
        const oldMarkedItem = collection.find((item) => item.isMarked());
        if (oldMarkedItem) {
            const newMarkedItem = collection.getNext(oldMarkedItem);
            if (newMarkedItem) {
                oldMarkedItem.setMarked(false);
                newMarkedItem.setMarked(true);
                collection.nextVersion();
            }
        }
    }
}

export class MarkPrevious implements ICollectionCommand<IMarkerItem> {
    execute(collection: IBaseCollection<IMarkerItem>): void {
        const oldMarkedItem = collection.find((item) => item.isMarked());
        if (oldMarkedItem) {
            const newMarkedItem = collection.getPrevious(oldMarkedItem);
            if (newMarkedItem) {
                oldMarkedItem.setMarked(false);
                newMarkedItem.setMarked(true);
                collection.nextVersion();
            }
        }
    }
}
