import {default as NewSourceController, IControllerOptions} from 'Controls/_dataSource/Controller';
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
import {mixin} from 'Types/util';
import {SerializableMixin} from 'Types/entity';
import {ControllerClass as SearchController} from 'Controls/search';
import {ISearchControllerOptions} from 'Controls/_search/ControllerClass';

const DEFAULT_LOAD_TIMEOUT = 10000;

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
    filter?: TFilter;
    filterButtonSource?: IFilterItem[];
    fastFilterSource?: object[];
    historyId?: string;
    groupHistoryId?: string;
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
}

export interface ILoadDataCustomConfig extends IBaseLoadDataConfig {
    type: 'custom';
    loadDataMethod: Function;
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
}

type TLoadedConfigs = Map<string, ILoadDataResult|ILoadDataConfig>;

function isNeedPrepareFilter(loadDataConfig: ILoadDataConfig): boolean {
    return !!loadDataConfig.filterButtonSource;
}

function getFilterController(options: IFilterControllerOptions): FilterController {
    const controllerClass = loadSync<typeof import('Controls/filter')>('Controls/filter').ControllerClass;
    return new controllerClass(options);
}

function getSourceController(options: IControllerOptions): NewSourceController {
    return new NewSourceController(options);
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
    return controller.loadFilterItemsFromHistory().then((historyItems) => {
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
        data: sourceController.getItems(),
        error: sourceController.getLoadError(),
        filter: sourceController.getFilter(),
        sorting:  sourceController.getSorting() as TSortingOptionValue
    };
}

function loadDataByConfig(loadConfig: ILoadDataConfig): Promise<ILoadDataResult> {
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
                filterController = controller;
                filterHistoryItems = historyItems;
            })
            .catch(() => {
                filterController = getFilterController(loadConfig as IFilterControllerOptions);
            });
        filterPromise = wrapTimeout(filterPromise, DEFAULT_LOAD_TIMEOUT).catch(() => {
            Logger.info('Controls/dataSource:loadData: Данные фильтрации не загрузились за 1 секунду');
        });
    }

    if (loadConfig.propStorageId) {
        sortingPromise = loadSavedConfig(loadConfig.propStorageId, ['sorting']);
        sortingPromise = wrapTimeout(sortingPromise, DEFAULT_LOAD_TIMEOUT).catch(() => {
            Logger.info('Controls/dataSource:loadData: Данные сортировки не загрузились за 1 секунду');
        });
    }

    return Promise.all([
        filterPromise,
        sortingPromise
    ]).then(([filterPromiseResult, sortingPromiseResult]: [TFilter, ISortingOptions]) => {
        const sorting = sortingPromiseResult ? sortingPromiseResult.sorting : loadConfig.sorting;
        const sourceController = getSourceController({
            ...loadConfig,
            sorting,
            filter: filterController ? filterController.getFilter() : loadConfig.filter,
            loadTimeout: DEFAULT_LOAD_TIMEOUT
        });

        return new Promise((resolve) => {
            if (loadConfig.source) {
                sourceController.load().finally(() => {
                    resolve(getLoadResult(loadConfig, sourceController, filterController, filterHistoryItems));
                });
            } else {
                resolve(getLoadResult(loadConfig, sourceController, filterController, filterHistoryItems));
            }
        });
    });
}

export default class DataLoader extends mixin<SerializableMixin>(SerializableMixin) {
    private _loadedConfigStorage: TLoadedConfigs = new Map();
    private _loadDataConfigs: ILoadDataConfig[];
    private _searchControllerCreatePromise: Promise<SearchController>;

    constructor(options: IDataLoaderOptions = {}) {
        super();
        SerializableMixin.call(this);
        this._loadDataConfigs = options.loadDataConfigs || [];
        this._fillLoadedConfigStorage(this._loadDataConfigs);
    }

    load<T extends ILoadDataResult>(
        sourceConfigs: Array<ILoadDataConfig|ILoadDataCustomConfig> = this._loadDataConfigs
    ): Promise<T[]> {
        return Promise.all(this.loadEvery<T>(sourceConfigs)).then((results) => {
            this._fillLoadedConfigStorage(results);
            return results;
        });
    }

    loadEvery<T extends ILoadDataConfig|ILoadDataCustomConfig>(
        sourceConfigs: Array<ILoadDataConfig|ILoadDataCustomConfig> = this._loadDataConfigs
    ): Array<Promise<T>> {
        const loadDataPromises = [];
        let loadPromise;

        sourceConfigs.forEach((loadConfig) => {
            if (loadConfig.type === 'custom') {
                loadPromise = loadConfig.loadDataMethod();
            } else {
                loadPromise = loadDataByConfig(loadConfig);
            }
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

        return loadDataPromises;
    }

    getSourceController(id?: string): NewSourceController {
        const config = this._getConfig(id);
        let sourceController;

        if (config.sourceController) {
            sourceController = config.sourceController;
        } else {
            sourceController = config.sourceController = getSourceController(config);
        }
        return sourceController;
    }

    getFilterController(id?: string): FilterController {
        const config = this._getConfig(id);
        let filterController;

        if (config.filterController) {
            filterController = config.filterController;
        } else if (isLoaded('Controls/filter')) {
            filterController = config.filterController = getFilterController(config as IFilterControllerOptions);
        }
        return filterController;
    }

    getSearchController(id?: string): Promise<SearchController> {
        const config = this._getConfig(id);
        if (!config.searchController) {
            if (!this._searchControllerCreatePromise) {
                this._searchControllerCreatePromise = import('Controls/search').then((result) => {
                    config.searchController = new result.ControllerClass(
                        {
                            ...config,
                            sourceController: this.getSourceController(id)
                        } as ISearchControllerOptions
                    );

                    return config.searchController;
                });
            }
            return this._searchControllerCreatePromise;
        }

        return Promise.resolve(config.searchController);
    }

    destroy(): void {
        this._loadedConfigStorage.forEach((config: ILoadDataResult) => {
            if (config.sourceController) {
                config.sourceController.destroy();
            }
        });
        this._loadedConfigStorage.clear();
    }

    private _fillLoadedConfigStorage(
        data: ILoadDataConfig[]|ILoadDataResult[]
    ): void {
        this._loadedConfigStorage.clear();
        data.forEach((result) => {
            this._loadedConfigStorage.set(result.id || Guid.create(), result);
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

Object.assign(DataLoader.prototype, {
    _moduleName: 'Controls/dataSource:DataLoader'
});
