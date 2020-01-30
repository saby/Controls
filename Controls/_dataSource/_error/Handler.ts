/// <amd-module name="Controls/_dataSource/_error/Handler" />
import Mode from './Mode';
import {
    ViewConfig as ParkingViewConfig
} from '../_parking/Handler';
import { IVersionable } from 'Types/entity';

/**
 * Возвращаемый обработчиком ошибки результат
 * @interface Controls/_dataSource/_error/ViewConfig
 * @extends Types/entity:IVersionable
 * @extends Controls/_dataSource/_parking/ViewConfig
 * @public
 * @author Санников К.А.
 */
export interface ViewConfig<TOptions = object> extends ParkingViewConfig<TOptions>, Partial<IVersionable> {
    /**
     * @name Controls/_dataSource/_error/ViewConfig#mode
     * @cfg {Controls/_dataSource/_error/Mode} [mode]
     */
    mode?: Mode;
}

/**
 * Передаваемые в обработчик параметры
 * @interface Controls/_dataSource/_error/HandlerConfig
 * @public
 * @author Санников К.А.
 */
export interface HandlerConfig<T extends Error = Error> {
    /**
     * @name Controls/_dataSource/_error/HandlerConfig#error
     * @cfg {T | Error} Обрабатываемая ошибка
     */
    error: T | Error;
    /**
     * @name Controls/_dataSource/_error/HandlerConfig#mode
     * @cfg {Controls/_dataSource/_error/Mode} Способ отображения ошибки (на всё окно / диалог / внутри компонента)
     */
    mode: Mode;
}

/**
 * Обработчик ошибки
 * @remark
 * Функциональный интерфейс.
 * @interface Controls/_dataSource/_error/Handler
 * @public
 * @author Санников К.А.
 */
export type Handler<
    TError extends Error = Error,
    TOptions = object
> = (config: HandlerConfig<TError>) => ViewConfig<TOptions> | void;

/**
 * Обработчик ошибки
 * @function
 * @name Controls/_dataSource/_error/Handler#function
 * @param {HandlerConfig} объект с параметрами
 * @return {void | Controls/_dataSource/_error/ViewConfig}
 */
