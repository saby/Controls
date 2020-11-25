import { GroupItem, IDragPosition } from 'Controls/display';
import {
    BaseDragStrategy,
    IDraggableCollection,
    IDraggableItem,
    IDragStrategyParams
} from '../interface';
import { Model } from 'Types/entity';

export interface IDraggableFlatCollection<T extends IDraggableItem = IDraggableItem> extends IDraggableCollection {
    getIndex(item: T): number;
    getIndexBySourceItem(sourceItem: Model): number;
}

/**
 * Стратегия расчета позиции для драг'н'дропа в плоском списке
 * @class Controls/_listDragNDrop/strategies/Flat
 * @author Панихин К.А.
 */

export default class Flat<
    T extends IDraggableItem = IDraggableItem,
    C extends IDraggableFlatCollection = IDraggableFlatCollection,
> extends BaseDragStrategy<IDragPosition<T>, T, C> {
    protected _startPosition: IDragPosition<T>;

    constructor(model: C, draggableItem: T) {
        super(model, draggableItem);

        // getIndexBySourceItem - т.к. draggableItem это avatar и его нет в коллекции
        this._startPosition = {
            index: this._model.getIndexBySourceItem(draggableItem.getContents()),
            position: 'before',
            dispItem: this._draggableItem
        };
    }

    /**
     * Запускает расчет позиции
     */
    calculatePosition({currentPosition, targetItem}: IDragStrategyParams<IDragPosition<T>, T>): IDragPosition<T> {
        let prevIndex = -1;

        if (targetItem === null) {
            return this._startPosition;
        }

        // If you hover on a record that is being dragged, then the position should not change.
        if (!(targetItem['[Controls/_display/GroupItem]']) && this._draggableItem.getContents().getKey() === targetItem.getContents().getKey()) {
            return currentPosition;
        }

        if (currentPosition) {
            prevIndex = currentPosition.index;
        } else if (this._draggableItem) {
            prevIndex = this._startPosition.index;
        }

        let position;
        const targetIndex = this._model.getIndex(targetItem);
        if (prevIndex === -1) {
            position = 'before';
        } else if (targetIndex > prevIndex) {
            position = 'after';
        } else if (targetIndex < prevIndex) {
            position = 'before';
        } else if (targetIndex === prevIndex) {
            position = currentPosition.position === 'after' ? 'before' : 'after';
        }

        return {
            index: targetIndex,
            dispItem: targetItem,
            position
        };
    }
}
