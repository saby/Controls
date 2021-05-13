import Base from 'Controls/_popup/PopupHelper/Base';
import DialogOpener from 'Controls/_popup/Opener/Dialog';
import {IDialogPopupOptions} from 'Controls/_popup/interface/IDialog';

/**
 * Хелпер для открытия диалоговых окон.
 * @class Controls/_popup/PopupHelper/Dialog
 * @implements Controls/popup:IDialogOpener
 * @implements Controls/popup:IBaseOpener
 *
 * @remark
 * Для предотвращения потенциальной утечки памяти не забывайте уничтожать экземпляр опенера.
 * с помощью метода {@link Controls/_popup/PopupHelper/Dialog#destroy destroy}.
 *
 * @author Красильников А.С.
 * @public
 */

export default class Dialog extends Base {
    _opener = DialogOpener;

    /**
     * Метод для открытия диалоговых окон.
     * @name Controls/_popup/PopupHelper/Dialog#open
     * @function
     * @param {Controls/popup:IDialogOpener} config Конфигурация диалогового окна.
     * @return Promise<void>
     * @example
     * <pre class="brush: js">
     * import {DialogOpener} from 'Controls/popup';
     *
     * this._dialog = new DialogOpener();
     *
     * openDialog() {
     *     this._dialog.open({
     *         template: 'Example/MyDialogTemplate',
     *         opener: this._children.myButton
     *     });
     * }
     * </pre>
     * @see close
     * @see destroy
     * @see isOpened
     */
    open(popupOptions: IDialogPopupOptions): void {
        return super.open(popupOptions);
    }
}
/**
 * Метод для закрытия диалогового окна.
 * @name Controls/_popup/PopupHelper/Dialog#close
 * @function
 * @example
 * <pre class="brush: js">
 * import {DialogOpener} from 'Controls/popup';
 *
 * this._dialog = new DialogOpener();
 *
 * closeDialog() {
 *     this._dialog.close();
 * }
 * </pre>
 * @see open
 * @see destroy
 * @see isOpened
 */

/**
 * Разрушает экземпляр класса
 * @name Controls/_popup/PopupHelper/Dialog#destroy
 * @function
 * @example
 * <pre class="brush: js">
 * import {DialogOpener} from 'Controls/popup';
 *
 * this._dialog = new DialogOpener();
 *
 * _beforeUnmount() {
 *     this._dialog.destroy();
 *     this._dialog = null;
 * }
 * </pre>
 * @see open
 * @see close
 * @see isOpened
 */

/**
 * @name Controls/_popup/PopupHelper/Dialog#isOpened
 * @description Возвращает информацию о том, открыто ли диалоговое окно.
 * @function
 * @see open
 * @see close
 * @see destroy
 */
