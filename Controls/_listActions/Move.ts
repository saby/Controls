import IAction from './interface/IAction';
import IActionOptions from './interface/IActionOptions';
import {IMoveProvider, IMoveProviderOptions} from './Move/Provider';
import * as ModulesLoader from 'WasabyLoader/ModulesLoader';
import {DataSet} from 'Types/source';

export interface IMoveActionOptions extends IActionOptions, IMoveProviderOptions {
    providerName?: string;
    providerOptions?: any;
}

/**
 * Действие "перемещение записей"
 * @class Controls/_actions/Move
 * @implements Controls/listActions:IAction
 * @public
 * @author Крайнов Д.О.
 */
export default class Move implements IAction {
    private _options: IMoveActionOptions;

    constructor(options: IMoveActionOptions) {
        this._options = options
    }

    execute(meta: Partial<IMoveActionOptions>): Promise<void | DataSet> {
        const config = {...this._options, ...meta};
        return this._getProvider(config.providerName).then((provider) => {
            return provider.execute({
                ...config,
                ...config.providerOptions
            });
        });
    }

    private _getProvider(providerName: string = 'Controls/listActions:MoveProviderWithDialog'): Promise<IMoveProvider> {
        return ModulesLoader.loadAsync(providerName).then((provider) => {
           return new provider();
        });
    }
}
