import Base from 'Controls/_popup/PopupHelper/Base';
import DialogOpener from 'Controls/_popup/Opener/Dialog';
import {IDialogPopupOptions} from 'Controls/_popup/interface/IDialog';

/**
 * Хелпер для открытия диалоговых DialogOpener
 * @class Controls/_popup/PopupHelper/Dialog
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
     * @param {PopupOptions} config Конфигурация диалогового окна
     * @example
     * <pre class="brush: js">
     *    import {DialogOpener} from 'Controls/popup';
     *    ...
     *    this._dialog = new DialogOpener();
     *    openDialog() {
     *        this._dialog.open({
     *          template: 'Example/MyDialogTemplate',
     *          opener: this._children.myButton
     *        });
     *    }
     * </pre>
     * @see close
     * @see destroy
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
 *    import {DialogOpener} from 'Controls/popup';
 *    ...
 *    this._dialog = new DialogOpener();
 *
 *    closeDialog() {
 *        this._dialog.close();
 *    }
 * </pre>
 * @see open
 * @see destroy
 */

/**
 * Разрушает экземпляр класса
 * @name Controls/_popup/PopupHelper/Dialog#destroy
 * @function
 * @example
 * <pre class="brush: js">
 *    import {DialogOpener} from 'Controls/popup';
 *    ...
 *    this._dialog = new DialogOpener();
 *
 *    _beforeUnmount() {
 *        this._dialog.destroy();
 *        this._dialog = null;
 *    }
 * </pre>
 * @see open
 * @see close
 */
