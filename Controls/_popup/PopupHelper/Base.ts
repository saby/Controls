import {IBasePopupOptions} from 'Controls/_popup/interface/IBaseOpener';
import BaseOpener from 'Controls/_popup/Opener/BaseOpener';

interface IOpenerStaticMethods {
    openPopup: (popupOptions: IBasePopupOptions) => Promise<string>;
    closePopup: (popupId: string) => void;
}
/**
 * Базовый хелпер для открытия всплывающих окон
 * @class Controls/_popup/PopupHelper/Base
 * @control
 * @author Красильников А.С.
 * @category Popup
 * @private
 */

export default class Base {
    _popupId: string;
    _opener: IOpenerStaticMethods;

    open(popupOptions: IBasePopupOptions): void {
        const config: IBasePopupOptions = {...popupOptions};
        config.isHelper = true;
        if (this.isOpened()) {
            config.id = this._popupId;
        }
        this._opener.openPopup(config).then((id: string) => {
            this._popupId = id;
        });
    }

    close(): void {
        return this._opener.closePopup(this._popupId);
    }

    isOpened(): boolean {
        return BaseOpener.isOpened(this._popupId);
    }

    destroy(): void {
        if (this.isOpened()) {
            this.close();
        }
        this._popupId = null;
        this._opener = null;
    }
}
