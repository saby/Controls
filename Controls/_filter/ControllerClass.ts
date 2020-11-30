import {IPrefetchHistoryParams} from './IPrefetch';
import {IFilterItem} from 'Controls/_filter/View/interface/IFilterView';

import Store from 'Controls/Store';
import Prefetch from 'Controls/_filter/Prefetch';
import isEqualItems from 'Controls/_filter/Utils/isEqualItems';
import mergeSource from 'Controls/_filter/Utils/mergeSource';
import {getHistorySource} from 'Controls/_filter/HistoryUtils';
import {_assignServiceFilters} from '../_search/Utils/FilterUtils';
import {selectionToRecord} from 'Controls/operations';
import {TKeysSelection} from 'Controls/interface';

import * as clone from 'Core/core-clone';
import * as isEmpty from 'Core/helpers/Object/isEmpty';
import {CrudWrapper} from '../_dataSource/CrudWrapper';
import Utils = require('Types/util');
import {isEqual} from 'Types/object';
import {Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import * as Deferred from 'Core/Deferred';
import {ICrud, PrefetchProxy, Rpc} from 'Types/source';

export interface IFilterHistoryData {
    items: IFilterItem[];
    prefetchParams?: IPrefetchHistoryParams;
}

type THistoryData = IFilterHistoryData | IFilterItem[];

export interface IFilterControllerOptions {
    prefetchParams?: IPrefetchHistoryParams;
    filter: object;
    useStore?: boolean;
    filterButtonSource: IFilterItem[];
    fastFilterSource?: IFilterItem[];
    historyItems?: IFilterItem[];
    historyId?: string;
    searchValue?: string;
    searchParam?: string;
    minSearchLength?: number;
    parentProperty?: string;
    selectedKeys?: TKeysSelection;
    excludedKeys?: TKeysSelection;
    source?: ICrud;
    selectionViewMode?: string;
    historySaveCallback?: (historyData: Record<string, any>, filterButtonItems: IFilterItem[]) => void;
}

const getPropValue = Utils.object.getPropertyValue.bind(Utils);
const setPropValue = Utils.object.setPropertyValue.bind(Utils);

const ACTIVE_HISTORY_FILTER_INDEX = 0;
const SELECTION_PATH_FILTER_FIELD = 'SelectionWithPath';

export default class FilterControllerClass {
    private _options: Partial<IFilterControllerOptions> = null;
    private _crudWrapper: CrudWrapper;
    private _filterButtonItems: IFilterItem[] = null;
    private _fastFilterItems: IFilterItem[] = null;
    private _filter: object = {};

    /* Флаг необходим, т.к. добавлять запись в историю после изменения фильтра
   необходимо только после загрузки данных, т.к. только в ответе списочного метода
   можно получить идентификатор закэшированных данных для этого фильтра */
    private _isFilterChanged: boolean = false;

    constructor(options: Partial<IFilterControllerOptions>) {
        this._options = options;
        this._filter = options.filter || {};

        if (options.prefetchParams) {
            this._filter = Prefetch.prepareFilter(this._filter, options.prefetchParams);
        }
        this._updateFilter(options);
    }

    setFilterItems(historyItems: THistoryData): void {
        // TODO: storefix207100
        if (this._options.useStore && !this._options.filterButtonSource) {
            const state = Store.getState();
            this._setFilterItems(state.filterSource, [], historyItems);
        } else {
            this._setFilterItems(this._options.filterButtonSource, this._options.fastFilterSource, historyItems);
        }
        this._applyItemsToFilter(Prefetch.applyPrefetchFromHistory(this._filter, historyItems),
            this._filterButtonItems, this._fastFilterItems);

        if (this._options.prefetchParams && (historyItems instanceof Array) && historyItems.length) {
            this._isFilterChanged = true;
        }
    }

    loadFilterItemsFromHistory(): Promise<THistoryData> {
        // TODO: storefix207100
        if (this._options.useStore && !this._options.filterButtonSource) {
            const state = Store.getState();
            const loadedSources = state && state.loadedSources && state.loadedSources[0];
            if (loadedSources) {
                return this._resolveItemsWithHistory(loadedSources, loadedSources.filter);
            } else {
                return this._resolveItemsWithHistory({
                    historyId: state.historyId || this._options.historyId,
                    filterButtonSource: state.filterSource || this._options.filterButtonSource,
                    historyItems: this._options.historyItems
                }, state.filter || this._options.filter);
            }
        } else {
            return this._resolveItemsWithHistory(this._options, this._filter);
        }
    }

    update(newOptions: IFilterControllerOptions): void | boolean {
        let filterButtonChanged;
        let fastFilterChanged;
        let filterChanged;
        let selectionViewModeChanged;

        if (!this._options.useStore) {
            filterButtonChanged = this._options.filterButtonSource !== newOptions.filterButtonSource;
            fastFilterChanged = this._options.fastFilterSource !== newOptions.fastFilterSource;
            filterChanged = !isEqual(this._options.filter, newOptions.filter);
            selectionViewModeChanged = this._options.selectionViewMode !== newOptions.selectionViewMode;

            if (filterButtonChanged || fastFilterChanged) {
                this._setFilterItems(
                    filterButtonChanged ? newOptions.filterButtonSource : this._filterButtonItems,
                    fastFilterChanged ? newOptions.fastFilterSource : this._fastFilterItems);

                this._applyItemsToFilter(this._filter, this._filterButtonItems, this._fastFilterItems);
            }

            if (filterChanged) {
                this._applyItemsToFilter(
                    Prefetch.prepareFilter(newOptions.filter, newOptions.prefetchParams),
                    this._filterButtonItems,
                    this._fastFilterItems
                );
                if (newOptions.prefetchParams) {
                    this._isFilterChanged = true;
                }
            }

            if (filterButtonChanged && newOptions.prefetchParams) {
                this._filter = Prefetch.clearPrefetchSession(this._filter);
            }

            if (newOptions.historyId !== this._options.historyId) {
                this._crudWrapper = null;
            }
        }
        this._options = newOptions;
        if (filterChanged || selectionViewModeChanged) {
            this._updateFilter(this._options);
        }
        return filterChanged || filterButtonChanged || fastFilterChanged;
    }

    resetPrefetch(): void {
        const filter = clone(this._filter);
        this._isFilterChanged = true;
        this._setFilter(Prefetch.clearPrefetchSession(filter));
    }

    updateHistory(history: THistoryData): void {
        if (this._options.prefetchParams) {
            this._processHistoryOnItemsChanged(history.items || history, this._options);
        }
    }

    updateFilterItems(items: IFilterItem[]): void {
        this._updateFilterItems(items);
        this._applyItemsToFilter(this._filter, items);

        if (this._options.historyId) {
            if (this._options.prefetchParams) {
                if (!this._isFilterChanged) {
                    this._deleteCurrentFilterFromHistory();
                    Prefetch.clearPrefetchSession(this._filter);
                }
                this._isFilterChanged = true;
            } else  if (this._options.historyId) {
                this._addToHistory(this._filterButtonItems, this._fastFilterItems, this._options.historyId);
            }
        }
    }

    setFilter(filter: object): void {
        this._setFilter(Prefetch.prepareFilter(filter, this._options.prefetchParams));
    }

    handleDataLoad(items: RecordSet): void {
        if (this._options.historyId && this._isFilterChanged) {
            if (getHistorySource({ historyId: this._options.historyId,
                                        favorite: !!this._options.prefetchParams }).historyReady()) {
                this._deleteCurrentFilterFromHistory();
            }
            this._addToHistory(
                this._filterButtonItems,
                this._fastFilterItems,
                this._options.historyId,
                Prefetch.getPrefetchParamsForSave(items));

            // Намеренное допущение, что меняем объект по ссылке.
            // Сейчас по-другому не сделать, т.к. контроллер фильтрации находится над
            // контейнером и списком, которые владеют данными.
            // А изменение фильтра вызывает повторный запрос за данными.
            Prefetch.applyPrefetchFromItems(this._filter, items);
        }

        this._isFilterChanged = false;
    }

    handleDataError(): void {
        if (this._options.historyId && this._isFilterChanged) {
            const currentAppliedHistoryItems =
                this._getHistoryByItems(this._options.historyId, this._filterButtonItems);

            if (currentAppliedHistoryItems) {
                Object.assign(
                    this._filter,
                    Prefetch.applyPrefetchFromHistory(this._filter, currentAppliedHistoryItems.data)
                );
            }
        }
    }

    getFilter(): object {
        return this._filter;
    }

    getFilterButtonItems(): IFilterItem[] {
        return this._filterButtonItems;
    }

    getFastFilterItems(): IFilterItem[] {
        return  this._fastFilterItems;
    }

    getCalculatedFilter(config) {
        return getCalculatedFilter.call(this, config);
    }

    saveFilterToHistory(config) {
        return saveFilterToHistory.call(this, config);
    }

    private _updateFilterItems(newItems: IFilterItem[]): void {
        if (this._filterButtonItems) {
            this._filterButtonItems = FilterControllerClass._cloneItems(this._filterButtonItems);
            mergeSource(this._filterButtonItems, newItems);
        }

        if (this._fastFilterItems) {
            this._fastFilterItems = FilterControllerClass._cloneItems(this._fastFilterItems);
            mergeSource(this._fastFilterItems, newItems);
        }

        this._setIsFastProperty(this._filterButtonItems, this._fastFilterItems);
    }

    private _updateFilter(options: Partial<IFilterControllerOptions>): void {
        if (options.searchParam && options.searchValue) {
            this._prepareSearchFilter(this._filter, options);
        }
        if (options.selectedKeys && options.selectedKeys.length) {
            this._prepareOperationsFilter(this._filter, options);
        }
    }

    private _resolveItemsWithHistory(options: Partial<IFilterControllerOptions>,
                                     filter: object): Promise<THistoryData> {
        return this._resolveHistoryItems(
            options.historyId,
            options.historyItems,
            options.prefetchParams
        ).then((history) => {
            this._setFilterItems(options.filterButtonSource, options.fastFilterSource, history);
            this._applyItemsToFilter(
                Prefetch.applyPrefetchFromHistory(filter, history),
                this._filterButtonItems,
                this._fastFilterItems);
            if (options.historyItems && options.historyItems.length && options.historyId && options.prefetchParams) {
                this._processHistoryOnItemsChanged(options.historyItems, options as IFilterControllerOptions);
            }
            return history;
        });
    }

    // Получает итемы с учетом истории.
    private _resolveHistoryItems(
        historyId: string,
        historyItems: IFilterItem[],
        prefetchParams: IPrefetchHistoryParams
    ): Promise<THistoryData> {
        if (historyItems && prefetchParams && historyItems?.length) {
            return this._loadHistoryItems(historyId).then((result) => {
                return historyItems ? historyItems : result;
            });
        } else {
            return historyItems ? Promise.resolve(historyItems) : this._loadHistoryItems(historyId);
        }
    }

    private _loadHistoryItems(historyId: string): Promise<THistoryData> {
        let result;

        if (!historyId) {
            result = Promise.resolve([]);
        } else {
            const source = getHistorySource({historyId});

            if (!this._crudWrapper) {
                this._crudWrapper = new CrudWrapper({
                    source
                });
            }

            result = this._loadHistorySource(source);
        }

        return result;
    }

    private _loadHistorySource(source): Promise<THistoryData> {
        return new Promise((resolve) => {
            this._crudWrapper.query({filter: { $_history: true }})
                .then((res) => {
                    let historyResult;
                    const recent = source.getRecent();

                    if (recent.getCount()) {
                        const lastFilter = recent.at(ACTIVE_HISTORY_FILTER_INDEX);
                        historyResult = source.getDataObject(lastFilter) || [];
                    } else {
                        historyResult = [];
                    }
                    resolve(historyResult);
                    return res;
                })
                .catch((error) => {
                    error.processed = true;
                    resolve([]);
                    return error;
                });
        });
    }

    private _deleteCurrentFilterFromHistory(): void {
        const history = this._getHistoryByItems(this._options.historyId, this._filterButtonItems);

        if (history) {
            FilterControllerClass._deleteFromHistory(history.item, this._options.historyId);
        }
    }

    private _getHistoryByItems(historyId: string, items: IFilterItem[]): IFilterItem | null {
        let result;
        this._updateMeta = null;

        result = this._findItemInHistory(historyId, items);

        // Метод используется для поиска элемента для удаления и последующего сохранения нового элемента с новыми данными
        // Если элемент запинен или добавлен в избранное, его нельзя удалять.
        if (result) {
            const isPinned = result.item.get('pinned');
            const isFavorite = result.item.get('client');
            if (isFavorite || isPinned) {
                this._updateMeta = {
                    item: result.item,
                    isClient: result.data.isClient
                };
                if (isPinned) {
                    this._updateMeta.$_pinned = true;
                } else {
                    this._updateMeta.$_favorite = true;
                }
                result = null;
            }
        }
        return result;
    }

    private _findItemInHistory(historyId: string, items: IFilterItem[]): void {
        let result;
        let historyData;
        let minimizedItemFromHistory;
        let minimizedItemFromOption;

        const historySource = getHistorySource({historyId});
        const historyItems = historySource.getItems();
        if (historyItems && historyItems.getCount()) {
            historyItems.each((item, index) => {
                if (!result) {
                    historyData = historySource.getDataObject(item);

                    if (historyData) {
                        const itemsToSave = items.filter((itemToSave) => !itemToSave.doNotSaveToHistory);
                        minimizedItemFromOption = this._minimizeFilterItems(itemsToSave);
                        minimizedItemFromHistory = this._minimizeFilterItems(historyData.items || historyData);
                        if (isEqual(minimizedItemFromOption, minimizedItemFromHistory)) {
                            result = {
                                item,
                                data: historyData,
                                index
                            };
                        }
                    }
                }
            });
        }

        return result;
    }

    private _minimizeFilterItems(items: IFilterItem[]): IFilterItem[] {
        const minItems = [];
        items.forEach((item) => {
            minItems.push(FilterControllerClass._minimizeItem(item));
        });
        return minItems;
    }

    private _addToHistory(filterButtonItems: IFilterItem[],
                          fastFilterItems: IFilterItem[],
                          historyId: string,
                          prefetchParams?: IPrefetchHistoryParams): Promise<any> {
        const meta = this._updateMeta || { $_addFromData: true };

        const update = () => {
            let historyData;
            if (this._updateMeta) {
                historyData = this._updateMeta.item;
            } else {
                historyData = this._getHistoryData(filterButtonItems, fastFilterItems, prefetchParams);
                if (this._options.historySaveCallback instanceof Function) {
                    this._options.historySaveCallback(historyData, filterButtonItems);
                }
            }

            return getHistorySource({historyId}).update(historyData, meta);
        };

        if (!getHistorySource({historyId}).historyReady()) {
            // Getting history before updating if it hasn’t already done
            return this._loadHistoryItems(historyId).then(() => {
                return update();
            });
        } else {
            return update();
        }
    }

    private _getHistoryData(filterButtonItems: IFilterItem[],
                            fastFilterItems: IFilterItem[],
                            prefetchParams?: IPrefetchHistoryParams): THistoryData {
        let result = {} as IFilterHistoryData;

        /* An empty filter should not appear in the history,
           but should be applied when loading data from the history.
           To understand this, save an empty object in history. */
        if (this._isFilterItemsChanged(filterButtonItems, fastFilterItems)) {
            result = Prefetch.addPrefetchToHistory(result, prefetchParams);
            result.items = this._prepareHistoryItems(filterButtonItems, fastFilterItems);
        }
        return result;
    }

    private _prepareHistoryItems(filterButtonItems: IFilterItem[],
                                 fastFilterItems: IFilterItem[]): IFilterItem[] {
        let historyItems = FilterControllerClass._cloneItems(filterButtonItems);
        this._setTextValueProperty(filterButtonItems, fastFilterItems, historyItems);

        historyItems = historyItems.filter((item) => {
            return !item.doNotSaveToHistory;
        });

        return this._minimizeFilterItems(historyItems);
    }

    private _processHistoryOnItemsChanged(items: IFilterItem[], options: IFilterControllerOptions): void {
        this._processPrefetchOnItemsChanged(options, items);
        this._isFilterChanged = true;
    }

    private _processPrefetchOnItemsChanged(options: IFilterControllerOptions,
                                           items: IFilterItem[]): void {
        // Меняют фильтр с помощью кнопки фильтров,
        // но такой фильтр уже может быть сохранён в истории и по нему могут быть закэшированные данные,
        // поэтому ищем в истории такой фильтр, если есть, смотрим валидны ли ещё закэшированные данные,
        // если валидны, то просто добавляем идентификатор сессии в фильтр,
        // если данные не валидны, то такую запись из истории надо удалить
        const history = this._getHistoryByItems(options.historyId, items || this._filterButtonItems);
        let filter = this._filter;
        let needDeleteFromHistory = false;
        let needApplyPrefetch = false;

        if (history) {
            const prefetchParams = Prefetch.getPrefetchFromHistory(history.data);
            const needInvalidate = prefetchParams && Prefetch.needInvalidatePrefetch(history.data);

            if (needInvalidate) {
                needDeleteFromHistory = true;
            }

            if (prefetchParams && !needInvalidate) {
                needApplyPrefetch = true;
            }
        }

        if (needApplyPrefetch) {
            filter = Prefetch.applyPrefetchFromHistory(this._filter, history.data);

            if (!isEqual(filter, this._filter)) {
                needDeleteFromHistory = true;
            }
        } else {
            filter = Prefetch.clearPrefetchSession(this._filter);
        }

        if (needDeleteFromHistory) {
            FilterControllerClass._deleteFromHistory(history.item, options.historyId);
        }

        this._setFilter(filter);
    }

    // мержит историю в итемы кнопки и итемы быстрых фильтров.
    private _setFilterItems(filterButtonOption: IFilterItem[],
                            fastFilterOption: IFilterItem[],
                            history?: THistoryData): void {
        let historyItems;

        if (history) {
            historyItems = history.items || (Array.isArray(history) ? history : []);
        }

        this._filterButtonItems = FilterControllerClass._getItemsByOption(filterButtonOption, historyItems);
        this._fastFilterItems = FilterControllerClass._getItemsByOption(fastFilterOption, historyItems);
        this._setIsFastProperty(this._filterButtonItems, this._fastFilterItems);
    }

    private _isFilterItemsChanged(filterButtonItems: IFilterItem[], fastFilterItems: IFilterItem[]): boolean {
        const filter = {};

        function processItems(elem) {
            // The filter can be changed by another control, in which case the value is set to the filter button, but textValue is not set.
            if (!isEqual(getPropValue(elem, 'value'), getPropValue(elem, 'resetValue')) &&
                getPropValue(elem, 'textValue') !== undefined && getPropValue(elem, 'textValue') !== null) {
                filter[getPropValue(elem, 'id') ? getPropValue(elem, 'id') : getPropValue(elem, 'name')] = getPropValue(elem, 'value');
            }
        }

        this._itemsIterator(filterButtonItems, fastFilterItems, processItems);

        return !isEmpty(filter);
    }

    // Для итемов быстрого фильтра в кнопке пишет поле isFast = true.
    // Для того, чтобы текст быстрых фильтров не устанавливался и не сбрасывался в кнопке,
    // FIXME удалить после перевода всех на filter:View
    private _setIsFastProperty(filterButtonItems: IFilterItem[], fastFilterItems: IFilterItem[]): void {
        if (filterButtonItems && fastFilterItems) {
            const prepareFastFilterItem = (index) => {
                // Fast filters could not be reset from the filter button.
                // We set flag for filters duplicated in the fast filter.
                filterButtonItems[index].isFast = true;
            };
            FilterControllerClass._equalItemsIterator(filterButtonItems, fastFilterItems, prepareFastFilterItem);
        }
    }

    // FIXME удалить после перевода всех на filter:View
    private _setTextValueProperty(filterButtonItems: IFilterItem[],
                                  fastFilterItems: IFilterItem[],
                                  historyItems: IFilterItem[]): void {
        const setTextValue = (index, item) => {
            setPropValue(historyItems[index], 'textValue', getPropValue(item, 'textValue'));
        };

        if (filterButtonItems && fastFilterItems) {
            FilterControllerClass._equalItemsIterator(filterButtonItems, fastFilterItems, setTextValue);
        }
    }

    private _applyItemsToFilter(filter: object,
                                filterButtonItems: IFilterItem[],
                                fastFilterItems?: IFilterItem[]): void {
        const filterClone = this._calculateFilterByItems(filter, filterButtonItems, fastFilterItems);
        this._setFilter(filterClone);
    }

    private _calculateFilterByItems(filter: object,
                                    filterButtonItems: IFilterItem[],
                                    fastFilterItems: IFilterItem[]): object {
        const filterClone = {...filter} || {};
        const itemsFilter = this._getFilterByItems(filterButtonItems, fastFilterItems);
        const emptyFilterKeys = this._getEmptyFilterKeys(filterButtonItems, fastFilterItems);

        emptyFilterKeys.forEach((key) => {
            delete filterClone[key];
        });

        Object.assign(filterClone, itemsFilter);

        return filterClone;
    }

    private _getFilterByItems(filterButtonItems: IFilterItem[],
                              fastFilterItems: IFilterItem[]): object {
        const filter = {};

        const processItems = (elem) => {
            const prop = getPropValue(elem, 'id') ? getPropValue(elem, 'id') : getPropValue(elem, 'name');
            filter[prop] = getPropValue(elem, 'value');
        };

        this._itemsIterator(filterButtonItems, fastFilterItems, processItems);

        return filter;
    }

    private _getEmptyFilterKeys(filterButtonItems: IFilterItem[],
                                fastFilterItems: IFilterItem[]): string[] {
        const removedKeys = [];

        const processItems = (elem) => {
            removedKeys.push(getPropValue(elem, 'id') ? getPropValue(elem, 'id') : getPropValue(elem, 'name'));
        };

        this._itemsIterator(filterButtonItems, fastFilterItems, null, processItems);

        return removedKeys;
    }

    private _itemsIterator(filterButtonItems: IFilterItem[],
                           fastFilterItems: IFilterItem[],
                           differentCallback: Function | null,
                           equalCallback?: Function): void {
        const processItems = (items) => {
            items.forEach((elem) => {
                const value = getPropValue(elem, 'value');
                const visibility = getPropValue(elem, 'visibility');
                const viewMode = getPropValue(elem, 'viewMode');

                if (value !== undefined &&
                    ((visibility === undefined || visibility === true) || viewMode === 'frequent')) {
                    if (differentCallback) {
                        differentCallback(elem);
                    }
                } else if (equalCallback) {
                    equalCallback(elem);
                }
            });
        };

        if (filterButtonItems) {
            processItems(filterButtonItems);
        }

        if (fastFilterItems) {
            processItems(fastFilterItems);
        }
    }

    private _prepareSearchFilter(filter: object,
                                 {
                                     searchValue,
                                     searchParam,
                                     minSearchLength,
                                     parentProperty
                                 }: Partial<IFilterControllerOptions>): void {
        const preparedFilter = {...filter} || {};
        if (searchValue && searchParam &&
            searchValue.length >= minSearchLength) {
            preparedFilter[searchParam] = searchValue;
            _assignServiceFilters({}, preparedFilter, parentProperty);
        }
        this._setFilter(preparedFilter);
    }

    private _prepareOperationsFilter(filter: object,
                                     {
                                         selectedKeys= [],
                                         excludedKeys= [],
                                         source,
                                         selectionViewMode
                                     }: Partial<IFilterControllerOptions>): object {
        const preparedFilter = {...filter} || {};

        if (selectionViewMode === 'selected') {
            const listSource = (source as PrefetchProxy).getOriginal ? (source as PrefetchProxy).getOriginal() : source;
            preparedFilter[SELECTION_PATH_FILTER_FIELD] = selectionToRecord({
                selected: selectedKeys || [],
                excluded: excludedKeys || []
            }, (listSource as Rpc).getAdapter(), 'all', false);
        } else {
            delete preparedFilter[SELECTION_PATH_FILTER_FIELD];
        }

        this._setFilter(preparedFilter);
        return preparedFilter;
    }

    private _setFilter(filter: object): void {
        this._filter = filter;
    }

    private static _minimizeItem(item: IFilterItem): IFilterItem {
        const textValue = getPropValue(item, 'textValue');
        // Two case of saving filter in history
        // 1 case - need to hide textValue in line near button, but save value in history
        // 2 case - need to hide textValue in line near button and not save value in history
        // if textValue is empty string (''), save filter in history
        // if textValue is null, do not save
        const isNeedSaveHistory = textValue !== undefined && textValue !== null;
        const visibility = !isNeedSaveHistory && getPropValue(item, 'visibility') ? false : getPropValue(item, 'visibility');
        const minimizedItem = {} as IFilterItem;
        const value = getPropValue(item, 'value');
        const isNeedSaveValue = getPropValue(item, 'resetValue') !== undefined ?
            value !== undefined && isNeedSaveHistory :
            true;

        if (visibility !== undefined) {
            minimizedItem.visibility = visibility;
        }

        if (isNeedSaveValue) {
            minimizedItem.value = getPropValue(item, 'value');
        }

        if (visibility !== false && textValue !== getPropValue(item, 'resetTextValue')) {
            if (isEqual(value, getPropValue(item, 'resetValue'))) {
                minimizedItem.textValue = '';
            } else {
                minimizedItem.textValue = getPropValue(item, 'textValue');
            }
        }

        if (getPropValue(item, 'id')) {
            minimizedItem.id = getPropValue(item, 'id');
        } else {
            minimizedItem.name = getPropValue(item, 'name');
            minimizedItem.viewMode = getPropValue(item, 'viewMode');
        }
        return minimizedItem;
    }

    private static _deleteFromHistory(item: Model, historyId: string): void {
        getHistorySource({historyId}).destroy(item.getKey(), {$_history: true});
    }

    // Возвращает итемы смерженнные с историей.
    private static _getItemsByOption(option: IFilterItem[] | Function,
                                     history?: IFilterItem[]): IFilterItem[] {
        let result;

        if (option) {
            if (typeof option === 'function') {
                result = option(history);
            } else if (history) {
                result = mergeSource(FilterControllerClass._cloneItems(option), history);
            } else {
                result = FilterControllerClass._cloneItems(option);
            }
        }

        return result;
    }

    private static _equalItemsIterator(filterButtonItems: IFilterItem[],
                                       fastFilterItems: IFilterItem[],
                                       prepareCallback: Function): void {
        filterButtonItems.forEach((buttonItem, index) => {
            fastFilterItems.forEach((fastItem) => {
                if (isEqualItems(buttonItem, fastItem)
                    && fastItem.hasOwnProperty('textValue') && buttonItem.hasOwnProperty('textValue')) {
                    prepareCallback(index, fastItem);
                }
            });
        });
    }

    private static _cloneItems(items: IFilterItem[]|RecordSet<IFilterItem>): IFilterItem[] {
        let resultItems;

        if (items['[Types/_entity/CloneableMixin]']) {
            resultItems = (items as RecordSet<IFilterItem>).clone();
        } else {
            resultItems = [];
            items.forEach((item) => {
                resultItems.push({...item});
            });
        }
        return resultItems;
    }
}

function getCalculatedFilter(config) {
    const def = new Deferred();
    this._resolveHistoryItems(config.historyId, config.historyItems, config.prefetchParams).then((items) => {
        this._setFilterItems(clone(config.filterButtonSource), clone(config.fastFilterSource), items);
        let calculatedFilter;
        try {
            calculatedFilter = this._calculateFilterByItems(config.filter, this._filterButtonItems, this._fastFilterItems);

            if (config.prefetchParams && config.historyId) {
                const history = this._getHistoryByItems(config.historyId, this._filterButtonItems);

                if (history) {
                    calculatedFilter = Prefetch.applyPrefetchFromHistory(calculatedFilter, history.data);
                }
                calculatedFilter = Prefetch.prepareFilter(calculatedFilter, config.prefetchParams);
            }
        } catch (err) {
            def.errback(err);
            throw err;
        }
        def.callback({
            filter: calculatedFilter,
            historyItems: items,
            filterButtonItems: this._filterButtonItems,
            fastFilterItems: this._fastFilterItems
        });
        return items;
    }).addErrback(function(err) {
        def.errback(err);
        return err;
    });
    return def;
}

function saveFilterToHistory(config) {
    if (!config.historyId) {
        throw new Error('Controls/_filter/Controller::historyId is required');
    }
    this._setIsFastProperty(config.filterButtonItems, config.fastFilterItems);
    return this._addToHistory(config.filterButtonItems, config.fastFilterItems, config.historyId);
}
