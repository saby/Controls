import { Logger } from 'UI/Utils';
import { IVersionable, PromiseCanceledError } from 'Types/entity';
import { constants } from 'Env/Env';
import { fetch } from 'Browser/Transport';
import ParkingController, { loadHandlers } from './_parking/Controller';
import {
    Handler,
    HandlerConfig,
    ProcessedError,
    ViewConfig
} from './Handler';
import Mode from './Mode';
import Popup, { IPopupHelper } from './Popup';

export type Config = {
    handlers?: Handler[];
    viewConfig?: Partial<ViewConfig>;
};

type CanceledError = Error & { canceled?: boolean; };

let popupHelper: IPopupHelper;

/**
 * Получить экземпляр IPopupHelper, который контроллер ошибок использует по умолчанию, если ему не передали другого.
 */
export function getPopupHelper(): IPopupHelper {
    if (!popupHelper) {
        popupHelper = new Popup();
    }

    return popupHelper;
}

/// endregion helpers

/**
 * Класс для выбора обработчика ошибки и формирования объекта с данными для шаблона ошибки.
 * Передаёт ошибку по цепочке функций-обработчиков.
 * Обработчики предоставляются пользователем или берутся из настроек приложения.
 * @class Controls/_dataSource/_error/Controller
 * @public
 * @author Северьянов А.А.
 * @example
 * <pre class="brush: js">
 * // TypeScript
 *     let handler = ({ error, mode }) => {
 *         if (error.code == 423) {
 *             return {
 *                 template: LockedErrorTemplate,
 *                 options: {
 *                     // ...
 *                 }
 *             }
 *         }
 *     };
 *     let errorController = new ErrorController({
 *         handlers: [handler]
 *     });
 *
 *     this.load().catch((error) => {
 *         return errorController.process(error).then((parking) => {
 *             if (!parking) {
 *                 return;
 *             }
 *             return this.__showError(parking);
 *         });
 *     })
 * </pre>
 */
export default class ErrorController {
    private __controller: ParkingController<ViewConfig>;
    private _mode?: Mode;

    constructor(options: Config, private _popupHelper: IPopupHelper = getPopupHelper()) {
        this._mode = options?.viewConfig?.mode;
        this.__controller = new ParkingController<ViewConfig>({
            configField: ErrorController.CONFIG_FIELD,
            ...options
        });
    }

    destroy(): void {
        this.__controller.destroy();
        delete this.__controller;
        delete this._popupHelper;
    }

    /**
     * Добавить обработчик ошибки.
     * @param {Controls/_dataSource/_error/Handler} handler
     * @param isPostHandler Выполнять ли обработчик после обработчиков уровня приложения.
     * @public
     */
    addHandler(handler: Handler, isPostHandler?: boolean): void {
        this.__controller.addHandler(handler, isPostHandler);
    }

    /**
     * Убрать обработчик ошибки.
     * @param {Controls/_dataSource/_error/Handler} handler
     * @param isPostHandler Выполнять ли обработчик после обработчиков уровня приложения.
     * @public
     */
    removeHandler(handler: Handler, isPostHandler?: boolean): void {
        this.__controller.removeHandler(handler, isPostHandler);
    }

    /**
     * Обработать ошибку и получить данные для шаблона ошибки.
     * Передаёт ошибку по цепочке функций-обработчиков, пока какой-нибудь обработчик не вернёт результат.
     * @remark
     * Если ни один обработчик не вернёт результат, будет показан диалог с сообщением об ошибке.
     * @method
     * @name Controls/_dataSource/_error/Controller#process
     * @public
     * @param {Error | Controls/_dataSource/_error/HandlerConfig} config Обрабатываемая ошибки или объект, содержащий обрабатываемую ошибку и предпочитаемый режим отображения.
     * @return {void | Controls/_dataSource/_error/ViewConfig} Данные для отображения сообщения об ошибке.
     */
    process<TError extends ProcessedError = ProcessedError>(
        config: HandlerConfig<TError> | TError
    ): Promise<ViewConfig | void> {
        const _config = this._prepareConfig<TError>(config);

        if (!ErrorController._isNeedHandle(_config.error)) {
            return Promise.resolve();
        }

        return this.__controller.process(_config).then((handlerResult: ViewConfig | void) => {
            /**
             * Ошибка может быть уже обработана, если в соседние контролы прилетела одна ошибка от родителя.
             * Проверяем, обработана ли ошибка каким-то из контроллеров.
             */
            if (!ErrorController._isNeedHandle(_config.error)) {
                return;
            }

            if (!handlerResult) {
                _config.error.processed = true;
                return this._getDefault(_config);
            }

            /**
             * Обработчик может вернуть флаг processed === false в том случае,
             * когда он точно знает, что его ошибку нужно обработать всегда,
             * даже если она была обработана ранее
             */
            _config.error.processed = handlerResult.processed !== false;
            return {
                status: handlerResult.status,
                mode: handlerResult.mode || _config.mode,
                template: handlerResult.template,
                options: handlerResult.options,
                ...ErrorController._getIVersion()
            };
        }).catch((error: PromiseCanceledError) => {
            if (!error.isCanceled) {
                Logger.error('Handler error', null, error);
            }
        });
    }

    private _getDefault<T extends Error = Error>(config: HandlerConfig<T>): void {
        this._popupHelper.openConfirmation({
            type: 'ok',
            style: 'danger',
            theme: config.theme,
            message: config.error.message
        });
    }

    /**
     * Поле ApplicationConfig, в котором содержатся названия модулей с обработчиками ошибок.
     */
    static readonly CONFIG_FIELD: string = 'errorHandlers';

    private static _getIVersion(): Partial<IVersionable> {
        if (constants.isServerSide) {
            // При построении контролов на сервере мы не будем добавлять в конфиг
            // функцию getVersion(), иначе конфиг не сможет нормально десериализоваться.
            return {};
        }

        const id: number = Math.random();
        /*
         * неоходимо для прохождения dirty-checking при схранении объекта на инстансе компонента,
         * для дальнейшего его отображения через прокидывание параметра в Container
         * в случа, когда два раза пришла одна и та же ошибка, а между ними стейт не менялся
         */
        return {
            '[Types/_entity/IVersionable]': true,
            getVersion(): number {
                return id;
            }
        };
    }

    private static _isNeedHandle(error: ProcessedError & CanceledError): boolean {
        return !(
            (error instanceof fetch.Errors.Abort) ||
            error.processed ||
            error.canceled ||
            error.isCanceled // PromiseCanceledError
        );
    }

    private _prepareConfig<T extends Error = Error>(config: HandlerConfig<T> | T): HandlerConfig<T> {
        const mode = this._mode || Mode.dialog;

        if (config instanceof Error) {
            return {
                error: config,
                mode
            };
        }

        const result = {
            mode,
            ...config
        };

        if (this._mode) {
            result.mode = this._mode;
        }

        return result;
    }
}

// Загружаем модули обработчиков заранее, чтобы была возможность использовать их при разрыве соединения.
loadHandlers(ErrorController.CONFIG_FIELD);
