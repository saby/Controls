import {IItemAction} from './IItemAction';

/**
 * Расширенный интерфейс IItemAction с полями для использования в шаблоне
 * @interface
 * @private
 * @author Аверкиев П.А.
 */

/*
 * Extended interface for itemActions to use it inside of template
 * @interface
 * @private
 * @author Аверкиев П.А.
 */
export interface IShownItemAction extends IItemAction {
    /**
     * Показывать текст операции
     */
    showTitle?: boolean;

    /**
     * Показывать иконку операции
     */
    showIcon?: boolean;

    /**
     * Флаг опция вызова меню
     */
    isMenu?: boolean;
}

export interface IItemActionsContainer {
    all: IItemAction[];
    showed: IShownItemAction[];
}
