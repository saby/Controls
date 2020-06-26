import { Logger } from 'UI/Utils';
import { PromiseCanceledError } from 'Types/entity';
import ParkingController, { loadHandlers } from './_parking/Controller';
import {
    Handler,
    HandlerConfig,
    ProcessedError,
    ViewConfig
} from './Handler';
import Mode from './Mode';
import { fetch } from 'Browser/Transport';
import { IVersionable } from 'Types/entity';
import Popup, { IPopupHelper } from './Popup';

export type Config = {
    handlers?: Handler[];
    viewConfig?: Partial<ViewConfig>;
};

/// region helpers
const getIVersion = (): IVersionable => {
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
};

const isNeedHandle = (error: Error): boolean => {
    return !(
        (error instanceof fetch.Errors.Abort) ||
        // @ts-ignore
        error.processed ||
        // @ts-ignore
        error.canceled
    );
};

const prepareConfig = <T extends Error = Error>(config: HandlerConfig<T> | T): HandlerConfig<T> => {
    if (config instanceof Error) {
        return {
            error: config,
            mode: Mode.dialog
        };
    }
    return {
        mode: Mode.dialog,
        ...config
    };
};

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
 * <pre>
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

    constructor(options: Config, private _popupHelper: IPopupHelper = getPopupHelper()) {
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
        const _config = prepareConfig<TError>(config);

        if (!isNeedHandle(_config.error)) {
            return Promise.resolve();
        }

        return this.__controller.process(_config).then((handlerResult: ViewConfig | void) => {
            if (!handlerResult) {
                return this._getDefault(_config);
            }

            _config.error.processed = true;
            return {
                status: handlerResult.status,
                mode: handlerResult.mode || _config.mode,
                template: handlerResult.template,
                options: handlerResult.options,
                ...getIVersion()
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
}

// Загружаем модули обработчиков заранее, чтобы была возможность использовать их при разрыве соединения.
loadHandlers(ErrorController.CONFIG_FIELD);
