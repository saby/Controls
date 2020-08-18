import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_browser/resources/BrowserTemplate';
import {SyntheticEvent} from 'Vdom/Vdom';
import {ControllerClass as OperationsController} from 'Controls/operations';
import {ControllerClass as SearchController} from 'Controls/search';
import tmplNotify = require('Controls/Utils/tmplNotify');
import {RecordSet} from 'Types/collection';

import {DataController} from 'Controls/list';
import {ContextOptions as DataOptions} from '../context';
import {RegisterClass} from 'Controls/event';
import {default as DataControllerClass} from '../_list/Data/ControllerClass';
import * as isNewEnvironment from 'Core/helpers/isNewEnvironment';
import {error as dataSourceError} from 'Controls/dataSource';
import {TSelectionType} from 'Controls/interface';

type Key = string|number|null;

interface IDataChildContext {
    dataOptions: unknown;
}

export default class Browser extends Control {
    protected _template: TemplateFunction = template;
    protected _notifyHandler: Function = tmplNotify;
    private _selectedKeysCount: number = null;
    private _selectionType: TSelectionType = 'all';
    private _isAllSelected: boolean = false;
    private _operationsController: OperationsController = null;
    private _searchController: SearchController = null;
    private _listMarkedKey: Key = null;
    private _dataOptions: object = null;
    private _previousViewMode: string = null;
    private _viewMode: string = null;
    private _searchValue: string = null;
    private _misspellValue: string = null;
    private _root: Key = null;
    private _deepReload: boolean = undefined;
    private _inputSearchValue: string = '';

    private _dataController: DataController;
    private _itemsReadyCallback: Function;
    private _loading: boolean = false;
    private _items: RecordSet;
    private _filter: object;
    private _groupHistoryId: string;
    private _dataOptionsContext: unknown;
    private _errorRegister: RegisterClass;

    protected _beforeMount(options, context, receivedState): void|Promise<RecordSet> {
        this._itemOpenHandler = this._itemOpenHandler.bind(this);
        this._dataLoadCallback = this._dataLoadCallback.bind(this);
        this._afterSetItemsOnReloadCallback = this._afterSetItemsOnReloadCallback.bind(this);
        this._operationsController = this._createOperationsController(options);

        this._filter = options.filter;
        this._groupHistoryId = options.groupHistoryId;
        this._itemsReadyCallback = this._itemsReadyCallbackHandler.bind(this);
        this._errorRegister = new RegisterClass({register: 'dataError'});
        this._dataController = new DataControllerClass({...options});
        this._dataOptionsContext = this._dataController.createContext();

        if (receivedState && isNewEnvironment()) {
            this._setItemsAndCreateSearchController(receivedState, options);
        } else if (options.source) {
            return this._dataController.loadItems().then((items) => {
                this._setItemsAndCreateSearchController(items, options);
                return items;
            });
        } else {
            this._dataController.updateContext(this._dataOptionsContext);
            this._createSearchControllerWithContext(options, this._dataOptionsContext);
        }
    }

    protected _beforeUpdate(newOptions, context): void|Promise<RecordSet> {
        const isChanged = this._dataController.update({...newOptions});
        this._filter = newOptions.filter;

        if (this._options.source !== newOptions.source) {
            this._loading = true;
            return this._dataController.loadItems().then((result) => {
                if (!this._items) {
                    this._items = this._dataController.setItems(result);
                } else {
                    this._dataController.updatePrefetchProxy(result);
                }
                this._dataController.updateContext(this._dataOptionsContext);
                this._loading = false;
                this._groupHistoryId = newOptions.groupHistoryId;
                return result;
            });
        } else if (isChanged) {
            this._dataController.setFilter(this._filter);
            this._dataController.updateContext(this._dataOptionsContext);
            this._groupHistoryId = newOptions.groupHistoryId;
        }
        this._operationsController.update(newOptions);
        this._searchController.update(
            this._getSearchControllerOptions(newOptions),
            {dataOptions: this._dataOptionsContext}
        );
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
    }

    private _setItemsAndCreateSearchController(items: RecordSet, options): void {
        this._items = items;
        this._dataController.setItems(items);
        this._dataController.updateContext(this._dataOptionsContext);
        this._createSearchControllerWithContext(options, this._dataOptionsContext);
    }

    private _createSearchControllerWithContext(options, context): void {
        this._searchController = this._createSearchController(options, {dataOptions: context});
        this._searchValue = this._searchController.getSearchValue();
    }

    _itemsReadyCallbackHandler(items): void {
        if (this._items !== items) {
            this._items = this._dataController.setItems(items);
            this._dataController.updateContext(this._dataOptionsContext);
        }

        if (this._options.itemsReadyCallback) {
            this._options.itemsReadyCallback(items);
        }
    }

    _filterChanged(event: SyntheticEvent, filter: object): void {
        this._dataController.setFilter(this._filter = filter);
        this._dataController.updateContext(this._dataOptionsContext);

        /* If filter changed, prefetchSource should return data not from cache,
           will be changed by task https://online.sbis.ru/opendoc.html?guid=861459e2-a229-441d-9d5d-14fdcbc6676a */
        this._dataOptionsContext.prefetchSource = this._options.source;
        this._dataOptionsContext.updateConsumers();
    }

    protected _rootChanged(event: SyntheticEvent, root: Key): void {
        this._notify('rootChanged', [root]);
    }

    protected _itemsChanged(event: SyntheticEvent, items: RecordSet): void {
        // search:Cotnroller fires two events after search: itemsChanged, filterChanged
        // on filterChanged event filter state will updated
        // on itemChanged event prefetchSource will updated,
        // but createPrefetchSource method work async becouse of promise,
        // then we need to create prefetchSource synchronously
        this._dataController.updatePrefetchProxy(items);
        this._dataController.updateContext(this._dataOptionsContext);
    }

    protected _getChildContext(): IDataChildContext {
        return {
            dataOptions: this._dataOptionsContext
        };
    }

    protected _onDataError(event: SyntheticEvent, errbackConfig: dataSourceError.ViewConfig): void {
        this._errorRegister.start(errbackConfig);
    }

    protected _registerHandler(event, registerType, component, callback, config): void {
        this._errorRegister.register(event, registerType, component, callback, config);
        this._getOperationsController().registerHandler(event, registerType, component, callback, config);
    }

    protected _unregisterHandler(event, registerType, component, config): void {
        this._errorRegister.unregister(event, component, config);
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
        this._notify('markedKeyChanged', [markedKey]);
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

    _createSearchController(options, context): SearchController {
        return new SearchController(this._getSearchControllerOptions(options), context);
    }

    _getSearchControllerOptions(options): object {
        const optionsChangedCallbacks = SearchController.getStateAndOptionsChangedCallbacks(this);
        optionsChangedCallbacks.filter = this._filter;
        return {...options, ...optionsChangedCallbacks};
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
        this._searchController.search(value, force);
    }

    _dataLoadCallback(data: RecordSet): void {
        this._getSearchController().handleDataLoad(data);
    }

    _afterSetItemsOnReloadCallback(): void {
        this._getSearchController().handleAfterSetItemsOnReload();
    }

    _misspellCaptionClick(): void {
        this._getSearchController().handleMisspellClick();
    }

    static contextTypes(): object {
        return {
            dataOptions: DataOptions
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
