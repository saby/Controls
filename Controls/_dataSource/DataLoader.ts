import {default as NewSourceController, IControllerState} from 'Controls/_dataSource/Controller';
import {IFilterItem, ControllerClass as FilterController, IFilterControllerOptions} from 'Controls/filter';
import {
    ISourceOptions,
    ISortingOptions,
    TSortingOptionValue,
    INavigationOptions,
    INavigationSourceConfig,
    TFilter,
    TKey
} from 'Controls/interface';
import {RecordSet} from 'Types/collection';
import {wrapTimeout} from 'Core/PromiseLib/PromiseLib';
import {Logger} from 'UI/Utils';
import {loadSavedConfig} from 'Controls/Application/SettingsController';
import {loadAsync, loadSync, isLoaded} from 'WasabyLoader/ModulesLoader';
import {Guid} from 'Types/entity';
import {ControllerClass as SearchController} from 'Controls/search';
import {ISearchControllerOptions} from 'Controls/_search/ControllerClass';
import {TArrayGroupId} from 'Controls/list';
import {constants} from 'Env/Constants';
import {PrefetchProxy} from 'Types/source';

const QUERY_PARAMS_LOAD_TIMEOUT = 5000;
const DEFAULT_LOAD_TIMEOUT = 10000;
const DEBUG_DEFAULT_LOAD_TIMEOUT = 30000;

interface IFilterHistoryLoaderResult {
    filterButtonSource: IFilterItem[];
    filter: TFilter;
    historyItems: IFilterItem[];
}
interface IFilterResult {
    historyItems: IFilterItem[];
    controller: FilterController;
}

interface IBaseLoadDataConfig {
    afterLoadCallback?: string;
}

export interface ILoadDataConfig extends
    IBaseLoadDataConfig,
    ISourceOptions,
    INavigationOptions<INavigationSourceConfig> {
    id?: string;
    type?: 'list';
    sorting?: TSortingOptionValue;
    sourceController?: NewSourceController;
    filterController?: FilterController;
    filter?: TFilter;
    filterButtonSource?: IFilterItem[];
    fastFilterSource?: object[];
    historyId?: string;
    groupHistoryId?: string;
    nodeHistoryId?: string;
    historyItems?: IFilterItem[];
    propStorageId?: string;
    root?: string;
    parentProperty?: string;
    expandedItems?: TKey[];
    searchParam?: string;
    searchValue?: string;
    filterHistoryLoader?: (filterButtonSource: object[], historyId: string) => Promise<IFilterHistoryLoaderResult>;
    error?: Error;
    historySaveCallback?: (historyData: Record<string, unknown>, filterButtonItems: IFilterItem[]) => void;
    minSearchLength?: number;
    searchDelay?: number;
    items?: RecordSet;
    loadTimeout?: number;
}

export interface ILoadDataCustomConfig extends IBaseLoadDataConfig {
    type: 'custom';
    loadDataMethod: Function;
    loadDataMethodArguments?: object;
}

export interface IDataLoaderOptions {
    loadDataConfigs?: ILoadDataConfig[];
}

export interface ILoadDataResult extends ILoadDataConfig {
    data: RecordSet;
    error: Error;
    sourceController: NewSourceController;
    filterController?: FilterController;
    searchController?: SearchController;
    collapsedGroups?: TArrayGroupId;
    source: PrefetchProxy;
}

type TLoadedConfigs = Map<string, ILoadDataResult|ILoadDataConfig>;
type TLoadConfig = ILoadDataConfig|ILoadDataCustomConfig;
type TLoadResult = ILoadDataResult|ILoadDataCustomConfig|boolean;
type TLoadPromiseResult = Promise<TLoadResult>;

function isNeedPrepareFilter(loadDataConfig: ILoadDataConfig): boolean {
    return !!(loadDataConfig.filterButtonSource || loadDataConfig.fastFilterSource || loadDataConfig.searchValue);
}

function getFilterController(options: IFilterControllerOptions): FilterController {
    const controllerClass = loadSync<typeof import('Controls/filter')>('Controls/filter').ControllerClass;
    return new controllerClass({...options});
}

function getSourceController(options: ILoadDataConfig): NewSourceController {
    let sourceController;

    if (options.sourceController) {
        sourceController = options.sourceController;
        sourceController.updateOptions(options);
    } else {
        sourceController = new NewSourceController(options);
    }

    return sourceController;
}

function getFilterControllerWithHistoryFromLoader(loadConfig: ILoadDataConfig): Promise<IFilterResult> {
    return loadConfig.filterHistoryLoader(loadConfig.filterButtonSource, loadConfig.historyId)
        .then((result: IFilterHistoryLoaderResult) => {
            const controller = getFilterController({
                ...loadConfig,
                ...result
            } as IFilterControllerOptions);

            if (result.historyItems) {
                controller.setFilterItems(result.historyItems);
            }
            return {
                controller,
                ...result
            };
        });
}

function getFilterControllerWithFilterHistory(loadConfig: ILoadDataConfig): Promise<IFilterResult> {
    const controller = getFilterController(loadConfig as IFilterControllerOptions);
    return Promise.resolve(loadConfig.historyItems || controller.loadFilterItemsFromHistory()).then((historyItems) => {
        controller.setFilterItems(historyItems);
        return {
            controller,
            historyItems: historyItems.items || historyItems
        };
    });
}

function getLoadResult(
    loadConfig: ILoadDataConfig,
    sourceController: NewSourceController,
    filterController: FilterController,
    historyItems?: IFilterItem[]
): ILoadDataResult {
    return {
        ...loadConfig,
        sourceController,
        filterController,
        historyItems,
        filterButtonSource: filterController?.getFilterButtonItems(),
        source: loadConfig.source ? new PrefetchProxy({
            target: loadConfig.source,
            data: {
                query: sourceController.getLoadError() || sourceController.getItems()
            }
        }) : undefined,
        data: sourceController.getItems(),
        error: sourceController.getLoadError(),
        filter: sourceController.getFilter(),
        sorting:  sourceController.getSorting() as TSortingOptionValue,
        collapsedGroups: sourceController.getCollapsedGroups()
    };
}

function loadDataByConfig(
    loadConfig: ILoadDataConfig,
    loadTimeout?: number
): Promise<ILoadDataResult> {
    const loadDataTimeout = loadTimeout || getLoadTimeout(loadConfig);
    let filterController: FilterController;
    let filterHistoryItems;
    let sortingPromise;
    let filterPromise;

    if (isNeedPrepareFilter(loadConfig)) {
        if (loadConfig.filterHistoryLoader instanceof Function) {
            filterPromise  = getFilterControllerWithHistoryFromLoader(loadConfig);
        } else {
            if (isLoaded('Controls/filter')) {
                filterPromise = getFilterControllerWithFilterHistory(loadConfig);
            } else {
                filterPromise = loadAsync('Controls/filter').then(() => {
                    return getFilterControllerWithFilterHistory(loadConfig);
                });
            }
        }

        filterPromise
            .then(({controller, historyItems}) => {
                filterController = loadConfig.filterController = controller;
                filterHistoryItems = historyItems;
            })
            .catch(() => {
                filterController = getFilterController(loadConfig as IFilterControllerOptions);
            });
        filterPromise = wrapTimeout(filterPromise, QUERY_PARAMS_LOAD_TIMEOUT).catch(() => {
            Logger.info('Controls/dataSource:loadData: Данные фильтрации не загрузились за 1 секунду');
        });
    }

    if (loadConfig.propStorageId) {
        sortingPromise = loadSavedConfig(loadConfig.propStorageId, ['sorting']);
        sortingPromise = wrapTimeout(sortingPromise, QUERY_PARAMS_LOAD_TIMEOUT).catch(() => {
            Logger.info('Controls/dataSource:loadData: Данные сортировки не загрузились за 1 секунду');
        });
    }

    return Promise.all([
        filterPromise,
        sortingPromise
    ]).then(([, sortingPromiseResult]: [TFilter, ISortingOptions]) => {
        const sorting = sortingPromiseResult ? sortingPromiseResult.sorting : loadConfig.sorting;
        const sourceController = getSourceController({
            ...loadConfig,
            sorting,
            filter: filterController ? filterController.getFilter() : loadConfig.filter,
            loadTimeout: loadDataTimeout
        });

        return new Promise((resolve) => {
            if (loadConfig.source) {
                sourceController.reload(undefined, true)
                    .catch((error) => error)
                    .finally(() => {
                        resolve(getLoadResult(loadConfig, sourceController, filterController, filterHistoryItems));
                    });
            } else {
                resolve(getLoadResult(loadConfig, sourceController, filterController, filterHistoryItems));
            }
        });
    });
}

function getLoadTimeout(loadConfig: ILoadDataConfig): Number {
    return loadConfig?.loadTimeout || (constants.isProduction ? DEFAULT_LOAD_TIMEOUT : DEBUG_DEFAULT_LOAD_TIMEOUT);
}

export default class DataLoader {
    private _loadedConfigStorage: TLoadedConfigs = new Map();
    private _loadDataConfigs: ILoadDataConfig[];

    constructor(options: IDataLoaderOptions = {}) {
        this._loadDataConfigs = options.loadDataConfigs || [];
        this._fillLoadedConfigStorage(this._loadDataConfigs);
    }

    load<T extends ILoadDataResult>(
        sourceConfigs?: TLoadConfig[]
    ): Promise<TLoadResult[]> {
        return Promise.all(this.loadEvery<T>(sourceConfigs));
    }

    loadEvery<T extends ILoadDataConfig|ILoadDataCustomConfig>(
        sourceConfigs?: TLoadConfig[],
        loadTimeout?: number
    ): TLoadPromiseResult[] {
        const loadDataPromises = [];
        let loadPromise;
        let configs;

        if (sourceConfigs) {
            this._loadedConfigStorage.clear();
            configs = sourceConfigs;
        } else {
            configs = this._loadDataConfigs;
        }

        configs.forEach((loadConfig) => {
            if (loadConfig.type === 'custom') {
                const customPromise = loadConfig.loadDataMethod(loadConfig.loadDataMethodArguments)
                loadPromise = wrapTimeout(customPromise, loadTimeout || getLoadTimeout(loadConfig)).catch((error) => {
                    return error;
                });
            } else {
                loadPromise = loadDataByConfig(loadConfig, loadTimeout);
            }
            Promise.resolve(loadPromise).then((result) => {
                if (loadConfig.type === 'list' && !result.source && result.historyItems) {
                    result.sourceController.setFilter(result.filter);
                }
                return result;
            });
            if (loadConfig.afterLoadCallback) {
                const afterReloadCallbackLoadPromise = loadAsync(loadConfig.afterLoadCallback);
                loadPromise.then((result) => {
                    if (isLoaded(loadConfig.afterLoadCallback)) {
                        loadSync<Function>(loadConfig.afterLoadCallback)(result);
                        return result;
                    } else {
                        return afterReloadCallbackLoadPromise.then((afterLoadCallback: Function) => {
                            afterLoadCallback(result);
                            return result;
                        });
                    }
                });
            }
            loadDataPromises.push(loadPromise);
        });
        Promise.all(loadDataPromises).then((results) => {
            this._fillLoadedConfigStorage(results);
        });

        return loadDataPromises;
    }

    getSourceController(id?: string): NewSourceController {
        const config = this._getConfig(id);
        let {sourceController} = config;
        const {items, filterButtonSource, fastFilterSource} = config;

        if (!sourceController) {
            sourceController = config.sourceController = getSourceController(config);

            if (items) {
                sourceController.setItems(items);
            }

            if (filterButtonSource || fastFilterSource) {
                sourceController.setFilter(this.getFilterController(id).getFilter());
            }
        }

        return sourceController;
    }

    getFilterController(id?: string): FilterController {
        const config = this._getConfig(id);
        let {filterController} = config;
        const {historyItems} = config;

        if (!filterController) {
            if (isLoaded('Controls/filter')) {
                filterController = config.filterController = getFilterController(config as IFilterControllerOptions);

                if (historyItems) {
                    filterController.setFilterItems(config.historyItems);
                }
            }
        }
        return filterController;
    }

    getSearchController(id?: string): Promise<SearchController> {
        const config = this._getConfig(id);
        if (!config.searchController) {
            if (!config.searchControllerCreatePromise) {
                config.searchControllerCreatePromise = import('Controls/search').then((result) => {
                    config.searchController = new result.ControllerClass(
                        {...config} as ISearchControllerOptions
                    );

                    return config.searchController;
                });
            }
            return config.searchControllerCreatePromise;
        }

        return Promise.resolve(config.searchController);
    }

    getSearchControllerSync(id?: string): SearchController {
        return this._getConfig(id).searchController;
    }

    getState(): Record<string, IControllerState> {
        const state = {};
        this.each((config, id) => {
            state[id] = {...config, ...this.getSourceController(id).getState()};
        });
        return state;
    }

    destroy(): void {
        this.each(({sourceController}) => {
            sourceController?.destroy();
        });
        this._loadedConfigStorage.clear();
    }

    each(callback: Function): void {
        this._loadedConfigStorage.forEach((config: ILoadDataResult, id) => {
            callback(config, id);
        });
    }

    private _fillLoadedConfigStorage(
        data: ILoadDataConfig[]|ILoadDataResult[]
    ): void {
        this._loadedConfigStorage.clear();
        data.forEach((result) => {
            this._loadedConfigStorage.set(result?.id || Guid.create(), result);
        });
    }

    private _getConfig(id?: string): ILoadDataResult {
        let config;

        if (!id) {
            config = this._loadedConfigStorage.entries().next().value[1];
        } else if (id) {
            config = this._loadedConfigStorage.get(id);
        } else {
            Logger.error('Controls/dataSource:loadData: ????');
        }

        return config;
    }
}
