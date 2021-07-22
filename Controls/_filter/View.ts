import rk = require('i18n!Controls');
import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_filter/View/View';
import * as defaultItemTemplate from 'wml!Controls/_filter/View/ItemTemplate';

import {detection, IoC} from 'Env/Env';
import {SyntheticEvent} from 'Vdom/Vdom';
import {RegisterUtil, UnregisterUtil} from 'Controls/event';
import Store from 'Controls/Store';
import {factory as CollectionFactory, RecordSet, List} from 'Types/collection';
import {isEqual} from 'Types/object';
import {object} from 'Types/util';
import {factory} from 'Types/chain';
import {Model, CancelablePromise} from 'Types/entity';
import {ICrudPlus, QueryWhereExpression} from 'Types/source';
import CoreClone = require('Core/core-clone');
import Merge = require('Core/core-merge');
import {load} from 'Core/library';

import {error as dataSourceError, NewSourceController as SourceController} from 'Controls/dataSource';
import {dropdownHistoryUtils as historyUtils} from 'Controls/dropdown';
import {
    StickyOpener,
    StackOpener,
    DialogOpener,
    DependencyTimer,
    IPopupOptions,
    IStickyPopupOptions
} from 'Controls/popup';
import {
    getItemsWithHistory,
    isHistorySource,
    getUniqItems,
    deleteHistorySourceFromConfig
} from 'Controls/_filter/HistoryUtils';
import {hasResetValue, resetFilter, resetFilterItem} from 'Controls/_filter/resetFilterUtils';
import converterFilterItems = require('Controls/_filter/converterFilterItems');
import mergeSource from 'Controls/_filter/Utils/mergeSource';
import {descriptor} from 'Types/entity';

import {IFilterItem, IEditorOptions, TKey, TNavigation} from './View/interface/IFilterItem';
import {IFilterView, IFilterViewOptions} from './View/interface/IFilterView';
import {Source as HistorySource} from 'Controls/history';
import 'css!Controls/filter';

interface IFilterReceivedState {
    configs: IFilterItemConfigs;
}

interface IFilterItemConfig extends IEditorOptions {
    emptyText: string;
    emptyKey: boolean | string | number;
    sourceController: SourceController;
    popupItems: RecordSet;
    items: RecordSet;
    initSelectorItems: RecordSet;
}

interface IFilterItemConfigs {
    [key: string]: IFilterItemConfig;
}

interface IDisplayText {
    text?: string;
    hasMoreText?: string;
    title?: string;
}

interface IResultPopup {
    id: string;
    data: Model[];
    selectedItems?: RecordSet;
    selectedKeys?: TKey[];
    action: string;
    items?: IFilterItem[];
    history?: IFilterItem[];
}

const DEFAULT_FILTER_NAME = 'all_frequent';
const FILTER_PANEL_POPUP_STACK = 'Controls/filterPanelPopup:Stack';
const FILTER_PANEL_POPUP = 'Controls/filterPanelPopup';

/**
 * Контрол "Объединенный фильтр". Предоставляет возможность отображать и редактировать фильтр в удобном для пользователя виде.
 * Состоит из кнопки-иконки, строкового представления выбранного фильтра и параметров быстрого фильтра.
 * @remark
 * При клике на кнопку-иконку или строковое представления открывается панель фильтров, созданная на основе {@link Controls/filterPopup:DetailPanel}.
 * При клике на параметры быстрого фильтра открывается панель "Быстрых фильтров", созданная на основе {@link Controls/filterPopup:SimplePanel}.
 *
 * Полезные ссылки:
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/filter/filter-view/ руководство разработчика по работе с контролом}
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/filter-and-search/ руководство разработчика по организации поиска и фильтрации в реестре}
 * * {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/component-kinds/ руководство разработчика по классификации контролов Wasaby и схеме их взаимодействия}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_filter.less переменные тем оформления filter}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_filterPopup.less переменные тем оформления filterPopup}
 *
 * @public
 * @author Михайлов С.Е.
 *
 * @demo Controls-demo/FilterView/ItemTemplates/Index
 * @demo Controls-demo/FilterView/FilterView
 *
 * @see Controls/filterPopup:SimplePanel
 * @see Controls/filterPopup:DetailPanel
 * @see Controls/filter:ViewContainer
 */

/*
 * Control for data filtering. Consists of an icon-button, a string representation of the selected filter and fast filter parameters.
 * Clicking on a icon-button or a string opens the detail panel. {@link Controls/filterPopup:DetailPanel}
 * Clicking on fast filter parameters opens the simple panel. {@link Controls/filterPopup:SimplePanel}
 * Here you can see <a href="/materials/Controls-demo/app/Controls-demo%2FFilterView%2FFilterView">demo-example</a>.
 *
 * @class Controls/_filter/View
 * @extends UI/Base:Control
 *
 * @public
 * @author Золотова Э.Е.
 * @see Controls/filterPopup:SimplePanel
 * @see Controls/filterPopup:DetailPanel
 * @see Controls/filter:FastContainer
 */

class FilterView extends Control<IFilterViewOptions, IFilterReceivedState> implements IFilterView {
    readonly '[Controls/_filter/View/interface/IFilterView]': boolean;
    protected _template: TemplateFunction = template;
    protected _displayText: {[key: string]: IDisplayText};
    protected _filterText: string;
    protected _configs: IFilterItemConfigs;
    protected _source: IFilterItem[];
    protected _dateRangeItem: IFilterItem;
    protected _hasResetValues: boolean;
    private _idOpenSelector: string;
    private _dependenciesTimer: DependencyTimer;
    private _filterPopupOpener: StackOpener | StickyOpener;
    private _stackOpener: StackOpener;
    private _detailPanelTemplateName: string;
    private _openCallbackId: string;
    private _resetCallbackId: string;
    private _storeCtxCallbackId: string;
    private _loadPromise: CancelablePromise<any>;
    private _loadOperationsPanelPromise: Promise<unknown>;
    private _collapsedFilters: string[]|number[] = null;

    openDetailPanel(): void {
        if (this._detailPanelTemplateName) {
            const panelItems = converterFilterItems.convertToDetailPanelItems(this._source);
            let popupOptions: IStickyPopupOptions =  {
                fittingMode: {
                    horizontal: 'overflow',
                    vertical: 'overflow'
                }
            };
            if (this._options.alignment === 'right') {
                popupOptions.targetPoint = {
                    vertical: 'top',
                    horizontal: 'right'
                };
                popupOptions.direction = {
                    horizontal: 'left'
                };
            }
            popupOptions = Merge(popupOptions, this._options.detailPanelPopupOptions || {});
            popupOptions.template = this._detailPanelTemplateName;
            if (this._detailPanelTemplateName !== FILTER_PANEL_POPUP_STACK) {
                popupOptions.className = 'controls-FilterButton-popup-orientation-' + (this._options.alignment === 'right' ? 'left' : 'right');
            }
            popupOptions.templateOptions = this._options.detailPanelTemplateOptions || {};
            this._open(panelItems, popupOptions);
        } else {
            this._openPanel();
        }
    }

    reset(): void {
        resetFilter(this._source);
        this._notifyChanges(this._source);
        this._updateText(this._source, this._configs);
    }

    protected _beforeMount(options: IFilterViewOptions,
                           context: object,
                           receivedState: IFilterReceivedState): Promise<IFilterReceivedState> {
        this._configs = {} as IFilterItemConfigs;
        this._displayText = {};
        let resultDef;

        if (receivedState) {
            this._configs = receivedState.configs;
            this._resolveItems(options.source);
            this._calculateStateSourceControllers(this._configs, this._source);
            this._updateText(this._source, this._configs);
        } else if (options.source) {
            this._resolveItems(options.source);
            resultDef = this._reload(true, !!options.panelTemplateName);
            if (!resultDef) {
                this._updateText(this._source, this._configs);
            }
        }
        this._detailPanelTemplateName = this._getDetailPanelTemplateName(options);
        return resultDef;
    }

    protected _afterMount(options: IFilterViewOptions): void {
        if (options.useStore) {
            this._subscribeStoreCommands();
            this._storeCtxCallbackId = Store.onPropertyChanged('_contextName', () => {
                Store.unsubscribe(this._openCallbackId);
                Store.unsubscribe(this._resetCallbackId);
                this._subscribeStoreCommands();
            }, true);
        }
    }

    _subscribeStoreCommands(): void {
        this._openCallbackId = Store.declareCommand(
            'openFilterDetailPanel',
            this.openDetailPanel.bind(this)
        );
        this._resetCallbackId = Store.declareCommand('resetFilter', this.reset.bind(this));
    }

    protected _getItemsForReload(
        oldItems: IFilterItem[],
        newItems: IFilterItem[],
        configs: IFilterItemConfigs
    ): IFilterItem[] {
        const optionsToCheck = ['source', 'filter', 'navigation'];
        const getOptionsChecker = (oldItem, newItem) => {
            return (changed, optName) => changed ||
                !isEqual(oldItem.editorOptions[optName], newItem.editorOptions[optName]);
        };
        const result = [];
        factory(newItems).each((newItem) => {
            const oldItem = this._getItemByName(oldItems, newItem.name);
            const newItemIsFrequent = this._isFrequentItem(newItem);
            const oldItemIsFrequent = oldItem && this._isFrequentItem(oldItem);
            const needHistoryReload = configs && configs[newItem.name] && !configs[newItem.name].sourceController;
            const valueChanged = oldItem && !isEqual(newItem.value, oldItem.value);
            if (
                newItemIsFrequent &&
                (!oldItem || !oldItemIsFrequent || optionsToCheck.reduce(getOptionsChecker(oldItem, newItem), false)
                    || (valueChanged && configs && !configs[newItem.name]) || needHistoryReload)
            ) {
                if (valueChanged && !isEqual(newItem.value, newItem.resetValue)) {
                    result.push(newItem);
                } else if (configs && configs[newItem.name]) {
                    // Загрузим перед открытием
                    delete configs[newItem.name];
                }
            }
        });
        return result;
    }

    protected _beforeUpdate(newOptions: IFilterViewOptions): void {
        if (newOptions.source && newOptions.source !== this._options.source) {
            let resultDef;
            this._resolveItems(newOptions.source);
            this._detailPanelTemplateName = this._getDetailPanelTemplateName(newOptions);
            const itemsForReload = this._getItemsForReload(this._options.source, newOptions.source, this._configs);
            if (itemsForReload.length) {
                this._clearConfigs(this._source, this._configs);
                resultDef = this._reload(null, !!newOptions.panelTemplateName, itemsForReload);
            } else if (this._loadPromise) {
                resultDef = this._loadPromise.promise.then(() => {
                    return this._loadSelectedItems(this._source, this._configs).then(() => {
                        this._updateText(this._source, this._configs);
                    });
                });
            } else {
                resultDef = this._loadSelectedItems(this._source, this._configs).then(() => {
                    this._updateText(this._source, this._configs);
                    if (this._getFilterPopupOpener().isOpened()) {
                        this.openDetailPanel();
                    }
                });
            }
            return resultDef;
        }
    }

    protected _beforeUnmount(): void {
        if (this._loadPromise) {
            this._loadPromise.cancel();
            this._loadPromise = null;
        }
        this._configs = null;
        this._displayText = null;
        UnregisterUtil(this, 'scroll', {listenAll: true});
        if (this._filterPopupOpener) {
            this._filterPopupOpener.destroy();
        }
        if (this._stackOpener) {
            this._stackOpener.destroy();
        }
        if (this._dialogOpener) {
            this._dialogOpener.destroy();
        }
        if (this._options.useStore) {
            Store.unsubscribe(this._openCallbackId);
            Store.unsubscribe(this._resetCallbackId);
            Store.unsubscribe(this._storeCtxCallbackId);
        }
    }

    protected _mouseEnterHandler(): void {
        if (!this._options.readOnly) {
            if (!this._dependenciesTimer) {
                this._dependenciesTimer = new DependencyTimer();
            }
            this._dependenciesTimer.start(this._loadDependencies.bind(this));
        }
    }

    protected _openPanel(event?: SyntheticEvent<Event>, name?: string): Promise<void>|void {
        const isLoading = this._loadPromise && !this._loadPromise.promise.isReady();
        if (this._options.panelTemplateName && this._sourcesIsLoaded(this._configs) && !isLoading) {
            const clickOnFrequentItem = !!name;
            const target = clickOnFrequentItem && event.currentTarget;
            return this._loadUnloadedFrequentItems(this._configs, this._source).then(() => {
                const items = new RecordSet({
                    rawData: this._getPopupConfig(this._configs, this._source)
                });
                const popupOptions: IStickyPopupOptions = {
                    template: this._options.panelTemplateName,
                    fittingMode: {
                        horizontal: 'overflow',
                        vertical: 'adaptive'
                    }
                };

                if (clickOnFrequentItem) {
                    /*
                        В кейсе, когда переопределен itemTemplate, контейнера нет в _children
                        Нужно открыться от таргета, который закэширован перед запросом.
                     */
                    popupOptions.target = this._children[name] ||
                        target.getElementsByClassName('js-controls-FilterView__target')[0];
                    popupOptions.className = 'controls-FilterView-SimplePanel-popup';
                } else {
                    popupOptions.className = 'controls-FilterView-SimplePanel__buttonTarget-popup';
                }
                popupOptions.templateOptions = this._options.panelTemplateOptions || {};
                this._open(items, popupOptions);
            }, (error) => {
                // Если во время загрузки данных произошла ошибка, то попытаемся догрузить при следующем открытии
                this._configs = {};
                dataSourceError.process({ error });
            });
        } else if (!this._options.panelTemplateName) {
            this._showSelector(name);
        }
    }

    protected _rangeTextChangedHandler(event: Event, textValue: string): void {
        const dateRangeItem = this._getDateRangeItem(this._source);
        dateRangeItem.textValue = textValue;
    }

    protected _rangeValueChangedHandler(event: Event, start: Date, end: Date): void {
        const dateRangeItem = this._getDateRangeItem(this._source);
        dateRangeItem.value = [start, end];
        this._dateRangeItem = object.clone(dateRangeItem);
        this._notifyChanges(this._source);
    }

    protected _isFastReseted(): boolean {
        let isReseted = true;
        factory(this._source).each((item) => {
            if (this._isFrequentItem(item) && this._isItemChanged(item)) {
                isReseted = false;
            }
        });
        return isReseted;
    }

    protected _needShowFastFilter(source: IFilterItem[]): boolean {
        let needShowFastFilter = false;

        factory(source).each((item) => {
            if (!needShowFastFilter && this._isFrequentItem(item)) {
                needShowFastFilter = true;
            }
        });

        return needShowFastFilter;
    }

    protected _reset(event: Event, item: IFilterItem): void {
        const opener = this._getFilterPopupOpener();
        if (opener.isOpened()) {
            opener.close();
        }
        const newValue = object.getPropertyValue(item, 'resetValue');
        object.setPropertyValue(item, 'value', newValue);
        this._notifyChanges(this._source);
        this._updateText(this._source, this._configs);
    }

    protected _resetFilterText(): void {
        const opener = this._getFilterPopupOpener();
        if (opener.isOpened()) {
            opener.close();
        }
        factory(this._source).each((item) => {
            // Быстрые фильтры и фильтр выбора периода
            // не должны сбрасываться по клику на крестик строки выбранных параметров
            if (!this._isFrequentItem(item) && item.type !== 'dateRange') {
                resetFilterItem(item);
            }
        });
        this._notifyChanges(this._source);
        this._updateText(this._source, this._configs);
    }

    private _getDetailPanelTemplateName({detailPanelTemplateName, detailPanelOpenMode}: IFilterViewOptions): string {
        return detailPanelOpenMode === 'stack' ? FILTER_PANEL_POPUP_STACK : detailPanelTemplateName;
    }

    private _open(items: RecordSet, panelPopupOptions: IPopupOptions): void {
        if (this._options.readOnly) {
            return;
        }
        if (!detection.isMobileIOS) {
            RegisterUtil(this, 'scroll', this._handleScroll.bind(this), {listenAll: true});
        }
        const popupOptions = {
            opener: this,
            templateOptions: {
                items,
                collapsedGroups: this._collapsedFilters,
                historyId: this._options.historyId
            },
            target: this._container[0] || this._container,
            className: 'controls-FilterView-popup',
            closeOnOutsideClick: true,
            eventHandlers: {
                onResult: this._resultHandler.bind(this)
            }
        };
        if (this._options.detailPanelOpenMode === 'stack' && !this._container.closest('.controls-StackTemplate')) {
            popupOptions.restrictiveContainer = '.sabyPage-MainLayout__rightPanel_border.sabyPage-MainLayout__rightPanel';
        }
        Merge(popupOptions, panelPopupOptions);
        popupOptions.className += ` controls_popupTemplate_theme-${this._options.theme} controls_filter_theme-${this._options.theme} controls_filterPopup_theme-${this._options.theme} controls_dropdownPopup_theme-${this._options.theme}`;
        this._getFilterPopupOpener().open(popupOptions);
    }

    private _handleScroll(): void {
        const opener = this._getFilterPopupOpener();
        if (opener.isOpened()) {
            opener.close();
        }
    }

    private _getFilterPopupOpener(): StickyOpener|StackOpener {
        if (!this._filterPopupOpener) {
            this._filterPopupOpener = this._options.detailPanelOpenMode === 'stack' ?
                new StackOpener() : new StickyOpener();
        }
        return this._filterPopupOpener;
    }

    private _getStackOpener(): StackOpener {
        if (!this._stackOpener) {
            this._stackOpener = new StackOpener();
        }
        return this._stackOpener;
    }

    private _getDialogOpener(): DialogOpener {
        if (!this._dialogOpener) {
            this._dialogOpener = new DialogOpener();
        }
        return this._dialogOpener;
    }

    private _resultHandler(result: IResultPopup): void {
        if (!result.action) {
            const filterSource = converterFilterItems.convertToFilterSource(result.items);
            this._resolveItems(mergeSource(this._source, filterSource));
            this._updateText(this._source, this._configs, true);
        } else {
            switch (result.action) {
                case 'itemClick': this._itemClick(result); break;
                case 'applyClick': this._applyClick(result); break;
                case 'selectorResult': this._selectorResult(result); break;
                case 'moreButtonClick': this._moreButtonClick(result); break;
                case 'collapsedFiltersChanged': this._collapsedFiltersChanged(result); break;
            }
        }
        if (result.action !== 'moreButtonClick' && result.action !== 'collapsedFiltersChanged') {
            if (result.history) {
                this._notify('historyApply', [result.history]);
            }
            this._notifyChanges(this._source);
        }
        if (this._options.detailPanelOpenMode !== 'stack') {
            this._getFilterPopupOpener().close();
        }
    }

    private _onSelectorTemplateResult(items: RecordSet): void {
        const config = this._configs[this._idOpenSelector];
        if (!config.items && items.getCount()) {
            config.items = factory(items).value(CollectionFactory.recordSet, {
                keyProperty: items.at(0).getKeyProperty(),
                adapter: items.at(0).getAdapter(),
                format: items.at(0).getFormat()
            });
        }
        const resultSelectedItems = this._notify('selectorCallback',
            [this._configs[this._idOpenSelector].initSelectorItems, items, this._idOpenSelector]) || items;
        this._resultHandler({action: 'selectorResult',
            id: this._idOpenSelector, data: resultSelectedItems as Model[]});
    }

    private _openSelector(filterItem: IFilterItem, selectedKeys: string[]): Promise<void> {
        const selectedItems = [];
        const items = this._configs[filterItem.name]?.popupItems || this._configs[filterItem.name]?.items;
        factory(selectedKeys).each((key) => {
            if (key !== undefined && key !== null) {
                const index = items.getIndexByValue(this._configs[filterItem.name].keyProperty, key);
                if (index !== -1) {
                    selectedItems.push(items.at(index));
                }
            }
        });
        const selectorTemplate = filterItem.editorOptions.selectorTemplate;
        const templateOptions = object.clone(selectorTemplate.templateOptions) || {};
        templateOptions.multiSelect = filterItem.editorOptions.multiSelect;
        templateOptions.selectedItems = new List({
            items: selectedItems
        });
        this._idOpenSelector = filterItem.name;
        this._configs[filterItem.name].initSelectorItems = templateOptions.selectedItems;
        return this._getStackOpener().open({
            opener: this,
            template: filterItem.editorOptions.selectorTemplate.templateName,
            templateOptions,
            eventHandlers: {
                onSelectComplete: (event, result): void => {
                    this._onSelectorTemplateResul(result);
                    this._getStackOpener().close();
                },
                onResult: this._onSelectorTemplateResult.bind(this)
            }
        });
    }

    private _showSelector(filterName?: string): Promise<void> {
        let item = null;
        if (filterName && filterName !== DEFAULT_FILTER_NAME) {
            item = this._getItemByName(this._source, filterName);
        } else {
            item = factory(this._source).filter((filterItem) => this._isFrequentItem(filterItem)).first();
        }
        if (item) {
            const name = item.name;

            if (!this._configs[name]) {
                this._getConfigByItem(item);
            }
            if (item?.editorOptions.selectorTemplate) {
                const items = this._configs[name]?.popupItems || this._configs[name]?.items;
                const selectedKeys = item.editorOptions.multiSelect ? item.value : [item.value];
                if (items) {
                    return this._openSelector(item, selectedKeys);
                } else {
                    return this._loadItems(item).then(() => {
                        return this._openSelector(item, selectedKeys);
                    });
                }
            }
        }
    }

    private _getItemByName(items: IFilterItem[], name: string): IFilterItem {
        let result;
        factory(items).each((item) => {
            if (item.name === name) {
                result = item;
            }
        });
        return result;
    }

    private _isFrequentItem(item: IFilterItem): boolean {
        return item.viewMode === 'frequent' && item.type !== 'dateRange';
    }

    private _resolveItems(items: IFilterItem[]): void {
        // When serializing the Date, "_serializeMode" field is deleted, so object.clone can't be used
        this._source = CoreClone(items);
        this._hasResetValues = hasResetValue(items);
    }

    private _sourcesIsLoaded(configs: IFilterItemConfigs): boolean {
        let result = true;
        factory(configs).each((config) => {
            if (config.sourceController && config.sourceController.isLoading()) {
                result = false;
            }
        });
        return result;
    }

    private _calculateStateSourceControllers(configs: IFilterItemConfigs, source: IFilterItem[]): void {
        factory(source).each((item) => {
            const config = configs[item.name];
            if (this._isFrequentItem(item) && config?.items) {
                const sourceController = this._getSourceController(configs[item.name], item.editorOptions.source,
                    item.editorOptions.navigation);
                sourceController.setItems(configs[item.name].items);
            }
        });
    }

    private _getSourceController(config: IFilterItemConfig,
                                 source: ICrudPlus | HistorySource,
                                 navigation: TNavigation): SourceController {
        if (!config.sourceController) {
            config.sourceController = new SourceController({
                source: source as ICrudPlus,
                navigation
            });
        }
        return config.sourceController;
    }

    private _getDateRangeItem(items: IFilterItem[]): IFilterItem {
        let dateRangeItem;
        factory(items).each((item) => {
            if (item.type === 'dateRange') {
                dateRangeItem = item;
            }
        });
        return dateRangeItem;
    }

    private _loadUnloadedFrequentItems(configs: IFilterItemConfigs, items: IFilterItem[]): Promise<RecordSet[]> {
        const loadPromises = [];
        factory(items).each((item): void => {
            if (this._isFrequentItem(item) && (!configs[item.name] || !configs[item.name].items)) {
                loadPromises.push(this._loadItems(item));
            }
        });
        return Promise.all(loadPromises).then(() => {
            return this._loadSelectedItems(this._source, this._configs);
        });
    }

    private _getPopupConfig(configs: IFilterItemConfigs, items: IFilterItem[]) {
        const popupItems = [];
        factory(items).each((item) => {
            if (this._isFrequentItem(item)) {
                const popupItem = CoreClone(configs[item.name]);
                Merge(popupItem, item.editorOptions);
                popupItem.id = item.name;
                popupItem.selectedKeys = (item.value instanceof Object) ? item.value : [item.value];
                popupItem.resetValue = (item.resetValue instanceof Object) ? item.resetValue : [item.resetValue];
                popupItem.items = configs[item.name].popupItems || popupItem.items;
                popupItem.selectorItems = configs[item.name].items;
                if (item.editorOptions.source) {
                    if (!configs[item.name].source && (!configs[item.name].loadDeferred || configs[item.name].loadDeferred.isReady())) {  // TODO https://online.sbis.ru/opendoc.html?guid=99e97896-1953-47b4-9230-8b28e50678f8
                        popupItem.loadDeferred = this._loadItemsFromSource(configs[item.name], item.editorOptions.source, popupItem.filter, item.editorOptions.navigation);
                        configs[item.name].loadDeferred = popupItem.loadDeferred;
                    }
                    if (!configs[item.name].sourceController) {
                        const sourceController = this._getSourceController(configs[item.name], item.editorOptions.source, item.editorOptions.navigation);
                        sourceController.setItems(popupItem.items);
                    }
                    popupItem.hasMoreButton = configs[item.name].sourceController.hasMoreData('down');
                    popupItem.sourceController = configs[item.name].sourceController;
                    popupItem.selectorOpener = this._getStackOpener();
                    popupItem.dialogOpener = this._getDialogOpener();
                    popupItem.selectorDialogResult = this._onSelectorTemplateResult.bind(this);
                    popupItem.opener = this;
                }
                popupItems.push(popupItem);
            }
        });
        return popupItems;
    }

    private _getFolderIds(items: RecordSet,
                          {nodeProperty, parentProperty, keyProperty}: IFilterItemConfig): TKey[] {
        const folders = [];
        factory(items).each((item) => {
            if (item.get(nodeProperty) && !item.get(parentProperty)) {
                folders.push(item.get(keyProperty));
            }
        });
        return folders;
    }

    private _getHasMoreText(selection: TKey[]): string {
        return selection.length > 1 ? ', ' + rk('еще') + ' ' + (selection.length - 1) : '';
    }

    private _getFastText(config: IFilterItemConfig, selectedKeys: string[], item?: IFilterItem): IDisplayText {
        const textArr = [];
        const displayTextValue = item?.displayTextValue;
        if (selectedKeys[0] === config.emptyKey && config.emptyText) {
            textArr.push(config.emptyText);
        } else if (config.items) {
            factory(selectedKeys).each((key) => {
                const selectedItem = config.items.at(config.items.getIndexByValue(config.keyProperty, key));
                if (selectedItem) {
                    textArr.push(object.getPropertyValue(selectedItem, config.displayProperty));
                }
            });
        } else if (displayTextValue) {
            return {
                ...displayTextValue,
                title: item?.textValue ? item.textValue : ''
            };
        } else if (item?.textValue) {
            textArr.push(item.textValue);
        }
        return {
            text: textArr[0] || '',
            title: textArr.join(', '),
            hasMoreText: this._getHasMoreText(textArr)
        };
    }

    private _getFilterButtonText(items: IFilterItem[]): string {
        const textArr = [];
        let textValue;
        factory(items).each((item) => {
            if (!this._isFrequentItem(item) && item.type !== 'dateRange' &&
                (item.viewMode !== 'extended' || item.visibility === true) && this._isItemChanged(item)) {
                textValue = item.textValue;
                if (textValue) {
                    textArr.push(textValue);
                }
            }
        });
        return textArr.join(', ');
    }

    private _updateText(items: IFilterItem[], configs: IFilterItemConfigs, detailPanelHandler: boolean = false): void {
        factory(items).each((item: IFilterItem) => {
            if (this._isFrequentItem(item)) {
                this._displayText[item.name] = {};
                if (this._isItemChanged(item)) {
                    if (configs[item.name]) {
                        const nodeProperty = configs[item.name].nodeProperty;
                        const selectedKeys = configs[item.name].multiSelect || nodeProperty ? item.value : [item.value];

                        // [ [selectedKeysList1], [selectedKeysList2] ] in hierarchy list
                        const flatSelectedKeys = nodeProperty ? factory(selectedKeys).flatten().value() : selectedKeys;
                        const displayText = this._getFastText(configs[item.name], flatSelectedKeys, item);
                        this._displayText[item.name] = displayText;
                        if (!displayText.text && detailPanelHandler) {
                            // If method is called after selecting from detailPanel,
                            // then textValue will contains actual display value
                            displayText.text = item.textValue && item.textValue.split(', ')[0];
                            displayText.hasMoreText = this._getHasMoreText(flatSelectedKeys);
                        }
                        if (item.textValue !== undefined && !detailPanelHandler) {
                            item.textValue = displayText.title;
                            item.displayTextValue = displayText;
                        }
                    } else if (item.textValue) {
                        /* Сюда мы попадем только в случае, когда фильтр выбрали с панели фильтров,
                           но не открывали справочник и панель быстрых фильтров
                        */
                        const selectedKeys = item.editorOptions?.multiSelect ? item.value : [item.value];
                        this._displayText[item.name] = this._getFastText({}, selectedKeys, item);
                    }
                }
            }
        });
        this._filterText = this._getFilterButtonText(items);
        this._dateRangeItem = this._getDateRangeItem(items);
        this._displayText = {...this._displayText};
    }

    private _isItemChanged(item: IFilterItem): boolean {
        return !isEqual(object.getPropertyValue(item, 'value'), object.getPropertyValue(item, 'resetValue'));
    }

    private _getKeysUnloadedItems(config: IFilterItemConfig, value: TKey | TKey[]): TKey[] {
        const selectedKeys = value instanceof Object ? value : [value];
        const flattenKeys = factory(selectedKeys).flatten().value();
        const newKeys = [];
        if (config.items) {
            factory(flattenKeys).each((key) => {
                if (key !== undefined && !config.items.getRecordById(key) &&
                    !(key === config.emptyKey && config.emptyText)) {
                    newKeys.push(key);
                }
            });
        }
        return newKeys;
    }

    private _getPreparedItems(config: IFilterItemConfig,
                              item: IFilterItem,
                              newItems: Model[],
                              folderId: TKey): RecordSet {
        const getItemsByParentKey = (items: Model[] | RecordSet) => {
            return factory(items).filter((popupItem) => {
                return popupItem.get(config.parentProperty) === folderId;
            });
        };

        let folderItems: RecordSet = getItemsByParentKey(config.popupItems).value(CollectionFactory.recordSet, {
            adapter: config.popupItems.getAdapter(),
            keyProperty: config.popupItems.getKeyProperty(),
            format: config.popupItems.getFormat(),
            model: config.popupItems.getModel()
        });
        const newFolderItems = getItemsByParentKey(newItems).value();
        folderItems = getItemsWithHistory(folderItems, newFolderItems,
            config.sourceController, item.editorOptions.source, config.keyProperty, folderId);
        folderItems.prepend([config.popupItems.getRecordById(folderId)]);
        return folderItems;
    }

    private _setItems(config: IFilterItemConfig, item: IFilterItem, newItems: Model[]): void {
        if (config.nodeProperty) {
            config.popupItems = config.popupItems || config.items.clone();
            const folders = this._getFolderIds(config.popupItems, config);
            let resultItems;
            factory(folders).each((folderId) => {
                if (!resultItems) {
                    resultItems = this._getPreparedItems(config, item, newItems, folderId);
                } else {
                    resultItems.append(this._getPreparedItems(config, item, newItems, folderId));
                }
            });
            config.popupItems.assign(resultItems);
            if (isHistorySource(item.editorOptions.source)) {
                config.popupItems = (item.editorOptions.source as HistorySource).prepareItems(config.popupItems);
            }
        } else {
            config.popupItems = getItemsWithHistory(config.popupItems || config.items.clone(), newItems,
                config.sourceController, item.editorOptions.source, config.keyProperty);
        }
        config.items = getUniqItems(config.items, newItems, config.keyProperty);
    }

    private _loadSelectedItems(items: IFilterItem[], configs: IFilterItemConfigs): Promise<RecordSet[]> {
        const loadPromises = [];
        factory(items).each((item) => {
            if (this._isFrequentItem(item) && configs[item.name]) {
                const config = configs[item.name];
                const keys = this._getKeysUnloadedItems(config, item.value as TKey);
                if (keys.length) {
                    const editorOpts = {
                        source: item.editorOptions.source,
                        filter: {...config.filter}
                    };

                    const keyProperty = config.keyProperty;
                    editorOpts.filter[keyProperty] = keys;
                    const result = this._loadItemsFromSource({}, editorOpts.source, editorOpts.filter, null,
                        // FIXME https://online.sbis.ru/opendoc.html?guid=b6ca9523-38ce-42d3-a3ec-36be075bccfe
                        item.editorOptions.dataLoadCallback,
                        false).then((newItems) => {

                        this._setItems(config, item, newItems);
                    });
                    loadPromises.push(result);
                }
            }
        });
        return Promise.all(loadPromises);
    }

    private _loadItemsFromSource(instance,
                                 source: ICrudPlus | HistorySource,
                                 filter: QueryWhereExpression<unknown>,
                                 navigation?: TNavigation,
                                 dataLoadCallback?: Function,
                                 withHistory: boolean = true): Promise<RecordSet> {
        let queryFilter = Merge({}, filter);
        if (instance.nodeProperty) {
            queryFilter = Merge(queryFilter, {historyId: instance.historyId});
        }
        // As the data source can be history source, then you need to merge the filter
        queryFilter = withHistory ? historyUtils.getSourceFilter(queryFilter, source) : queryFilter;
        const sourceController = this._getSourceController(instance, source, navigation);
        sourceController.setFilter(queryFilter);

        return sourceController.load().then((items: RecordSet) => {
            instance.items = items;
            if (dataLoadCallback) {
                dataLoadCallback(items);
            }
            return items;
        });
    }

    private _getConfigByItem(item: IFilterItem): void {
        const options = item.editorOptions;
        this._configs[item.name] = Merge(this._configs[item.name] || {}, CoreClone(options), {ignoreRegExp: /dataLoadCallback/});
        this._configs[item.name].emptyText = item.emptyText;
        this._configs[item.name].emptyKey = item.hasOwnProperty('emptyKey') ? item.emptyKey : null;
        this._configs[item.name].sourceController = null;
        this._configs[item.name].popupItems = null;
    }

    private _loadItems(item: IFilterItem): Promise<void | RecordSet>  {
        const options = item.editorOptions;
        this._getConfigByItem(item);
        if (options.source) {
            return this._loadItemsFromSource(this._configs[item.name],
                options.source, options.filter, options.navigation, options.dataLoadCallback);
        } else {
            return Promise.resolve();
        }
    }

    private _notifyChanges(items: IFilterItem[]): void {
        this._notify('filterChanged', [this._getFilter(items)]);
        this._notify('itemsChanged', [items]);
    }

    private _getFilter(items: IFilterItem[]): QueryWhereExpression<unknown> {
        const filter = {};
        factory(items).each((item) => {
            if (this._isItemChanged(item)) {
                filter[item.name] = item.value;
            }
        });
        return filter;
    }

    private _clearConfigs(source: IFilterItem[], configs: IFilterItemConfigs): void {
        const newConfigs = CoreClone(configs);
        factory(newConfigs).each((config, name: string) => {
            const item = this._getItemByName(source, name);
            if (!item || !this._isFrequentItem(item)) {
                delete configs[name];
            }
        });
    }

    private _reload(onlyChangedItems: boolean = false,
                    hasSimplePanel: boolean = true,
                    items?: IFilterItem[]): Promise<IFilterReceivedState> | void {
        const loadPromises = [];
        factory(items || this._source).each((item) => {
            if (this._isFrequentItem(item)) {
                if (!onlyChangedItems || this._isItemChanged(item)) {
                    if (hasSimplePanel) {
                        if (!item.textValue) {
                            const result = this._loadItems(item);
                            loadPromises.push(result);
                        } else {
                            this._getConfigByItem(item);
                        }
                    } else {
                        this._getConfigByItem(item);
                        loadPromises.push(this._loadSelectedItems([item], this._configs));
                    }
                }
            }
        });

        if (loadPromises.length) {
            this._loadPromise = new CancelablePromise(Promise.all(loadPromises));

            // At first, we will load all the lists in order not to cause blinking of the interface and many redraws.
            return this._loadPromise.promise.then(() => {
                return this._loadSelectedItems(this._source, this._configs).then(() => {
                    this._updateText(this._source, this._configs);
                    return {
                        configs: deleteHistorySourceFromConfig(this._configs, 'source')
                    };
                });
            });
        }
    }

    private _setValue(selectedKeys: TKey | TKey[], name: string): void {
        const config = this._configs[name];
        const item = this._getItemByName(this._source, name);
        const resetValue: TKey = object.getPropertyValue(item, 'resetValue');

        if (config.nodeProperty) {
            selectedKeys = this._prepareHierarchySelection(selectedKeys, config, resetValue);
        }
        let value;
        if (selectedKeys instanceof Array &&
            (!selectedKeys.length || selectedKeys.includes(resetValue) || isEqual(selectedKeys, resetValue)
            // empty item is selected, but emptyKey not set
            || item.emptyText && !item.hasOwnProperty('emptyKey') && selectedKeys.includes(null))) {
            value = object.getPropertyValue(item, 'resetValue');
        } else if (this._configs[name].multiSelect || this._configs[item.name].nodeProperty) {
            value = selectedKeys;
        } else {
            value = selectedKeys[0];
        }
        object.setPropertyValue(item, 'value', value);
    }

    private _getNewItems(selectedItems: Model[], config: IFilterItemConfig): Model[] {
        const newItems = [];
        const keyProperty = config.keyProperty;

        factory(selectedItems).each((item) => {
            if (item.has(keyProperty)) {
                newItems.push(item);
            }
        });
        return newItems;
    }

    private _getSelectedKeys(items: Model[], config: IFilterItemConfig): TKey[] | object {
        let selectedKeys;

        const getHierarchySelectedKeys = () => {
            // selectedKeys - { folderId1: [selected keys for folder] , folderId2: [selected keys for folder], ... }
            const folderIds = this._getFolderIds(config.items, config);
            factory(folderIds).each((folderId, index) => {
                selectedKeys[folderId] = [];
                factory(items).each((item) => {
                    if (folderId === item.get(config.keyProperty) || folderId === item.get(config.parentProperty)) {
                        selectedKeys[folderId].push(item.get(config.keyProperty));
                    }
                });
            });
        };

        if (config.nodeProperty) {
            selectedKeys = {};
            getHierarchySelectedKeys();
        } else {
            selectedKeys = [];
            factory(items).each((item) => {
                selectedKeys.push(object.getPropertyValue(item, config.keyProperty));
            });
        }
        return selectedKeys;
    }

    private _getSelectedItems(items: RecordSet, selectedKeys: TKey[]): Model[] {
        const selectedItems = [];
        const flatKeys = factory(selectedKeys).flatten().value();

        factory(flatKeys).each((selectedKey) => {
            if (items.getRecordById(selectedKey)) {
                selectedItems.push(items.getRecordById(selectedKey));
            }
        });
        return selectedItems;
    }

    private _itemClick(result: IResultPopup): void {
        this._setValue(result.selectedKeys, result.id);
        this._updateText(this._source, this._configs);
        this._updateHistory(result.id, result.data, result.selectedKeys);
    }

    private _prepareHierarchySelection(selectedKeys: TKey[],
                                       curConfig: IFilterItemConfig,
                                       resetValue: unknown): object {
        const folderIds = this._getFolderIds(curConfig.items, curConfig);
        let isEmptySelection = true;
        let onlyFoldersSelected = true;

        let resultSelectedKeys = {};
        folderIds.forEach((parentKey, index) => {
            // selectedKeys - { folderId1: [selected keys for folder] , folderId2: [selected keys for folder], ... }
            const nodeSelectedKeys = selectedKeys[parentKey] || [];
            // if folder is selected, delete other keys
            if (nodeSelectedKeys.includes(parentKey)) {
                resultSelectedKeys[parentKey] = [parentKey];
            } else {
                onlyFoldersSelected = false;
                resultSelectedKeys[parentKey] = nodeSelectedKeys;
            }
            if (nodeSelectedKeys.length && !nodeSelectedKeys.includes(curConfig.emptyKey)) {
                isEmptySelection = false;
            }
        });
        if (isEmptySelection || onlyFoldersSelected) {
            resultSelectedKeys = resetValue;
        }
        return resultSelectedKeys;
    }

    private _applyClick(result: IResultPopup): void {
        factory(result.selectedKeys).each((sKey, index: string) => {
            if (sKey) {
                const curConfig = this._configs[index];
                this._setValue(sKey, index);

                const selectedItems = this._getSelectedItems(curConfig.items, sKey);
                this._updateHistory(index, selectedItems);
            }
        });

        this._updateText(this._source, this._configs);
    }

    private _selectorResult(result: IResultPopup): void {
        const curConfig = this._configs[result.id];
        const curItem = this._getItemByName(this._source, result.id);
        const newItems = this._getNewItems(result.data, curConfig);

        this._updateHistory(result.id, factory(result.data).toArray());
        this._setItems(curConfig, curItem, newItems);
        if (isHistorySource(curItem.editorOptions.source) && newItems.length) {
            curConfig.sourceController = null;
        }
        const selectedKeys = this._getSelectedKeys(result.data, curConfig);
        this._setValue(selectedKeys, result.id);
        this._updateText(this._source, this._configs);
    }

    private _moreButtonClick(result: IResultPopup): void {
        this._idOpenSelector = result.id;
        this._configs[result.id].initSelectorItems = result.selectedItems;
    }

    private _collapsedFiltersChanged(result: object): void {
        this._collapsedFilters = result.collapsedFilters;
    }

    private _updateHierarchyHistory(currentFilter: IFilterItemConfig,
                                    selectedItems: Model[],
                                    source: HistorySource): void {
        const folderIds = this._getFolderIds(currentFilter.items, currentFilter);

        const getNodeItems = (parentKey) => {
            const nodeItems = [];

            factory(selectedItems).each((item) => {
                if (item.get(currentFilter.parentProperty) === parentKey) {
                    nodeItems.push(item);
                }
            });
            return nodeItems;
        };

        factory(folderIds).each((parentKey) => {
            const nodeHistoryItems = getNodeItems(parentKey);
            if (nodeHistoryItems.length) {
                source.update(nodeHistoryItems, Merge(historyUtils.getMetaHistory(), {parentKey}));
            }
        });
    }

    private _updateHistory(name: string, items: Model[], selectedKeys?: TKey[]): void {
        const source = this._getItemByName(this._source, name).editorOptions.source as HistorySource;
        if (isHistorySource(source)) {
            const currentFilter = this._configs[name];
            let selectedItems = items;
            if (selectedKeys) {
                selectedItems = this._getSelectedItems(currentFilter.items, selectedKeys);
            }
            if (currentFilter.nodeProperty) {
                this._updateHierarchyHistory(currentFilter, selectedItems, source);
            } else {
                source.update(selectedItems, historyUtils.getMetaHistory());
            }
            if (currentFilter.sourceController && source.getItems) {
                currentFilter.items = source.getItems();
            }
        }
    }

    private _loadDependencies(): Promise<unknown> {
        try {
            const popupLibrary = this._options.detailPanelOpenMode === 'stack' ? FILTER_PANEL_POPUP : 'Controls/filterPopup';
            const detailPanelTemplateName = this._detailPanelTemplateName;

            if (!this._loadOperationsPanelPromise) {
                this._loadOperationsPanelPromise = Promise.all([
                    import(popupLibrary),
                    // load потому-что в detailPanelTemplateName могут
                    // передаваться значения вида Controls/filter:Popup, что не поддерживает import()
                    (typeof detailPanelTemplateName === 'string') ?
                        load(detailPanelTemplateName) : null
                ]);
            }
            return this._loadOperationsPanelPromise;
        } catch (e) {
            IoC.resolve('ILogger').error('_filter:View', e);
        }
    }

    static getDefaultOptions(): Partial<IFilterViewOptions> {
        return {
            panelTemplateName: 'Controls/filterPopup:SimplePanel',
            alignment: 'right',
            itemTemplate: defaultItemTemplate,
            detailPanelOpenMode: 'sticky',
            source: []
        };
    }
    static getOptionTypes(): object {
        return {
            source: descriptor(Array)
        };
    }
}

Object.defineProperty(FilterView, 'defaultProps', {
    enumerable: true,
    configurable: true,

    get(): object {
        return FilterView.getDefaultOptions();
    }
});

export default FilterView;
