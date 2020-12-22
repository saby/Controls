import Base from 'Controls/_popup/PopupHelper/Base';
import StickyOpener from 'Controls/_popup/Opener/Sticky';
import {IStickyPopupOptions} from 'Controls/_popup/interface/ISticky';

/**
 * Хелпер для открытия прилипающих окон
 * @class Controls/_popup/PopupHelper/Sticky
 *
 * @author Красильников А.С.
 * @public
 */

export default class Sticky extends Base {
    _opener = StickyOpener;

    /**
     * Метод для открытия прилипающих окон.
     * @function Controls/_popup/PopupHelper/Sticky#open
     * @param {PopupOptions} config Конфигурация прилипающего окна.
     * @example
     * <pre class="brush: js">
     * import {StickyOpener} from 'Controls/popup';
     * 
     * this._sticky = new StickyOpener();
     * 
     * openSticky() {
     *     this._sticky.open({
     *         template: 'Example/MyStickyTemplate',
     *         opener: this._children.myButton
     *     });
     * }
     * </pre>
     * @see close
     * @see destroy
     * @see isOpened
     */
    open(popupOptions: IStickyPopupOptions, popupController?: string): void {
        //TODO: will be fixed by https://online.sbis.ru/opendoc.html?guid=50d7c8f9-7f88-401c-a511-79f774c43c4a
        return super.open(popupOptions, popupController);
    }
}
/**
 * Метод для закрытия прилипающего окна.
 * @name Controls/_popup/PopupHelper/Sticky#close
 * @function
 * @example
 * <pre class="brush: js">
 * import {StickyOpener} from 'Controls/popup';
 * 
 * this._sticky = new StickyOpener();
 * 
 * closeSticky() {
 *     this._sticky.close();
 * }
 * </pre>
 * @see open
 * @see destroy
 * @see isOpened
 */

/**
 * Разрушает экземпляр класса.
 * @name Controls/_popup/PopupHelper/Sticky#destroy
 * @function
 * @example
 * <pre class="brush: js">
 * import {StickyOpener} from 'Controls/popup';
 * 
 * this._sticky = new StickyOpener();
 *
 * _beforeUnmount() {
 *     this._sticky.destroy();
 *     this._sticky = null;
 * }
 * </pre>
 * @see open
 * @see close
 * @see isOpened
 */

/**
 * @name Controls/_popup/PopupHelper/Sticky#isOpened
 * @description Возвращает информацию о том, открыто ли прилипающее окно.
 * @function
 * @see open
 * @see close
 * @see destroy
 */