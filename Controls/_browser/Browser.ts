import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_browser/resources/BrowserTemplate';
import {SyntheticEvent} from 'Vdom/Vdom';
import {ControllerClass as OperationsController} from 'Controls/operations';
import {
    ControllerClass as SearchController,
    getSwitcherStrFromData,
    SearchResolver as SearchResolverController
} from 'Controls/search';
import {ControllerClass as FilterController, IFilterItem} from 'Controls/filter';
import { IFilterControllerOptions } from 'Controls/_filter/ControllerClass';
import {EventUtils} from 'UI/Events';
import {RecordSet} from 'Types/collection';
import {ContextOptions} from 'Controls/context';

import {RegisterClass} from 'Controls/event';
import * as isNewEnvironment from 'Core/helpers/isNewEnvironment';
import {
    error as dataSourceError,
    ISourceControllerOptions,
    NewSourceController as SourceController
} from 'Controls/dataSource';
import {IFilterOptions, IHierarchyOptions, ISearchOptions, ISourceOptions, TSelectionType, Direction} from 'Controls/interface';
import Store from 'Controls/Store';
import {SHADOW_VISIBILITY} from 'Controls/scroll';
import {detection} from 'Env/Env';
import {ICrud, ICrudPlus, IData, PrefetchProxy, QueryWhereExpression} from 'Types/source';
import {ISearchControllerOptions} from 'Controls/_search/ControllerClass';
import {IHierarchySearchOptions} from 'Controls/interface/IHierarchySearch';
import {IFilterHistoryData} from 'Controls/_filter/ControllerClass';
import {IMarkerListOptions} from 'Controls/_marker/interface';
import {IShadowsOptions} from 'Controls/_scroll/Container/Interface/IShadows';
import {IControllerState} from 'Controls/_dataSource/Controller';

type Key = string|number|null;

type TViewMode = 'search' | 'tile' | 'table' | 'list';

export interface IBrowserOptions extends IControlOptions, ISearchOptions, ISourceOptions,
    Required<IFilterOptions>, Required<IHierarchyOptions>, IHierarchySearchOptions,
    IMarkerListOptions, IShadowsOptions {
    searchNavigationMode: string;
    groupHistoryId: string;
    searchValue: string;
    filterButtonSource: IFilterItem[];
    useStore?: boolean;
    dataLoadCallback?: Function;
    dataLoadErrback?: Function;
    itemsReadyCallback?: Function;
    viewMode: TViewMode;
    root?: Key;
}

type IReceivedState = {
    items: RecordSet | void | Error;
    filterItems: IFilterItem[] | IFilterHistoryData;
} | Error | void;

interface IDataChildContext {
    dataOptions: IBrowserOptions;
}

type IFilterControllerOptions = Pick<IBrowserOptions,
   'filter' | 'minSearchLength' | 'filterButtonSource' | 'parentProperty' | 'searchParam' | 'searchValue'>;

/**
 * Контрол "Браузер" обеспечивает связь между списком (см. {@link Controls/list:View Плоский список}, {@link Controls/grid:View Таблица}, {@link Controls/treeGrid:View Дерево}, {@link Controls/tile:View Плитка} и {@link Controls/explorer:View Иерархический проводник}) и контролами его окружения, таких как {@link Controls/search:Input Строка поиска}, {@link Controls/breadcrumbs:Path Хлебные крошки}, {@link Controls/operations:Panel Панель действий} и {@link Controls/filter:View Объединенный фильтр}.
 * @class Controls/browser:Browser
 * @public
 * @author Герасимов А.М.
 * @mixes Controls/_browser/interface/IBrowser
 * @mixes Controls/_filter/IPrefetch
 * @mixes Controls/_interface/IFilter
 * @mixes Controls/_interface/IFilterChanged
 * @mixes Controls/_interface/INavigation
 * @mixes Controls/_interface/IHierarchy
 * @mixes Controls/_interface/ISource
 * @mixes Controls/_interface/ISearch
 * @mixes Controls/interface/IHierarchySearch
 *
 * @demo Controls-demo/Search/FlatList/Index
 */
export default class Browser extends Control<IBrowserOptions, IReceivedState> {
    protected _template: TemplateFunction = template;
    protected _notifyHandler: Function = EventUtils.tmplNotify;

    private _isMounted: boolean;
    private _selectedKeysCount: number | null;
    private _selectionType: TSelectionType = 'all';
    private _isAllSelected: boolean = false;

    private _listMarkedKey: Key = null;
    private _notifiedMarkedKey: Key = null;
    private _previousViewMode: TViewMode = null;
    private _viewMode: TViewMode = undefined;
    private _misspellValue: string = null;
    private _root: Key = null;
    private _path: RecordSet;
    private _deepReload: boolean = undefined;
    private _inputSearchValue: string = '';
    private _searchValue: string = '';
    private _dataOptionsContext: typeof ContextOptions;

    private _itemsReadyCallback: Function;
    private _loading: boolean = false;
    private _items: RecordSet;
    private _filter: QueryWhereExpression<unknown>;
    private _filterButtonItems: IFilterItem[];
    private _fastFilterItems: IFilterItem[];
    private _groupHistoryId: string;
    private _errorRegister: RegisterClass;
    private _storeCallbacks: string[];

    private _source: ICrudPlus | ICrud & ICrudPlus & IData;
    private _sourceController: SourceController = null;
    private _searchResolverController: SearchResolverController = null;
    private _operationsController: OperationsController = null;
    private _searchController: SearchController = null;
    private _filterController: FilterController = null;

    private _topShadowVisibility: SHADOW_VISIBILITY = SHADOW_VISIBILITY.AUTO;
    private _bottomShadowVisibility: SHADOW_VISIBILITY = SHADOW_VISIBILITY.AUTO;

    protected _beforeMount(options: IBrowserOptions,
                           context?: typeof ContextOptions,
                           receivedState?: IReceivedState): void | Promise<IReceivedState | Error | void> {
        this._itemOpenHandler = this._itemOpenHandler.bind(this);
        this._dataLoadCallback = this._dataLoadCallback.bind(this);
        this._dataLoadErrback = this._dataLoadErrback.bind(this);
        this._afterSetItemsOnReloadCallback = this._afterSetItemsOnReloadCallback.bind(this);
        this._notifyNavigationParamsChanged = this._notifyNavigationParamsChanged.bind(this);

        this._filterController = new FilterController({
            ...options,
            historySaveCallback: this._historySaveCallback.bind(this)
        } as IFilterControllerOptions);

        this._filter = options.filter || {};
        this._groupHistoryId = options.groupHistoryId;
        this._itemsReadyCallback = this._itemsReadyCallbackHandler.bind(this);
        this._viewMode = options.viewMode;

        if (options.root !== undefined) {
            this._root = options.root;
        }

        if (receivedState && options.source instanceof PrefetchProxy) {
            this._source = options.source.getOriginal();
        } else {
            this._source = options.source;
        }
        if (options.useStore) {
            this._searchValue = Store.getState().searchValue as unknown as string;
        } else if (options.searchValue) {
            this._searchValue = options.searchValue;
        }

        const controllerState = this._getSourceController(this._getSourceControllerOptions(options)).getState();
        this._dataOptionsContext = this._createContext(controllerState);

        this._previousViewMode = this._viewMode = options.viewMode;
        this._updateViewMode(options.viewMode);

        if (receivedState) {
            if ('filterItems' in receivedState && 'items' in receivedState) {
                this._setFilterItems(receivedState.filterItems as IFilterItem[]);
                this._defineShadowVisibility(receivedState.items);
                if (isNewEnvironment()) {
                    this._setItemsAndUpdateContext(receivedState.items as RecordSet, options);
                }
            }
        } else {
            return this._filterController.loadFilterItemsFromHistory().then((filterItems) => {
                this._setFilterItems(filterItems as IFilterItem[]);

                return this._loadItems(options, this._getSourceController(options).getState()).then((items) => {
                    this._defineShadowVisibility(items);
                    return {
                        filterItems,
                        items
                    };
                }, (error) => {
                    this._processLoadError(error);
                    return error;
                });
            }, (error) => error);
        }
    }

    private _getSourceController(options?: IBrowserOptions): SourceController {
        if (!this._sourceController) {
            this._sourceController = new SourceController(options ?? this._options);
        }

        return this._sourceController;
    }

    protected _afterMount(options: IBrowserOptions): void {
        this._isMounted = true;
        if (options.useStore) {
            const sourceCallbackId = Store.onPropertyChanged('filterSource', (filterSource: IFilterItem[]) => {
                this._filterItemsChanged(null, filterSource);
            });
            const filterSourceCallbackId = Store.onPropertyChanged('filter',
               (filter: QueryWhereExpression<unknown>) => this._filterChanged(null, filter));
            const searchValueCallbackId = Store.onPropertyChanged('searchValue',
               (searchValue: string) => this._search(null, searchValue));

            this._storeCallbacks = [
                sourceCallbackId,
                filterSourceCallbackId,
                searchValueCallbackId
            ];
        }
    }

    protected _beforeUpdate(newOptions: IBrowserOptions, context: typeof ContextOptions): void | Promise<RecordSet> {
        let methodResult;

        this._getOperationsController().update(newOptions);
        if (newOptions.hasOwnProperty('markedKey') && newOptions.markedKey !== undefined) {
            this._listMarkedKey = this._getOperationsController().setListMarkedKey(newOptions.markedKey);
        }

        const isFilterOptionsChanged = this._filterController.update(this._getFilterControllerOptions(newOptions));

        if (isFilterOptionsChanged) {
            this._updateFilterAndFilterItems();
        }

        const sourceChanged = this._options.source !== newOptions.source;
        if (sourceChanged) {
            this._source = newOptions.source;
        }

        if (newOptions.root !== this._options.root) {
            this._root = newOptions.root;
        }

        const sourceController = this._getSourceController(newOptions);

        const isChanged = sourceController.updateOptions(this._getSourceControllerOptions(newOptions));

        if (sourceChanged) {
            this._loading = true;
            methodResult = sourceController.reload()
               .then((items) => {
                   this._items = sourceController.getItems();

                   this._afterSourceLoad(sourceController, newOptions);

                   this._loading = false;
                   return items;
               }, (error) => {
                   this._processLoadError(error);
                   return error;
               })
               .then((result) => {
                   return this._updateSearchController(newOptions).then(() => result);
               });
        } else if (isChanged) {
            this._afterSourceLoad(sourceController, newOptions);
        }

        if (newOptions.searchValue !== undefined) {
            if (this._options.searchValue !== newOptions.searchValue) {
                this._inputSearchValue = newOptions.searchValue;
            }
            if (!methodResult) {
                methodResult = this._updateSearchController(newOptions);
            }
        }

        return methodResult;
    }

    private _updateSearchController(newOptions: IBrowserOptions): Promise<void> {
        return this._getSearchController().then((searchController) => {
            const updateResult = searchController.update(this._getSearchControllerOptions(newOptions));

            if (updateResult instanceof Promise) {
                this._loading = true;
                updateResult
                    .then((result) => {
                        this._searchDataLoad(result, newOptions.searchValue);
                    })
                    .catch((error) => error);
            } else if (updateResult) {
                this._filterChanged(null, updateResult as QueryWhereExpression<unknown>);
            }
        });
    }

    private _afterSourceLoad(sourceController: SourceController, options: IBrowserOptions): void {
        const controllerState = sourceController.getState();

        // TODO filter надо распространять либо только по контексту, либо только по опциям. Щас ждут и так и так
        this._filter = controllerState.filter;
        this._updateContext(controllerState);
        this._groupHistoryId = options.groupHistoryId;
    }

    protected _beforeUnmount(): void {
        if (this._searchResolverController) {
            this._searchResolverController.clearTimer();
        }
        if (this._operationsController) {
            this._operationsController.destroy();
            this._operationsController = null;
        }

        if (this._searchController) {
            this._updateFilter(this._searchController);
            this._searchController = null;
        }

        if (this._errorRegister) {
            this._errorRegister.destroy();
            this._errorRegister = null;
        }

        if (this._storeCallbacks) {
            this._storeCallbacks.forEach((id) => Store.unsubscribe(id));
        }

        if (this._sourceController) {
            this._sourceController.destroy();
            this._sourceController = null;
        }

        this._filterController = null;
    }

    private _getErrorRegister(): RegisterClass {
        if (!this._errorRegister) {
            this._errorRegister = new RegisterClass({register: 'dataError'});
        }
        return this._errorRegister;
    }

    private _setFilterItems(filterItems: IFilterItem[]): void {
        this._filterController.setFilterItems(filterItems);
        this._updateFilterAndFilterItems();
    }

    private _loadItems(options: IBrowserOptions, controllerState: IControllerState): Promise<void | RecordSet | Error> {
        let result;

        if (options.source) {
            result = this._getSourceController(options).load().then((loadResult) => {
                this._setItemsAndUpdateContext(loadResult as unknown as RecordSet, options);
                return loadResult;
            });
        } else {
            this._updateContext(controllerState);
            result = Promise.resolve();
        }

        return result;
    }

    private _setItemsAndUpdateContext(items: RecordSet, options: IBrowserOptions): void {
        const sourceController = this._getSourceController(options);

        // TODO items надо распространять либо только по контексту, либо только по опциям. Щас ждут и так и так
        this._items = sourceController.setItems(items);
        const controllerState = sourceController.getState();
        this._updateContext(controllerState);
    }

    private _getSearchController(options?: IBrowserOptions): Promise<SearchController> {
        if (!this._searchController) {
            return import('Controls/search').then((result) => {
                this._searchController = new result.ControllerClass(
                   this._getSearchControllerOptions(options ?? this._options));

                return this._searchController;
            });
        }

        return Promise.resolve(this._searchController);
    }

    protected _itemsReadyCallbackHandler(items: RecordSet): void {
        if (this._items !== items) {
            const sourceController = this._getSourceController();

            this._items = sourceController.setItems(items);
            this._dataOptionsContext.items = this._items;
            this._dataOptionsContext.updateConsumers();
        }
        if (this._options.itemsReadyCallback) {
            this._options.itemsReadyCallback(items);
        }
    }

    protected _handleItemOpen(root: Key, items: RecordSet, dataRoot: Key = null): void {
        if (this._searchController) {
            if (this._isSearchViewMode() && this._options.searchNavigationMode === 'expand') {
                this._notifiedMarkedKey = root;

                const expandedItems = Browser._prepareExpandedItems(
                   this._searchController.getRoot(),
                   root,
                   items,
                   this._options.parentProperty);

                this._notify('expandedItemsChanged', [expandedItems]);

                if (!this._deepReload) {
                    this._deepReload = true;
                }
            } else {
                this._searchController.setRoot(root);
                this._root = root;
            }
            if (root !== dataRoot) {
                this._updateFilter(this._searchController);

                this._inputSearchValue = '';
            }
        }
    }

    private _isSearchViewMode(): boolean {
        return this._viewMode === 'search';
    }

    protected _filterChanged(event: SyntheticEvent, filter: object): void {
        if (event) {
            event.stopPropagation();
        }
        this._filterController.setFilter(filter);

        this._getSourceController().setFilter(this._filterController.getFilter() as QueryWhereExpression<unknown>);

        const controllerState = this._sourceController.getState();

        this._filter = controllerState.filter;
        this._updateContext(controllerState);
        this._dataOptionsContext.updateConsumers();

        this._notify('filterChanged', [this._filter]);
    }

    protected _rootChanged(event: SyntheticEvent, root: Key): void {
        this._notify('rootChanged', [root]);
    }

    protected _historySaveCallback(historyData: Record<string, any>, items: IFilterItem[]): void {
        if (this._mounted) {
            this?._notify('historySave', [historyData, items]);
        }
    }

    protected _itemsChanged(event: SyntheticEvent, items: RecordSet): void {
        const sourceController = this._getSourceController(this._options);

        sourceController.cancelLoading();
        this._items = sourceController.setItems(items);
        this._updateContext(sourceController.getState());
    }

    protected _filterItemsChanged(event: SyntheticEvent, items: IFilterItem[]): void {
        this._filterController.updateFilterItems(items);
        this._updateFilterAndFilterItems();
        this._dataOptionsContext.filter = this._filter;
        this._notify('filterChanged', [this._filter]);
    }

    protected _getChildContext(): IDataChildContext {
        return {
            dataOptions: this._dataOptionsContext
        };
    }

    private _createContext(options?: IControllerState): typeof ContextOptions {
        return new ContextOptions(options);
    }

    private _updateContext(sourceControllerState: IControllerState): void {
        const curContext = this._dataOptionsContext;

        for (const i in sourceControllerState) {
            if (sourceControllerState.hasOwnProperty(i)) {
                curContext[i] = sourceControllerState[i];
            }
        }
        curContext.updateConsumers();
    }

    protected _filterHistoryApply(event: SyntheticEvent, history: IFilterItem[]): void {
        // Здесь ничего не обновляем, после стреляет filterItemsChanged
        this._filterController.updateHistory(history);
    }

    private _updateFilterAndFilterItems(): void {
        this._filter = this._filterController.getFilter() as QueryWhereExpression<unknown>;
        this._filterButtonItems = this._filterController.getFilterButtonItems();
        this._fastFilterItems = this._filterController.getFastFilterItems();
        this._sourceController.setFilter(this._filter);
    }

    protected _processLoadError(error: Error): void {
        this._onDataError(null, {
            error,
            mode: dataSourceError.Mode.include
        });
    }

    protected _onDataError(event: SyntheticEvent, errbackConfig: dataSourceError.ViewConfig): void {
        this._getErrorRegister().start(errbackConfig);
    }

    protected _registerHandler(event: Event, registerType: string,
                               component: any, callback: Function, config: object): void {
        this._getErrorRegister().register(event, registerType, component, callback, config);
        this._getOperationsController().registerHandler(event, registerType, component, callback, config);
    }

    protected _unregisterHandler(event: Event, registerType: string, component: any, config: object): void {
        this._getErrorRegister().unregister(event, registerType, component, config);
        this._getOperationsController().unregisterHandler(event, registerType, component, config);
    }

    protected _selectedTypeChangedHandler(event: SyntheticEvent<null>, typeName: string, limit?: number): void {
        this._getOperationsController().selectionTypeChanged(typeName, limit);
    }

    protected _selectedKeysCountChanged(e: SyntheticEvent, count: number|null, isAllSelected: boolean): void {
        e.stopPropagation();
        this._selectedKeysCount = count;
        this._isAllSelected = isAllSelected;
    }

    protected _listSelectionTypeForAllSelectedChanged(event: SyntheticEvent, selectionType: TSelectionType): void {
        event.stopPropagation();
        this._selectionType = selectionType;
    }

    protected _itemOpenHandler(newCurrentRoot: Key, items: RecordSet, dataRoot: Key = null): void {
        this._getOperationsController().itemOpenHandler(newCurrentRoot, items, dataRoot);
        this._handleItemOpen(newCurrentRoot, items, dataRoot);
    }

    protected _listMarkedKeyChangedHandler(event: SyntheticEvent<null>, markedKey: Key): unknown {
        this._listMarkedKey = this._getOperationsController().setListMarkedKey(markedKey);
        return this._notify('markedKeyChanged', [markedKey]);
    }

    protected _markedKeyChangedHandler(event: SyntheticEvent<null>): void {
        event.stopPropagation();
    }

    protected _operationsPanelOpen(): void {
        this._listMarkedKey = this._getOperationsController().setOperationsPanelVisible(true);
    }

    protected _operationsPanelClose(): void {
        this._getOperationsController().setOperationsPanelVisible(false);
    }

    private _createOperationsController(options) {
        const controllerOptions = {
            ...options,
            ...{
                selectionViewModeChangedCallback: (type) => {
                    this._notify('selectionViewModeChanged', [type]);
                }
            }
        };
        return new OperationsController(controllerOptions);
    }

    private _getOperationsController(): OperationsController {
        if (!this._operationsController) {
            this._operationsController = this._createOperationsController(this._options);
        }

        return this._operationsController;
    }

    private _defineShadowVisibility(items: RecordSet|Error|void): void {
        if (detection.isMobilePlatform) {
            // На мобильных устройствах тень верхняя показывается, т.к. там есть уже загруженные данные вверху
            return;
        }

        if (items instanceof RecordSet) {
            const more = items.getMetaData().more;
            if (more) {
                this._topShadowVisibility = more.before ? 'gridauto' : SHADOW_VISIBILITY.AUTO;
                this._bottomShadowVisibility = more.after ? 'gridauto' : SHADOW_VISIBILITY.AUTO;
            }
        }
    }

    private _getSearchControllerOptions(options: IBrowserOptions): ISearchControllerOptions {
        return {
            ...options, ...{sourceController: this._getSourceController(options)}
        };
    }

    private _getSourceControllerOptions(options: ISourceControllerOptions): ISourceControllerOptions {
        return {
            ...options,
            filter: this._filter,
            source: this._source,
            navigationParamsChangedCallback: this._notifyNavigationParamsChanged
        };
    }

    private _getFilterControllerOptions(options): IFilterControllerOptions {
       return {
           ...options,
           searchValue: options.hasOwnProperty('searchValue') ? options.searchValue : this._searchValue,
           historySaveCallback: this._historySaveCallback.bind(this)
        };
    }

    private _notifyNavigationParamsChanged(params): void {
        if (this._isMounted) {
            this._notify('navigationParamsChanged', [params]);
        }
    }

    private _startSearch(value: string): Promise<RecordSet | Error> {
        return this._getSearchController().then((searchController) => {
           return searchController.search(value);
        });
    }

    protected _search(event: SyntheticEvent, validatedValue: string): void {
        this._startSearch(validatedValue).then((result) => {
            this._searchDataLoad(result, validatedValue);
        }).catch((error: Error & {
            isCancelled?: boolean;
        }) => {
            if (!error?.isCancelled) {
                return error;
            }
        });
    }

    protected _searchDataLoad(result: RecordSet|Error, searchValue: string): void {
        if (result instanceof RecordSet) {
            this._handleDataLoad(result);
            this._afterSearch(result, searchValue);
            this._getSourceController().setItems(result);
        } else {
            this._handleError(result);
        }
    }

    private _searchReset(event: SyntheticEvent): void {
        this._getSearchController().then((searchController) => {
            this._updateFilter(searchController);
            this._handleDataLoad(null);
        });
    }

    private _updateFilter(searchController: SearchController): void {
        const filter = searchController.reset(true);
        this._filterChanged(null, filter);
        this._setSearchValue('');
    }

    private _afterSearch(recordSet: RecordSet, value: string): void {
        this._updateParams(value);
        this._afterSourceLoad(this._sourceController, this._options);
        this._dataLoadCallback(recordSet);

        this._itemsChanged(null, recordSet);
        this._filterChanged(null, this._sourceController.getFilter());

        const switchedStr = getSwitcherStrFromData(recordSet);
        this._misspellValue = switchedStr;
        if (Browser._needChangeSearchValueToSwitchedString(recordSet)) {
            this._setSearchValue(switchedStr);
        }
    }

    private _setSearchValue(value: string): void {
        this._searchValue = value;
        this._notify('searchValueChanged', [value]);
    }

    private _updateParams(value: string): void {
        if (this._viewMode !== 'search') {
            this._updateViewMode('search');

            if (this._options.parentProperty) {
                this._updateRootAfterSearch();
            }
        }
        this._loading = false;
        this._setSearchValue(value);
    }

    private _updateRootAfterSearch(): void {
        if (this._options.startingWith === 'root') {
            const newRoot = Browser._getRoot(this._path, this._root, this._options.parentProperty);

            this._getSearchController().then((searchController) => {
                this._root = newRoot;
                searchController.setRoot(newRoot);
                this._notify('rootChanged', [newRoot]);
            });
        }
    }

    private _updateViewMode(newViewMode: TViewMode): void {
        this._previousViewMode = this._viewMode;
        this._viewMode = newViewMode;
    }

    private _handleDataLoad(data: RecordSet): void {
        if (this._deepReload) {
            this._deepReload = undefined;
        }

        this._path = data?.getMetaData().path ?? null;

        if (this._isSearchViewMode() && !this._searchValue) {
            this._updateViewMode(this._previousViewMode);
            this._previousViewMode = null;
            this._misspellValue = '';
        }
    }

    private _dataLoadCallback(data: RecordSet, direction?: Direction): void {
        this._filterController.handleDataLoad(data);
        this._handleDataLoad(data);

        if (this._options.dataLoadCallback) {
            this._options.dataLoadCallback(data, direction);
        }
    }

    protected _handleError(error: Error | object): void {
        if (error instanceof Error) {
            if (this._options.dataLoadErrback) {
                this._options.dataLoadErrback(Error);
            }
        } else {
            this._notify('dataError', [error]);
            this._errorRegister.start(error);
        }
    }

    private _dataLoadErrback(error: Error): void {
        this._filterController.handleDataError();

        this._handleError(error);
    }

    _afterSetItemsOnReloadCallback(): void {
        if (this._notifiedMarkedKey !== undefined) {
            this._notify('markedKeyChanged', [this._notifiedMarkedKey]);
            this._notifiedMarkedKey = undefined;
        }
    }

    _misspellCaptionClick(): void {
        this._search(null, this._misspellValue);
        this._inputSearchValue = this._misspellValue;
        this._misspellValue = '';
    }

    resetPrefetch(): void {
        this._filterController.resetPrefetch();
        this._filter = this._filterController.getFilter() as QueryWhereExpression<unknown>;
        this._notify('filterChanged', [this._filter]);
    }

    private static _needChangeSearchValueToSwitchedString(recordSet: RecordSet): boolean {
        const metaData = recordSet && recordSet.getMetaData();
        return metaData ? metaData.returnSwitched : false;
    }

    static _getRoot(path: RecordSet, currentRoot: Key, parentProperty: string): Key {
        let root;

        if (path && path.getCount() > 0) {
            root = path.at(0).get(parentProperty);
        } else {
            root = currentRoot;
        }

        return root;
    }

    static _prepareExpandedItems(
       searchRoot: Key,
       expandedItemKey: Key,
       items: RecordSet,
       parentProperty: string
    ): Key[] {
        const expandedItems = [];
        let item;
        let nextItemKey = expandedItemKey;
        do {
            item = items.getRecordById(nextItemKey);
            nextItemKey = item.get(parentProperty);
            expandedItems.unshift(item.getId());
        } while (nextItemKey !== searchRoot);

        return expandedItems;
    }

    static contextTypes(): object {
        return {
            dataOptions: ContextOptions
        };
    }

    static getDefaultOptions(): object {
        return {
            minSearchLength: 3,
            searchDelay: 500,
            startingWith: 'root'
        };
    }
}
