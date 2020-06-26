import Mode from './Mode';
import {
    ViewConfig as ParkingViewConfig
} from './_parking/Handler';
import { IVersionable } from 'Types/entity';
import { HTTPStatus } from 'Browser/Transport';

/**
 * Данные для отображения сообщения об ошибке.
 * @interface Controls/_dataSource/_error/ViewConfig
 * @extends Types/entity:IVersionable
 * @extends Controls/_dataSource/_parking/ViewConfig
 * @public
 * @author Северьянов А.А.
 */
export interface ViewConfig<TOptions = object> extends ParkingViewConfig<TOptions>, Partial<IVersionable> {
    /**
     * @name Controls/_dataSource/_error/ViewConfig#mode
     * @cfg {Controls/_dataSource/_error/Mode} [mode]
     */
    mode?: Mode;
    status?: HTTPStatus;
}

export type ProcessedError = Error & { processed?: boolean; };

/**
 * Параметры для функции-обработчика ошибки
 * @interface Controls/_dataSource/_error/HandlerConfig
 * @public
 * @author Северьянов А.А.
 */
export interface HandlerConfig<TError extends ProcessedError = ProcessedError> {
    /**
     * @name Controls/_dataSource/_error/HandlerConfig#error
     * @cfg {T | Error} Обрабатываемая ошибка
     */
    error: TError;
    /**
     * @name Controls/_dataSource/_error/HandlerConfig#mode
     * @cfg {Controls/_dataSource/_error/Mode} Способ отображения ошибки (на всё окно / диалог / внутри компонента)
     */
    mode: Mode;

    /**
     * @name Controls/_dataSource/_error/HandlerConfig#theme
     * @cfg {String} Тема для окон уведомлений, которые контроллер показывает, если не удалось распознать ошибку.
     */
    theme?: string;
}

/**
 * Тип функции-обработчика ошибки.
 * Анализирует ошибку и определяет, какой парковочный шаблон нужно отобразить.
 * @interface Controls/_dataSource/_error/Handler
 * @public
 * @author Северьянов А.А.
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
