import IAction from './interface/IAction';
import IActionOptions from 'Controls/_listActions/interface/IActionOptions';
import {MoveController, IMoveControllerOptions} from 'Controls/list';
import {DataSet, CrudEntityKey, LOCAL_MOVE_POSITION} from 'Types/source';
import {loadSync, loadAsync, isLoaded} from 'WasabyLoader/ModulesLoader';

export interface IMoveProviderOptions extends IActionOptions, IMoveControllerOptions {
    targetKey?: CrudEntityKey;
    position?: LOCAL_MOVE_POSITION,
    direction?: 'up' | 'down'
}

export interface IMoveProvider {
    execute(meta: Partial<IMoveProviderOptions>): void;
}

export const CONTROLLER_MODULE_NAME = 'Controls/list:MoveController';

const DIALOG_FILTER = {'Только узлы': true};

/**
 * Стандартный провайдер "перемещения записей"
 * @author Крайнов Д.О.
 */
export default class Move implements IAction, IMoveProvider {
    protected _moveController: MoveController;

    execute(meta: Partial<IMoveProviderOptions>): Promise<void | DataSet> {
        if (isLoaded(CONTROLLER_MODULE_NAME)) {
            this._createMoveController(loadSync(CONTROLLER_MODULE_NAME), meta);
            return this._move(meta);
        } else {
            return loadAsync(CONTROLLER_MODULE_NAME).then((moveController) => {
                this._createMoveController(moveController, meta);
                return this._move(meta);
            })
        }
    }

    protected _createMoveController(moveController, meta: Partial<IMoveProviderOptions>): MoveController {
        this._moveController = new moveController({
            popupOptions: meta.popupOptions || {
                template: 'Controls/moverDialog:Template',
                templateOptions: {
                    parentProperty: meta.parentProperty,
                    nodeProperty: meta.nodeProperty,
                    columns: meta.columns,
                    filter: {...DIALOG_FILTER, ...meta.filter}
                }
            },
            source: meta.source,
            keyProperty: meta.keyProperty,
            sorting: meta.sorting,
            parentProperty: meta.parentProperty,
            siblingStrategy: meta.siblingStrategy
        });
        return this._moveController;
    }

    protected _move(meta): Promise<void | DataSet> {
        return this._moveController.move(meta.selection, meta.filter, meta.targetKey, meta.position);
    }
}
