import IAction from '../interface/IAction';
import IActionOptions from '../interface/IActionOptions';
import {RemoveController} from 'Controls/list';
import {loadSync, loadAsync, isLoaded} from 'WasabyLoader/ModulesLoader';

interface IRemoveProviderOptions extends IActionOptions {}

export interface IRemoveProvider {
    execute(meta: Partial<IRemoveProviderOptions>): void;
}

const CONTROLLER_MODULE_NAME = 'Controls/list:RemoveController';

/**
 * Стандартный провайдер "удаления записей". Удаляет элементы из источника данных без подтверждения
 * @author Крайнов Д.О.
 */
export default class RemoveProvider implements IAction, IRemoveProvider {
    protected _removeController: RemoveController;

    execute(meta: Partial<IActionOptions>): Promise<string> {
        if (isLoaded(CONTROLLER_MODULE_NAME)) {
            return this._remove(loadSync(CONTROLLER_MODULE_NAME), meta);
        } else {
            return loadAsync(CONTROLLER_MODULE_NAME).then((removeController) => {
                return this._remove(removeController, meta);
            })
        }
    }

    private _remove(removeController, meta): Promise<string> {
        this._removeController = new removeController({
            source: meta.source
        });
        return this._callRemove(meta)
    }

    protected _callRemove(meta): Promise<string> {
        return this._removeController.remove(meta.selection, meta.filter).then(
            (result) => result || 'fullReload');
    }
}
