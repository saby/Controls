import {Logger} from 'UI/Utils';
import {Control} from 'UI/Base';
import BaseOpener, {ILoadDependencies, IBaseOpenerOptions} from 'Controls/_popup/Opener/BaseOpener';
import {getModuleByName} from 'Controls/_popup/utils/moduleHelper';
import CancelablePromise from 'Controls/_popup/utils/CancelablePromise';
import ManagerController from 'Controls/_popup/Manager/ManagerController';

export default function openPopup(config: IBaseOpenerOptions, controller: string,
                                  moduleName: string): CancelablePromise<string> {
    const promise = new CancelablePromise<string>((cancelablePromise, resolve, reject) => {
        if (!config.hasOwnProperty('isHelper')) {
            Logger.warn('Controls/popup:Dialog: Для открытия диалоговых окон из кода используйте DialogOpener');
        }
        if (!config.hasOwnProperty('opener')) {
            Logger.error( `${moduleName}: Для открытия окна через статический метод, обязательно нужно указать опцию opener`);
        }

        const showDialog = (templateModule: Control, controllerModule: Control) => {
            if (cancelablePromise.isCanceled() === false) {
                BaseOpener.showDialog(templateModule, config, controllerModule).then((popupId: string) => {
                    if (cancelablePromise.isCanceled() === true) {
                        ManagerController.remove(popupId);
                        reject();
                    }
                    resolve(popupId);
                });
            } else {
                reject();
            }
        };

        // что-то поменялось в ядре, в ie из-за частых синхронизаций(при d'n'd) отвалилась перерисовка окон,
        // ядро пишет что создано несколько окон с таким ключом. Такой же сценарий актуален не только для диалогов.
        // убираю асинхронную фазу, чтобы ключ окна не успевал протухнуть пока идут микротаски от промисов.
        const tplModule = getModuleByName(config.template as string);
        const contrModule = getModuleByName(controller);
        if (tplModule && contrModule) {
            showDialog(tplModule, contrModule);
        } else {
            BaseOpener.requireModules(config, controller).then((result: ILoadDependencies) => {
                showDialog(result.template, result.controller);
            }).catch((error: RequireError) => {
                reject(error);
            });
        }
    });
    return promise;
}
