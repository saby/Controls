import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_browser/resources/BrowserTemplate';
import {SyntheticEvent} from 'Vdom/Vdom';
import {ControllerClass as OperationsController} from 'Controls/operations';
import {ControllerClass as SearchController} from 'Controls/search';
import {IFilterItem} from 'Controls/filter';
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
    TSelectionType,
    ISelectionObject,
    TKey
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
import {Logger} from 'UI/Utils';
import {descriptor, Model} from 'Types/entity';
import {loadAsync, isLoaded} from 'WasabyLoader/ModulesLoader';

type Key = string|number|null;

type TViewMode = 'search' | 'tile' | 'table' | 'list';

interface IListConfiguration extends IControlOptions, ISearchOptions, ISourceOptions,
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
    fastFilterSource?: unknown;
    historyItems?: IFilterItem[]
}

export interface IBrowserOptions extends IListConfiguration {
    listsOptions: IListConfiguration[];
}

interface IReceivedState {
    data: RecordSet | void | Error;
    historyItems: IFilterItem[] | IFilterHistoryData;
}

type TReceivedState = IReceivedState[] | Error | void;

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
 * @mixes Controls/filter:IPrefetch
 * @mixes Controls/interface:IFilter
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/interface:INavigation
 * @mixes Controls/interface:IHierarchy
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface:ISearch
 * @mixes Controls/interface/IHierarchySearch
 *
 * @demo Controls-demo/Search/FlatList/Index
 */
export default class Browser extends Control<IBrowserOptions, TReceivedState> {
    protected _template: TemplateFunction = template;
    protected _notifyHandler: Function = EventUtils.tmplNotify;
    private _isMounted: boolean;

    protected _topShadowVisibility: SHADOW_VISIBILITY | 'gridauto' = SHADOW_VISIBILITY.AUTO;
    protected _bottomShadowVisibility: SHADOW_VISIBILITY | 'gridauto' = SHADOW_VISIBILITY.AUTO;

    private _listMarkedKey: Key = null;
    private _root: Key = null;
    private _deepReload: boolean = undefined;

    private _dataOptionsContext: typeof ContextOptions;
    private _sourceControllerState: IControllerState;
    private _items: RecordSet;

    private _filter: QueryWhereExpression<unknown>;
    private _filterButtonItems: IFilterItem[];
    private _fastFilterItems: IFilterItem[];

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
    private _misspellValue: string = '';

    protected _beforeMount(options: IBrowserOptions,
                           context?: typeof ContextOptions,
                           receivedState?: TReceivedState): void | Promise<TReceivedState | Error | void> {
        this._initStates(options, receivedState);
        this._dataLoader = new DataLoader(this._getDataLoaderOptions(options, receivedState));

        return this._loadDependencies(options, () => {
            return this._beforeMountInternal(options, context, receivedState);
        });
    }

    private _beforeMountInternal(options: IBrowserOptions,
                                 context?: typeof ContextOptions,
                                 receivedState?: TReceivedState): void | Promise<TReceivedState | Error | void> {
        if (Browser._checkLoadResult(Browser._getListsOptions(options), receivedState as IReceivedState[])) {
            this._updateFilterAndFilterItems(options);
            this._defineShadowVisibility(receivedState[0].data);
            this._setItemsAndUpdateContext();
            if (options.source && options.dataLoadCallback) {
                options.dataLoadCallback(receivedState[0].data);
            }
        } else if (options.source || options.filterButtonSource || options.fastFilterSource || options.listsOptions) {
            if (options.fastFilterSource) {
                Logger.warn('Browser: контрол Controls/deprecatedFilter:Fast является устаревшим и будет удалён в 21.3100', this);
            }
            return this._dataLoader.load<ILoadDataResult>().then((result) => {
                this._updateFilterAndFilterItems(options);
                this._defineShadowVisibility(result[0].data);

                if (Browser._checkLoadResult(Browser._getListsOptions(options), result as IReceivedState[])) {
                    this._setItemsAndUpdateContext();
                    return result.map(({data, historyItems}) => {
                        return {
                            historyItems,
                            data
                        };
                    });
                } else {
                    this._updateContext();
                    return result[0].error;
                }
            });
        } else {
            this._updateContext();
        }
    }

    private _loadDependencies<T>(options: IBrowserOptions, callback: Function): Promise<T>|void {
        const deps = [];

        if (Browser._hasSearchParamInOptions(options) && !isLoaded('Controls/search')) {
            deps.push(loadAsync('Controls/search'));
        }

        if (Browser._hasFilterSourceInOptions(options) && !isLoaded('Controls/filter')) {
            deps.push(loadAsync('Controls/filter'));
        }

        if (deps.length) {
            return Promise.all(deps).then(() => {
               return callback();
            });
        } else {
            return callback();
        }
    }

    private _initStates(options: IBrowserOptions, receivedState: TReceivedState): void {
        this._itemOpenHandler = this._itemOpenHandler.bind(this);
        this._dataLoadCallback = this._dataLoadCallback.bind(this);
        this._dataLoadErrback = this._dataLoadErrback.bind(this);
        this._notifyNavigationParamsChanged = this._notifyNavigationParamsChanged.bind(this);

        if (options.root !== undefined) {
            this._root = options.root;
        }

        this._source = receivedState ? this._getOriginalSource(options) : options.source;

        if (options.useStore) {
            this._inputSearchValue = this._searchValue = Store.getState().searchValue as unknown as string || '';
        } else if (options.searchValue) {
            this._inputSearchValue = this._searchValue = options.searchValue;
        }

        this._filter = options.filter || {};
        this._groupHistoryId = options.groupHistoryId;

        // на mount'e не доступен searchController, т.к. он грузится асинхронно, поэтому логика тут нужна
        this._previousViewMode = this._viewMode = options.viewMode;
        if (this._inputSearchValue && this._inputSearchValue.length > options.minSearchLength) {
            this._updateViewMode('search');
        } else {
            this._updateViewMode(options.viewMode);
        }
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

    protected _operationPanelItemClick(
        event: SyntheticEvent,
        item: Model,
        clickEvent: SyntheticEvent,
        selection: ISelectionObject
    ): void {
        event.stopImmediatePropagation();
        this._getOperationsController().executeAction({
            target: clickEvent,
            selection,
            item,
            filter: this._filter
        });
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
                    this._searchResetHandler();
                }
           });

        return [
            sourceCallbackId,
            filterSourceCallbackId,
            searchValueCallbackId
        ];
    }

    protected _beforeUpdate(newOptions: IBrowserOptions, context: typeof ContextOptions): void | Promise<RecordSet> {
        return this._loadDependencies(newOptions, () => {
            return this._beforeUpdateInternal(newOptions, context);
        });
    }

    protected _beforeUpdateInternal(newOptions: IBrowserOptions, context: typeof ContextOptions): void | Promise<RecordSet> {
        if (newOptions.listsOptions) {
            // TODO доделать обновление по listsOptions
            return;
        }

        const sourceChanged = this._options.source !== newOptions.source;
        const hasSearchValueInOptions = newOptions.searchValue !== undefined;
        const isInputSearchValueLongerThenMinSearchLength = this._inputSearchValue && this._inputSearchValue.length >= this._options.minSearchLength;
        const searchValueOptionsChanged = this._options.searchValue !== newOptions.searchValue;
        const searchValueChanged = this._searchValue !== newOptions.searchValue;
        let methodResult;

        this._getOperationsController().update(newOptions);
        if (newOptions.hasOwnProperty('markedKey') && newOptions.markedKey !== undefined) {
            this._listMarkedKey = this._getOperationsController().setListMarkedKey(newOptions.markedKey);
        }

        if (this._dataLoader.getFilterController()?.update(this._getFilterControllerOptions(newOptions))) {
            this._updateFilterAndFilterItems(newOptions);
        }

        if (sourceChanged) {
            this._source = newOptions.source;
        }

        if (newOptions.root !== this._options.root) {
            this._root = newOptions.root;
            this._getSearchControllerSync()?.setRoot(newOptions.root);
        }

        if (this._options.viewMode !== newOptions.viewMode) {
            if (this._isSearchViewMode()) {
                this._previousViewMode = newOptions.viewMode;
            } else {
                this._updateViewMode(newOptions.viewMode);
            }
        }

        const sourceController = this._getSourceController();
        const isChanged = sourceController.updateOptions({...newOptions, ...this._getSourceControllerOptions()});

        if (searchValueOptionsChanged && searchValueChanged) {
            this._inputSearchValue = newOptions.searchValue;

            if (!newOptions.searchValue && sourceChanged && this._getSearchControllerSync()) {
                this._resetSearch();
            }
        }

        if (isChanged && this._source) {
            methodResult = this._reload(newOptions);
        } else if (isChanged) {
            this._afterSourceLoad(sourceController, newOptions);
        }

        const selectedKeysChanged = !isEqual(this._options.selectedKeys, newOptions.selectedKeys);
        const excludedKeysChanged = !isEqual(this._options.excludedKeys, newOptions.excludedKeys);
        if (!isChanged && (selectedKeysChanged || excludedKeysChanged)) {
            this._updateContext();
        }

        if (isChanged && isInputSearchValueLongerThenMinSearchLength && hasSearchValueInOptions && !newOptions.searchValue) {
            this._inputSearchValue = '';
        }

        if ((hasSearchValueInOptions && searchValueChanged) || this._options.searchParam !== newOptions.searchParam || this._options.startingWith !== newOptions.startingWith) {
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
                updateResult.catch(() => this._processSearchError);
            }

            return updateResult;
        });
    }

    private _afterSourceLoad(sourceController: SourceController, options: IBrowserOptions): void {
        // TODO filter надо распространять либо только по контексту, либо только по опциям. Щас ждут и так и так
        this._filter = sourceController.getState().filter;
        this._updateContext();
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

    private _setItemsAndUpdateContext(): void {
        const sourceController = this._getSourceController();
        // TODO items надо распространять либо только по контексту, либо только по опциям. Щас ждут и так и так
        this._items = sourceController.getItems();
        sourceController.subscribe('rootChanged', this._rootChanged.bind(this));
        this._updateContext();
    }

    protected _getSourceController(): SourceController {
        return this._dataLoader.getSourceController();
    }

    protected _cancelLoading(): void {
        this._dataLoader.each(({sourceController}) => {
            sourceController?.cancelLoading();
        });
    }

    private _getSearchController(): Promise<SearchController> {
        return this._dataLoader.getSearchController();
    }

    private _getSearchControllerSync(): SearchController {
        return this._dataLoader.getSearchControllerSync();
    }

    protected _handleItemOpen(root: Key, items: RecordSet, dataRoot: Key = null): void {
        if (this._isSearchViewMode() && this._options.searchNavigationMode === 'expand') {
            this._notify('expandedItemsChanged', [this._getSearchControllerSync().getExpandedItemsForOpenRoot(root, items)]);

            if (!this._deepReload) {
                this._deepReload = true;
            }
        } else if (!this._options.hasOwnProperty('root')) {
            this._getSearchControllerSync()?.setRoot(root);
            this._root = root;
        }
        if (root !== dataRoot && this._getSearchControllerSync()) {
            this._resetSearch();
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
        event?.stopPropagation();
        this._dataLoader.getFilterController()?.setFilter(filter);
        this._filter = filter;
        this._notify('filterChanged', [this._filter]);
    }

    protected _rootChanged(event: SyntheticEvent, root: Key): void {
        if (this._options.root === undefined) {
            this._root = root;
            // Стейт _root не реактивный, поэтому необходимо звать forceUpdate
            this._forceUpdate();
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
        this._updateFilterAndFilterItems(this._options);
        this._dataOptionsContext.filter = this._filter;
        this._notify('filterChanged', [this._filter]);
    }

    protected _getChildContext(): IDataChildContext {
        return {
            dataOptions: this._dataOptionsContext
        };
    }

    private _updateContext(): void {
        const sourceControllerState = this._getSourceController().getState();
        const contextState = {
            ...sourceControllerState,
            listsConfigs: this._dataLoader.getState(),
            listsSelectedKeys: this._getOperationsController().getSelectedKeysByLists(),
            listsExcludedKeys: this._getOperationsController().getExcludedKeysByLists()
        };

        if (!this._dataOptionsContext) {
            this._dataOptionsContext = new ContextOptions(contextState);
        } else {
            const curContext = this._dataOptionsContext;

            for (const i in contextState) {
                if (contextState.hasOwnProperty(i)) {
                    curContext[i] = contextState[i];
                }
            }
            curContext.updateConsumers();
        }
        this._sourceControllerState = sourceControllerState;
    }

    protected _filterHistoryApply(event: SyntheticEvent, history: IFilterItem[]): void {
        this._dataLoader.getFilterController().updateHistory(history);
    }

    private _updateFilterAndFilterItems(options: IBrowserOptions): void {
        if (Browser._hasFilterSourceInOptions(options)) {
            const filterController = this._dataLoader.getFilterController();
            this._filter = filterController.getFilter() as QueryWhereExpression<unknown>;
            this._filterButtonItems = filterController.getFilterButtonItems();
            this._fastFilterItems = filterController.getFastFilterItems();
        } else {
            this._filter = options.filter || {};
        }
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

    protected _selectedKeysCountChanged(e: SyntheticEvent, count: number|null, isAllSelected: boolean, id?: string): void {
        e.stopPropagation();
        const result = this._getOperationsController().updateSelectedKeysCount(count, isAllSelected, id);
        this._selectedKeysCount = result.count;
        this._isAllSelected = result.isAllSelected;
    }

    protected _listSelectionTypeForAllSelectedChanged(event: SyntheticEvent, selectionType: TSelectionType): void {
        event.stopPropagation();
        this._selectionType = selectionType;
    }

    protected _excludedKeysChanged(event: SyntheticEvent, ...args: [TKey[], TKey[], TKey[], string?]): void {
        args[0] = args[3] ? this._getOperationsController().updateExcludedKeys(...args) : args[0];
        this._notify('excludedKeysChanged', args);
    }

    protected _selectedKeysChanged(event: SyntheticEvent, ...args: [TKey[], TKey[], TKey[], string?]): void {
        args[0] = args[3] ? this._getOperationsController().updateSelectedKeys(...args) : args[0];
        this._notify('selectedKeysChanged', args);
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
            selectionViewModeChangedCallback: (type) => {
                this._notify('selectionViewModeChanged', [type]);
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

    private _getSourceControllerOptions(): ISourceControllerOptions {
        return {
            filter: this._filter,
            source: this._source,
            navigationParamsChangedCallback: this._notifyNavigationParamsChanged,
            dataLoadErrback: this._dataLoadErrback,
            dataLoadCallback: this._dataLoadCallback,
            root: this._root
        };
    }

    private _getDataLoaderOptions(options: IBrowserOptions, receivedState?: TReceivedState): IDataLoaderOptions {
        const additionalLoaderOptions = {
            ...this._getSourceControllerOptions(),
            searchValue: this._getSearchValue(options)
        };
        const loadDataConfigs = (Browser._getListsOptions(options)).map((listOptions, index) => {
            return {
                ...listOptions,
                ...additionalLoaderOptions,
                items: receivedState?.[index]?.data,
                historyItems: receivedState?.[index]?.historyItems || listOptions.historyItems,
                source: receivedState ? this._getOriginalSource(listOptions as IBrowserOptions) : listOptions.source
            };
        });

        return {loadDataConfigs} as IDataLoaderOptions;
    }

    private _getSearchValue(options: IBrowserOptions): string {
        return options.hasOwnProperty('searchValue') ? options.searchValue : this._searchValue;
    }

    private _getFilterControllerOptions(options: IBrowserOptions): IFilterControllerOptions {
       return {
           ...options,
           searchValue: this._getSearchValue(options),
           historySaveCallback: this._historySaveCallback.bind(this)
        } as IFilterControllerOptions;
    }

    private _notifyNavigationParamsChanged(params: unknown): void {
        if (this._isMounted) {
            this._notify('navigationParamsChanged', [params]);
        }
    }

    private _getOriginalSource(options: IBrowserOptions): ICrudPlus | ICrud & ICrudPlus & IData {
        let source;

        if (options.source instanceof PrefetchProxy) {
            source = options.source.getOriginal();
        } else {
            source = options.source;
        }

        return source;
    }

    protected _search(event: SyntheticEvent, value: string): Promise<Error|RecordSet[]|void> {
        const searchPromises = [];

        this._inputSearchValue = value;
        this._loading = true;
        event?.stopPropagation();
        this._dataLoader.each((config, id) => {
            if (config.searchParam) {
                searchPromises.push(this._dataLoader.getSearchController(id).then((searchController) => {
                    return searchController.search(value);
                }));
            }
        });

        return Promise.all(searchPromises).catch((error) => {
            return this._processSearchError(error);
        });
    }

    private _resetSearch(): void {
        const configsCount = Object.keys(this._dataLoader.getState()).length;

        if (configsCount > 1) {
            this._dataLoader.each(({searchController}) => {
                searchController.reset(Object.keys(this._dataLoader.getState()).length === 1);
            });
        } else {
            const filter = this._getSearchControllerSync().reset(true);
            if (!isEqual(this._filter, filter)) {
                this._filterChanged(null, filter);
            }
        }

        this._setSearchValue('');
    }

    protected _inputSearchValueChanged(event: SyntheticEvent, value: string): void {
        this._inputSearchValue = value;
    }

    private _processSearchError(error: Error): void|Error {
        if (!error.isCanceled) {
            this._loading = false;
            this._updateParams();
            this._filterChanged(null, this._dataLoader.getSearchControllerSync().getFilter());
            this._getErrorRegister().start({
                error,
                mode: dataSourceError.Mode.include
            });
            return error;
        }
    }

    private _searchResetHandler(): Promise<void> {
        this._cancelLoading();
        return this._getSearchController().then(() => {
            this._resetSearch();
            this._updateRootAfterSearch();
        });
    }

    private _afterSearch(recordSet: RecordSet): void {
        this._updateParams();
        this._filterChanged(null, this._getSearchControllerSync().getFilter());
        if (this._getSearchControllerSync().needChangeSearchValueToSwitchedString(recordSet)) {
            this._setSearchValue(this._misspellValue);
        }
    }

    private _setSearchValue(value: string): void {
        this._searchValue = value;
        this._notify('searchValueChanged', [value]);
    }

    private _updateParams(): void {
        if (this._viewMode !== 'search') {
            this._updateViewMode('search');
            this._updateRootAfterSearch();
        }
        this._setSearchValue(this._getSearchControllerSync().getSearchValue());
    }

    private _updateRootAfterSearch(): void {
        const newRoot = this._getSearchControllerSync().getRoot();

        if (newRoot !== this._root) {
            this._rootChanged(null, newRoot);
        }
    }

    private _updateViewMode(newViewMode: TViewMode): void {
        this._previousViewMode = this._viewMode;
        this._viewMode = newViewMode;
    }

    private _handleDataLoad(data: RecordSet): void {
        const searchController = this._getSearchControllerSync();

        if (this._deepReload) {
            this._deepReload = undefined;
        }

        if (this._loading) {
            this._afterSourceLoad(this._getSourceController(), this._options);
            this._loading = false;
        }

        if (searchController) {
            if (searchController.isSearchInProcess() || searchController.getSearchValue() !== this._searchValue) {
                this._afterSearch(data);
            }
            this._misspellValue = searchController.getMisspellValue();
        }

        if (this._isSearchViewMode() && !this._searchValue) {
            this._updateViewMode(this._previousViewMode);
            this._previousViewMode = null;
        }
    }

    private _dataLoadCallback(data: RecordSet, direction?: Direction): void {
        this._dataLoader.getFilterController()?.handleDataLoad(data);
        this._handleDataLoad(data);

        if (this._options.dataLoadCallback) {
            this._options.dataLoadCallback(data, direction);
        }
    }

    private _dataLoadErrback(error: Error): void {
        this._dataLoader.getFilterController()?.handleDataError();
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
        this._misspellValue = '';
    }

    resetPrefetch(): void {
        if (!this._getSourceController().isLoading()) {
            const filterController = this._dataLoader.getFilterController();
            filterController.resetPrefetch();
            this._filter = filterController.getFilter() as QueryWhereExpression<unknown>;
            this._notify('filterChanged', [this._filter]);
        }
    }

    private static _checkLoadResult(options: IListConfiguration[], loadResult: IReceivedState[] = []): boolean {
        return loadResult && loadResult.filter(
            (result, index) =>
                (!options[index].filterButtonSource || result.historyItems !== undefined) &&
                result.data !== undefined && !result.error
        ).length > 0;
    }

    private static _getListsOptions(options: IBrowserOptions): IListConfiguration[] {
        return options.listsOptions || [options];
    }

    private static _hasSearchParamInOptions(options: IBrowserOptions): boolean {
        return Browser._getListsOptions(options).filter((listOptions) => {
            return listOptions.searchParam;
        }).length > 0;
    }

    private static _hasFilterSourceInOptions(options: IBrowserOptions): boolean {
        return Browser._getListsOptions(options).filter((listOptions) => {
            return listOptions.filterButtonSource || listOptions.fastFilterSource || listOptions.searchValue;
        }).length > 0;
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
            startingWith: 'root',
            filter: {}
        };
    }

    static getOptionTypes(): object {
        return {
            searchValue: descriptor(String)
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
