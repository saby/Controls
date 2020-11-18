import BaseOpener, {IBaseOpenerOptions, ILoadDependencies} from 'Controls/_popup/Opener/BaseOpener';
import * as isNewEnvironment from 'Core/helpers/isNewEnvironment';
import {IPopupItemInfo} from 'Controls/_popup/interface/IPopup';
import {List} from 'Types/collection';
import ManagerController from 'Controls/_popup/Manager/ManagerController';
import {INotificationPopupOptions, INotificationOpener} from '../interface/INotification';
import {Logger} from 'UI/Utils';

interface INotificationOpenerOptions extends INotificationPopupOptions, IBaseOpenerOptions {}

const POPUP_CONTROLLER = 'Controls/popupTemplate:NotificationController';

const findItemById = (popupItems: List<IPopupItemInfo>, id: string): IPopupItemInfo | null => {
    const index = popupItems && popupItems.getIndexByValue('id', id);
    if (index > -1) {
        return popupItems.at(index);
    }
    return null;
};

const isLinkedPopup = (popupItems: List<IPopupItemInfo>,
                       parentItem: IPopupItemInfo,
                       item: IPopupItemInfo): boolean => {
    while (item && item.parentId) {
        item = findItemById(popupItems, item.parentId);
        if (item === parentItem) {
            return true;
        }
    }
    return false;
};

const compatibleOpen = (popupOptions: INotificationPopupOptions): Promise<string> => {
    const config: INotificationPopupOptions = BaseOpener.getConfig({}, popupOptions);
    delete config.id;
    return new Promise((resolve) => {
        Promise.all([
            BaseOpener.requireModule('Controls/compatiblePopup:BaseOpener'),
            BaseOpener.requireModule('SBIS3.CONTROLS/Utils/InformationPopupManager'),
            BaseOpener.requireModule('Controls/compatiblePopup:OldNotification'),
            BaseOpener.requireModule(config.template)
        ]).then((results) => {
            const BaseOpenerCompat = results[0];
            const InformationPopupManager = results[1];
            config.template = results[3];
            const compatibleConfig = getCompatibleConfig(BaseOpenerCompat, config);
            const popupId = InformationPopupManager.showNotification(compatibleConfig, compatibleConfig.notHide);
            resolve(popupId);
        });
    });
};

const getCompatibleConfig = (BaseOpenerCompat: any, config: INotificationPopupOptions) => {
    const cfg = BaseOpenerCompat.prepareNotificationConfig(config);
    cfg.notHide = !cfg.autoClose;
    cfg.isCompoundNotification = true;
    // элемент проставляется из createControl в совместимости, удаляем его чтобы потом при мерже получить новый элемент
    delete cfg.element;
    return cfg;
};
/**
 * Контрол, открывающий окно, которое позиционируется в правом нижнем углу окна браузера. Одновременно может быть открыто несколько окон уведомлений. В этом случае они выстраиваются в стек по вертикали.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FNotificationDemo%2FNotificationDemo">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/openers/notification/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_popupTemplate.less">переменные тем оформления</a>
 * 
 * @class Controls/_popup/Opener/Notification
 * @extends Controls/_popup/Opener/BaseOpener
 * @mixes Controls/_popup/interface/IBasePopupOptions
 * @mixes Controls/_popup/interface/INotificationPopupOptions
 * 
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Popup/Opener/NotificationPG
 */
class Notification extends BaseOpener<INotificationOpenerOptions> implements INotificationOpener {
    readonly '[Controls/_popup/interface/INotificationOpener]': boolean;
    _notificationId: string = '';

    isOpened(): boolean {
        return !!ManagerController.find(this._notificationId);
    }

    open(popupOptions: INotificationPopupOptions): Promise<string> {
        const config = {...this._options, ...popupOptions};
        this._clearPopupIds();
        config.id = this._notificationId;
        return Notification.openPopup(config).then((popupId) => {
            this._notificationId = popupId;
            return popupId;
        });
    }

    close(): void {
        Notification.closePopup(this._notificationId);
        this._compatibleClose();
    }

    private _clearPopupIds(): void {
        if (!this.isOpened()) {
            this._notificationId = null;
        }
    }

    private _compatibleClose(): void {
        // Close popup on old page
        if (!isNewEnvironment()) {
            if (this._notificationId && this._notificationId.close) {
                this._notificationId.close();
            }
            this._notificationId = null;
        }
    }

    // for tests
    protected _getCompatibleConfig(BaseOpenerCompat: any, config: INotificationPopupOptions) {
        return getCompatibleConfig(BaseOpenerCompat, config);
    }

    static openPopup(config: INotificationPopupOptions): Promise<string> {
        return new Promise((resolve) => {
            if (!config.hasOwnProperty('isHelper')) {
                Logger.warn('Controls/popup:Dialog: Для открытия нотификационных окон из ' +
                    'кода используйте NotificationOpener');
            }
            const newConfig = BaseOpener.getConfig(BASE_OPTIONS, config);
            // Сделал так же как в ws3. окна, которые закрываются автоматически - всегда выше всех.
            if (newConfig.autoClose) {
                newConfig.topPopup = true;
            }
            // Если окно не выше всех - высчитываем по стандарту
            if (!newConfig.topPopup) {
                newConfig.zIndexCallback = Notification.zIndexCallback;
            }
            if (isNewEnvironment()) {
                if (!newConfig.hasOwnProperty('opener')) {
                    newConfig.opener = null;
                }
                BaseOpener.requireModules(config, POPUP_CONTROLLER).then((result: ILoadDependencies) => {
                    BaseOpener.showDialog(result.template, newConfig, result.controller).then((popupId: string) => {
                        resolve(popupId);
                    });
                });
            } else {
                compatibleOpen(newConfig).then((popupId: string) => {
                    resolve(popupId);
                });
            }
        });
    }

    static closePopup(popupId: string): void {
        // TODO: Compatible. Нотификационные окна на старых страницах открываются через ws3 manager
        if (typeof popupId !== 'string' && popupId.close) {
            popupId.close();
        } else {
            BaseOpener.closeDialog(popupId);
        }
    }

    static getDefaultOptions(): INotificationOpenerOptions {
        return {...BaseOpener.getDefaultOptions(), ...BASE_OPTIONS};
    }

    static zIndexCallback(item: IPopupItemInfo, popupItems: List<IPopupItemInfo>): number {
        const count: number = popupItems.getCount();
        const zIndexStep: number = 10;
        const baseZIndex: number = 100;
        for (let i = 0; i < count; i++) {
            // if popups are linked, then notification must be higher then parent
            const isMaximize: boolean = popupItems.at(i).popupOptions.maximize;
            const isModal: boolean = popupItems.at(i).popupOptions.modal;
            if ((isMaximize || isModal) && !isLinkedPopup(popupItems, popupItems.at(i), item)) {
                const maximizedPopupZIndex = (i + 1) * zIndexStep;
                return maximizedPopupZIndex - 1;
            }
        }
        return baseZIndex;
    }
}

const BASE_OPTIONS = {
    autofocus: false,
    autoClose: true
};

export default Notification;
