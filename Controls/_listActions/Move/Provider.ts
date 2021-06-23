import IAction from './interface/IAction';
import IActionOptions from 'Controls/_listActions/interface/IActionOptions';
import {MoveController, IMoveControllerOptions} from 'Controls/list';

interface IMoveProviderOptions extends IActionOptions, IMoveControllerOptions {}

export interface IMoveProvider {
    execute(meta: Partial<IMoveProviderOptions>): void;
}

/**
 * Стандартный провайдер "перемещения записей"
 * @author Крайнов Д.О.
 */
export default class Move implements IAction, IMoveProvider {
    private _moveController: MoveController;

    execute(meta: Partial<IMoveProviderOptions>): void {
        import('Controls/list').then(({MoveController}) => {
            this._moveController = new MoveController({
                popupOptions: meta.popupOptions || {
                    template: 'Controls/moverDialog:Template'
                },
                source: meta.source,
                sorting: meta.sorting,
                parentProperty: meta.parentProperty,
                siblingStrategy: meta.siblingStrategy
            });
            this._moveController.moveWithDialog(meta.selection, meta.filter);
        });
    }
}
