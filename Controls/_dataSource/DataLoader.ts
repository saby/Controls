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
import PageController from 'Controls/_dataSource/PageController';

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
    id?: string;
    type: 'custom';
    loadDataMethod: Function;
    loadDataMethodArguments?: object;
    dependencies?: string[];
}

export interface ILoadDataAdditionalDepsConfig extends IBaseLoadDataConfig {
    id?: string;
    type: 'additionalDependencies';
    loadDataMethod: Function;
    loadDataMethodArguments?: object;
    dependencies?: string[];
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
type TLoadConfig = ILoadDataConfig|ILoadDataCustomConfig|ILoadDataAdditionalDepsConfig;
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
        this._loadDataConfigs.forEach((config) => {
            this._setDataToConfigStorage(config, config.id);
        });
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
        const startedLoaders: {[loaderKey: string]: TLoadPromiseResult} = {};
        let configs;

        if (sourceConfigs) {
            this._loadedConfigStorage.clear();
            configs = sourceConfigs;
        } else {
            configs = this._loadDataConfigs;
        }
        const loadersKeys: string[] = configs.map((loadCfg) => loadCfg.id);
        let allLoadersCalled = false;

        while (!allLoadersCalled) {
            configs.forEach((loadConfig, index) => {
                if (!loadDataPromises[index]) {
                    const dependencies = loadConfig.dependencies;
                    let loadPromise;
                    if (dependencies) {
                        if (this._isValidDependencies(loadersKeys, dependencies)) {
                            const loadedDependencies = this._getLoadedDependencies(startedLoaders, dependencies);

                            // Если все лоадеры, от которых зависим данный запущены,
                            // то запускаем его с результатами dependencies
                            if (loadedDependencies.length === dependencies.length) {
                                loadPromise = Promise.all(loadedDependencies).then((results) => {
                                    return this._callLoader(loadConfig, loadTimeout, results);
                                });
                            }
                        } else {
                            // Если dependencies заполнены некорректно кидаем ошибку и не запускаем лоадер
                            const errorText = `Один из ключей указаных в dependencies загрузчика
                                с ключом ${loadConfig.id} отсутствует в списке загрузчиков`;
                            Logger.error(errorText);
                            loadPromise = Promise.reject(new Error(errorText));
                        }
                    } else {
                        loadPromise = this._callLoader(loadConfig, loadTimeout);
                    }

                    if (loadPromise) {
                        if (loadConfig.id) {
                            startedLoaders[loadConfig.id] = loadPromise;
                        }

                        /*
                           Сеттим результат загрузки по индексу,
                           т.к. некоторые лоадеры будут запущены позже, а нам надо сохранить порядок
                         */
                        loadDataPromises[index] = loadPromise;
                    }
                }
            });
            allLoadersCalled = loadDataPromises.reduce((result, current) => result && !!current, true);
        }

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

    private _setDataToConfigStorage(
        data: ILoadDataConfig|ILoadDataResult,
        id?: string
    ): void {
        this._loadedConfigStorage.set(id || Guid.create(), data);
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

    /**
     * Вызывает лоадер по конфигу
     * @param loaderConfig
     * @param loadTimeout
     * @param dependencies
     * @private
     */
    private _callLoader(
        loaderConfig: TLoadConfig,
        loadTimeout?: number,
        dependencies?: TLoadResult[]
    ): TLoadPromiseResult {
        let loadPromise;
        if (loaderConfig.type === 'custom') {
            loadPromise = loaderConfig.loadDataMethod(
                loaderConfig.loadDataMethodArguments,
                dependencies
            ).catch((error) => error);
        } else if (loaderConfig.type === 'additionalDependencies') {
            loadPromise = this._loadAdditionalDependencies(loaderConfig, dependencies);
        } else {
            loadPromise = loadDataByConfig(loaderConfig, loadTimeout);
        }
        Promise.resolve(loadPromise).then((result) => {
            if (loaderConfig.type === 'list' && !result.source && result.historyItems) {
                result.sourceController.setFilter(result.filter);
            }
            return result;
        });
        if (loaderConfig.afterLoadCallback) {
            const afterReloadCallbackLoadPromise = loadAsync(loaderConfig.afterLoadCallback);
            loadPromise.then((result) => {
                if (isLoaded(loaderConfig.afterLoadCallback)) {
                    loadSync<Function>(loaderConfig.afterLoadCallback)(result);
                    return result;
                } else {
                    return afterReloadCallbackLoadPromise.then((afterLoadCallback: Function) => {
                        afterLoadCallback(result);
                        return result;
                    });
                }
            });
        }
        return loadPromise.then((result) => {
            this._setDataToConfigStorage(result, loaderConfig.id);
            return result;
        });
    }

    private _isValidDependencies(loadersKeys: string[], dependencies: string[] = []): boolean {
        return dependencies.reduce((result, key) => {
            return result && loadersKeys.includes(key);
        }, true);
    }

    protected _getLoadedDependencies(
        startedLoaders: Record<string, TLoadPromiseResult>,
        dependencies: string[]
    ): TLoadPromiseResult[] {
        const result = [];
        dependencies.forEach((key) => {
            if (startedLoaders[key]) {
                result.push(startedLoaders[key]);
            }
        });
        return result;
    }

    /**
     * Метод загрузки лоадера с типом 'additionalDependencies'
     * Этот лоадер возвращает список идентификаторов страниц,
     * данные для которых нужно дополнительно загрузить вместе с данными основной страницы.
     * @param config
     * @param dependencies
     * @private
     */
    private _loadAdditionalDependencies(
        config: ILoadDataAdditionalDepsConfig,
        dependencies?: TLoadResult[]
    ): Promise<Record<string, unknown>> {
        return Promise.resolve(config.loadDataMethod(config.loadDataMethodArguments, dependencies))
            .then(this._loadDepsData)
            .catch((error) => error);
    }

    /**
     * Загружает данные для списка страниц из additionalDependencies, по итогу возвращает объект с ключами -
     * идентификаторами страниц и значениями - результатами загрузки
     * @param pagesKeys
     * @param loadDataMethodArguments
     * @private
     */
    private _loadDepsData(
        pagesKeys: string[],
        loadDataMethodArguments: Record<string, unknown>
    ): Promise<{[pageId: string]: unknown}> {
        const result = {
            /*
               FIXME EXPERIMENT
               Для того, чтобы пока это эксперимент можно было понять,
               что это подгруженные данные страниц и обработать на уровне попапа
             */
            _isAdditionalDependencies: true
        };
        return new Promise((resolve) => {
            Promise.all(pagesKeys.map((key) => {
                return PageController.getPageConfig(key).then((pageConfig) => {
                    return PageController.loadData(pageConfig, loadDataMethodArguments).then((pageLoadedData) => {
                        result[key] = pageLoadedData;
                    });
                });
            })).then(() => resolve(result)).catch((error) => resolve(error));
        });
    }
}
