import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!Controls/_browser/resources/BrowserTemplate';
import { SyntheticEvent } from 'Vdom/Vdom';
import { ControllerClass as OperationsController } from 'Controls/operations';
import { ControllerClass as SearchController } from 'Controls/search';
import { ControllerClass as FilterController, IFilterItem } from 'Controls/filter';
import { IFilterControllerOptions } from 'Controls/_filter/ControllerClass';
import { tmplNotify } from 'Controls/eventUtils';
import { RecordSet } from 'Types/collection';

import { ContextOptions } from 'Controls/context';
import { RegisterClass } from 'Controls/event';
import * as isNewEnvironment from 'Core/helpers/isNewEnvironment';
import {
    error as dataSourceError,
    ISourceControllerOptions,
    NewSourceController as SourceController
} from 'Controls/dataSource';
import { IControlerState } from 'Controls/_dataSource/Controller';
import { TSelectionType, Direction } from 'Controls/interface';
import Store from 'Controls/Store';
import { SHADOW_VISIBILITY } from 'Controls/scroll';
import {detection} from 'Env/Env';
import {ICrud, ICrudPlus, IData, PrefetchProxy} from "Types/source";

type Key = string|number|null;

interface IDataChildContext {
    dataOptions: unknown;
}

export default class Browser extends Control {
    protected _template: TemplateFunction = template;
    protected _notifyHandler: Function = tmplNotify;

    private _isMounted: boolean;
    private _selectedKeysCount: number|null;
    private _selectionType: TSelectionType = 'all';
    private _isAllSelected: boolean = false;
    private _operationsController: OperationsController = null;
    private _searchController: SearchController = null;
    private _filterController: FilterController = null;
    private _listMarkedKey: Key = null;
    private _dataOptions: object = null;
    private _previousViewMode: string = null;
    private _viewMode: string = undefined;
    private _searchValue: string = '';
    private _misspellValue: string = null;
    private _root: Key = null;
    private _deepReload: boolean = undefined;
    private _inputSearchValue: string = '';

    private _source: ICrudPlus | ICrud & ICrudPlus & IData;
    private _sourceController: SourceController = null;
    private _itemsReadyCallback: Function;
    private _loading: boolean = false;
    private _items: RecordSet;
    private _filter: object;
    private _filterButtonItems: IFilterItem[];
    private _fastFilterItems: IFilterItem[];
    private _groupHistoryId: string;
    private _dataOptionsContext: ContextOptions;
    private _errorRegister: RegisterClass;
    private _storeCallbacks: string[];

    private _topShadowVisibility: SHADOW_VISIBILITY = SHADOW_VISIBILITY.AUTO;
    private _bottomShadowVisibility: SHADOW_VISIBILITY = SHADOW_VISIBILITY.AUTO;

    protected _beforeMount(options,
                           context,
                           receivedState): Promise<{ items: RecordSet, filterItems: IFilterItem[] }> {
        this._itemOpenHandler = this._itemOpenHandler.bind(this);
        this._dataLoadCallback = this._dataLoadCallback.bind(this);
        this._dataLoadErrback = this._dataLoadErrback.bind(this);
        this._afterSetItemsOnReloadCallback = this._afterSetItemsOnReloadCallback.bind(this);
        this._notifyNavigationParamsChanged = this._notifyNavigationParamsChanged.bind(this);

        this._filterController = new FilterController({
            ...options,
            historySaveCallback: this._historySaveCallback.bind(this)
        });

        this._filter = options.filter;
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
        this._sourceController = new SourceController(this._getSourceControllerOptions(options));
        const controllerState = this._sourceController.getState();
        this._dataOptionsContext = this._createContext(controllerState);

        if (receivedState) {
            this._setFilterItems(receivedState.filterItems);
            this._defineShadowVisibility(receivedState.items);
            if (isNewEnvironment()) {
                this._setItemsAndCreateSearchController(receivedState.items, options);
            }
        } else {
            return this._filterController.loadFilterItemsFromHistory().then((filterItems) => {
                this._setFilterItems(filterItems);
                return this._loadItems(options, this._sourceController.getState()).then((loadResult) => {
                    if (loadResult instanceof RecordSet) {
                        this._defineShadowVisibility(loadResult);
                        return {
                            filterItems,
                            items: loadResult
                        };
                    } else {
                        this._processLoadError(loadResult);
                    }
                    return loadResult;
                });
            });
        }
    }

    protected _afterMount(options): void {
        this._isMounted = true;
        if (options.useStore) {
            const sourceCallbackId = Store.onPropertyChanged('filterSource', (filterSource) => {
                this._filterItemsChanged(null, filterSource);
            });
            const filterSourceCallbackId = Store.onPropertyChanged('filter', (filter) => {
                this._filterChanged(null, filter);
            });

            this._storeCallbacks = [sourceCallbackId, filterSourceCallbackId];
        }
    }

    protected _historySaveCallback(historyData: Record<string, any>, items: IFilterItem[]): void {
        if (this._mounted) {
            this?._notify('historySave', [historyData, items]);
        }
    }

    protected _beforeUpdate(newOptions, context): void|Promise<RecordSet> {
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

        const isChanged = this._sourceController.updateOptions(this._getSourceControllerOptions(newOptions));

        if (sourceChanged) {
            this._loading = true;
            methodResult = this._sourceController.reload()
                .then((result) => {
                    // для того чтобы мог посчитаться новый prefetch Source внутри
                    if (result instanceof RecordSet) {
                        if (newOptions.dataLoadCallback instanceof Function) {
                            newOptions.dataLoadCallback(result);
                        }
                        this._items = this._sourceController.setItems(result);
                    } else if (result instanceof Error) {
                        this._processLoadError(result);
                    }

                    const controllerState = this._sourceController.getState();

                    // TODO filter надо распространять либо только по контексту, либо только по опциям. Щас ждут и так и так
                    this._filter = controllerState.filter;
                    this._updateContext(controllerState);

                    this._loading = false;
                    this._groupHistoryId = newOptions.groupHistoryId;
                    return result;
                })
                .catch((error) => error);
        } else if (isChanged) {
            const controllerState = this._sourceController.getState();

            // TODO filter надо распространять либо только по контексту, либо только по опциям. Щас ждут и так и так
            this._filter = controllerState.filter;
            this._updateContext(controllerState);
            this._groupHistoryId = newOptions.groupHistoryId;
        }

        if (this._searchController || newOptions.searchValue) {
            this._getSearchController().update(
                this._getSearchControllerOptions(newOptions),
                {dataOptions: this._dataOptionsContext}
            );
        }

        return methodResult;
    }

    protected _beforeUnmount(): void {
        if (this._operationsController) {
            this._operationsController.destroy();
            this._operationsController = null;
        }

        if (this._searchController) {
            this._searchController.destroy();
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

    private _setFilterItems(filterItems): void {
        this._filterController.setFilterItems(filterItems);
        this._updateFilterAndFilterItems();
    }

    private _loadItems(options, controllerState): Promise<void|RecordSet|Error> {
        let result;

        if (options.source) {
            result = this._sourceController.load().then((loadResult) => {
                if (loadResult instanceof RecordSet) {
                    this._setItemsAndCreateSearchController(loadResult, options);
                }
                return loadResult;
            });
        } else {
            this._updateContext(controllerState);
            this._createSearchControllerWithContext(options, this._dataOptionsContext);
            result = Promise.resolve();
        }

        return result;
    }

    private _setItemsAndCreateSearchController(items: RecordSet, options): void {

        // TODO items надо распространять либо только по контексту, либо только по опциям. Щас ждут и так и так
        this._items = this._sourceController.setItems(items);
        const controllerState = this._sourceController.getState();
        this._updateContext(controllerState);

        if (options.searchValue || options.useStore) {
            this._createSearchControllerWithContext(options, this._dataOptionsContext);
        }
    }

    private _createSearchControllerWithContext(options, context): void {
        this._searchController = this._createSearchController(options, {dataOptions: context});
        this._searchValue = this._searchController.getSearchValue();
    }

    _itemsReadyCallbackHandler(items): void {
        if (this._items !== items) {
            this._items = this._sourceController.setItems(items);
            this._dataOptionsContext.items = this._items;
            this._dataOptionsContext.updateConsumers();
        }

        if (this._options.itemsReadyCallback) {
            this._options.itemsReadyCallback(items);
        }
    }

    protected _filterChanged(event: SyntheticEvent, filter: object): void {
        event && event.stopPropagation();
        this._filterController.setFilter(filter);

        this._sourceController.setFilter(this._filterController.getFilter());

        const controllerState = this._sourceController.getState();

        // TODO filter надо распространять либо только по контексту, либо только по опциям. Щас ждут и так и так
        this._filter = controllerState.filter;

        this._updateContext(controllerState);
        this._dataOptionsContext.updateConsumers();

        this._notify('filterChanged', [this._filter]);
    }

    protected _rootChanged(event: SyntheticEvent, root: Key): void {
        this._notify('rootChanged', [root]);
    }

    protected _itemsChanged(event: SyntheticEvent, items: RecordSet): void {
        this._sourceController.cancelLoading();
        this._items = this._sourceController.setItems(items);
        this._updateContext(this._sourceController.getState());
    }

    protected _filterItemsChanged(event: SyntheticEvent, items: IFilterItem[]): void {
        this._filterController.updateFilterItems(items);
        this._updateFilterAndFilterItems();
        this._dataOptionsContext.filter = this._filter;
        this._notify('filterChanged', [this._filter]);
    }

    protected _filterHistoryApply(event: SyntheticEvent, history): void {
        // Здесь ничего не обновляем, после стреляет filterItemsChanged
        this._filterController.updateHistory(history);
    }

    protected _getChildContext(): IDataChildContext {
        return {
            dataOptions: this._dataOptionsContext
        };
    }

    private _updateFilterAndFilterItems(): void {
        this._filter = this._filterController.getFilter();
        this._filterButtonItems = this._filterController.getFilterButtonItems();
        this._fastFilterItems = this._filterController.getFastFilterItems();
        this._sourceController.setFilter(this._filter);
    }

    private _createContext(options?: IControlerState): typeof ContextOptions {
        return new ContextOptions(options);
    }

    private _updateContext(sourceControllerState: IControlerState): void {
        const curContext = this._dataOptionsContext;

        for (const i in sourceControllerState) {
            if (sourceControllerState.hasOwnProperty(i)) {
                curContext[i] = sourceControllerState[i];
            }
        }
        curContext.updateConsumers();
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

    protected _registerHandler(event, registerType, component, callback, config): void {
        this._getErrorRegister().register(event, registerType, component, callback, config);
        this._getOperationsController().registerHandler(event, registerType, component, callback, config);
    }

    protected _unregisterHandler(event, registerType, component, config): void {
        this._getErrorRegister().unregister(event, registerType, component, config);
        this._getOperationsController().unregisterHandler(event, registerType, component, config);
    }

    protected _selectedTypeChangedHandler(event: SyntheticEvent<null>, typeName: string, limit?: number): void {
        this._getOperationsController().selectionTypeChanged(typeName, limit);
    }

    protected _selectedKeysCountChanged(e, count: number|null, isAllSelected: boolean): void {
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
        this._getSearchController().handleItemOpen(newCurrentRoot, items, dataRoot);
    }

    protected _listMarkedKeyChangedHandler(event: SyntheticEvent<null>, markedKey: Key): void {
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
        this._getOperationsController(this._options).setOperationsPanelVisible(false);
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

    _createSearchController(options, context): SearchController {
        return new SearchController(this._getSearchControllerOptions(options), context);
    }

    _getSearchControllerOptions(options): object {
        const optionsChangedCallbacks = SearchController.getStateAndOptionsChangedCallbacks(this);
        optionsChangedCallbacks.filter = this._sourceController.getFilter();
        return {...options, ...optionsChangedCallbacks};
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

    _getSearchController(): SearchController {
        if (!this._searchController) {
            this._searchController = this._createSearchController(this._options, {
                dataOptions: this._dataOptionsContext
            });
        }
        return this._searchController;
    }

    _search(event: SyntheticEvent, value: string, force: boolean): void {
        this._getSearchController().search(value, force);
    }

    _dataLoadCallback(data: RecordSet, direction: Direction): void {
        this._filterController.handleDataLoad(data);
        this._getSearchController().handleDataLoad(data);

        if (this._options.dataLoadCallback) {
            this._options.dataLoadCallback(data, direction);
        }
    }

    _dataLoadErrback(error: Error): void {
        this._filterController.handleDataError();

        if (this._options.dataLoadErrback) {
            this._options.dataLoadErrback(error);
        }
    }

    _afterSetItemsOnReloadCallback(): void {
        this._getSearchController().handleAfterSetItemsOnReload();
    }

    _misspellCaptionClick(): void {
        this._getSearchController().handleMisspellClick();
    }

    resetPrefetch(): void {
        this._filterController.resetPrefetch();
        this._filter = this._filterController.getFilter();
        this._notify('filterChanged', [this._filter]);
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
