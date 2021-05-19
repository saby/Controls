import Base from 'Controls/_popup/PopupHelper/Base';
import StackOpener from 'Controls/_popup/Opener/Stack';
import {IStackPopupOptions} from 'Controls/_popup/interface/IStack';

/**
 * Хелпер для открытия стековых окон.
 * @class Controls/_popup/PopupHelper/Stack
 * @implements Controls/interface:IPropStorage
 * @implements Controls/popup:IStackOpener
 *
 * @remark
 * Для предотвращения потенциальной утечки памяти не забывайте уничтожать экземпляр опенера с помощью метода {@link Controls/_popup/PopupHelper/Stack#destroy destroy}.
 *
 * @author Красильников А.С.
 * @public
 */

export default class Stack extends Base {
    _opener = StackOpener;
    open(popupOptions: IStackPopupOptions): void {
        return super.open(popupOptions);
    }
}
