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
 * Для предотвращения потенциальной утечки памяти не забывайте уничтожать экземпляр опенера с помощью метода {@link Controls/popup:IDialogOpener#destroy destroy}.
 * @author Красильников А.С.
 * @public
 */

export default class Dialog extends Base {
    _opener = DialogOpener;
    open(popupOptions: IDialogPopupOptions): void {
        return super.open(popupOptions);
    }
}