import Base from 'Controls/_popup/PopupHelper/Base';
import BaseOpener, {ILoadDependencies} from 'Controls/_popup/Opener/BaseOpener';
import {ISlidingPanelOptions, ISlidingPanelPopupOptions} from 'Controls/_popup/interface/ISlidingPanel';
import StackOpener from 'Controls/_popup/PopupHelper/Stack';
import DialogOpener from 'Controls/_popup/PopupHelper/Dialog';
import {detection} from 'Env/Env';
import BaseOpenerUtil from 'Controls/_popup/Opener/BaseOpenerUtil';
import ManagerController from 'Controls/_popup/Manager/ManagerController';

const POPUP_CONTROLLER = 'Controls/popupSliding:Controller';
const DEFAULT_DESKTOP_MODE = 'stack';
const OPENER_BY_DESKTOP_MODE = {
    stack: StackOpener,
    dialog: DialogOpener
};

type TDesktopOpener = StackOpener | DialogOpener;

class SlidingPanelOpener extends BaseOpener {
    static _openPopup(config: ISlidingPanelPopupOptions, popupController: string = POPUP_CONTROLLER): Promise<string> {
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
 * @implements Controls/popup:ISlidingPanel
 *
 * @author Красильников А.С.
 * @demo Controls-demo/Popup/SlidingPanel/Index
 * @public
 */

export default class SlidingPanel extends Base {
    private _opener: Function = SlidingPanelOpener;
    private _desktopOpener: TDesktopOpener;
    protected _options: ISlidingPanelPopupOptions;
    open(popupOptions: ISlidingPanelPopupOptions): unknown {
        const adaptivePopupOptions = this._getPopupOptionsWithSizes(popupOptions);
        const desktopMode = this._getDesktopMode(adaptivePopupOptions);
        if (detection.isPhone) {
            return super.open(adaptivePopupOptions, POPUP_CONTROLLER);
        } else {
            return this._getDesktopOpener(desktopMode).open(adaptivePopupOptions);
        }
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

    protected _popupIsDestroying(popupId: string): boolean {
        const item = ManagerController.findItemById(this._popupId);
        if (!item) {
            // Элемент может быть удален с состояния ( что вызывает непорсдетсвенно анмаунт окна), но
            // цикла синхронизации еще могло не произойти. Если окно ожидает синхронизации на разрушение, тоже учитываю.
            const removedItems = ManagerController.getContainer().getRemovingItems();
            for (const removeData of removedItems) {
                if (removeData.removedItem.id === popupId) {
                    return true;
                }
            }
        }
        return item && (item.popupState === item.controller.POPUP_STATE_START_DESTROYING ||
            item.popupState === item.controller.POPUP_STATE_DESTROYING ||
            item.popupState === item.controller.POPUP_STATE_DESTROYED);
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

    private _getDesktopOpener(
        desktopMode?: ISlidingPanelPopupOptions['slidingPanelOptions']['desktopMode']
    ): TDesktopOpener {
        const mode = desktopMode || this._getDesktopMode(this._options);
        const OpenerConstructor = OPENER_BY_DESKTOP_MODE[mode];
        if (!this._desktopOpener) {
            this._desktopOpener = new OpenerConstructor();
        }
        return this._desktopOpener;
    }

    private _getDesktopMode(
        popupOptions: ISlidingPanelPopupOptions
    ): ISlidingPanelPopupOptions['slidingPanelOptions']['desktopMode'] {
        return popupOptions?.desktopMode || DEFAULT_DESKTOP_MODE;
    }

    /**
     * Получение дефолтного значения slidingPanelOptions,
     * т.к. при открытии на десктопе мы не попадем в контроллел SlidingPanel
     * @param {ISlidingPanelPopupOptions} popupOptions
     * @return {ISlidingPanelOptions}
     * @private
     */
    private _getDefaultSlidingPanelData(popupOptions: ISlidingPanelPopupOptions): ISlidingPanelOptions {
        return {
            desktopMode: popupOptions.desktopMode
        };
    }

    /**
     * Получаем конфиг для открытия панели, в зависимости от того на каком устройстве открываем
     * @param {ISlidingPanelPopupOptions} popupOptions
     * @return {ISlidingPanelPopupOptions}
     * @private
     */
    private _getPopupOptionsWithSizes(popupOptions: ISlidingPanelPopupOptions): ISlidingPanelPopupOptions {
        const isPhone = detection.isPhone;
        const slidingPanelOptions = {
            position: 'bottom',
            desktopMode: DEFAULT_DESKTOP_MODE,
            ...popupOptions.slidingPanelOptions
        };
        const options = isPhone ? slidingPanelOptions : popupOptions.dialogOptions;
        const mergedConfig = BaseOpenerUtil.getConfig(this._options, popupOptions) as ISlidingPanelPopupOptions;
        const resultPopupOptions = {
            desktopMode: DEFAULT_DESKTOP_MODE,
            ...mergedConfig,
            ...(options || {}),
            slidingPanelOptions
        };

        /*
            Если открываемся на десктопе, то открываемся другим опенером и в контроллер SlidingPanel не попадаем,
            соответственно slidingPanelOptions никто не прокинет, прокидываем сами через templateOptions
         */
        if (!isPhone) {
            if (!resultPopupOptions.templateOptions) {
                resultPopupOptions.templateOptions = {};
            }
            resultPopupOptions.templateOptions.slidingPanelOptions =
                this._getDefaultSlidingPanelData(resultPopupOptions);
        }

        return resultPopupOptions;
    }
}
