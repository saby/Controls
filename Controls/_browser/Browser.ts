import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_browser/resources/BrowserTemplate';
import {SyntheticEvent} from 'Vdom/Vdom';
import {ControllerClass as OperationsController} from 'Controls/operations';
import {
    ControllerClass as SearchController,
    getSwitcherStrFromData
} from 'Controls/search';
import {IFilterItem} from 'Controls/filter';
import * as filterLib from 'Controls/filter';
import {IFilterControllerOptions, IFilterHistoryData} from 'Controls/_filter/ControllerClass';
import {EventUtils} from 'UI/Events';
import {RecordSet} from 'Types/collection';
import {ContextOptions} from 'Controls/context';
import {RegisterClass} from 'Controls/event';
import {
    error as dataSourceError,
    ISourceControllerOptions,
    NewSourceController as SourceController
} from 'Controls/dataSource';
import {
    Direction,
    IFilterOptions,
    IHierarchyOptions,
    ISearchOptions,
    ISourceOptions,
    TSelectionType
} from 'Controls/interface';
import Store from 'Controls/Store';
import {SHADOW_VISIBILITY} from 'Controls/scroll';
import {detection} from 'Env/Env';
import {ICrud, ICrudPlus, IData, PrefetchProxy, QueryWhereExpression} from 'Types/source';
import {IHierarchySearchOptions} from 'Controls/interface/IHierarchySearch';
import {IMarkerListOptions} from 'Controls/_marker/interface';
import {IShadowsOptions} from 'Controls/_scroll/Container/Interface/IShadows';
import {IControllerState} from 'Controls/_dataSource/Controller';
import {isEqual} from 'Types/object';
import {DataLoader, IDataLoaderOptions, ILoadDataResult} from 'Controls/dataSource';

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

type TErrbackConfig = dataSourceError.ViewConfig & { error: Error };

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

    protected _topShadowVisibility: SHADOW_VISIBILITY | 'gridauto' = SHADOW_VISIBILITY.AUTO;
    protected _bottomShadowVisibility: SHADOW_VISIBILITY | 'gridauto' = SHADOW_VISIBILITY.AUTO;

    private _listMarkedKey: Key = null;
    private _notifiedMarkedKey: Key;
    private _misspellValue: string = null;
    private _root: Key = null;
    private _rootBeforeSearch: Key = null;
    private _path: RecordSet;
    private _deepReload: boolean = undefined;

    private _dataOptionsContext: typeof ContextOptions;
    private _sourceControllerState: IControllerState;
    private _items: RecordSet;

    private _filter: QueryWhereExpression<unknown>;
    private _filterButtonItems: IFilterItem[];
    private _fastFilterItems: IFilterItem[];
    private _filterLib = filterLib;

    private _groupHistoryId: string;
    private _errorRegister: RegisterClass;
    private _storeCallbackIds: string[];
    private _storeCtxCallbackId: string;

    private _source: ICrudPlus | ICrud & ICrudPlus & IData;
    private _dataLoader: DataLoader = null;
    private _loading: boolean = false;

    private _operationsController: OperationsController = null;
    private _selectedKeysCount: number | null = 0;
    private _selectionType: TSelectionType = 'all';
    private _isAllSelected: boolean = false;

    private _previousViewMode: TViewMode = null;
    private _viewMode: TViewMode = undefined;
    private _inputSearchValue: string = '';
    private _searchValue: string = '';
    private _searchController: SearchController = null;

    protected _beforeMount(options: IBrowserOptions,
                           context?: typeof ContextOptions,
                           receivedState?: IReceivedState): void | Promise<IReceivedState | Error | void> {
        this._initStates(options, receivedState);
        this._dataLoader = new DataLoader(this._getDataLoaderOptions(options));

        if (receivedState &&  'filterItems' in receivedState && 'items' in receivedState) {
            this._setFilterItems(receivedState.filterItems as IFilterItem[]);
            this._dataLoader.getSourceController().setFilter(this._filter);
            this._defineShadowVisibility(receivedState.items);
            this._setItemsAndUpdateContext(receivedState.items as RecordSet, options);
            if (options.source && options.dataLoadCallback) {
                options.dataLoadCallback(receivedState.items);
            }
        } else if (options.source || options.filterButtonSource) {
            return this._dataLoader.load<ILoadDataResult>().then(([result]) => {
                this._updateFilterAndFilterItems();
                this._defineShadowVisibility(result.data);
                this._updateContext(result.sourceController.getState());

                if (result.data) {
                    return {
                        filterItems: (result.filterController && result.filterController.getFilterButtonItems()) || [],
                        items: result.data
                    };
                } else {
                    return result.error;
                }
            });
        } else {
            this._updateContext(this._dataLoader.getSourceController().getState());
        }
    }

    private _initStates(options: IBrowserOptions, receivedState: IReceivedState): void {
        this._itemOpenHandler = this._itemOpenHandler.bind(this);
        this._dataLoadCallback = this._dataLoadCallback.bind(this);
        this._dataLoadErrback = this._dataLoadErrback.bind(this);
        this._notifyNavigationParamsChanged = this._notifyNavigationParamsChanged.bind(this);

        if (options.root !== undefined) {
            this._root = options.root;
        }

        if (receivedState && options.source instanceof PrefetchProxy) {
            this._source = options.source.getOriginal();
        } else {
            this._source = options.source;
        }

        if (options.useStore) {
            this._inputSearchValue = this._searchValue = Store.getState().searchValue as unknown as string || '';
        } else if (options.searchValue) {
            this._inputSearchValue = this._searchValue = options.searchValue;
        }

        this._filter = options.filter || {};
        this._groupHistoryId = options.groupHistoryId;
        this._viewMode = options.viewMode;
        this._previousViewMode = this._viewMode = options.viewMode;

        if (this._inputSearchValue && this._inputSearchValue.length > options.minSearchLength) {
            this._updateViewMode('search');
        } else {
            this._updateViewMode(options.viewMode);
        }
    }

    private _getSourceController(): SourceController {
        const sourceController = this._dataLoader.getSourceController();
        sourceController.subscribe('rootChanged', this._rootChanged.bind(this));
        return sourceController;
    }

    protected _afterMount(options: IBrowserOptions): void {
        this._isMounted = true;
        if (options.useStore) {
            this._storeCallbackIds = this._createNewStoreObservers();
            this._storeCtxCallbackId = Store.onPropertyChanged('_contextName', () => {
                this._storeCallbackIds.forEach((id) => Store.unsubscribe(id));
                this._storeCallbackIds = this._createNewStoreObservers();
            }, true);
        }
    }

    protected _createNewStoreObservers(): string[] {
        const sourceCallbackId = Store.onPropertyChanged('filterSource', (filterSource: IFilterItem[]) => {
                this._filterItemsChanged(null, filterSource);
        });
        const filterSourceCallbackId = Store.onPropertyChanged('filter',
           (filter: QueryWhereExpression<unknown>) => this._filterChanged(null, filter));
        const searchValueCallbackId = Store.onPropertyChanged('searchValue',
           (searchValue: string) => {
                if (searchValue) {
                    this._search(null, searchValue);
                } else {
                    this._searchReset(null);
                }
           });

        return [
            sourceCallbackId,
            filterSourceCallbackId,
            searchValueCallbackId
        ];
    }

    protected _beforeUpdate(newOptions: IBrowserOptions, context: typeof ContextOptions): void | Promise<RecordSet> {
        const sourceChanged = this._options.source !== newOptions.source;
        const hasSearchValueInOptions = newOptions.searchValue !== undefined;
        const isInputSearchValueLongerThenMinSearchLength = this._inputSearchValue && this._inputSearchValue.length >= this._options.minSearchLength;
        let methodResult;

        this._getOperationsController().update(newOptions);
        if (newOptions.hasOwnProperty('markedKey') && newOptions.markedKey !== undefined) {
            this._listMarkedKey = this._getOperationsController().setListMarkedKey(newOptions.markedKey);
        }

        const isFilterOptionsChanged = this._dataLoader.getFilterController().update(this._getFilterControllerOptions(newOptions));

        if (isFilterOptionsChanged) {
            this._updateFilterAndFilterItems();
        }

        if (sourceChanged) {
            this._source = newOptions.source;
        }

        if (newOptions.root !== this._options.root) {
            this._root = newOptions.root;

            if (this._searchController) {
                this._searchController.setRoot(newOptions.root);
            }
        }

        if (this._options.viewMode !== newOptions.viewMode) {
            if (this._isSearchViewMode()) {
                this._previousViewMode = newOptions.viewMode;
            } else {
                this._updateViewMode(newOptions.viewMode);
            }
        }

        const sourceController = this._getSourceController();
        const isChanged = sourceController.updateOptions(
           this._getSourceControllerOptions(newOptions as ISourceControllerOptions));

        if ((this._options.searchValue !== newOptions.searchValue) && (this._searchValue !== newOptions.searchValue)) {
            this._inputSearchValue = newOptions.searchValue;

            if (!newOptions.searchValue && sourceChanged && this._searchController) {
                this._updateFilter(this._searchController);
            }
        }

        if (isChanged && this._source) {
            methodResult = this._reload(newOptions);
        } else if (isChanged) {
            this._afterSourceLoad(sourceController, newOptions);
        }

        if (isChanged && isInputSearchValueLongerThenMinSearchLength && hasSearchValueInOptions && !newOptions.searchValue) {
            this._inputSearchValue = '';
        }

        const searchParamChanged = this._options.searchParam !== newOptions.searchParam;
        if ((hasSearchValueInOptions && this._searchValue !== newOptions.searchValue) || searchParamChanged) {
            if (!methodResult) {
                methodResult = this._updateSearchController(newOptions).catch((error) => {
                    this._processLoadError(error);
                    return error;
                });
            }
        }

        return methodResult;
    }

    private _updateSearchController(newOptions: IBrowserOptions): Promise<void> {
        return this._getSearchController().then((searchController) => {
            const updateResult = searchController.update({
                ...newOptions,
                sourceController: this._getSourceController()
            });

            if (updateResult instanceof Promise) {
                this._loading = true;
                updateResult.catch((error) => {
                       if (!error.isCancelled) {
                           return error;
                       }
                   });
            } else if (updateResult) {
                this._searchValue = newOptions.searchValue;
                this._filterChanged(null, updateResult as QueryWhereExpression<unknown>);
                this._setSearchValue(newOptions.searchValue);
            }

            return updateResult;
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
        if (this._operationsController) {
            this._operationsController.destroy();
            this._operationsController = null;
        }

        if (this._errorRegister) {
            this._errorRegister.destroy();
            this._errorRegister = null;
        }

        if (this._storeCallbackIds) {
            this._storeCallbackIds.forEach((id) => Store.unsubscribe(id));
        }
        if (this._storeCtxCallbackId) {
            Store.unsubscribe(this._storeCtxCallbackId);
        }

        this._dataLoader.destroy();
    }

    private _getErrorRegister(): RegisterClass {
        if (!this._errorRegister) {
            this._errorRegister = new RegisterClass({register: 'dataError'});
        }
        return this._errorRegister;
    }

    private _setFilterItems(filterItems: IFilterItem[]): void {
        this._dataLoader.getFilterController().setFilterItems(filterItems);
        this._updateFilterAndFilterItems();
    }

    private _setItemsAndUpdateContext(items: RecordSet): void {
        // TODO items надо распространять либо только по контексту, либо только по опциям. Щас ждут и так и так
        this._items = this._getSourceController().setItems(items);
        this._updateContext(this._getSourceController().getState());
    }

    private _getSearchController(): Promise<SearchController> {
        return this._dataLoader.getSearchController().then((controller) => {
            return this._searchController = controller;
        });
    }

    protected _handleItemOpen(root: Key, items: RecordSet, dataRoot: Key = null): void {
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
        } else if (!this._options.hasOwnProperty('root')) {
            this._searchController?.setRoot(root);
            this._root = root;
        }
        if (root !== dataRoot && this._searchController) {
            this._updateFilter(this._searchController);
            this._inputSearchValue = '';
            if (this._options.useStore) {
                Store.sendCommand('resetSearch');
            }
        }
    }

    private _isSearchViewMode(): boolean {
        return this._viewMode === 'search';
    }

    protected _filterChanged(event: SyntheticEvent, filter: QueryWhereExpression<unknown>): void {
        if (event) {
            event.stopPropagation();
        }
        this._dataLoader.getFilterController().setFilter(filter);
        this._filter = filter;
        this._notify('filterChanged', [this._filter]);
    }

    protected _rootChanged(event: SyntheticEvent, root: Key): void {
        if (this._options.root === undefined) {
            this._root = root;
        }
        this._notify('rootChanged', [root]);
    }

    protected _historySaveCallback(historyData: Record<string, any>, items: IFilterItem[]): void {
        if (this._mounted && !this._destroyed) {
            this?._notify('historySave', [historyData, items]);
        }
    }

    protected _filterItemsChanged(event: SyntheticEvent, items: IFilterItem[]): void {
        this._dataLoader.getFilterController().updateFilterItems(items);
        this._updateFilterAndFilterItems();
        this._dataOptionsContext.filter = this._filter;
        this._notify('filterChanged', [this._filter]);
    }

    protected _getChildContext(): IDataChildContext {
        return {
            dataOptions: this._dataOptionsContext
        };
    }

    private _updateContext(sourceControllerState: IControllerState): void {
        if (!this._dataOptionsContext) {
            this._dataOptionsContext = new ContextOptions(sourceControllerState);
        } else {
            const curContext = this._dataOptionsContext;

            for (const i in sourceControllerState) {
                if (sourceControllerState.hasOwnProperty(i)) {
                    curContext[i] = sourceControllerState[i];
                }
            }
            curContext.updateConsumers();
        }
        this._sourceControllerState = sourceControllerState;
    }

    protected _filterHistoryApply(event: SyntheticEvent, history: IFilterItem[]): void {
        // Здесь ничего не обновляем, после стреляет filterItemsChanged
        this._dataLoader.getFilterController().updateHistory(history);
    }

    private _updateFilterAndFilterItems(): void {
        const filterController = this._dataLoader.getFilterController();
        this._filter = filterController.getFilter() as QueryWhereExpression<unknown>;
        this._filterButtonItems = filterController.getFilterButtonItems();
        this._fastFilterItems = filterController.getFastFilterItems();
    }

    protected _processLoadError(error: Error): void {
        this._onDataError(null, {
            error,
            mode: dataSourceError.Mode.include
        } as TErrbackConfig);
    }

    protected _onDataError(event: SyntheticEvent, errbackConfig: TErrbackConfig): void {
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

    private _createOperationsController(options: IBrowserOptions): OperationsController {
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

    private _getSourceControllerOptions(options: ISourceControllerOptions): ISourceControllerOptions {
        return {
            ...options,
            filter: this._filter,
            source: this._source,
            navigationParamsChangedCallback: this._notifyNavigationParamsChanged,
            dataLoadErrback: this._dataLoadErrback,
            dataLoadCallback: this._dataLoadCallback,
            root: this._root
        };
    }

    private _getDataLoaderOptions(options: IBrowserOptions): IDataLoaderOptions {
        const loaderOptions = {
            dataLoadCallback: this._dataLoadCallback,
            source: this._source,
            navigationParamsChangedCallback: this._notifyNavigationParamsChanged,
            dataLoadErrback: this._dataLoadErrback,
            root: this._root,
            searchValue: options.hasOwnProperty('searchValue') ? options.searchValue : this._searchValue
        };

        return {
            loadDataConfigs: [{...options, ...loaderOptions}]
        } as IDataLoaderOptions;
    }

    private _getFilterControllerOptions(options: IBrowserOptions): IFilterControllerOptions {
       return {
           ...options,
           searchValue: options.hasOwnProperty('searchValue') ? options.searchValue : this._searchValue,
           historySaveCallback: this._historySaveCallback.bind(this)
        } as IFilterControllerOptions;
    }

    private _notifyNavigationParamsChanged(params: unknown): void {
        if (this._isMounted) {
            this._notify('navigationParamsChanged', [params]);
        }
    }

    protected _search(event: SyntheticEvent, value: string): Promise<Error|RecordSet|void> {
        this._inputSearchValue = value;
        this._loading = true;
        return this._getSearchController().then((searchController) => {
            return searchController
                .search(value)
                .catch((error) => {
                    return this._processSearchError(error);
                });
        });
    }

    protected _inputSearchValueChanged(event: SyntheticEvent, value: string): void {
        this._inputSearchValue = value;
    }

    protected _searchDataLoad(result: RecordSet|Error, searchValue: string): void {
        if (result instanceof RecordSet) {
            this._afterSearch(result, searchValue);
        }
    }

    private _processSearchError(error: Error): void|Error {
        if (!error.isCanceled) {
            this._loading = false;
            this._filterChanged(null, this._searchController.getFilter());
            this._getErrorRegister().start({
                error,
                mode: dataSourceError.Mode.include
            });
            return error;
        }
    }

    private _searchReset(event: SyntheticEvent): Promise<void> {
        this._getSourceController().cancelLoading();
        return this._getSearchController().then((searchController) => {
            if (this._rootBeforeSearch && this._root !== this._rootBeforeSearch && this._options.startingWith === 'current') {
                this._root = this._rootBeforeSearch;
                searchController.setRoot(this._root);
                this._notify('rootChanged', [this._root]);
            }
            this._rootBeforeSearch = null;
            this._updateFilter(searchController);
        });
    }

    private _updateFilter(searchController: SearchController): void {
        const filter = searchController.reset(true);
        if (!isEqual(this._filter, filter)) {
            this._filterChanged(null, filter);
        }
        this._setSearchValue('');
    }

    private _afterSearch(recordSet: RecordSet, value: string): void {
        const filter = this._searchController.getFilter();
        const sourceController = this._getSourceController();
        this._updateParams(value);
        this._afterSourceLoad(sourceController, this._options);
        this._filterChanged(null, filter);
        sourceController.setFilter(filter);

        const switchedStr = getSwitcherStrFromData(recordSet);
        this._misspellValue = switchedStr;
        if (this._searchController.needChangeSearchValueToSwitchedString(recordSet)) {
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

            if (newRoot !== this._root) {
                this._rootBeforeSearch = this._root;
                this._root = newRoot;
                this._searchController.setRoot(newRoot);
                this._notify('rootChanged', [newRoot]);
            }
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

        if (this._searchController && (this._searchController.isSearchInProcess() || this._searchController.getSearchValue() !== this._searchValue)) {
            this._loading = false;
            this._searchDataLoad(data, this._searchController.getSearchValue());
        } else if (this._loading) {
            this._afterSourceLoad(this._getSourceController(), this._options);
        }

        this._path = data?.getMetaData().path ?? null;

        if (this._options.searchParam) {
            if (this._searchController) {
                this._searchController.setPath(this._path);
            } else if (this._path) {
                this._getSearchController()
                    .then((searchController) => searchController.setPath(this._path))
                    .catch((error) => error);
            }
        }

        if (this._isSearchViewMode() && !this._searchValue) {
            this._updateViewMode(this._previousViewMode);
            this._previousViewMode = null;
            this._misspellValue = '';
            this._rootBeforeSearch = null;
        }
    }

    private _dataLoadCallback(data: RecordSet, direction?: Direction): void {
        this._dataLoader.getFilterController().handleDataLoad(data);
        this._handleDataLoad(data);

        if (this._options.dataLoadCallback) {
            this._options.dataLoadCallback(data, direction);
        }
    }

    private _dataLoadErrback(error: Error): void {
        this._dataLoader.getFilterController().handleDataError();
        if (this._options.dataLoadErrback) {
            this._options.dataLoadErrback(error);
        }
    }

    private _reload(options: IBrowserOptions): Promise<RecordSet> {
        const sourceController = this._getSourceController();

        this._loading = true;
        return sourceController.reload()
            .then((items) => {
                this._items = sourceController.getItems();
                return items;
            })
            .catch((error) => {
                this._processLoadError(error);
                return error;
            })
            .finally(() => {
                this._loading = false;
                this._afterSourceLoad(sourceController, options);
            })
            .then((result) => {
                return this._updateSearchController(options).then(() => result);
            });
    }

    _misspellCaptionClick(): void {
        this._search(null, this._misspellValue);
        this._inputSearchValue = this._misspellValue;
        this._misspellValue = '';
    }

    resetPrefetch(): void {
        const filterController = this._dataLoader.getFilterController();
        filterController.resetPrefetch();
        this._filter = filterController.getFilter() as QueryWhereExpression<unknown>;
        this._notify('filterChanged', [this._filter]);
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

Object.defineProperty(Browser, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Browser.getDefaultOptions();
   }
});
