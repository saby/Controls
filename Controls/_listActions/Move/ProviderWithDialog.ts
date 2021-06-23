import Provider, {IMoveProviderOptions, CONTROLLER_MODULE_NAME} from './Provider';
import {DataSet} from 'Types/source';
import {loadSync, loadAsync, isLoaded} from 'WasabyLoader/ModulesLoader';

/**
 * Стандартный провайдер "перемещения записей" с предварительным выбором родительского узла с помощью диалогового окна.
 * @author Крайнов Д.О.
 */
export default class ProviderWithDialog extends Provider {
    protected _move(meta): Promise<void | DataSet> {
        return this._moveController.moveWithDialog(meta.selection, meta.filter);
    }
}
