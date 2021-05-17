import Base from 'Controls/_popup/PopupHelper/Base';
import StickyOpener from 'Controls/_popup/Opener/Sticky';
import {IStickyPopupOptions} from 'Controls/_popup/interface/ISticky';

/**
 * Хелпер для открытия прилипающих окон
 * @class Controls/_popup/PopupHelper/Sticky
 * @implements Controls/popup:IStickyOpener
 *
 * @remark
 * Для предотвращения потенциальной утечки памяти не забывайте уничтожать экземпляр опенера с помощью метода {@link Controls/_popup/PopupHelper/Sticky#destroy destroy}.
 *
 * @author Красильников А.С.
 * @public
 */

export default class Sticky extends Base {
    _opener = StickyOpener;
    open(popupOptions: IStickyPopupOptions, popupController?: string): void {
        //TODO: will be fixed by https://online.sbis.ru/opendoc.html?guid=50d7c8f9-7f88-401c-a511-79f774c43c4a
        return super.open(popupOptions, popupController);
    }
}