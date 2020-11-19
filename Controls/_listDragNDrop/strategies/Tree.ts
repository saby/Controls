import Flat, { IDraggableFlatCollection} from './Flat';
import { IDragPosition } from 'Controls/display';
import { IDraggableItem, IDragStrategyParams, TPosition } from '../interface';

const DRAG_MAX_OFFSET = 10;

interface IDraggableTreeItem extends IDraggableItem {
    isNode(): boolean;
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

        if (targetItem && targetItem.isNode()) {
            result = this._calculatePositionRelativeNode(targetItem, mouseOffsetInTargetItem);
        } else {
            result = super.calculatePosition({currentPosition, targetItem});
        }

        return result;
    }

    private _calculatePositionRelativeNode(
        targetItem: IDraggableTreeItem, mouseOffsetInTargetItem: IOffset
    ): IDragPosition<IDraggableTreeItem> {
        let relativePosition: TPosition = 'on';
        // Если перетаскиваем лист на узел, то позиция может быть только 'on'
        // Если нет перетаскиваемого элемента, то значит мы перетаскивам в папку другого реестра
        if (!this._draggableItem || !this._draggableItem.isNode() && targetItem.isNode()) {
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

        return {
            index: this._model.getIndex(targetItem),
            position: relativePosition,
            dispItem: targetItem
        };
    }
}
