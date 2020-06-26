import { Handler, ViewConfig } from './Handler';
import { constants } from 'Env/Env';
import { load } from 'Core/library';
import { Logger } from 'UI/Utils';
import { PromiseCanceledError } from 'Types/entity';

export interface IParkingControllerOptions<TViewConfig = ViewConfig> {
    handlers: Handler[];
    configField: string;
    viewConfig?: Partial<TViewConfig>;
}

/**
 * Загружает модули обработчиков обшибок.
 * Названия модулей обработчиков берутся из поля ApplicationConfig[handlersField].
 * Функция может быть использована для предварительной загрузки обработчиков.
 * Например, это может понадобиться для случая показа ошибки при разрыве соединения.
 * @param handlersField
 */
export const loadHandlers = (handlersField: string): Array<Promise<Handler>> => {
    return getApplicationHandlers(handlersField).map(getHandler);
};

/// region helpers
const log = (message: string) => {
    Logger.info(
        'Controls/_dataSource/_parking/Controller: ' + message
    );
};

const getApplicationConfig = () => constants.ApplicationConfig || {};

const getApplicationHandlers = (handlersField: string): Array<Handler | string> => {
    const applicationConfig = getApplicationConfig();
    const handlers = applicationConfig[handlersField];
    if (!Array.isArray(handlers)) {
        log(`ApplicationConfig:${handlersField} must be Array<Function>`);
        return [];
    }
    return handlers;
};

const getHandler = (handler: Handler | string): Promise<Handler> => {
    if (typeof handler === 'string') {
        return load(handler);
    }
    if (typeof handler === 'function') {
        return Promise.resolve(handler);
    }
    return Promise.reject(new Error('handler must be string|function'));
};

/**
 * Выполнить функцию и вернуть промис со значением, которое вернула функция.
 * @param fn
 * @param arg
 */
export function callHandler<TArg, TResult>(
    fn: (arg: TArg) => TResult,
    arg: TArg
): Promise<TResult> {
    return new Promise((resolve, reject) => {
        try {
            resolve(fn(arg));
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Выполнять по очереди обработчики ошибок, пока какой-нибудь из них не вернёт результат.
 * @param handlers Обработчики ошибок
 * @param config
 */
export function findTemplate<TConfig>(
    [handler, ...otherHandlers]: Array<Handler | string>,
    config: TConfig
): Promise<ViewConfig | void> {
    if (!handler) {
        return Promise.resolve();
    }

    return getHandler(handler)
        .catch((error: Error) => {
            // Не удалось получить функицю-обработчик.
            // Логируем ошибку и продолжаем выполнение обработчиков.
            Logger.error('Invalid error handler', null, error);
        })
        .then((handlerFn: Handler) => handlerFn && callHandler(handlerFn, config))
        .catch((error: PromiseCanceledError) => {
            if (error.isCanceled) {
                // Выкидываем ошибку отмены наверх, чтоб прервать всю цепочку обработчиков.
                throw error;
            }

            // Если это не отмена, то логируем ошибку и продолжаем выполнение обработчиков.
            Logger.error('Handler error', null, error);
        })
        .then((viewConfig) => viewConfig || findTemplate(otherHandlers, config));
}

/// endregion helpers

/**
 * Класс для выбора обработчика ошибки и формирования опций для парковочного компонента.
 * Передаёт ошибку по цепочке функций-обработчиков. Обработчики предоставляются пользователем
 * или берутся из настроек приложения.
 * @class
 * @name Controls/_dataSource/_parking/Controller
 * @public
 * @author Северьянов А.А.
 * @example
 * <pre>
 *     let handler = (config) => {
 *         if (needShowParking(config)) {
 *             return {
 *                 template: ParkingTemplate,
 *                 options: {
 *                     // ...
 *                 }
 *             }
 *         }
 *     };
 *     let parkingController = new ParkingController({
 *         handlers: [handler]
 *     });
 *
 *     this.load().then((result) => {
 *         return  parkingController.process(result).then((parking) => {
 *             if (parking) {
 *                 return this.__showParking(parking);
 *             }
 *             return this.__showResult(result);
 *         });
 *     });
 * </pre>
 */
export default class ParkingController<TViewConfig extends ViewConfig = ViewConfig> {
    private _handlers: Handler[];
    private _postHandlers: Handler[] = [];
    private readonly _configField: string;
    private _viewConfig: Partial<TViewConfig>;

    constructor(options: Partial<IParkingControllerOptions<TViewConfig>> = {}) {
        this._handlers = options.handlers || [];
        this._configField = options.configField || ParkingController.CONFIG_FIELD;
        this._viewConfig = options.viewConfig || {};
    }

    /**
     * Составить конфиг ошибки из предустановленных данных и результата из обработчика.
     * @param viewConfig Результат обработчика
     * @private
     */
    private _composeViewConfig(viewConfig: TViewConfig): TViewConfig {
        const result = {
            ...this._viewConfig,
            ...viewConfig
        };

        if (this._viewConfig.options && viewConfig.options) {
            result.options = {
                ...this._viewConfig.options,
                ...viewConfig.options
            };
        }

        return result;
    }

    destroy(): void {
        delete this._handlers;
        delete this._postHandlers;
        delete this._viewConfig;
    }

    /**
     * Добавить обработчик ошибки.
     * @param {Controls/_dataSource/_parking/Handler} handler
     * @param isPostHandler Выполнять ли обработчик после обработчиков уровня приложения.
     * @public
     */
    addHandler(handler: Handler, isPostHandler?: boolean): void {
        const handlers = isPostHandler ? this._postHandlers : this._handlers;
        if (handlers.indexOf(handler) >= 0) {
            return;
        }
        handlers.push(handler);
    }

    /**
     * Удалить обработчик ошибки.
     * @param {Controls/_dataSource/_parking/Handler} handler
     * @param isPostHandler Выполнять ли обработчик после обработчиков уровня приложения.
     * @public
     */
    removeHandler(handler: Handler, isPostHandler?: boolean): void {
        const handlers = isPostHandler ? '_postHandlers' : '_handlers';
        this[handlers] = this[handlers].filter((_handler) => handler !== _handler);
    }

    /**
     * Получить опции для парковочной заглушки.
     * @param {*} config
     * @public
     * @returns {Promise.<void | Controls/_dataSource/_parking/ViewConfig>}
     */
    process<TConfig>(config: TConfig): Promise<TViewConfig | void> {
        return [
            () => this._handlers,
            () => getApplicationHandlers(this._configField),
            () => this._postHandlers
        ].reduce(
            (result: Promise<TViewConfig | void>, getHandlers: () => Handler[]) =>
                result.then((viewConfig) => viewConfig
                    ? this._composeViewConfig(viewConfig)
                    : findTemplate(getHandlers(), config)
                ),
            Promise.resolve());
    }

    /**
     * Поле ApplicationConfig, в котором содержатся названия модулей с обработчиками ошибок.
     */
    static readonly CONFIG_FIELD: string = 'parkingHandlers';
}
