/// <amd-module name="Controls/_dataSource/_error/Controller" />
import { Controller as ParkingController, loadHandlers } from 'Controls/_dataSource/parking';
import {
    Handler,
    HandlerConfig,
    ViewConfig
} from './Handler';
import Mode from './Mode';
import { fetch } from 'Browser/Transport';
import { IVersionable } from 'Types/entity';
import { constants } from 'Env/Env';
import { Confirmation } from 'Controls/popup';

const { Errors } = fetch;
const { Abort } = Errors;

export type Config = {
    handlers?: Handler[];
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
        (error instanceof Abort) ||
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

/// endregion helpers

/**
 * Модуль для выбора обработчика ошибки и формирования объекта с данными для шаблона ошибки.
 * @class Controls/_dataSource/_error/Controller
 * @public
 * @author Санников К.А.
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
    private __controller: ParkingController;

    constructor(config: Config) {
        // Поле ApplicationConfig, в котором содержатся названия модулей с обработчиками ошибок
        const configField = 'errorHandlers';
        // Загружаем модули обработчиков заранее, чтобы была возможность использовать их при разрыве соединения
        loadHandlers(configField);
        this.__controller = new ParkingController({ configField, ...config });
    }

    destroy(): void {
        this.__controller.destroy();
        delete this.__controller;
    }

    /**
     * Добавить обработчик ошибки
     * @method
     * @name Controls/_dataSource/_error/Controller#addHandler
     * @public
     * @param {Controls/_dataSource/_error/Handler} handler
     * @void
     */
    addHandler(handler: Handler): void {
        this.__controller.addHandler(handler);
    }

    /**
     * Убрать обработчик ошибки
     * @method
     * @name Controls/_dataSource/_error/Controller#removeHandler
     * @public
     * @param {Controls/_dataSource/_error/Handler} handler
     * @void
     */
    removeHandler(handler: Handler): void {
        this.__controller.removeHandler(handler);
    }

    /**
     * Запуск обработки ошибки для формирования объекта с данными для шаблона ошибки.
     * @method
     * @name Controls/_dataSource/_error/Controller#process
     * @public
     * @param {Error | Controls/_dataSource/_error/HandlerConfig} config Объект, содержащий обрабатываемую ошибку и предпочитаемый режим отображения, лио обрабатываемая ошибка
     * @return {void | Controls/_dataSource/_error/ViewConfig} Данные для отображения шаблона
     */
    process<T extends Error = Error>(config: HandlerConfig<T> | T): Promise<ViewConfig | void> {
        const _config = prepareConfig<T>(config);
        if (!isNeedHandle(_config.error)) {
            return Promise.resolve();
        }
        return this.__controller.process(_config).then((handlerResult: ViewConfig | void) => {
            if (!handlerResult) {
                return this._getDefault(_config);
            }
            // @ts-ignore
            _config.error.processed = true;
            return {
                mode: handlerResult.mode || _config.mode,
                template: handlerResult.template,
                options: handlerResult.options,
                ...getIVersion()
            };
        });
    }

    private _getDefault<T extends Error = Error>(config: HandlerConfig<T>): void {
        const message = config.error.message;
        const style = 'danger';
        const type = 'ok';

        importConfirmation().then((Confirmation) => {
            Confirmation.openPopup({
                type,
                style,
                message
            });
        }, () => {
            if (constants.isBrowserPlatform) {
                alert(message);
            }
        });
    }
}

/**
 * Загрузить всё необходимое для показа диалога.
 * @returns {Promise} Промис с Controls/popup:Confirmation.
 * Если что-то не загрузилось, то промис завершится с ошибкой.
 */
function importConfirmation(): Promise<typeof Confirmation> {
    // Предварительно загрузить темизированные стили для диалога.
    // Без этого стили загружаются только в момент показа диалога.
    // Но когда потребуется показать сообщение о потере соединения, стили уже не смогут загрузиться.
    const confirmationModule = 'Controls/popupConfirmation';
    const importThemedStyles = import('UI/theme/controller').then(({ getThemeController }) =>
        getThemeController().get(confirmationModule));

    return Promise.all([
        import('Controls/popup'),
        import(confirmationModule),
        importThemedStyles
    ]).then(([popup]) => popup.Confirmation);
}
