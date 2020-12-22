import { GroupItem, IDragPosition } from 'Controls/display';
import {
    BaseDragStrategy,
    IDraggableCollection,
    IDraggableItem,
    IDragStrategyParams
} from '../interface';
import { Model } from 'Types/entity';

export interface IDraggableFlatCollection<T extends IDraggableItem = IDraggableItem> extends IDraggableCollection {
    getCount(): number;
    at(index: number): T;
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
        if (targetItem === null) {
            return this._startPosition;
        }

        if (this._targetItemIsDraggable(targetItem)) {
            return currentPosition;
        }

        let prevIndex = -1;
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

        // Логика для свернутых групп
        if (targetItem['[Controls/_display/GroupItem]'] && targetIndex > 0) {
            const shouldChangePosition = this._shouldChangePosition(targetIndex, position);
            if (shouldChangePosition) {
                position = currentPosition.position === 'after' ? 'before' : 'after';
            } else {
                return currentPosition;
            }
        }

        return {
            index: targetIndex,
            dispItem: targetItem,
            position
        };
    }

    protected _targetItemIsDraggable(targetItem: T): boolean {
        return this._draggableItem && targetItem && !targetItem['[Controls/_display/GroupItem]']
           && this._draggableItem.getContents().getKey() === targetItem.getContents().getKey();
    }

    /**
     * Проверяем, что нужно менять позицию, если навели на группу.
     * Позицию нужно поменять, только когда навели после свернутых групп.
     * Между свернутыми группа вставлять элемент не нужно
     * @param targetIndex
     * @param position
     * @protected
     */
    protected _shouldChangePosition(targetIndex: number, position: string): boolean {
        const offset = position === 'after' ? 1 : -1;

        let index = targetIndex;
        let item = this._model.at(index);
        while (item && item['[Controls/_display/GroupItem]'] && !item.isExpanded() && (index > -1 || index < this._model.getCount())) {
            index += offset;
            item = this._model.at(index);
        }

        return targetIndex === index;
    }
}
