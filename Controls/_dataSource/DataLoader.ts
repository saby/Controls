import {NewSourceController} from 'Controls/dataSource';
import {IFilterItem, ControllerClass as FilterController, IFilterControllerOptions} from 'Controls/filter';
import {
    ISourceOptions,
    ISortingOptions,
    TSortingOptionValue,
    INavigationOptions,
    INavigationSourceConfig,
    IFilterOptions,
    TFilter,
    TKey, INavigationOptionValue
} from 'Controls/interface';
import {RecordSet} from 'Types/collection';
import {wrapTimeout} from 'Core/PromiseLib/PromiseLib';
import {Logger} from 'UI/Utils';
import {loadSavedConfig} from 'Controls/Application/SettingsController';

const FILTER_PARAMS_LOAD_TIMEOUT = 1000;

interface IFilterHistoryLoaderResult {
    filterButtonSource: IFilterItem[];
    filter: TFilter;
    historyItems: IFilterItem[];
}

export interface ILoadDataConfig extends
    ISourceOptions,
    ISortingOptions,
    INavigationOptions<INavigationSourceConfig>,
    IFilterOptions {
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

export interface ILoadDataResult {
    data: RecordSet;
    error: Error;

    filter?: TFilter;
    sorting?: TSortingOptionValue;
    navigation?: INavigationOptionValue<INavigationSourceConfig>;

    sourceController: NewSourceController;
    filterController?: FilterController;
}

function importFilterLibrary(): Promise<typeof import('Controls/filter')> {
    return import('Controls/filter');
}

function isNeedPrepareFilter(loadDataConfig: ILoadDataConfig): boolean {
    return !!loadDataConfig.filterButtonSource;
}

function isNeedImportFilterLibrary(): boolean {
    return !requirejs.defined('Controls/filter');
}

function getFilterController(options: IFilterControllerOptions): FilterController {
    const controllerClass = requirejs('Controls/filter').ControllerClass;
    return new controllerClass(options);
}

function getFilterControllerWithHistoryFromLoader(loadConfig: ILoadDataConfig): Promise<FilterController> {
    return loadConfig.filterHistoryLoader(loadConfig.filterButtonSource, loadConfig.historyId)
        .then((result: IFilterHistoryLoaderResult) => {
            return getFilterController({
                ...loadConfig,
                result
            } as IFilterControllerOptions);
        });
}

function getFilterControllerWithFilterHistory(loadConfig: ILoadDataConfig): Promise<FilterController> {
    const controller = getFilterController(loadConfig as IFilterControllerOptions);
    return controller.loadFilterItemsFromHistory().then((historyItems) => {
        controller.setFilterItems(historyItems);
        return controller;
    });
}

function loadDataByConfig(loadConfig: ILoadDataConfig): Promise<ILoadDataResult> {
    let filterController: FilterController;
    let sortingPromise;
    let filterPromise;

    if (isNeedPrepareFilter(loadConfig)) {
        if (loadConfig.filterHistoryLoader instanceof Function) {
            filterPromise  = getFilterControllerWithHistoryFromLoader(loadConfig);
        } else {
            if (isNeedImportFilterLibrary()) {
                filterPromise = importFilterLibrary().then(() => {
                    return getFilterControllerWithFilterHistory(loadConfig);
                });
            } else {
                filterPromise = getFilterControllerWithFilterHistory(loadConfig);
            }
        }

        filterPromise
            .then((controller) => {
                filterController = controller;
            })
            .catch(() => {
                filterController = getFilterController(loadConfig as IFilterControllerOptions);
            });
        filterPromise = wrapTimeout(filterPromise, FILTER_PARAMS_LOAD_TIMEOUT).catch(() => {
            Logger.info('Controls/dataSource:loadData: Данные фильтрации не загрузились за 1 секунду');
        });
    } else {
        filterController = getFilterController(loadConfig as IFilterControllerOptions);
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
                resolve({
                    sourceController,
                    data: sourceController.getItems(),
                    error: sourceController.getLoadError(),
                    filter: sourceController.getFilter(),
                    sorting,
                    navigation: loadConfig.navigation
                });
            });
        });
    });
}

export default class DataLoader {
    load(sourceConfigs: ILoadDataConfig[]): Promise<ILoadDataResult[]> {
        const loadDataPromises = [];

        sourceConfigs.forEach((loadConfig) => {
            loadDataPromises.push(loadDataByConfig(loadConfig));
        });

        return Promise.all(loadDataPromises);
    }
}
