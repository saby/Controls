import { TItemKey, IBaseCollection, ICollectionCommand, IStrategyCollection } from '../interface';

import DragStrategy from '../itemsStrategy/Drag';

export type IDragItem = unknown;

export interface IDragCollection
    extends IBaseCollection<IDragItem>, IStrategyCollection<IDragItem> {
    getIndexByKey(key: TItemKey): number;
}

export class Start implements ICollectionCommand<IDragItem> {
    constructor(private draggedItemsKeys: TItemKey[], private avatarItemKey: TItemKey) {}

    execute(collection: IDragCollection): void {
        const avatarStartIndex = collection.getIndexByKey(this.avatarItemKey);

        collection.appendStrategy(DragStrategy, {
            draggedItemsKeys: this.draggedItemsKeys,
            avatarItemKey: this.avatarItemKey,
            avatarIndex: avatarStartIndex
        });
    }
}

export class Move implements ICollectionCommand<IDragItem> {
    constructor(private index: number) {}

    execute(collection: IDragCollection): void {
        const strategy = collection.getStrategyInstance(DragStrategy) as DragStrategy<unknown>;
        if (strategy) {
            strategy.avatarIndex = this.index;
            collection.nextVersion();
        }
    }
}

export class Stop implements ICollectionCommand<IDragItem> {
    execute(collection: IDragCollection): void {
        collection.removeStrategy(DragStrategy);
    }
}
