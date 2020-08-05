import {default as Store} from 'Controls/Store';
import {isEqual} from 'Types/object';
import {ICrudPlus, IDecorator} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {ISearchOptions, ISourceOptions, INavigationOptions, IFilterOptions, ISortingOptions, IHierarchyOptions} from 'Controls/interface';
import {IHierarchySearchOptions} from 'Controls/interface/IHierarchySearch';
import cInstance = require('Core/core-instance');
import _SearchController from './_SearchController';
import {error as dataSourceError} from 'Controls/dataSource';
import {Logger} from 'UI/Utils';
import getSwitcherStrFromData = require('Controls/_search/Misspell/getSwitcherStrFromData');
import {_assignServiceFilters, _deleteServiceFilters} from 'Controls/_search/Utils/FilterUtils';

type Key = string|number|null;

export interface ISearchControllerOptions extends ISearchOptions, ISourceOptions,
                 INavigationOptions<unknown>, IFilterOptions, ISortingOptions, IHierarchySearchOptions,
                 IHierarchyOptions {
    viewMode: string;
    searchValue: string;
    root: Key;
    useStore: boolean;
    rootChangedCallback?: Function;
    searchValueChangedCallback?: Function;
    inputSearchValueChangedCallback?: Function;
    viewModeChangedCallback?: Function;
    markedKeyChangedCallback?: Function;
    expandedItemsChangedCallback?: Function;
    deepReloadChangedCallback?: Function;
    misspellValueChangedCallback?: Function;
    pathChangedCallback?: Function;
    itemsChangedCallback: Function;
    dataLoadCallback?: Function;
    loadingChangedCallback: Function;
    filterChangedCallback: Function;
    dataLoadErrback: Function;
    searchStartingWith: string;
    deepReload: boolean;
}

interface IDataContext {
    dataOptions: ISearchControllerOptions;
}

interface ISearchCallbackResult {
    data: RecordSet;
    hasMore: boolean;
}

export default class SearchControllerClass {
    private _options: ISearchControllerOptions = null;
    private _viewMode: string = '';
    private _previousViewMode: string = '';
    private _storeCallbackId: string = null;
    private _root: Key;
    private _searchValue: string = '';
    private _inputSearchValue: string = '';
    private _dataOptions: ISearchControllerOptions = null;
    private _searchController: unknown = null;
    private _notifiedMarkedKey: Key = undefined;
    private _deepReload: boolean;
    private _path: RecordSet;
    private _misspellValue: string = '';

    constructor(options: ISearchControllerOptions, context: IDataContext) {
        this._options = options;
        this._dataOptions = context.dataOptions;
        this._previousViewMode = this._viewMode = options.viewMode;
        this._updateViewMode(options.viewMode);
        let searchValue = options.searchValue;
        if (options.useStore) {
            this._observeStore();
            searchValue = Store.getState().searchValue as unknown as string;
        }

        if (searchValue) {
            this._setInputSearchValue(searchValue);
            if (!this._isSearchValueShort(searchValue, options.minSearchLength)) {
                this._searchValue = searchValue;

                if (this._needUpdateViewMode('search')) {
                    this._updateViewMode('search');
                }
            }
        }

        if (options.root !== undefined) {
            this._setRoot(options.root);
        }
    }

    update(newOptions: ISearchControllerOptions, context: IDataContext): void {
        const currentOptions = this._dataOptions;
        let filter;
        let updateResult;

        this._dataOptions = context.dataOptions;

        const needRecreateSearchController =
            this._isNeedRecreateSearchControllerOnOptionsChanged(currentOptions, this._dataOptions) ||
            this._isNeedRecreateSearchControllerOnOptionsChanged(this._options, newOptions);
        const searchValue = needRecreateSearchController && newOptions.searchValue === undefined ?
            this._inputSearchValue :
            newOptions.searchValue;
        const needUpdateRoot = this._options.root !== newOptions.root;

        if (!isEqual(this._options.filter, newOptions.filter)) {
            filter = newOptions.filter;
        }

        if (needUpdateRoot) {
            this._setRoot(newOptions.root);
        }

        if (this._needUpdateViewMode(newOptions.viewMode)) {
            this._updateViewMode(newOptions.viewMode);
        }

        if (this._searchController) {
            if (filter) {
                this._searchController.setFilter(filter);
            }

            if ((this._isNeedRestartSearchOnOptionsChanged(currentOptions, this._dataOptions) ||
                this._isNeedRestartSearchOnOptionsChanged(this._options, newOptions)) && this._searchValue) {
                this._searchController.abort(true);
            }

            if (needRecreateSearchController) {
                this._recreateSearchController(newOptions);
            }

            if (!isEqual(this._options.sorting, newOptions.sorting)) {
                this._searchController.setSorting(newOptions.sorting);
            }
        }

        const isNewSourceController = this._startSearchWithNewSourceController(searchValue, needRecreateSearchController);

        if (this._needStartSearchBySearchValueChanged(newOptions, searchValue) || isNewSourceController) {
            if (!needUpdateRoot || isNewSourceController) {
                updateResult = this._startSearch(searchValue);
            }
            if (this._isInputSearchValueChanged(searchValue)) {
                this._setInputSearchValue(searchValue);
            }
        }
        this._options = newOptions;
        return updateResult;
    }

    destroy() {
        if (this._searchController) {
            this._searchController.abort(true);
            this._searchController = null;
        }
        this._dataOptions = null;
        this._path = null;
        if (this._storeCallbackId) {
            Store.unsubscribe(this._storeCallbackId);
            Store.dispatch('searchValue', undefined);
        }
    }

    handleDataLoad(data: RecordSet): void {
        if (this._deepReload) {
            this._setDeepReload(undefined);
        }

        this._setPath(data.getMetaData().path);

        if (this._isSearchViewMode() && !this._searchValue) {
            this._updateViewMode(this._previousViewMode);
            this._previousViewMode = null;
            this._setMisspellValue('');
        }

        if (this._options.dataLoadCallback) {
            this._options.dataLoadCallback(data);
        }
    }

    handleItemOpen(root: Key, items: RecordSet, dataRoot: Key = null): void {
        if (this._isSearchViewMode() && this._options.searchNavigationMode === 'expand') {
            this._notifiedMarkedKey = root;
            if (this._options.expandedItemsChangedCallback) {
                this._options.expandedItemsChangedCallback(
                    SearchControllerClass._prepareExpandedItems(
                        this._options.root,
                        root,
                        items,
                        this._options.parentProperty)
                );
            }
            if (!this._options.deepReload) {
                this._setDeepReload(true);
            }
        } else {
            this._setRoot(root);
            this._options.itemsChangedCallback(items);
        }
        if (root !== dataRoot) {
            this._getSearchController().abort(true);
            this._setInputSearchValue('');
        }
    }

    handleAfterSetItemsOnReload(): void {
        if (this._notifiedMarkedKey !== undefined) {
            if (this._options.markedKeyChangedCallback) {
                this._options.markedKeyChangedCallback(this._notifiedMarkedKey);
            }
            this._notifiedMarkedKey = undefined;
        }
    }

    handleMisspellClick(): void {
        this.search(this._misspellValue, true);
        this._setMisspellValue('');
    }

    search(value: string, force: boolean): void {
        this._startSearch(value, force);
        this._setInputSearchValue(value);
    }

    getSearchValue(): string {
        return this._searchValue;
    }

    private _isSearchValueShort(searchValue: string, minSearchLength: number): boolean {
        return !searchValue || searchValue.length < minSearchLength;
    }

    private _needUpdateViewMode(newViewMode: string): boolean {
        return this._options.viewMode !== newViewMode && this._viewMode !== newViewMode;
    }

    private _updateViewMode(newViewMode: string): void {
        this._previousViewMode = this._viewMode;
        this._viewMode = newViewMode;

        if (this._options.viewModeChangedCallback) {
            this._options.viewModeChangedCallback(newViewMode);
        }
    }

    private _observeStore(): void {
        this._storeCallbackId = Store.onPropertyChanged('searchValue', (searchValue) => {
            this.search(searchValue, true);
        });
    }

    private _isNeedRecreateSearchControllerOnOptionsChanged(
        options: ISearchControllerOptions,
        newOptions: ISearchControllerOptions
    ): boolean {
        return !isEqual(options.navigation, newOptions.navigation) ||
            options.searchDelay !== newOptions.searchDelay ||
            options.minSearchLength !== newOptions.minSearchLength ||
            this._isNeedRestartSearchOnOptionsChanged(options, newOptions);
    }

    private _isNeedRestartSearchOnOptionsChanged(
        options: ISearchControllerOptions,
        newOptions: ISearchControllerOptions
    ): boolean {
        return options.searchParam !== newOptions.searchParam ||
            this._getOriginSource(options.source) !== this._getOriginSource(newOptions.source);
    }

    private _getOriginSource(source: ICrudPlus): ICrudPlus {
        return cInstance.instanceOfModule(source, 'Types/_source/IDecorator') ?
            (source as unknown as IDecorator).getOriginal() :
            source;
    }

    private _recreateSearchController(newOptions: ISearchControllerOptions): void {
        this._searchController.cancel();
        this._searchController = null;
        this._getSearchController(newOptions);
    }

    private _getSearchController(newOptions?: ISearchControllerOptions): unknown {
        const options = newOptions || this._dataOptions;

        if (!this._searchController) {
            this._searchController = new _SearchController({
                searchParam: options.searchParam || this._options.searchParam,
                minSearchLength: options.minSearchLength || this._options.minSearchLength,
                searchDelay: options.searchDelay || this._options.searchDelay,
                searchValueTrim: options.searchValueTrim || this._options.searchValueTrim,
                filter: {...options.filter} || {},
                source: options.source || this._options.source,
                sorting: options.sorting,
                navigation: options.navigation,
                keyProperty: options.keyProperty,
                searchCallback: this._searchCallback.bind(this),
                abortCallback: this._abortCallback.bind(this),
                searchStartCallback: this._searchStartCallback.bind(this),
                searchErrback: this._searchErrback.bind(this)
            });
        }

        return this._searchController;
    }

    private _startSearchWithNewSourceController(searchValue: string, needRecreateSearchController: boolean): boolean {
        return searchValue && needRecreateSearchController;
    }

    private _needStartSearchBySearchValueChanged(
        options: ISearchControllerOptions,
        searchValue: string
    ): boolean {
        const isSearchValueShorterThenMinLength = this._isSearchValueShort(searchValue, options.minSearchLength);
        const isSearchValueChanged = this._isSearchValueChanged(searchValue);
        return isSearchValueChanged &&
            !!(!isSearchValueShorterThenMinLength || (this._isSearchViewMode() && !searchValue && this._searchValue));
    }

    private _isSearchValueChanged(searchValue: string): boolean {
        return this._options.searchValue !== searchValue &&
            this._searchValue !== searchValue &&
            this._isInputSearchValueChanged(searchValue);
    }

    private _isInputSearchValueChanged(searchValue: string): boolean {
        return searchValue !== this._inputSearchValue;
    }

    private _isSearchViewMode(): boolean {
        return this._viewMode === 'search';
    }

    private _startSearch(value: string, force?: boolean): Promise<ISearchCallbackResult>|void {
        if (this._options.source) {
            const searchValue = this._options.searchValueTrim ? value.trim() : value;
            const shouldSearch = this._isSearchControllerLoading() ?
                this._isInputSearchValueChanged(searchValue) :
                !this._isSearchValueEmpty(this._inputSearchValue, searchValue);

            if (shouldSearch) {
                const searchResult = this._getSearchController().search(searchValue, force);

                if (searchResult instanceof Promise) {
                    searchResult.then((result) => {
                        if (result instanceof Error) {
                            this._options.dataLoadErrback({
                                error: result,
                                mode: dataSourceError.Mode.include
                            });
                        }
                    });
                    return searchResult;
                }
            }
        } else {
            Logger.error('search:Controller source is required for search', this);
        }
    }

    private _isSearchValueEmpty(inputSearchValue: string, searchValue: string): boolean {
        const checkedValue =
            (this._options.searchValueTrim ? inputSearchValue.trim() : inputSearchValue) || searchValue;
        return !checkedValue;
    }

    private _isSearchControllerLoading(): boolean {
        return this._searchController && this._searchController.isLoading();
    }

    private _needChangeSearchValueToSwitchedString(data: RecordSet): boolean {
        const metaData = data && data.getMetaData();
        return metaData ? metaData.returnSwitched : false;
    }

    private _searchCallback(result: ISearchCallbackResult, filter: object): void {
        this._updateSearchParams(filter);
        this._options.itemsChangedCallback(result.data);
        const switchedStr = getSwitcherStrFromData(result.data);
        this._setMisspellValue(switchedStr);
        if (this._needChangeSearchValueToSwitchedString(result.data)) {
            this._setSearchValue(switchedStr);
        }
    }

    private _abortCallback(filter: object): void {
        this._options.loadingChangedCallback(false);
        if (this._isSearchViewMode() && this._searchValue) {
            this._setSearchValue('');

            if (this._options.parentProperty) {
                _deleteServiceFilters(this._options, filter);
                this._deleteRootFromFilterAfterSearch(filter);
            }

            // abortCallback is called on every input change, when input value is less then minSearchLength,
            // but filter could be already changed, because viewMode: 'search' will change only after data loaded.
            if (!isEqual(this._options.filter, filter)) {
                this._options.filterChangedCallback(filter);
            }
        }
    }

    private _searchStartCallback(filter: object): void {
        _assignServiceFilters(this, filter, false);

        if (this._root !== undefined && this._options.parentProperty) {
            if (this._options.startingWith === 'current') {
                filter[this._options.parentProperty] = this._root;
            } else {
                delete filter[this._options.parentProperty];
            }
        }
        this._options.loadingChangedCallback(true);
    }

    private _searchErrback(error: Error, filter: object): void {
        if (this._options.dataLoadErrback) {
            this._options.dataLoadErrback(error);
        }
        this._options.loadingChangedCallback(false);
        if (!error.canceled) {
            this._updateSearchParams(filter);
        }
    }

    private _updateSearchParams(filter: object): void {
        if (this._viewMode !== 'search') {
            this._updateViewMode('search');

            if (this._options.parentProperty) {
                this._deleteRootFromFilterAfterSearch(filter);
                this._updateRootAfterSearch();
            }
        }
        this._options.loadingChangedCallback(false);
        this._options.filterChangedCallback(filter);
        this._setSearchValue(filter[this._options.searchParam] || '');
    }

    private _deleteRootFromFilterAfterSearch(filter: object): void {
        if (this._options.startingWith === 'current') {
            delete filter[this._options.parentProperty];
        }
    }

    private _updateRootAfterSearch(): void {
        if (this._options.startingWith === 'root') {
            this._setRoot(
                SearchControllerClass._getRoot(this._path, this._root, this._options.parentProperty)
            );
        }
    }

    private _setRoot(root: Key): void {
        this._root = root;
        if (this._options.rootChangedCallback) {
            this._options.rootChangedCallback(root);
        }
    }

    private _setSearchValue(searchValue: string): void {
        this._searchValue = searchValue;
        if (this._options.searchValueChangedCallback) {
            this._options.searchValueChangedCallback(searchValue);
        }
    }

    private _setInputSearchValue(inputSearchValue: string): void {
        this._inputSearchValue = inputSearchValue;
        if (this._options.inputSearchValueChangedCallback) {
            this._options.inputSearchValueChangedCallback(inputSearchValue);
        }
    }

    private _setDeepReload(deepReload: boolean): void {
        if (this._options.deepReloadChangedCallback) {
            this._options.deepReloadChangedCallback(deepReload);
        }
    }

    private _setMisspellValue(value: string): void {
        this._misspellValue = value;
        if (this._options.misspellValueChangedCallback) {
            this._options.misspellValueChangedCallback(value);
        }
    }

    private _setPath(path: RecordSet): void {
        if (this._options.pathChangedCallback) {
            this._options.pathChangedCallback(path);
        }
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

    static _getRoot(path: RecordSet, currentRoot: Key, parentProperty: string): Key {
        let root;

        if (path && path.getCount() > 0) {
            root = path.at(0).get(parentProperty);
        } else {
            root = currentRoot;
        }

        return root;
    }

    static getStateAndOptionsChangedCallbacks(self): object {
        return {
            rootChangedCallback: (root) => {
                self._root = root;
            },
            searchValueChangedCallback: (searchValue) => {
                self._searchValue = searchValue;
                self._notify('searchValueChanged', [searchValue]);
            },
            itemsChangedCallback: (items) => {
                if (self._itemsChanged) {
                    self._itemsChanged(null, items);
                }
                self._notify('itemsChanged', [items]);
            },
            pathChangedCallback: (path) => {
                self._path = path;
            },
            inputSearchValueChangedCallback: (value) => {
                self._inputSearchValue = value;
            },
            viewModeChangedCallback: (viewMode) => {
                self._viewMode = viewMode;
            },
            markedKeyChangedCallback: (markedKey) => {
                self._notify('markedKeyChanged', [markedKey]);
            },
            expandedItemsChangedCallback: (expandedItems) => {
                self._notify('expandedItemsChanged', [expandedItems]);
            },
            loadingChangedCallback: (loading) => {
                self._loading = loading;
            },
            deepReloadChangedCallback: (deepReload) => {
                self._deepReload = deepReload;
            },
            misspellValueChangedCallback: (value) => {
                self._misspellValue = value;
            },
            filterChangedCallback: (filter) => {
                if (self._filterChanged) {
                    self._filterChanged(null, filter);
                }
                self._notify('filterChanged', [filter]);
            },
            dataLoadErrback: (error: Object|Error) => {
                if (error instanceof Error) {
                    if (self._options.dataLoadErrback) {
                        self._options.dataLoadErrback(error);
                    }
                } else {
                    self._notify('dataError', [error]);
                }
            }
        };
    }
}
