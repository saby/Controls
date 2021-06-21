import IAction from './interface/IAction';
import IActionOptions from './interface/IActionOptions';
import {IRemoveProvider} from 'Controls/_listActions/Remove/Provider';
import * as ModulesLoader from 'WasabyLoader/ModulesLoader';

interface IOptions extends IActionOptions {
    providerName?: string;
    providerOptions?: any;
}

/**
 * Действие "удаление записи"
 * @class Controls/_actions/Remove
 * @implements Controls/listActions:IAction
 * @public
 * @author Крайнов Д.О.
 */
export default class Remove implements IAction {
    private _options: IOptions;

    constructor(options: IOptions) {
        this._options = options;
    }

    execute(): Promise<string | void> {
        let providerName;
        if (this._options.providerName) {
            providerName = this._options.providerName;
        }
        return this._getProvider(providerName).then((provider) => {
            return provider.execute({...this._options, ...this._options.providerOptions});
        });
    }

    private _getProvider(providerName: string = 'Controls/listActions:RemoveProviderWithConfirm'): Promise<IRemoveProvider> {
        return ModulesLoader.loadAsync(providerName).then((provider) => {
            return new provider();
        });
    }
}
