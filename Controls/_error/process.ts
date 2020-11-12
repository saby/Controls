import { Control } from 'UI/Base';
import { IBasePopupOptions } from 'Controls/popup';
import { Handler, ViewConfig } from './Handler';
import ErrorController, { getPopupHelper } from './Controller';
import { IPopupHelper, PopupId } from './Popup';

/**
 * Показать диалог с дружелюбным сообщением об ошибке.
 * @remark
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

        return _popupHelper.openDialog(viewConfig, {
            opener,
            eventHandlers: dialogEventHandlers,
            ...dialogOptions
        });
    });
}
