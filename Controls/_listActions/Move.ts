import IAction from './interface/IAction';
import IActionOptions from './interface/IActionOptions';
import {IMoveProvider} from './Move/Provider';
import * as ModulesLoader from 'WasabyLoader/ModulesLoader';
import {IMoveControllerOptions} from 'Controls/list';

interface IOptions extends IActionOptions, IMoveControllerOptions {
    providerName: string;
    providerOptions: any;
}

/**
 * Действие "перемещение записей"
 * @class Controls/_actions/Move
 * @implements Controls/listActions:IAction
 * @public
 * @author Крайнов Д.О.
 */
export default class Move implements IAction {
    private _options: IOptions;

    constructor(options: IOptions) {
        this._options = options
    }

    execute(meta: Partial<IOptions>): Promise<void> {
        const config = {...this._options, ...meta};
        return this._getProvider().then((provider) => {
            provider.execute({
                ...config,
                ...config.providerOptions
            });
        });
    }

    private _getProvider(providerName: string = 'Controls/listActions:MoveProvider'): Promise<IMoveProvider> {
        return ModulesLoader.loadAsync(providerName).then((provider) => {
           return new provider();
        });
    }
}
