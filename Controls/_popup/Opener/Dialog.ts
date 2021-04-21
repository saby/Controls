import BaseOpener, {IBaseOpenerOptions} from 'Controls/_popup/Opener/BaseOpener';
import {IDialogOpener, IDialogPopupOptions} from 'Controls/_popup/interface/IDialog';
import CancelablePromise from 'Controls/_popup/utils/CancelablePromise';
import {IPropStorage, IPropStorageOptions} from 'Controls/interface';
import openPopup from 'Controls/_popup/utils/openPopup';

interface IDialogOpenerOptions extends IDialogPopupOptions, IBaseOpenerOptions, IPropStorageOptions {
}

const getDialogConfig = (config: IDialogOpenerOptions): IDialogOpenerOptions => {
    config = config || {};
    // The dialog is isDefaultOpener by default. For more information,
    // see  {@link Controls/_interface/ICanBeDefaultOpener}
    config.isDefaultOpener = config.isDefaultOpener !== undefined ? config.isDefaultOpener : true;
    return config;
};

const POPUP_CONTROLLER = 'Controls/popupTemplate:DialogController';

/**
 * Контрол, открывающий всплывающее окно, которое позиционируется по центру экрана.
 *
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FPopup%2FOpener%2FStackDemo демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/openers/dialog/#open-popup руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_popupTemplate.less переменные тем оформления}
 * Для открытия диалоговых окон из кода используйте {@link Controls/popup:DialogOpener}.
 * @implements Controls/popup:IBaseOpener
 * @author Красильников А.С.
 * @demo Controls-demo/Popup/Dialog/Index
 * @public
 */
class Dialog extends BaseOpener<IDialogOpenerOptions> implements IDialogOpener, IPropStorage {
    readonly '[Controls/_popup/interface/IDialogOpener]': boolean;
    readonly '[Controls/_interface/IPropStorage]': boolean;

    open(popupOptions: IDialogOpenerOptions): Promise<string | undefined> {
        return super.open(this._getDialogConfig(popupOptions), POPUP_CONTROLLER);
    }

    private _getDialogConfig(popupOptions: IDialogOpenerOptions): IDialogOpenerOptions {
        return getDialogConfig(popupOptions);
    }

    static _openPopup(config: IDialogOpenerOptions): CancelablePromise<string> {
        const newCfg = getDialogConfig(config);
        const moduleName = Dialog.prototype._moduleName;
        return openPopup(newCfg, POPUP_CONTROLLER, moduleName);
    }
    static openPopup(config: IDialogOpenerOptions): Promise<string> {
        const cancelablePromise = Dialog._openPopup(config);
        return new Promise((resolve, reject) => {
            cancelablePromise.then(resolve);
            cancelablePromise.catch(reject);
        });
    }

    static closePopup(popupId: string): void {
        BaseOpener.closeDialog(popupId);
    }
}

export default Dialog;
