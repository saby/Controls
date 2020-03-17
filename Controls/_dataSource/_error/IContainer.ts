import { ViewConfig } from './Handler';
import { IControlOptions } from 'UI/Base';

/**
 * Объект конфигурации {@link Controls/_dataSource/_error/IContainer IContainer}
 * @interface Controls/_dataSource/_error/IContainerConfig
 * @private
 * @author Заляев А.В
 */
export interface IContainerConfig extends IControlOptions {
    viewConfig?: ViewConfig;
}

/**
 * Интерфейс компонента, отвечающего за отображение шаблона ошибки по данным  от {@link Controls/_dataSource/_error/Controller}
 *
 * @interface Controls/_dataSource/_error/IContainer
 * @public
 * @author Заляев А.В
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
 * @private
 * @author Заляев А.В
 */
export interface IContainerConstructor {
    new(config: IContainerConfig): IContainer;
}
