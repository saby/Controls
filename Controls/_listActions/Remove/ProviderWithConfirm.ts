import IAction from './interface/IAction';
import IActionOptions from 'Controls/_listActions/interface/IActionOptions';
import {IRemoveProvider} from 'Controls/_listActions/Remove/Provider';
import {RemoveController} from 'Controls/list';

/**
 * Провайдер "удаления записей". Удаляет элементы из источника данных c подтверждением удаления.
 * @author Крайнов Д.О.
 */
export default class ProviderWithConfirm implements IAction, IRemoveProvider {
    private _removeController: RemoveController;

    execute(meta: Partial<IActionOptions>): Promise<string> {
        return import('Controls/list').then(({RemoveController}) => {
            this._removeController = new RemoveController({
                source: meta.source
            });
            return this._removeController.removeWithConfirmation(meta.selection,
                meta.filter).then(() => 'fullReload');
        });
    }
}
