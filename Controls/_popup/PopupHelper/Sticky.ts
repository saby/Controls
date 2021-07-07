import Base from 'Controls/_popup/PopupHelper/Base';
import StickyOpener from 'Controls/_popup/Opener/Sticky';
import {IStickyPopupOptions} from 'Controls/_popup/interface/ISticky';

/**
 * Хелпер для открытия прилипающих окон
 * @class Controls/_popup/PopupHelper/Sticky
 * @control
 * @author Красильников А.С.
 * @category Popup
 * @public
 */

export default class Sticky extends Base {
    _opener = StickyOpener;

    /**
     * Метод для открытия прилипающих окон
     * @function Controls/_popup/PopupHelper/Sticky#open
     * @param {PopupOptions} config Конфигурация прилипающего окна
     * @example
     * <pre class="brush: js">
     * import {StickyOpener} from 'Controls/popup';
     * ...
     * this._sticky = new StickyOpener();
     * openSticky() {
     *     this._sticky.open({
     *         template: 'Example/MyStickyTemplate',
     *         opener: this._children.myButton
     *     });
     * }
     * </pre>
     * @see close
     * @see destroy
     */
    open(popupOptions: IStickyPopupOptions): void {
        return super.open(popupOptions);
    }
}
/**
 * Метод для закрытия прилипающего окна
 * @name Controls/_popup/PopupHelper/Sticky#close
 * @function
 * @example
 * <pre class="brush: js">
 * import {StickyOpener} from 'Controls/popup';
 * ...
 * this._sticky = new StickyOpener();
 *
 * closeSticky() {
 *    this._sticky.close();
 * }
 * </pre>
 * @see open
 * @see destroy
 */

/**
 * Разрушает экземпляр класса
 * @name Controls/_popup/PopupHelper/Sticky#destroy
 * @function
 * @example
 * <pre class="brush: js">
 *    import {StickyOpener} from 'Controls/popup';
 *    ...
 *    this._sticky = new StickyOpener();
 *
 *    _beforeUnmount() {
 *        this._sticky.destroy();
 *        this._sticky = null;
 *    }
 * </pre>
 * @see open
 * @see close
 */
