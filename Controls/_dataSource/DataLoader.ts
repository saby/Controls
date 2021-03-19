import {default as NewSourceController} from 'Controls/_dataSource/Controller';
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
import {TArrayGroupId} from 'Controls/_list/Controllers/Grouping';

const FILTER_PARAMS_LOAD_TIMEOUT = 1000;

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
}

export interface ILoadDataCustomConfig extends IBaseLoadDataConfig {
    type: 'custom';
    loadDataMethod: Function;
}

export interface ILoadDataResult extends ILoadDataConfig {
    data: RecordSet;
    error: Error;
    sourceController: NewSourceController;
    filterController?: FilterController;
    collapsedGroups?: TArrayGroupId;
}

function isNeedPrepareFilter(loadDataConfig: ILoadDataConfig): boolean {
    return !!loadDataConfig.filterButtonSource;
}

function getFilterController(options: IFilterControllerOptions): FilterController {
    const controllerClass = loadSync<typeof import('Controls/filter')>('Controls/filter').ControllerClass;
    return new controllerClass(options);
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
        filterPromise = wrapTimeout(filterPromise, FILTER_PARAMS_LOAD_TIMEOUT).catch(() => {
            Logger.info('Controls/dataSource:loadData: Данные фильтрации не загрузились за 1 секунду');
        });
    }

    if (loadConfig.propStorageId) {
        sortingPromise = loadSavedConfig(loadConfig.propStorageId, ['sorting']);
        sortingPromise = wrapTimeout(sortingPromise, FILTER_PARAMS_LOAD_TIMEOUT).catch(() => {
            Logger.info('Controls/dataSource:loadData: Данные сортировки не загрузились за 1 секунду');
        });
    }

    return Promise.all([
        filterPromise,
        sortingPromise
    ]).then(([filterPromiseResult, sortingPromiseResult]: [TFilter, ISortingOptions]) => {
        const sorting = sortingPromiseResult ? sortingPromiseResult.sorting : loadConfig.sorting;
        const sourceController = new NewSourceController({
            ...loadConfig,
            sorting,
            filter: filterController ? filterController.getFilter() : loadConfig.filter
        });

        return new Promise((resolve) => {
            sourceController.load().finally(() => {
                const loadResult = {
                    sourceController,
                    data: sourceController.getItems(),
                    error: sourceController.getLoadError(),
                    filter: sourceController.getFilter(),
                    collapsedGroups: sourceController.getCollapsedGroups(),
                    sorting,
                    navigation: loadConfig.navigation,
                    historyItems: filterHistoryItems
                };
                resolve({...loadConfig, ...loadResult});
            });
        });
    });
}

export default class DataLoader {
    load(sourceConfigs: Array<ILoadDataConfig|ILoadDataCustomConfig>): Promise<Array<ILoadDataResult|unknown>> {
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

        return Promise.all(loadDataPromises);
    }
}
