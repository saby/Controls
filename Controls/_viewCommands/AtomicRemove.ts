import Remove from './Remove';
import {IOptions} from './IViewAction';

/**
 * Экшен синхронного удаления записей из списка.
 * @public
 * @author Золотова Э.Е.
 */
export default class AtomicRemove extends Remove {
    execute(meta: Partial<IOptions>): Promise<string | void> {
        const config = {...this._options, ...meta};

        this._options.strategy.remove(config.sourceController.getItems(), config);
        return config.action ? config.action.execute(config) : Promise.resolve();
    }
}
