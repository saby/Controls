import {IItemActionsObject} from './IItemActionsObject';
import {Model} from 'Types/entity';
import {ANIMATION_STATE, ICollectionItem} from 'Controls/display';

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
export interface IItemActionsItem extends ICollectionItem {
    // '[Controls/_itemActions/interface/IItemActionsItem]': true;

    /**
     * Получить опции записи
     * @function
     * @public
     * @return {Controls/_itemActions/interface/IItemActionsObject} Опции записи
     */
    getActions(): IItemActionsObject;

    /**
     * Установить опции записи
     * @param {Controls/_itemActions/interface/IItemActionsObject} actions Опции записи
     * @param {boolean} [silent=false] Не генерировать событие onCurrentChange
     * @function
     * @public
     */
    setActions(actions: IItemActionsObject, silent?: boolean): void;

    /**
     * Получить состояние активности текущего элемента
     * @function
     * @public
     * @return {Boolean} Состояние активности текущего элемента
     */
    isActive(): boolean;

    /**
     * Установить состояние активности текущего элемента
     * @param {Boolean} active Состояние активности текущего элемента
     * @param {Boolean} silent Не генерировать событие onCurrentChange
     * @function
     * @public
     */
    setActive(active: boolean, silent?: boolean): void;

    /**
     * Получить состояние свайпа текущего элемента
     * @function
     * @public
     * @return {Boolean} Состояние свайпа текущего элемента
     */
    isSwiped(): boolean;

    /**
     * Установить состояние свайпа текущего элемента
     * @param {Boolean} swiped Состояние свайпа текущего элемента
     * @param {Boolean} silent Не генерировать событие onCurrentChange
     * @function
     * @public
     */
    setSwiped(swiped: boolean, silent?: boolean): void;

    /**
     * Получить состояние редактирования текущего элемента
     * @function
     * @public
     * @return {Boolean} Состояние редактирования текущего элемента
     */
    isEditing(): boolean;

    /**
     * Установить в модель текущее состояние анимации
     * @param {Controls/display:ANIMATION_STATE} state Текущее состояние анимации
     * @function
     * @public
     */
    setSwipeAnimation?(state: ANIMATION_STATE): void;

    /**
     * Получить текущее состояние анимации
     * @function
     * @public
     * @return {Controls/display:ANIMATION_STATE} Текущее состояние анимации
     */
    getSwipeAnimation?(): ANIMATION_STATE;
}
