import {IOptions} from './IViewAction';
import HierarchyRemoveStrategy from './Remove/HierarchyRemoveStrategy';

export interface IRemoveOptions extends IOptions{
    strategy?: HierarchyRemoveStrategy;
}

/**
 * Экшен удаления записей из списка.
 * @public
 * @author Золотова Э.Е.
 */
export default class {
    protected _options: IRemoveOptions;
    protected _strategy;

    constructor(options: IRemoveOptions) {
        this._options = options;
        this._strategy = options.strategy || new HierarchyRemoveStrategy();
    }

    execute(meta: Partial<IRemoveOptions>): Promise<string | void> {
        const config = {...this._options, ...meta};
        const executePromise = config.action ? config.action.execute(config) : Promise.resolve();
        return executePromise.then((result) => {
            if (result) {
                this._options.strategy.remove(config.sourceController.getItems(), config);
            }
        });
    }
}
