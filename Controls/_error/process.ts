import { Control } from 'UI/Base';
import { logger } from 'Application/Env';
import { constants } from 'Env/Env';
import { IBasePopupOptions } from 'Controls/popup';
import { Handler, ViewConfig } from './Handler';
import ErrorController, { getPopupHelper } from './Controller';
import { IPopupHelper, PopupId } from './Popup';

/**
 * Показать диалог с дружелюбным сообщением об ошибке.
 * @remark
 * <b>Функция работает только в браузере</b>, при выполнении на сервере в логи будет записана ошибка.
 * Для вывода сообщений об ошибках при построении на сервере используйте {@link Controls/_dataSource/_error/Container}.
 *
 * Функция объект со следующими свойствами:
 * - error: Error - ошибка, которую надо обработать.
 * - handlers: Function[] - необязательный; массив дополнительных обработчиков ошибки, которые вызываются перед платформенными.
 * - postHandlers: Function[] - необязательный; массив дополнительных обработчиков ошибки, которые вызываются после платформенных.
 * - dialogOptions: {@link Controls/_popup/interface/IBaseOpener} - необязательный; параметры открываемого диалогового окна.
 * - beforeOpenDialogCallback: Function - необязательный; функция, в которую передаётся конфиг для показа ошибки.
 *
 * В случае обрыва соединения или недоступности сервисов ресурсы, необходимые для показа диалогового окна, могут
 * не загрузиться, в этом случае платформенное диалоговое окно открыть не получится и будет показан браузерный alert.
 * Для показа платформенных диалоговых окон необходимые ресурсы будут загружены асинхронно через 10 секунд после
 * загрузки этого модуля.
 *
 * Функция возвращает Promise. Если платформенный диалог открылся, то в промисе будет идентификатор окна,
 * этот идентификатор надо использовать для закрытия окна через {@link Controls/_popup/interface/IDialog#closePopup}.
 *
 * @example
 * <pre class="brush: js">
 * // TypeScript
 * import { error as dataSourceError } from 'Controls/dataSource';
 *
 * // Функция вызывает БЛ через Types/source:SbisService, возвращает результат метода call().
 * declare callMethod(): Promise<object>;
 *
 * function callAndHandleResult() {
 *     return callMethod().catch((error) => dataSourceError.process({ error }));
 * }
 * </pre>
 *
 * @class Controls/_dataSource/_error/process
 * @public
 * @author Северьянов А.А.
 */

export interface IProcessOptions {
    error: Error;
    handlers?: Handler[];
    opener?: Control;
    dialogEventHandlers?: Record<string, Function>;
    dialogOptions?: IBasePopupOptions;
    postHandlers?: Handler[];
    beforeOpenDialogCallback?: (viewConfig: ViewConfig) => void;
    _popupHelper?: IPopupHelper;
}

export default function process(options: IProcessOptions): Promise<PopupId | void> {
    const {
        error,
        handlers = [],
        opener,
        dialogEventHandlers,
        dialogOptions,
        postHandlers = [],
        beforeOpenDialogCallback,
        _popupHelper = getPopupHelper()
    } = options;

    const controller = new ErrorController({ handlers }, _popupHelper);

    for (const postHandler of postHandlers) {
        controller.addHandler(postHandler, true);
    }

    return controller.process(error).then((viewConfig) => {
        if (!viewConfig) {
            return;
        }

        if (typeof beforeOpenDialogCallback === 'function') {
            beforeOpenDialogCallback(viewConfig);
        }

        if (constants.isServerSide) {
            logServerSideError(error, viewConfig);
            return;
        }

        return _popupHelper.openDialog(viewConfig, {
            opener,
            eventHandlers: dialogEventHandlers,
            ...dialogOptions
        });
    });
}

function logServerSideError(error: Error, viewConfig: ViewConfig<{ message?: string; details?: string; }>): void {
    const tabSpace = 4;
    let errorMessage =
        'Controls/dataSource:error.process is being called during server-side rendering!\n' +
        'Use Controls/dataSource:error.Container to render an error.\n' +
        'Error config:\n' +
        JSON.stringify({
            status: viewConfig.status,
            options: {
                message: viewConfig.options?.message,
                details: viewConfig.options?.details
            }
        }, null, tabSpace);

    try {
        errorMessage += '\nProcessed error:\n' + JSON.stringify(error, null, tabSpace);
    } catch (e) {
        // игнорируем ошибку сериализации
    }

    const message = (new Error(errorMessage)).stack || errorMessage;

    logger.error(message);
}
