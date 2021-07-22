import BaseOpener, {IBaseOpenerOptions, ILoadDependencies} from 'Controls/_popup/Opener/BaseOpener';
import * as isNewEnvironment from 'Core/helpers/isNewEnvironment';
import {IPopupItemInfo} from 'Controls/_popup/interface/IPopup';
import {List} from 'Types/collection';
import ManagerController from 'Controls/_popup/Manager/ManagerController';
import {INotificationPopupOptions, INotificationOpener} from '../interface/INotification';
import {Logger} from 'UI/Utils';
import BaseOpenerUtil from 'Controls/_popup/Opener/BaseOpenerUtil';

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
    const config: INotificationPopupOptions = BaseOpenerUtil.getConfig({}, popupOptions);
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
 * * {@link /materials/Controls-demo/app/Controls-demo%2FPopup%2FNotification%2FIndex демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/openers/notification/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_popupTemplate.less переменные тем оформления}
 *
 * @extends Controls/_popup/Opener/BaseOpener
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Popup/Notification/Index
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

    static _openPopup(config: INotificationPopupOptions): Promise<string> {
        return Notification._privateOpenPopup(config);
    }
    // TODO: Проверить, можно ли Notification перевести на utils/OpenPopup
    static openPopup(config: INotificationPopupOptions): Promise<string> {
        return Notification._privateOpenPopup(config);
    }
    private static _privateOpenPopup(config: INotificationPopupOptions): Promise<string> {
        return new Promise((resolve) => {
            if (!config.hasOwnProperty('isHelper')) {
                Logger.warn('Controls/popup:Dialog: Для открытия нотификационных окон из ' +
                    'кода используйте NotificationOpener');
            }
            const newConfig = BaseOpenerUtil.getConfig(BASE_OPTIONS, config);
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
        if (popupId && typeof popupId !== 'string' && popupId.close) {
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

Object.defineProperty(Notification, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Notification.getDefaultOptions();
   }
});

const BASE_OPTIONS = {
    autofocus: false,
    autoClose: true
};

export default Notification;

/**
 * Статический метод для открытия окна уведомления.
 * @function
 * @name Controls/_popup/Opener/Notification#openPopup
 * @param {Controls/_popup/interface/INotificationOpener/PopupOptions.typedef} config Конфигурация окна.
 * @returns {Promise<string>} Возвращает Promise, который в качестве результата вернет идентификатор окна.
 * Такой идентификатор используют в методе {@link closePopup} для закрытия окна.
 * @static
 * @remark
 * Дополнительный пример работы со статическим методом доступен {@link /doc/platform/developmentapl/interface-development/controls/openers/notification/#open-popup здесь}.
 * При использовании метода не требуется создавать {@link Controls/popup:Notification} в верстке.
 * @example
 * <pre class="brush: js">
 * // TypeScript
 * import {NotificationOpener} from 'Controls/popup';
 * ...
 * _afterMount(){
 *      this._opener = new NotificationOpener({
 *          template: 'Controls/popupTemplate:NotificationSimple',
 *          autoClose: true,
 *          templateOptions: {
 *              style: 'success',
 *              text: `Новое уведомление`,
 *              icon: 'icon-Admin'
 *          }
 *      });
 *      this._opener.open({});
 * }
 *
 * _beforeUnmount(){
 *      this._opener.destroy();
 * }
 * </pre>
 * @see closePopup
 * @see close
 * @see open
 */