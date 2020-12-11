import Flat, { IDraggableFlatCollection} from './Flat';
import { IDragPosition } from 'Controls/display';
import { IDraggableItem, IDragStrategyParams, TPosition } from '../interface';
import { List } from 'Types/collection';

const DRAG_MAX_OFFSET = 10;

interface IDraggableTreeItem extends IDraggableItem {
    isNode(): boolean;
    isExpanded(): boolean;
    getChildren(): List<IDraggableTreeItem>;
}

interface IOffset {
    top: number;
    bottom: number;
}

interface IDraggableTreeCollection extends IDraggableFlatCollection<IDraggableTreeItem> {
    getPrevDragPosition(): IDragPosition<IDraggableTreeItem>;
}

type ITreeDragStrategyParams = IDragStrategyParams<IDragPosition<IDraggableTreeItem>, IDraggableTreeItem>;

/**
 * Стратегия расчета позиции для драг'н'дропа в иерархическом списке
 * @class Controls/_listDragNDrop/strategies/Flat
 * @author Панихин К.А.
 */

export default class Tree extends Flat<IDraggableTreeItem, IDraggableTreeCollection> {
    /**
     * Запускает расчет позиции
     */
    calculatePosition(
        {currentPosition, targetItem, mouseOffsetInTargetItem}: ITreeDragStrategyParams
    ): IDragPosition<IDraggableTreeItem> {
        if (this._draggableItem && this._draggableItem === targetItem) {
            return this._model.getPrevDragPosition() || null;
        }

        let result;

        const moveTileNodeToLeaves = this._model['[Controls/_tile/TreeTileViewModel]'] && this._draggableItem.isNode()
            && targetItem && !targetItem.isNode();
        if (targetItem && targetItem.isNode() && !moveTileNodeToLeaves) {
            result = this._calculatePositionRelativeNode(targetItem, mouseOffsetInTargetItem);
        } else {
            // В плитке нельзя смешивать узлы и листья, если перетаскивают узел в листья, то мы не меняем позицию
            result = super.calculatePosition({currentPosition, targetItem: moveTileNodeToLeaves ? null : targetItem});
        }

        return result;
    }

    private _calculatePositionRelativeNode(
        targetItem: IDraggableTreeItem, mouseOffsetInTargetItem: IOffset
    ): IDragPosition<IDraggableTreeItem> {
        let relativePosition: TPosition = 'on';

        // Если нет перетаскиваемого элемента, то значит мы перетаскивам в папку другого реестра, т.к
        // если перетаскивают не в узел, то нам вернут рекорд из которого мы создадим draggableItem
        // В плитке лист мы можем перенести только внутрь узла
        if (!this._draggableItem || this._model['[Controls/_tile/TreeTileViewModel]'] && !this._draggableItem.isNode() && targetItem.isNode()) {
            relativePosition = 'on';
        } else {
            if (mouseOffsetInTargetItem) {
                if (mouseOffsetInTargetItem.top <= DRAG_MAX_OFFSET) {
                    relativePosition = 'before';
                } else if (mouseOffsetInTargetItem.bottom <= DRAG_MAX_OFFSET) {
                    relativePosition = 'after';
                } else {
                    relativePosition = 'on';
                }
            }
        }

        let newPosition;
        if (relativePosition === 'after' && targetItem.isExpanded() && targetItem.getChildren().getCount()) {
            const firstChild = targetItem.getChildren().at(0);

            if (firstChild === this._draggableItem) {
                newPosition = this._startPosition;
            } else {
                newPosition = {
                    index: this._model.getIndex(targetItem),
                    position: 'before',
                    dispItem: firstChild
                };
            }
        } else {
            newPosition = {
                index: this._model.getIndex(targetItem),
                position: relativePosition,
                dispItem: targetItem
            };
        }

        return newPosition;
    }
}
