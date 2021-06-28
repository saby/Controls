import Provider, {IMoveProviderOptions, CONTROLLER_MODULE_NAME} from './Provider';
import {DataSet} from 'Types/source';
import {loadSync, loadAsync, isLoaded} from 'WasabyLoader/ModulesLoader';

/**
 * Провайдер "перемещения записи". Перемещает переданный элемент на один пункт вверх или вниз.
 * @author Крайнов Д.О.
 */
export default class ProviderWithDialog extends Provider {
    protected _move(meta: Partial<IMoveProviderOptions>): Promise<void | DataSet> {
        if (meta.direction === 'up') {
            return this._moveController.moveUp(meta.selection);
        } else {
            return this._moveController.moveDown(meta.selection);
        }
    }
}
