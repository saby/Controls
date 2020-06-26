import { ViewConfig } from 'Controls/error';
import { IControlOptions } from 'UI/Base';

/**
 * Опции компонента {@link Controls/_dataSource/_error/IContainer IContainer}
 * @interface Controls/_dataSource/_error/IContainerConfig
 * @author Северьянов А.А.
 */
export interface IContainerConfig extends IControlOptions {
    /**
     * @name Controls/_dataSource/_error/Container#viewConfig
     * @cfg {Controls/_dataSource/_error/Container/Config} Данные для отображения сообщения об ошибке.
     */
    viewConfig?: ViewConfig;
}

/**
 * Интерфейс компонента, отвечающего за отображение шаблона ошибки по данным  от {@link Controls/_dataSource/_error/Controller}
 *
 * @interface Controls/_dataSource/_error/IContainer
 * @public
 * @author Северьянов А.А.
 */
export default interface IContainer {
    /**
     * Показать парковочный компонент, отображающий данные об ошибке
     * @param {Controls/_dataSource/_error/ViewConfig} viewConfig
     * @method
     * @public
     */
    show(viewConfig: ViewConfig): void;

    /**
     * Скрыть компонент, отображающий данные об ошибке
     * @method
     * @public
     */
    hide(): void;
}

/**
 * Интерефейс конструктора {@link Controls/_dataSource/_error/IContainer IContainer}
 * @interface Controls/_dataSource/_error/IContainerConstructor
 * @author Северьянов А.А.
 */
export interface IContainerConstructor {
    new(config: IContainerConfig): IContainer;
}
