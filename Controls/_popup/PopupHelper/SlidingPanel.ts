import Base from 'Controls/_popup/PopupHelper/Base';
import BaseOpener, {ILoadDependencies} from 'Controls/_popup/Opener/BaseOpener';
import {ISlidingPanelPopupOptions} from 'Controls/_popup/interface/ISlidingPanel';
import StackOpener from 'Controls/_popup/PopupHelper/Stack';
import {detection} from 'Env/Env';

const POPUP_CONTROLLER = 'Controls/popupSliding:Controller';

class SlidingPanelOpener extends BaseOpener {
    static openPopup(config: ISlidingPanelPopupOptions, popupController: string = POPUP_CONTROLLER): Promise<string> {
        return new Promise((resolve) => {
            BaseOpener.requireModules(config, popupController).then((result: ILoadDependencies) => {
                BaseOpener.showDialog(result.template, config, result.controller).then((popupId: string) => {
                    resolve(popupId);
                });
            });
        });
    }

    static closePopup(popupId: string): void {
        BaseOpener.closeDialog(popupId);
    }
}

/**
 * Хелпер для открытия Шторки.
 * @class Controls/_popup/PopupHelper/SlidingPanel
 *
 * @author Красильников А.С.
 * @demo Controls-demo/PopupTemplate/SlidingPanel/Index
 * @public
 */

export default class SlidingPanel extends Base {
    private _opener: Function = SlidingPanelOpener;
    private _desktopOpener: StackOpener;

    /**
     * Метод для открытия шторки.
     * @function Controls/_popup/PopupHelper/SlidingPanel#open
     * @param {PopupOptions} popupOptions Конфигурация шторки.
     * @example
     * <pre class="brush: js">
     * import {SlidingPanelOpener} from 'Controls/popup';
     *
     * this._slidingPanel = new SlidingPanelOpener();
     *
     * openStack() {
     *     this._slidingPanel.open({
     *         template: 'Example/MyStackTemplate',
     *         opener: this._children.myButton
     *     });
     * }
     * </pre>
     * @see close
     * @see destroy
     * @see isOpened
     */

    open(popupOptions: ISlidingPanelPopupOptions): unknown {
        const adaptivePopupOptions = this._getPopupOptionsWidthSizes(popupOptions);
        return this._callMethodAdaptive('open', adaptivePopupOptions, detection.isPhone ? POPUP_CONTROLLER : undefined);
    }

    close(...args: unknown[]): void {
        return this._callMethodAdaptive('close', ...args) as void;
    }

    destroy(...args: unknown[]): void {
        return this._callMethodAdaptive('destroy', ...args) as void;
    }

    isOpened(...args: unknown[]): boolean {
        return this._callMethodAdaptive('isOpened', ...args) as boolean;
    }

    /**
     * Выполняет метод для десктопного или мобильного опенера,
     * в зависимости от того, на каком устройстве открывают попап.
     * @param {string} methodName
     * @param args
     * @return {unknown}
     * @private
     */
    private _callMethodAdaptive(methodName: string, ...args: unknown[]): unknown {
        if (detection.isPhone) {
            return super[methodName](...args);
        } else {
            return this._getDesktopOpener()[methodName](...args);
        }
    }

    private _getDesktopOpener(): StackOpener {
        if (!this._desktopOpener) {
            this._desktopOpener = new StackOpener();
        }
        return this._desktopOpener;
    }

    /**
     * Получаем конфиг для открытия панели, в зависимости от того на каком устройстве открываем
     * @param {ISlidingPanelPopupOptions} popupOptions
     * @return {ISlidingPanelPopupOptions}
     * @private
     */
    private _getPopupOptionsWidthSizes(popupOptions: ISlidingPanelPopupOptions): ISlidingPanelPopupOptions {
        const sizes = detection.isPhone ? popupOptions.slidingPanelSizes : popupOptions.dialogSizes;
        return Object.assign(
            {
                position: 'bottom'
            },
            sizes,
            popupOptions
        );
    }
}

/**
 * Метод для закрытия стекового окна.
 * @name Controls/_popup/PopupHelper/SlidingPanel#close
 * @function
 * @example
 * <pre class="brush: js">
 * import {SlidingPanelOpener} from 'Controls/popup';
 *
 * this._slidingPanel = new SlidingPanelOpener();
 *
 * closeStack() {
 *     this._slidingPanel.close();
 * }
 * </pre>
 * @see open
 * @see destroy
 * @see isOpened
 */

/**
 * Разрушает экземпляр класса
 * @name Controls/_popup/PopupHelper/SlidingPanel#destroy
 * @function
 * @example
 * <pre class="brush: js">
 * import {SlidingPanelOpener} from 'Controls/popup';
 *
 * this._slidingPanel = new SlidingPanelOpener();
 *
 * _beforeUnmount() {
 *     this._slidingPanel.destroy();
 *     this._slidingPanel = null;
 * }
 * </pre>
 * @see open
 * @see close
 * @see isOpened
 */

/**
 * @name Controls/_popup/PopupHelper/SlidingPanel#isOpened
 * @description Возвращает информацию о том, открыта ли шторка.
 * @function
 * @see open
 * @see close
 * @see destroy
 */
