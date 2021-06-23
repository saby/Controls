import IAction from './interface/IAction';
import IActionOptions from 'Controls/_listActions/interface/IActionOptions';
import {RemoveController} from 'Controls/list';

interface IRemoveProviderOptions extends IActionOptions {}

export interface IRemoveProvider {
    execute(meta: Partial<IRemoveProviderOptions>): void;
}

/**
 * Стандартный провайдер "удаления записей". Удаляет элементы из источника данных без подтверждения
 * @author Крайнов Д.О.
 */
export default class RemoveProvider implements IAction, IRemoveProvider {
    private _removeController: RemoveController;

    execute(meta: Partial<IActionOptions>): Promise<string> {
        return import('Controls/list').then(({RemoveController}) => {
            this._removeController = new RemoveController({
                source: meta.source
            });
            return this._removeController.remove(meta.selection, meta.filter).then(
                (result) => result || 'fullReload');
        });
    }
}
