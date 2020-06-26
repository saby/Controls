import { Control } from 'UI/Base';
import { Handler } from './Handler';
import ErrorController, { getPopupHelper } from './Controller';
import { IPopupHelper, PopupId } from './Popup';

/**
 * Показать диалог с дружелюбным сообщением об ошибке.
 * Функцияя объект со следующими свойствами:
 * - error: Error - ошибка, которую надо обработать.
 * - handlers: Function[] - необязательный; массив дополнительных обработчиков ошибки.
 * - opener: Control - необязательный; контрол, открывающий диалоговое окно.
 * - dialogEventHandlers: Object - необязательный; {@link Controls/popup/IBaseOpener/options/eventHandlers| обработчики событий диалогового окна}.
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
 * <pre>
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

interface IProcessOptions {
    error: Error;
    handlers?: Handler[];
    opener?: Control;
    dialogEventHandlers?: Record<string, Function>;
    _popupHelper?: IPopupHelper;
}

export default function process(options: IProcessOptions): Promise<PopupId | void> {
    const {
        error,
        handlers = [],
        opener,
        dialogEventHandlers,
        _popupHelper = getPopupHelper()
    } = options;

    const controller = new ErrorController({ handlers }, _popupHelper);

    return controller.process(error).then((viewConfig) => {
        if (!viewConfig) {
            return;
        }

        return _popupHelper.openDialog(viewConfig, opener, dialogEventHandlers);
    });
}
