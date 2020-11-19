import {CrudEntityKey, LOCAL_MOVE_POSITION} from 'Types/source';
import {ISelectionObject} from 'Controls/interface';

/**
 * Интерфейс контрола View, который обладает возможностью перемещения записей
 * @interface Controls/_list/interface/IMovableList
 * @public
 * @author Аверкиев П.А.
 */
export interface IMovableList {
    /**
     * Перемещает указанные записи в source относительно target в указанную позицию (after/before/on)
     * и возвращает результат перемещения
     * @method
     * @public
     * @param selection
     * @param targetKey
     * @param position
     */
    moveItems(selection: ISelectionObject, targetKey: CrudEntityKey, position: LOCAL_MOVE_POSITION): Promise<void>;

    /**
     * Перемещаетодин элемент вверх и возвращает результат перемещения
     * @method
     * @public
     * @param selectedKey
     */
    moveItemUp(selectedKey: CrudEntityKey): Promise<void>;

    /**
     * Перемещает один элемент вниз и возвращает результат перемещения
     * @method
     * @public
     * @param selectedKey
     */
    moveItemDown(selectedKey: CrudEntityKey): Promise<void>;

    /**
     * Перемещает указанные элементы при помощи диалога MoveDialog, и возвращает результат moveItems().
     * @method
     * @public
     * @param selection
     */
    moveItemsWithDialog(selection: ISelectionObject): Promise<void>;
}
