import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_browser/resources/BrowserTemplate';
import {SyntheticEvent} from 'Vdom/Vdom';
import {ControllerClass as OperationsController} from 'Controls/operations';
import {ControllerClass as SearchController} from 'Controls/search';
import {IFilterItem} from 'Controls/filter';
import {IFilterControllerOptions, IFilterHistoryData} from 'Controls/_filter/ControllerClass';
import {EventUtils} from 'UI/Events';
import {RecordSet} from 'Types/collection';
import { IContextOptionsValue } from 'Controls/context';
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
    TKey,
    ISelectFieldsOptions
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
import {descriptor} from 'Types/entity';
import {loadAsync, isLoaded} from 'WasabyLoader/ModulesLoader';
import {IBaseAction} from "Controls/_actions/BaseAction";

type Key = string|number|null;

type TViewMode = 'search' | 'tile' | 'table' | 'list';

interface IListConfiguration extends IControlOptions, ISearchOptions, ISourceOptions,
    Required<IFilterOptions>, Required<IHierarchyOptions>, IHierarchySearchOptions,
    IMarkerListOptions, IShadowsOptions, ISelectFieldsOptions {
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
    historyItems?: IFilterItem[];
    sourceController?: SourceController;
    id?: string;
}

export interface IBrowserOptions extends IListConfiguration {
    listsOptions: IListConfiguration[];
    sourceControllerId?: string;
    _dataOptionsValue?: IContextOptionsValue;
}

interface IReceivedState {
    data: RecordSet | void | Error;
    historyItems: IFilterItem[] | IFilterHistoryData;
}

type TReceivedState = IReceivedState[] | Error | void;

type TErrbackConfig = dataSourceError.ViewConfig & { error: Error };

/**
 * Контрол "Браузер" обеспечивает связь между списком (см. {@link Controls/list:View Плоский список}, {@link Controls/grid:View Таблица}, {@link Controls/treeGrid:View Дерево}, {@link Controls/tile:View Плитка} и {@link Controls/explorer:View Иерархический проводник}) и контролами его окружения, таких как {@link Controls/search:Input Строка поиска}, {@link Controls/breadcrumbs:Path Хлебные крошки}, {@link Controls/operations:Panel Панель действий} и {@link Controls/filter:View Объединенный фильтр}.
 * @class Controls/browser:Browser
 * @public
 * @author Герасимов А.М.
 * @mixes Controls/browser:IBrowser
 * @mixes Controls/filter:IPrefetch
 * @mixes Controls/interface:IFilter
 * @mixes Controls/interface:IFilterChanged
 * @mixes Controls/interface:INavigation
 * @mixes Controls/interface:IHierarchy
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface:ISearch
 * @mixes Controls/interface:ISelectFields
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
    protected _contextState: IContextOptionsValue;

    protected _listMarkedKey: Key = null;
    private _root: Key = null;
    private _deepReload: boolean = undefined;

    protected _sourceControllerState: IControllerState;
    protected _items: RecordSet;

    private _filter: QueryWhereExpression<unknown>;
    protected _filterButtonItems: IFilterItem[];
    protected _fastFilterItems: IFilterItem[];

    protected _groupHistoryId: string;
    private _errorRegister: RegisterClass;
    private _rootChangedRegister: RegisterClass;
    private _storeCallbackIds: string[];
    private _storeCtxCallbackId: string;

    private _source: ICrudPlus | ICrud & ICrudPlus & IData;
    private _dataLoader: DataLoader = null;
    private _loading: boolean = false;

    private _operationsController: OperationsController = null;
    protected _selectedKeysCount: number | null = 0;
    protected _selectionType: TSelectionType = 'all';
    protected _isAllSelected: boolean = false;

    private _previousViewMode: TViewMode = null;
    private _viewMode: TViewMode = undefined;
    private _inputSearchValue: string = '';
    private _searchValue: string = '';
    private _misspellValue: string = '';
    private _returnedOnlyByMisspellValue: boolean = false;
    private _listsOptions: IListConfiguration[];

    protected _beforeMount(options: IBrowserOptions,
                           _: unknown,
                           receivedState?: TReceivedState): void | Promise<TReceivedState | Error | void> {
        this._initStates(options, receivedState);
        this._dataLoader = new DataLoader(this._getDataLoaderOptions(options, receivedState));

        return this._loadDependencies(options, () => {
            return this._beforeMountInternal(options, undefined, receivedState);
        });
    }

    private _beforeMountInternal(options: IBrowserOptions,
                                 _: unknown,
                                 receivedState?: TReceivedState): void | Promise<TReceivedState | Error | void> {
        if (Browser._checkLoadResult(this._listsOptions, receivedState as IReceivedState[])) {
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

                if (Browser._checkLoadResult(this._listsOptions, result as IReceivedState[])) {
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

        if (this._hasFilterSourceInOptions(options) && !isLoaded('Controls/filter')) {
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
        this._searchStartCallback = this._searchStartCallback.bind(this);

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
        if (this._inputSearchValue && this._inputSearchValue.length >= options.minSearchLength) {
            this._updateViewMode('search');
        } else {
            this._updateViewMode(options.viewMode);
        }
        this._listsOptions = Browser._getListsOptions(options);
    }

    protected _afterMount(options: IBrowserOptions): void {
        this._isMounted = true;
        if (options.useStore) {
            this._storeCallbackIds = this._createNewStoreObservers();
            this._storeCtxCallbackId = Store.onPropertyChanged('_contextName', () => {
                this._storeCallbackIds.forEach((id) => Store.unsubscribe(id));
                this._storeCallbackIds = this._createNewStoreObservers();
                if (!options.hasOwnProperty('searchValue') && this._searchValue) {
                    this._setSearchValue('');
                    this._getSearchControllerSync()?.reset(true);
                }
            }, true);
        }
    }

    private _validateSearchOptions(options: IBrowserOptions): void {
        if (options.hasOwnProperty('searchValue') && options.searchValue === undefined) {
            Logger.error('Controls/browser:Browser опция searchValue имеет некорректный тип, необходимо передавать строкой', this);
        }
    }

    protected _operationPanelItemClick(
        event: SyntheticEvent,
        action: IBaseAction,
        clickEvent: SyntheticEvent
    ): void {
        event.stopImmediatePropagation();
        this._getOperationsController().executeAction({
            action,
            source: this._source,
            target: clickEvent,
            selection: {
                selected: this._options.selectedKeys,
                excluded: this._options.excludedKeys
            },
            filter: this._filter,
            keyProperty: this._getSourceController().getKeyProperty(),
            parentProperty: this._getSourceController().getParentProperty(),
            nodeProperty: this._options.nodeProperty,
            sourceController: this._getSourceController()
        });
    }

    protected _createNewStoreObservers(): string[] {
        const sourceCallbackId = Store.onPropertyChanged('filterSource', (filterSource: IFilterItem[]) => {
                this._filterItemsChanged(null, filterSource);
        });
        const selectedTypeChangedCallbackId = Store.onPropertyChanged('selectedType', (type: string) => {
            this._selectedTypeChangedHandler(null, type);
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
            searchValueCallbackId,
            selectedTypeChangedCallbackId
        ];
    }

    protected _beforeUpdate(newOptions: IBrowserOptions): void | Promise<RecordSet> {
        return this._loadDependencies(newOptions, () => {
            return this._beforeUpdateInternal(newOptions);
        });
    }

    protected _beforeUpdateInternal(newOptions: IBrowserOptions): void | Promise<RecordSet> {
        if (newOptions.listsOptions) {
            if (!isEqual(newOptions.listsOptions, this._options.listsOptions)) {
                this._listsOptions = Browser._getListsOptions(newOptions);
            }
            this._listsOptions.forEach((options, index) => {
                this._update(
                    {...this._options, ...this._options.listsOptions[index]},
                    {...newOptions, ...options},
                    options.id
                );
            });
        } else {
            this._listsOptions = Browser._getListsOptions(newOptions);
            return this._update(this._options, newOptions);
        }
    }

    private _update(options: IBrowserOptions, newOptions: IBrowserOptions, id?: string): void | Promise<RecordSet> {
        const sourceChanged = options.source !== newOptions.source;
        const hasSearchValueInOptions = newOptions.searchValue !== undefined;
        const isInputSearchValueLongerThenMinSearchLength = this._inputSearchValue && this._inputSearchValue.length >= this._options.minSearchLength;
        const searchValueOptionsChanged = options.searchValue !== newOptions.searchValue;
        const searchValueChanged = this._searchValue !== newOptions.searchValue;
        let methodResult;

        this._getOperationsController().update(newOptions);
        if (newOptions.hasOwnProperty('markedKey') && newOptions.markedKey !== undefined) {
            this._listMarkedKey = this._getOperationsController().setListMarkedKey(newOptions.markedKey);
        }

        if (this._dataLoader.getFilterController(id)?.update(this._getFilterControllerOptions(newOptions)) ||
            !isEqual(options.filter, newOptions.filter)) {
            this._updateFilterAndFilterItems(newOptions, id);
        }

        if (sourceChanged) {
            this._source = newOptions.source;
        }

        if (newOptions.root !== options.root) {
            this._root = newOptions.root;
            this._getSearchControllerSync(id)?.setRoot(newOptions.root);
        }

        if (options.viewMode !== newOptions.viewMode) {
            if (this._isSearchViewMode()) {
                this._previousViewMode = newOptions.viewMode;
            } else {
                this._updateViewMode(newOptions.viewMode);
            }
        }

        const sourceController = this._getSourceController(id);
        let source;
        if (sourceChanged) {
            source = newOptions.source;
        } else if (sourceController.getSource() !== newOptions.source) {
            source = this._getOriginalSource(newOptions);
        } else {
            source = newOptions.source;
        }
        const isChanged = sourceController.updateOptions({
            ...newOptions,
            ...this._getSourceControllerOptions(newOptions),
            source
        });

        if (searchValueOptionsChanged && searchValueChanged) {
            this._inputSearchValue = newOptions.searchValue;

            if (!newOptions.searchValue && sourceChanged && this._getSearchControllerSync()) {
                this._resetSearch();
                sourceController.setFilter(this._filter);
            }
        }

        if (isChanged && Browser._hasInOptions(newOptions, ['source'])) {
            methodResult = this._reload(newOptions, id);
        } else if (isChanged) {
            this._afterSourceLoad(sourceController, newOptions);
        } else {
            this._updateItemsOnState();
        }

        const selectedKeysChanged = !isEqual(options.selectedKeys, newOptions.selectedKeys);
        const excludedKeysChanged = !isEqual(options.excludedKeys, newOptions.excludedKeys);
        const expandedItemsChanged = !isEqual(options.expandedItems, newOptions.expandedItems);
        if (!isChanged && (selectedKeysChanged || excludedKeysChanged || expandedItemsChanged)) {
            this._updateContext();
        }
        if (expandedItemsChanged) {
            sourceController.setExpandedItems(newOptions.expandedItems);
        }

        if (isChanged && isInputSearchValueLongerThenMinSearchLength && hasSearchValueInOptions && !newOptions.searchValue) {
            this._inputSearchValue = '';
        }

        if ((hasSearchValueInOptions && searchValueChanged) || options.searchParam !== newOptions.searchParam || options.startingWith !== newOptions.startingWith) {
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
            if (this._destroyed) {
                return ;
            }
            this._validateSearchOptions(newOptions);
            const updateResult = searchController.update({
                ...newOptions,
                sourceController: this._getSourceController(),
                root: this._root
            });

            if (updateResult instanceof Promise) {
                this._loading = true;
                updateResult.catch(this._processSearchError);
            }

            return updateResult;
        }).catch((error) => error);
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

    private _getRootChangedRegister(): RegisterClass {
        if (!this._rootChangedRegister) {
            this._rootChangedRegister = new RegisterClass({register: 'rootChanged'});
        }
        return this._rootChangedRegister;
    }

    private _setItemsAndUpdateContext(): void {
        this._updateItemsOnState();
        this._getSourceController().subscribe('rootChanged', this._rootChanged.bind(this));
        this._updateContext();
    }

    private _updateItemsOnState(): void {
        // TODO items надо распространять либо только по контексту, либо только по опциям. Щас ждут и так и так
        const sourceControllerItems = this._getSourceController().getItems();
        if (!this._items || this._items !== sourceControllerItems) {
            this._items = sourceControllerItems;
        }
    }

    protected _getSourceController(id?: string): SourceController {
        return this._dataLoader.getSourceController(id);
    }

    protected _cancelLoading(): void {
        this._dataLoader.each(({sourceController}) => {
            sourceController?.cancelLoading();
        });
    }

    private _getSearchController(): Promise<SearchController> {
        return this._dataLoader.getSearchController();
    }

    private _getSearchControllerSync(id?: string): SearchController {
        return this._dataLoader.getSearchControllerSync(id);
    }

    protected _handleItemOpen(root: Key, items: RecordSet): void {
        const currentRoot = this._root;
        if (this._isSearchViewMode() && this._options.searchNavigationMode === 'expand') {
            this._notify('expandedItemsChanged', [this._getSearchControllerSync().getExpandedItemsForOpenRoot(root, items)]);

            if (!this._deepReload) {
                this._deepReload = true;
            }
        } else if (!this._options.hasOwnProperty('root')) {
            this._getSearchControllerSync()?.setRoot(root);
            this._root = root;
        }
        if (root !== currentRoot && this._getSearchControllerSync()) {
            this._inputSearchValue = '';

            if (this._searchValue) {
                this._resetSearch();
                if (this._options.useStore) {
                    Store.sendCommand('resetSearch');
                }
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

    protected _breadCrumbsItemClick(event: SyntheticEvent, root: Key): void {
        this._getRootChangedRegister().start(root);
    }

    protected _rootChanged(event: SyntheticEvent, root: Key, id?: string): void {
        if (!Browser._hasRootInOptions(this._options)) {
            this._setRoot(root, id);
            // Стейт _root не реактивный, поэтому необходимо звать forceUpdate
            this._forceUpdate();
        }
        this._notify('rootChanged', [root, id]);
    }

    protected _setRoot(root: Key, id?: string): void {
        if (this._listsOptions && id) {
            this._getListOptionsById(id).root = root;
        } else {
            this._root = root;
        }
    }

    protected _getListOptionsById(id: string): IBrowserOptions {
        return this._listsOptions.find((options: IBrowserOptions) => {
            return options.id === id;
        }) || this._options;
    }

    protected _historySaveCallback(historyData: Record<string, any>, items: IFilterItem[]): void {
        if (this._mounted && !this._destroyed) {
            this?._notify('historySave', [historyData, items]);
        }
    }

    protected _filterItemsChanged(event: SyntheticEvent, items: IFilterItem[]): void {
        if (!this._hasFilterSourceInOptions(this._options)) {
            Logger.error(
                'Browser: для корректной работы фильтра необходимо передать опцию filterButtonSource',
                this
            );
        }
        this._dataLoader.getFilterController().updateFilterItems(items);
        this._updateFilterAndFilterItems(this._options);
        this._contextState = {
            ...this._contextState,
            filter: this._filter
        };
        this._notify('filterChanged', [this._filter]);
    }

    private _updateContext(): void {
        const sourceControllerState = this._getSourceController().getState();
        this._contextState = {
            ...sourceControllerState,
            listsConfigs: this._dataLoader.getState(),
            listsSelectedKeys: this._getOperationsController().getSelectedKeysByLists(),
            listsExcludedKeys: this._getOperationsController().getExcludedKeysByLists()
        };
        this._sourceControllerState = sourceControllerState;
    }

    protected _filterHistoryApply(event: SyntheticEvent, history: IFilterItem[]): void {
        this._dataLoader.getFilterController().updateHistory(history);
    }

    private _updateFilterAndFilterItems(options: IBrowserOptions): void {
        if (this._hasFilterSourceInOptions(options)) {
            const filterController = this._dataLoader.getFilterController();
            this._filter = filterController.getFilter() as QueryWhereExpression<unknown>;
            this._filterButtonItems = filterController.getFilterButtonItems();
            this._fastFilterItems = filterController.getFastFilterItems();
        } else {
            this._filter = options.filter || {};
        }
    }

    protected _processLoadError(error: Error): void {
        if (error && !error.isCanceled) {
            this._onDataError(null, {
                error,
                mode: dataSourceError.Mode.include
            } as TErrbackConfig);
        }
    }

    protected _onDataError(event: SyntheticEvent, errbackConfig: TErrbackConfig): void {
        this._getErrorRegister().start(errbackConfig);
    }

    protected _registerHandler(event: Event, registerType: string,
                               component: unknown, callback: Function, config: object): void {
        this._getErrorRegister().register(event, registerType, component, callback, config);
        this._getOperationsController().registerHandler(event, registerType, component, callback, config);
        this._getRootChangedRegister().register(event, registerType, component, callback, config);
    }

    protected _unregisterHandler(event: Event, registerType: string, component: unknown, config: object): void {
        this._getErrorRegister().unregister(event, registerType, component, config);
        this._getOperationsController().unregisterHandler(event, registerType, component, config);
        this._getRootChangedRegister().unregister(event, registerType, component, config);
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

    private _getSourceControllerOptions(options: IListConfiguration): ISourceControllerOptions {
        const root = options.id ? options.root : this._root;
        const filter = options.id ? options.filter : this._filter;
        return {
            filter,
            navigationParamsChangedCallback: this._notifyNavigationParamsChanged,
            dataLoadErrback: this._dataLoadErrback,
            dataLoadCallback: this._dataLoadCallback,
            root
        };
    }

    private _getDataLoaderOptions(
        options: IBrowserOptions,
        receivedState?: TReceivedState
    ): IDataLoaderOptions {
        const loadDataConfigs = (Browser._getListsOptions(options)).map((listOptions, index) => {
            return {
                ...listOptions,
                ...this._getSourceControllerOptions(listOptions),
                searchValue: this._getSearchValue(options),
                items: receivedState?.[index]?.data,
                historyItems: receivedState?.[index]?.historyItems || listOptions.historyItems,
                source: receivedState ? this._getOriginalSource(listOptions as IBrowserOptions) : listOptions.source,
                searchStartCallback: this._searchStartCallback,
                sourceController: Browser._getSourceControllerForDataLoader(options)
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

    private _searchStartCallback(filter: QueryWhereExpression<unknown>): void {
        if (this._isMounted) {
            this._notify('searchStart', [filter]);
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
        event?.stopPropagation();
        this._listsOptions.forEach(({searchParam, id}, index) => {
            if (searchParam) {
                this._loading = true;
                searchPromises.push(this._dataLoader.getSearchController(id).then((searchController) => {
                    return searchController.search(value).finally(() => {
                        if (!this._destroyed) {
                            this._loading = false;
                            this._afterSourceLoad(
                                this._getSourceController(id),
                                this._listsOptions[index] as IBrowserOptions
                            );
                            this._updateItemsOnState();
                        }
                    });
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
        this._returnedOnlyByMisspellValue = false;
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
        this._returnedOnlyByMisspellValue =
            this._getSearchControllerSync().needChangeSearchValueToSwitchedString(recordSet) &&
            !!this._misspellValue;
        this._updateContext();
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
            this._misspellValue = searchController.getMisspellValue();
            if (searchController.isSearchInProcess() || searchController.getSearchValue() !== this._searchValue) {
                this._afterSearch(data);
            }
        }

        if (this._isSearchViewMode() && !this._searchValue) {
            this._updateViewMode(this._previousViewMode);
            this._previousViewMode = null;
        }
        this._updateContext();
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

    private _reload(options: IBrowserOptions, id?: string): Promise<RecordSet> {
        const sourceController = this._getSourceController(id);

        this._loading = true;
        return sourceController.reload()
            .then((items) => {
                this._updateItemsOnState();
                return items;
            })
            .catch((error) => {
                this._processLoadError(error);
                return error;
            })
            .finally(() => {
                if (!this._destroyed) {
                    this._loading = false;
                    this._afterSourceLoad(sourceController, options);
                }
            })
            .then((result) => {
                if (!this._destroyed) {
                    return this._updateSearchController(options).then(() => result);
                }
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
            // Состояние _filter - не реактивное, и в случае,
            // если не задают опцию filter, то _beforeUpdate не будет вызван и данные не перезагрузятся,
            // т.к. sourceController обновляется только на _beforeUpdate
            this._forceUpdate();
        }
    }

    private _hasFilterSourceInOptions(options: IBrowserOptions): boolean {
        return Browser._hasInOptions(options, ['filterButtonSource', 'fastFilterSource']) ||
               (!!this._getSearchValue(options) && !options.filter?.[options.searchParam]);
    }

    private static _getSourceControllerForDataLoader(
        {sourceController, sourceControllerId, _dataOptionsValue}: IBrowserOptions
    ): SourceController|void {
        let browserSourceController;

        if (sourceController) {
            browserSourceController = sourceController;
        }

        if (!sourceController) {
            if (_dataOptionsValue && sourceControllerId && _dataOptionsValue.listsConfigs[sourceControllerId]) {
                browserSourceController = _dataOptionsValue.listsConfigs[sourceControllerId].sourceController;
            } else if (_dataOptionsValue?.sourceController) {
                browserSourceController = _dataOptionsValue.sourceController;
            }
        }

        return browserSourceController;
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

    private static _hasInOptions(browserOptions: IBrowserOptions, options: string[]): boolean {
        return options.some((option) => {
            return Browser._getListsOptions(browserOptions).filter((listOptions) => {
                return listOptions[option] !== undefined;
            }).length > 0;
        });
    }

    private static _hasSearchParamInOptions(options: IBrowserOptions): boolean {
        return Browser._hasInOptions(options, ['searchParam']);
    }

    private static _hasRootInOptions(options: IBrowserOptions): boolean {
        return Browser._hasInOptions(options, ['root']);
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
