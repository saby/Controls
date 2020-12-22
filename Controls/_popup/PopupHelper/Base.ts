import {IBasePopupOptions} from 'Controls/_popup/interface/IBaseOpener';
import BaseOpener from 'Controls/_popup/Opener/BaseOpener';
import * as randomId from 'Core/helpers/Number/randomId';
import ManagerController from 'Controls/_popup/Manager/ManagerController';
import BaseOpenerUtil from 'Controls/_popup/Opener/BaseOpenerUtil';
import {IndicatorOpener} from 'Controls/LoadingIndicator';

interface IOpenerStaticMethods {
    openPopup: (popupOptions: IBasePopupOptions, popupController?: string) => Promise<string>;
    closePopup: (popupId: string) => void;
}
/**
 * Базовый хелпер для открытия всплывающих окон.
 * @class Controls/_popup/PopupHelper/Base
 *
 * @author Красильников А.С.
 * @private
 */

export default class Base {
    protected _popupId: string;
    private _opener: IOpenerStaticMethods;
    private _indicatorId: string;

    open(popupOptions: IBasePopupOptions, popupController?: string): void {
        const config: IBasePopupOptions = {...popupOptions};
        config.isHelper = true;

        // Защита от множ. вызова. Хэлпер сам генерирует id
        if (ManagerController.isDestroying(this._popupId)) {
            this._popupId = null;
        }
        if (!this._popupId) {
            this._popupId = randomId('popup-');
        }
        config.id = this._popupId;
        if (!this._indicatorId && config.showIndicator !== false) {
            this._showIndicator(config);
        }
        config._events = {
            onOpen: () => {
                this._hideIndicator();
            },
            onClose: () => {
                this._hideIndicator();
                // Защита. Могут позвать close и сразу open. В этом случае мы
                // инициируем закрытие окна, откроем новое и после стрельнет onCLose, который очистит id нового окна.
                // В итоге повторый вызов метода close ничего не сделает, т.к. popupId уже почищен.
                if (!this.isOpened()) {
                    this._popupId = null;
                }
            }
        };
        if (config.dataLoaders) {
            config._prefetchPromise = ManagerController.loadData(config.dataLoaders);
        }

        this._openPopup(config, popupController);
    }

    close(): void {
        this._opener.closePopup(this._popupId);
        this._popupId = null;
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

    protected _openPopup(config, popupController): void {
        this._opener.openPopup(config, popupController);
    }

    private _hideIndicator(): void {
        if (this._indicatorId) {
            IndicatorOpener.hide(this._indicatorId);
            this._indicatorId = null;
        }
    }

    private _showIndicator(config: IBasePopupOptions): void {
        // Если окно уже открыто или открывается, новые обработчики не создаем
        const popupItem = config.id && ManagerController.find(config.id);
        if (popupItem) {
            config._events = popupItem.popupOptions._events;
        } else {
            const indicatorConfig = BaseOpenerUtil.getIndicatorConfig(null, config);
            this._indicatorId = IndicatorOpener.show(indicatorConfig);
        }
    }
}
