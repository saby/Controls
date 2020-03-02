import BaseOpener, {IBaseOpenerOptions, ILoadDependencies} from 'Controls/_popup/Opener/BaseOpener';
import * as isNewEnvironment from 'Core/helpers/isNewEnvironment';
import ManagerController from 'Controls/_popup/Manager/ManagerController';
import {INotificationPopupOptions, INotificationOpener} from '../interface/INotification';

/**
 * Контрол, открывающий окно, которое позиционируется в правом нижнем углу окна браузера. Одновременно может быть открыто несколько окон уведомлений. В этом случае они выстраиваются в стек по вертикали.
 * @remark
 * Подробнее о работе с контролом читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/notification/ здесь}.
 * См. <a href="/materials/demo-ws4-notification">демо-пример</a>.
 * @class Controls/_popup/Opener/Notification
 * @extends Controls/_popup/Opener/BaseOpener
 * @mixes Controls/_popup/interface/IBaseOpener
 * @mixes Controls/_popup/interface/INotification
 * @control
 * @public
 * @author Красильников А.С.
 * @category Popup
 * @demo Controls-demo/Popup/Opener/NotificationPG
 */

interface INotificationOpenerOptions extends INotificationPopupOptions, IBaseOpenerOptions {}

const POPUP_CONTROLLER = 'Controls/popupTemplate:NotificationController';

const BASE_OPTIONS = {
    autofocus: false,
    autoClose: true
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
    // элемент проставляется из createControl в совместимости, удаляем его чтобы потом при мерже получить новый элемент
    delete cfg.element;
    return cfg;
};

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

    static openPopup(config: object): Promise<string> {
        return new Promise((resolve) => {
            const newConfig = BaseOpener.getConfig(BASE_OPTIONS, config);
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
        BaseOpener.closeDialog(popupId);
    }

    static getDefaultOptions(): INotificationOpenerOptions {
        return {...BaseOpener.getDefaultOptions(), ...BASE_OPTIONS};
    }
}

export default Notification;
