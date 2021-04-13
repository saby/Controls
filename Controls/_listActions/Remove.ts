import IAction from './interface/IAction';
import IActionOptions from './interface/IActionOptions';
import {RemoveController} from 'Controls/list';
import {Confirmation, IConfirmationOptions} from 'Controls/popup';

interface IOptions extends IActionOptions {
    strategy: 'silent' | 'confirmation';
    confirmationOptions: IConfirmationOptions;
}

/**
 * Действие "удаление записи"
 * @class Controls/_actions/Remove
 * @implements Controls/listActions:IAction
 * @public
 * @author Крайнов Д.О.
 */
export default class Remove implements IAction {
    private _removeController: RemoveController;
    private _options: IOptions;

    constructor(options: IOptions) {
        this._options = {...Remove.defaultOptions, ...options};
        this._removeController = new RemoveController({
            source: this._options.source
        });
    }

    execute(): Promise<string | void> {
        const remove = () => {
            return this._removeController.remove(
                this._options.selection,
                this._options.filter
            ).then(() => 'fullReload');
        };

        return new Promise((resolve) => {
            if (this._options.strategy === 'silent') {
                resolve(remove());
            } else {
                const message = this._options.selection.selected.length === 1 ?
                    'Вы действительно хотите удалить эту запись?' :
                    'Вы действительно хотите удалить эти записи?';

                return Confirmation.openPopup({
                    message,
                    ...this._options.confirmationOptions
                }, null).then((result: boolean) => {
                    if (result) {
                        resolve(remove());
                    } else {
                        resolve();
                    }
                });
            }
        });
    }

    static defaultOptions: Partial<IOptions> = {
        strategy: 'confirmation'
    };
}
