import {IBasePopupOptions} from 'Controls/_popup/interface/IBaseOpener';
import BaseOpener from 'Controls/_popup/Opener/BaseOpener';
import * as randomId from 'Core/helpers/Number/randomId';
import ManagerController from 'Controls/_popup/Manager/ManagerController';
import BaseOpenerUtil from 'Controls/_popup/Opener/BaseOpenerUtil';
import {IndicatorOpener} from 'Controls/LoadingIndicator';

interface IOpenerStaticMethods {
    _openPopup: (popupOptions: IBasePopupOptions, popupController?: string) => Promise<string>;
    openPopup: (popupOptions: IBasePopupOptions, popupController?: string) => Promise<string>;
    closePopup: (popupId: string) => void;
}
/**
 * Базовый хелпер для открытия всплывающих окон.
 * @class Controls/_popup/PopupHelper/Base
 * @implements Controls/popup:IBaseOpener
 *
 * @author Красильников А.С.
 * @private
 */

export default class Base {
    protected _popupId: string;
    protected _opener: IOpenerStaticMethods;
    private _indicatorId: string;
    protected _options: IBasePopupOptions;
    private _openPromise: Array<Promise<string>> = [];

    constructor(cfg: IBasePopupOptions = {}) {
        this._options = cfg;
    }

    open(popupOptions: IBasePopupOptions, popupController?: string): Promise<void> {
        return new Promise((resolve,reject) => {
            const config: IBasePopupOptions = BaseOpenerUtil.getConfig(this._options, popupOptions);
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
                    resolve();
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
        })
    }

    close(): void {
        this._cancelOpen();
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

    protected _openPopup(config: IBasePopupOptions, popupController: string): void {
        const promise = this._opener._openPopup(config, popupController);
        this._openPromise.push(promise);
        promise.then(() => {
            const index = this._openPromise.indexOf(promise);
            if (index > -1) {
                this._openPromise.splice(index, 1);
            }
        });
        promise.catch(() => {
            this._hideIndicator();
        });
    }

    private _hideIndicator(): void {
        if (this._indicatorId) {
            IndicatorOpener.hide(this._indicatorId);
            this._indicatorId = null;
        }
    }

    private _cancelOpen(): void {
        // Notification и SlidingPanel еще не переведены на механизм cancelablePromise, нужны проверки
        if (this._openPromise.length) {
            for (const promise of this._openPromise) {
                if (promise.cancelPromise) {
                    promise.cancelPromise();
                }
            }
            this._openPromise = [];
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
