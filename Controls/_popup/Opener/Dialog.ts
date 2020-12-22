import BaseOpener, {IBaseOpenerOptions, ILoadDependencies} from 'Controls/_popup/Opener/BaseOpener';
import {Logger} from 'UI/Utils';
import {Control} from 'UI/Base';
import {IDialogOpener, IDialogPopupOptions} from 'Controls/_popup/interface/IDialog';
import {IPropStorage, IPropStorageOptions} from 'Controls/interface';
import {getModuleByName} from 'Controls/_popup/utils/moduleHelper';

interface IDialogOpenerOptions extends IDialogPopupOptions, IBaseOpenerOptions, IPropStorageOptions {}

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
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_popupTemplate.less переменные тем оформления}
 * Для открытия диалоговых окон из кода используйте {@link Controls/popup:DialogOpener}.
 * @mixes Controls/_popup/interface/IBaseOpener
 * 
 * @author Красильников А.С.
 * @demo Controls-demo/Popup/Opener/StackDemo
 * @public
 */
class Dialog extends BaseOpener<IDialogOpenerOptions> implements IDialogOpener, IPropStorage {
    readonly '[Controls/_popup/interface/IDialogOpener]': boolean;

    open(popupOptions: IDialogOpenerOptions): Promise<string | undefined> {
        return super.open(this._getDialogConfig(popupOptions), POPUP_CONTROLLER);
    }

    private _getDialogConfig(popupOptions: IDialogOpenerOptions): IDialogOpenerOptions {
        return getDialogConfig(popupOptions);
    }

    static openPopup(config: IDialogOpenerOptions): Promise<string> {
        return new Promise((resolve) => {
            const newCfg = getDialogConfig(config);
            if (!newCfg.hasOwnProperty('isHelper')) {
                Logger.warn('Controls/popup:Dialog: Для открытия диалоговых окон из кода используйте DialogOpener');
            }
            if (!newCfg.hasOwnProperty('opener')) {
                Logger.error(Dialog.prototype._moduleName + ': Для открытия окна через статический метод, обязательно нужно указать опцию opener');
            }

            const showDialog = (templateModule: Control, newCfg: IDialogOpenerOptions, controllerModule: Control) => {
                BaseOpener.showDialog(templateModule, newCfg, controllerModule).then((popupId: string) => {
                    resolve(popupId);
                });
            };

            // что-то поменялось в ядре, в ie из-за частых синхронизаций(при d'n'd) отвалилась перерисовка окон,
            // ядро пишет что создано несколько окон с таким ключом. Такой же сценарий актуален не только для диалогов.
            // убираю асинхронную фазу, чтобы ключ окна не успевал протухнуть пока идут микротаски от промисов.
            const tplModule = getModuleByName(newCfg.template as string);
            const contrModule = getModuleByName(POPUP_CONTROLLER);
            if (tplModule && contrModule) {
                showDialog(tplModule, newCfg, contrModule);
            } else {
                BaseOpener.requireModules(newCfg, POPUP_CONTROLLER).then((result: ILoadDependencies) => {
                    showDialog(result.template, newCfg, result.controller);
                });
            }
        });
    }

    static closePopup(popupId: string): void {
        BaseOpener.closeDialog(popupId);
    }
}

export default Dialog;
