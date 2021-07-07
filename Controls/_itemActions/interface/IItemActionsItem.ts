import {IItemActionsContainer} from './IItemActionsContainer';
import {Model} from 'Types/entity';

/**
 * Интерфейс элемента коллекции, который обладает опциями записи
 * @interface Controls/_itemActions/interface/IItemActionsItem
 * @public
 * @author Аверкиев П.А.
 */

/*
 * Interface of collection element that posses item actions
 * @interface Controls/_itemActions/interface/IItemActionsItem
 * @public
 * @author Аверкиев П.А.
 */
export interface IItemActionsItem {
    // '[Controls/_itemActions/interface/IItemActionsItem]': true;

    /**
     * Получить опции записи
     * @method
     * @public
     * @return {Controls/_itemActions/interface/IItemActionsContainer} Опции записи
     */
    getActions(): IItemActionsContainer;

    /**
     * Установить опции записи
     * @param {Controls/_itemActions/interface/IItemActionsContainer} actions Опции записи
     * @param {boolean} [silent=false] Не генерировать событие onCurrentChange
     * @method
     * @public
     */
    setActions(actions: IItemActionsContainer, silent?: boolean): void;

    /**
     * Получить пердставление текущего элемента
     * @method
     * @public
     * @return {Types/entity:Model} Опции записи
     */
    getContents(): Model;

    /**
     * Получить состояние активности текущего элемента
     * @method
     * @public
     * @return {Boolean} Состояние активности текущего элемента
     */
    isActive(): boolean;

    /**
     * Установить состояние активности текущего элемента
     * @param {Boolean} active Состояние активности текущего элемента
     * @param {Boolean} silent Не генерировать событие onCurrentChange
     * @method
     * @public
     */
    setActive(active: boolean, silent?: boolean): void;

    /**
     * Получить состояние свайпа текущего элемента
     * @method
     * @public
     * @return {Boolean} Состояние свайпа текущего элемента
     */
    isSwiped(): boolean;

    /**
     * Установить состояние свайпа текущего элемента
     * @param {Boolean} swiped Состояние свайпа текущего элемента
     * @param {Boolean} silent Не генерировать событие onCurrentChange
     * @method
     * @public
     */
    setSwiped(swiped: boolean, silent?: boolean): void;

    /**
     * Получить состояние редактирования текущего элемента
     * @method
     * @public
     * @return {Boolean} Состояние редактирования текущего элемента
     */
    isEditing(): boolean;

    // TODO уберётся отсюда по https://online.sbis.ru/opendoc.html?guid=183d60a3-fc2e-499c-8c50-aca0462c6f3d
    isRightSwiped?(): boolean;
    setRightSwiped?(swiped: boolean, silent?: boolean): boolean;
}
