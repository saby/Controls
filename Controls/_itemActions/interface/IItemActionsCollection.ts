import {IBaseCollection, ISwipeConfig, ANIMATION_STATE} from 'Controls/display';
import {IItemActionsItem} from './IItemActionsItem';
import {IItemActionsTemplateConfig} from './IItemActionsTemplateConfig';
import {Model} from 'Types/entity';

/**
 * Интерфейс коллекции, элементы которой обладают опциями записи
 * @interface Controls/_itemActions/interface/IItemActionsCollection
 * @public
 * @author Аверкиев П.А.
 */

/*
 * Interface of collection that elements posses item actions
 * @interface Controls/_itemActions/interface/IItemActionsCollection
 * @public
 * @author Аверкиев П.А.
 */
export interface IItemActionsCollection extends IBaseCollection<Model, IItemActionsItem> {
    // '[Controls/_itemActions/interface/IItemActionsCollection]': true;

    /**
     * Установить состояние флага "Опции записи заданы для элементов коллекции"
     * @param {Boolean} assigned Состояние флага "Опции записи заданы для элементов коллекции"
     * @function
     * @public
     */
    setActionsAssigned(assigned: boolean): void;

    /**
     * Получить состояние флага "Опции записи заданы для элементов коллекции"
     * @function
     * @public
     * @return {Boolean} Состояние флага "Опции записи заданы для элементов коллекции"
     */
    isActionsAssigned(): boolean;

    /**
     * Установить в модель текущий активный элемент
     * @param {Controls/_itemActions/interface/IItemActionsItem} item Текущий активный элемент
     * @function
     * @public
     */
    setActiveItem(item: IItemActionsItem): void;

    /**
     * Получить из модели текущий активный элемент
     * @function
     * @public
     * @return {Controls/_itemActions/interface/IItemActionsItem} Текущий активный элемент
     */
    getActiveItem(): IItemActionsItem;

    /**
     * Получить состояние флага "Один из элементов коллекции редактируется"
     * @function
     * @public
     * @return {Boolean} Состояние флага "Один из элементов коллекции редактируется"
     */
    isEditing(): boolean;

    /**
     * Установить в модель конфиг для itemActionsTemplate/swipeTemplate
     * @param {Object} config Конфиг для itemActionsTemplate/swipeTemplate
     * @function
     * @public
     */
    setActionsTemplateConfig(config: IItemActionsTemplateConfig): void;

    /**
     * Получить конфиг для itemActionsTemplate/swipeTemplate
     * @function
     * @public
     * @return {Object} Конфиг для itemActionsTemplate/swipeTemplate
     */
    getActionsTemplateConfig?(): IItemActionsTemplateConfig;

    /**
     * Установить в модель конфиг для отображения swipeTemplate
     * @param {Object} config Конфиг специфичный для swipeTemplate
     * @function
     * @public
     */
    setSwipeConfig?(config: ISwipeConfig): void;

    /**
     * Получить конфиг для отображения swipeTemplate
     * @function
     * @public
     * @return {Object} Конфиг специфичный для swipeTemplate
     */
    getSwipeConfig?(): ISwipeConfig;
}
