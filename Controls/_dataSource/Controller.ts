import {ICrud, PrefetchProxy} from 'Types/source';
import {CrudWrapper} from './CrudWrapper';
import {NavigationController} from 'Controls/source';
import {INavigationOptionValue,
        INavigationSourceConfig,
        Direction,
        TKey,
        IBaseSourceConfig,
        IFilterOptions,
        ISortingOptions,
        IHierarchyOptions,
        IGroupingOptions,
        ISourceOptions,
        IPromiseSelectableOptions,
        INavigationOptions} from 'Controls/interface';
import {TNavigationPagingMode} from 'Controls/_interface/INavigation';
import {RecordSet, IObservable} from 'Types/collection';
import {Record as EntityRecord} from 'Types/entity';
import {Logger} from 'UI/Utils';
import {QueryOrderSelector, QueryWhereExpression} from 'Types/source';
import {IQueryParams} from 'Controls/_interface/IQueryParams';
import {default as groupUtil} from './GroupUtil';
import {isEqual} from 'Types/object';
// @ts-ignore
import * as cInstance from 'Core/core-instance';
import {TArrayGroupId} from 'Controls/_list/Controllers/Grouping';
import {SyntheticEvent} from 'UI/Vdom';

export interface IControllerState {
    keyProperty: string;
    source: ICrud;

    sorting: QueryOrderSelector;
    filter: QueryWhereExpression<unknown>;
    navigation: INavigationOptionValue<INavigationSourceConfig>;

    items: RecordSet;
    sourceController: Controller;
}

export interface IControllerOptions extends
    IFilterOptions,
    ISortingOptions,
    IHierarchyOptions,
    IGroupingOptions,
    ISourceOptions,
    IPromiseSelectableOptions,
    INavigationOptions<INavigationSourceConfig> {
    dataLoadErrback?: Function;
    root?: string;
    expandedItems?: TKey[];
    deepReload?: boolean;
    collapsedGroups?: TArrayGroupId;
}

type LoadResult = Promise<RecordSet|Error>;

enum NAVIGATION_DIRECTION_COMPATIBILITY {
    up = 'backward',
    down = 'forward'
}

export default class Controller {
    private _options: IControllerOptions;
    private _filter: QueryWhereExpression<unknown>;
    private _crudWrapper: CrudWrapper;
    private _navigationController: NavigationController;
    private _items: RecordSet;
    private _loadPromise: LoadResult;

    private _expandedItems: TKey[];
    private _deepReload: boolean;

    constructor(cfg: IControllerOptions) {
        this._options = cfg;
        this._filter = cfg.filter;
        this._collectionChange = this._collectionChange.bind(this);
    }
    load(direction?: Direction,
         key: TKey = this._options.root,
         navigationSourceConfig?: INavigationSourceConfig
    ): LoadResult {
        return this._load(direction, key, navigationSourceConfig);
    }

    reload(sourceConfig?: INavigationSourceConfig): LoadResult {
        this._navigationController = null;
        this._deepReload = true;

        return this._load(undefined, this._options.root, sourceConfig).then((result) => {
            this._deepReload = false;
            return result;
        });
    }

    read(key: TKey, meta?: object): Promise<EntityRecord> {
        return this._options.source.read(key, meta);
    }

    setItems(items: RecordSet): RecordSet {
        this._setItems(items);

        if (this._options.navigation) {
            this._getNavigationController(this._options.navigation).updateQueryProperties(items, this._options.root);
        }

        return this._items;
    }

    getItems(): RecordSet {
        return this._items;
    }

    setFilter(filter: QueryWhereExpression<unknown>): QueryWhereExpression<unknown> {
        return this._filter = filter;
    }

    getFilter(): QueryWhereExpression<unknown> {
        return this._filter;
    }

    updateOptions(newOptions: IControllerOptions): boolean {
        const isFilterChanged = !isEqual(newOptions.filter, this._options.filter);
        const isSourceChanged = newOptions.source !== this._options.source;
        const isNavigationChanged = !isEqual(newOptions.navigation, this._options.navigation);
        if (isFilterChanged) {
            this._filter = newOptions.filter;
        }

        if (isSourceChanged && this._crudWrapper) {
            this._crudWrapper.updateOptions({source: newOptions.source});
        }

        if (isNavigationChanged) {
            if (newOptions.navigation) {
                if (this._navigationController)  {
                    this._navigationController.updateOptions({
                        navigationType: newOptions.navigation.source,
                        navigationConfig: newOptions.navigation.sourceConfig
                    });
                } else {
                    this._navigationController = this._getNavigationController(newOptions.navigation);
                }
            }

        }

        const isChanged =
            isFilterChanged ||
            isNavigationChanged ||
            isSourceChanged ||
            newOptions.sorting !== this._options.sorting ||
            newOptions.keyProperty !== this._options.keyProperty ||
            newOptions.root !== this._options.root;

        this._options = newOptions;
        return isChanged;
    }

    getState(): IControllerState {
        const source = this._options.source;
        const originSource = source instanceof PrefetchProxy ? source.getOriginal() as ICrud : source;

        return {
            keyProperty: this._options.keyProperty,
            source: originSource,

            filter: this._filter,
            sorting: this._options.sorting,
            navigation: this._options.navigation,

            items: this._items,
            sourceController: this
        };
    }

    // FIXME для работы дерева без bind'a опции expandedItems
    setExpandedItems(expandedItems: number[] | string[]): void {
        this._expandedItems = expandedItems;
    }

    // FIXME для поддержки nodeSourceControllers в дереве
    calculateState(items: RecordSet, direction: Direction, key: TKey = this._options.root): void {
        this._updateQueryPropertiesByItems(items, key);
    }

    hasMoreData(direction: Direction, key: TKey = this._options.root): boolean {
        let hasMoreData = false;

        if (this._options.navigation) {
            hasMoreData = this._getNavigationController(this._options.navigation)
                .hasMoreData(NAVIGATION_DIRECTION_COMPATIBILITY[direction], key);
        }

        return hasMoreData;
    }

    isLoading(): boolean {
        return !!this._loadPromise;
    }

    shiftToEdge(direction: Direction, id: TKey, shiftMode: TNavigationPagingMode): void {
        if (this._options.navigation) {
            this._getNavigationController(this._options.navigation)
                .shiftToEdge(NAVIGATION_DIRECTION_COMPATIBILITY[direction], id, shiftMode);
        }
    }

    // TODO обсудить
    cancelLoading(): void {
        //?
    }

    destroy(): void {
        this.cancelLoading();
        this._unsubscribeItemsCollectionChangeEvent();

        if (this._navigationController) {
            this._navigationController.destroy();
            this._navigationController = null;
        }
    }

    private _getCrudWrapper(sourceOption: ICrud): CrudWrapper {
        if (!this._crudWrapper) {
            this._crudWrapper = new CrudWrapper({source: sourceOption});
        }
        return this._crudWrapper;
    }

    private _getNavigationController(
        navigationOption: INavigationOptionValue<INavigationSourceConfig>
    ): NavigationController {
        if (!this._navigationController) {
            this._navigationController = new NavigationController({
                navigationType: navigationOption.source,
                navigationConfig: navigationOption.sourceConfig
            });
        }

        return this._navigationController;
    }

    private _updateQueryPropertiesByItems(
        list: RecordSet,
        id?: TKey,
        navigationConfig?: IBaseSourceConfig,
        direction?: Direction
    ): void {
        if (this._options.navigation) {
            this._getNavigationController(this._options.navigation)
                .updateQueryProperties(list, id, navigationConfig, NAVIGATION_DIRECTION_COMPATIBILITY[direction]);
        }
    }

    private _prepareQueryParams(
        queryParams: IQueryParams,
        key: TKey,
        navigationSourceConfig: INavigationSourceConfig,
        direction: Direction
        ): IQueryParams {
        const navigationController = this._getNavigationController(this._options.navigation);
        return navigationController.getQueryParams(
            {
                filter: queryParams.filter,
                sorting: queryParams.sorting
            },
            key,
            navigationSourceConfig,
            NAVIGATION_DIRECTION_COMPATIBILITY[direction]
        );
    }

    private _setItems(items: RecordSet): void {
        if (this._items && Controller._isEqualItems(this._items, items)) {
            this._items.assign(items);
        } else {
            this._subscribeItemsCollectionChangeEvent(items);
            this._items = items;
        }
    }

    private _load(
        direction?: Direction,
        key?: TKey,
        navigationSourceConfig?: INavigationSourceConfig
    ): LoadResult {
        if (this._options.source) {
            this._loadPromise = Controller._getFilterForCollapsedGroups(this._filter, this._options).then((filter) => {
                return this._getFilterHierarchy(filter, this._options, key).then((preparedFilter) => {
                    const crudWrapper = this._getCrudWrapper(this._options.source);

                    let params = {
                        filter: preparedFilter,
                        sorting: this._options.sorting
                    } as IQueryParams;

                    if (this._options.navigation) {
                        params = this._prepareQueryParams(params, key, navigationSourceConfig, direction);
                    }
                    return crudWrapper.query(params, this._options.keyProperty).then((result) => {
                        if (result instanceof Error) {
                            if (this._options.dataLoadErrback instanceof Function) {
                                this._options.dataLoadErrback(result);
                            }
                        }
                        if (result instanceof RecordSet) {
                            this._updateQueryPropertiesByItems(result, key, navigationSourceConfig, direction);
                        }
                        return result;
                    });
                });
            }).finally(() => {
                this._loadPromise = null;
            });
            return this._loadPromise;
        } else {
            Logger.error('source/Controller: Source option has incorrect type');
            return Promise.reject(new Error('source/Controller: Source option has incorrect type'));
        }
    }

    private _getFilterHierarchy(
        initialFilter: QueryWhereExpression<unknown>,
        options: IControllerOptions,
        root?: TKey): Promise<QueryWhereExpression<unknown>> {
        const rootForFilter = root || options.root;
        const expandedItemsForFilter = this._expandedItems || options.expandedItems;
        const parentProperty = options.parentProperty;
        const deepReload = this._deepReload || options.deepReload;
        let resultFilter = initialFilter;

        return new Promise((resolve) => {
            if (parentProperty) {
                resultFilter = {...initialFilter};

                if (rootForFilter) {
                    resultFilter[options.parentProperty] = rootForFilter;
                }

                if (expandedItemsForFilter?.length && expandedItemsForFilter?.[0] !== null && deepReload) {
                    resultFilter[parentProperty] = Array.isArray(resultFilter[parentProperty]) ?
                        resultFilter[parentProperty] :
                        [];
                    resultFilter[parentProperty].push(rootForFilter);
                    resultFilter[parentProperty] = resultFilter[parentProperty].concat(expandedItemsForFilter);
                }

                if (options.selectedKeys && options.selectedKeys.length) {
                    import('Controls/operations').then((operations) => {
                        resultFilter.entries = operations.selectionToRecord({
                            selected: options.selectedKeys,
                            excluded: options.excludedKeys
                        }, options.source.getAdapter());
                        resolve(resultFilter);
                    });
                } else {
                    resolve(resultFilter);
                }
            } else {
                resolve(resultFilter);
            }
        });
    }

    private _subscribeItemsCollectionChangeEvent(items: RecordSet): void {
        this._unsubscribeItemsCollectionChangeEvent();
        items.subscribe('onCollectionChange', this._collectionChange);
    }

    private _unsubscribeItemsCollectionChangeEvent(): void {
        if (this._items) {
            this._items.unsubscribe('onCollectionChange', this._collectionChange);
        }
    }

    private _collectionChange(): void {
        if (this._options.navigation) {
            this._getNavigationController(this._options.navigation).updateQueryRange(this._items, this._options.root);
        }
    }

    private static _isEqualItems(oldList: RecordSet, newList: RecordSet): boolean {
        const getProtoOf = Object.getPrototypeOf.bind(Object);
        return oldList && cInstance.instanceOfModule(oldList, 'Types/collection:RecordSet') &&
               (newList.getModel() === oldList.getModel()) &&
               (newList.getKeyProperty() === oldList.getKeyProperty()) &&
               (getProtoOf(newList).constructor == getProtoOf(newList).constructor) &&
               (getProtoOf(newList.getAdapter()).constructor == getProtoOf(oldList.getAdapter()).constructor);
    }

    private static _getFilterForCollapsedGroups(
        initialFilter: QueryWhereExpression<unknown>,
        options: IControllerOptions
    ): Promise<QueryWhereExpression<unknown>> {
        const hasGrouping = !!options.groupProperty || !!options.groupingKeyCallback;
        const historyId = hasGrouping ? (options.groupHistoryId || options.historyIdCollapsedGroups) : undefined;
        const collapsedGroups = options.collapsedGroups;
        const getFilterWithCollapsedGroups = (collapsedGroupsIds: TArrayGroupId) => {
            let modifiedFilter: Record<string, unknown> = {};
            if (collapsedGroupsIds && collapsedGroupsIds.length) {
                modifiedFilter = { ...initialFilter };
                modifiedFilter.collapsedGroups = collapsedGroupsIds;
            }
            return modifiedFilter;
        };
        let resultFilterPromise;

        if (collapsedGroups && collapsedGroups.length) {
            resultFilterPromise = Promise.resolve(getFilterWithCollapsedGroups(collapsedGroups));
        } else if (historyId) {
            resultFilterPromise = groupUtil.restoreCollapsedGroups(historyId).then(
                (restoredCollapsedGroups?: TArrayGroupId) => getFilterWithCollapsedGroups(restoredCollapsedGroups)
            );
        } else {
            resultFilterPromise = Promise.resolve(initialFilter);
        }

        return resultFilterPromise;
    }

}
