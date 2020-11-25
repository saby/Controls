import rk = require('i18n!Controls');
import Control = require('Core/Control');
import template = require('wml!Controls/_filter/View/View');
import CoreClone = require('Core/core-clone');
import Merge = require('Core/core-merge');
import ParallelDeferred = require('Core/ParallelDeferred');
import Deferred = require('Core/Deferred');
import converterFilterItems = require('Controls/_filter/converterFilterItems');
import {isEqual} from 'Types/object';
import {Controller as SourceController} from 'Controls/source';
import {error as dataSourceError} from 'Controls/dataSource';
import {dropdownHistoryUtils as historyUtils} from 'Controls/dropdown';
import {detection, IoC} from 'Env/Env';
import {object} from 'Types/util';
import {factory} from 'Types/chain';
import {factory as CollectionFactory, RecordSet, List} from 'Types/collection';
import {getItemsWithHistory, isHistorySource, getUniqItems, deleteHistorySourceFromConfig} from 'Controls/_filter/HistoryUtils';
import {hasResetValue} from 'Controls/_filter/resetFilterUtils';
import {resetFilter} from 'Controls/_filter/resetFilterUtils';
import mergeSource from 'Controls/_filter/Utils/mergeSource';
import * as defaultItemTemplate from 'wml!Controls/_filter/View/ItemTemplate';
import {SyntheticEvent} from 'Vdom/Vdom';
import {DependencyTimer} from 'Controls/popup';
import {load} from 'Core/library';
import {IFilterItem} from './View/interface/IFilterView';
import {StickyOpener, StackOpener} from 'Controls/popup';
import {RegisterUtil, UnregisterUtil} from 'Controls/event';

const DEFAULT_FILTER_NAME = 'all_frequent';
var _private = {
    getItemByName: function(items, name) {
        var result;
        factory(items).each(function(item) {
            if (item.name === name) {
                result = item;
            }
        });
        return result;
    },

    isFrequentItem: function(item) {
      return item.viewMode === 'frequent' && item.type !== 'dateRange';
    },

    resolveItems: function(self, items) {
        // When serializing the Date, "_serializeMode" field is deleted, so object.clone can't be used
        self._source = CoreClone(items);
        self._hasResetValues = hasResetValue(items);
    },

    sourcesIsLoaded: function(configs) {
        let result = true;
        factory(configs).each((config) => {
            if (config.sourceController && config.sourceController.isLoading()) {
                result = false;
            }
        });
        return result;
    },

    calculateStateSourceControllers: function(configs, source) {
        factory(source).each(function(item) {
            const config = configs[item.name];
            if (_private.isFrequentItem(item) && config?.items) {
                var sourceController = _private.getSourceController(configs[item.name], item.editorOptions.source,
                     item.editorOptions.navigation);
                sourceController.calculateState(configs[item.name].items);
            }
        });
    },

    getSourceController: function(self, source, navigation) {
        if (!self.sourceController) {
            self.sourceController = new SourceController({
                source: source,
                navigation: navigation
            });
        }
        return self.sourceController;
    },

    getDateRangeItem: function(items) {
        let dateRangeItem;
        factory(items).each((item) => {
           if (item.type === 'dateRange') {
               dateRangeItem = item;
           }
        });
        return dateRangeItem;
    },

    loadUnloadedFrequentItems(self, configs, items): Promise<RecordSet[]> {
        const loadPromises = [];
        factory(items).each((item): void => {
            if (_private.isFrequentItem(item) && (!configs[item.name] || !configs[item.name].items)) {
                loadPromises.push(_private.loadItems(self, item));
            }
        });
        return Promise.all(loadPromises).then(() => {
            return _private.loadSelectedItems(self._source, self._configs);
        });
    },

    getPopupConfig: function(self, configs, items) {
        var popupItems = [];
        factory(items).each(function(item) {
            if (_private.isFrequentItem(item)) {
                var popupItem = CoreClone(configs[item.name]);
                Merge(popupItem, item.editorOptions);
                popupItem.id = item.name;
                popupItem.selectedKeys = (item.value instanceof Object) ? item.value : [item.value];
                popupItem.resetValue = (item.resetValue instanceof Object) ? item.resetValue : [item.resetValue];
                popupItem.items = configs[item.name].popupItems || popupItem.items;
                popupItem.selectorItems = configs[item.name].items;
                if (item.editorOptions.source) {
                    if (!configs[item.name].source && (!configs[item.name].loadDeferred || configs[item.name].loadDeferred.isReady())) {  // TODO https://online.sbis.ru/opendoc.html?guid=99e97896-1953-47b4-9230-8b28e50678f8
                        popupItem.loadDeferred = _private.loadItemsFromSource(configs[item.name], item.editorOptions.source, popupItem.filter, item.editorOptions.navigation);
                        configs[item.name].loadDeferred = popupItem.loadDeferred;
                    }
                    if (!configs[item.name].sourceController) {
                        let sourceController = _private.getSourceController(configs[item.name], item.editorOptions.source, item.editorOptions.navigation);
                        sourceController.calculateState(popupItem.items);
                    }
                    popupItem.hasMoreButton = configs[item.name].sourceController.hasMoreData('down');
                    popupItem.sourceController = configs[item.name].sourceController;
                    popupItem.selectorOpener = self._getStackOpener();
                    popupItem.selectorDialogResult = self._onSelectorTemplateResult.bind(self);
                    popupItem.opener = self;
                }
                popupItems.push(popupItem);
            }
        });
        return popupItems;
    },

    getFolderIds: function(items, {nodeProperty, parentProperty, keyProperty}) {
        let folders = [];
        factory(items).each((item) => {
            if (item.get(nodeProperty) && !item.get(parentProperty)) {
                folders.push(item.get(keyProperty));
            }
        });
        return folders;
    },

    getHasMoreText: function(selection) {
        return selection.length > 1 ? ', ' + rk('еще') + ' ' + (selection.length - 1) : '';
    },

    getFastText: function(config, selectedKeys, item?: IFilterItem) {
        var textArr = [];
        if (selectedKeys[0] === config.emptyKey && config.emptyText) {
            textArr.push(config.emptyText);
        } else if (config.items) {
            factory(selectedKeys).each(function (key) {
                const selectedItem = config.items.at(config.items.getIndexByValue(config.keyProperty, key));
                if (selectedItem) {
                    textArr.push(object.getPropertyValue(selectedItem, config.displayProperty));
                }
            });
        } else if (item?.textValue) {
            textArr.push(item.textValue);
        }
        return {
            text: textArr[0] || '',
            title: textArr.join(', '),
            hasMoreText: _private.getHasMoreText(textArr)
        };
    },

    getFilterButtonText: function(self, items) {
        var textArr = [];
        factory(items).each(function(item) {
            if (!_private.isFrequentItem(item) && item.type !== 'dateRange' && (item.viewMode !== 'extended' || item.visibility === true) && _private.isItemChanged(item)) {
                var textValue = item.textValue;
                if (textValue) {
                    textArr.push(textValue);
                }
            }
        });
        return textArr.join(', ');
    },

    updateText: function(self, items, configs, detailPanelHandler = false) {
        factory(items).each(function(item: IFilterItem) {
            if (configs[item.name]) {
                self._displayText[item.name] = {};
                if (_private.isItemChanged(item)) {
                    const nodeProperty = configs[item.name].nodeProperty;
                    const selectedKeys = configs[item.name].multiSelect || nodeProperty ? item.value : [item.value];

                    // [ [selectedKeysList1], [selectedKeysList2] ] in hierarchy list
                    const flatSelectedKeys = nodeProperty ? factory(selectedKeys).flatten().value() : selectedKeys;
                    self._displayText[item.name] = _private.getFastText(configs[item.name], flatSelectedKeys, item);
                    if (!self._displayText[item.name].text && detailPanelHandler) {
                        // If method is called after selecting from detailPanel, then textValue will contains actual display value
                        self._displayText[item.name].text = item.textValue && item.textValue.split(', ')[0];
                        self._displayText[item.name].hasMoreText = _private.getHasMoreText(flatSelectedKeys);
                    }
                    if (item.textValue !== undefined && !detailPanelHandler) {
                        item.textValue = self._displayText[item.name].title;
                    }
                }
            }
        });
        self._filterText = _private.getFilterButtonText(self, items);
        self._dateRangeItem = _private.getDateRangeItem(items);
        self._displayText = {...self._displayText};
    },

    isItemChanged: function(item) {
        return !isEqual(object.getPropertyValue(item, 'value'), object.getPropertyValue(item, 'resetValue'));
    },

    getKeysUnloadedItems: function(config, value) {
        let selectedKeys = value instanceof Object ? value : [value];
        let flattenKeys = factory(selectedKeys).flatten().value();
        let newKeys = [];
        if (config.items) {
            factory(flattenKeys).each((key) => {
                if (key !== undefined && !config.items.getRecordById(key) && !(key === config.emptyKey && config.emptyText)) {
                    newKeys.push(key);
                }
            });
        }
        return newKeys;
    },

    getPreparedItems: function(config, item, newItems, folderId) {
        const getItemsByParentKey = (items) => {
            return factory(items).filter((popupItem) => {
                return popupItem.get(config.parentProperty) === folderId;
            });
        };

        let folderItems = getItemsByParentKey(config.popupItems).value(CollectionFactory.recordSet, {
            adapter: config.popupItems.getAdapter(),
            keyProperty: config.popupItems.getKeyProperty(),
            format: config.popupItems.getFormat(),
            model: config.popupItems.getModel()
        });
        let newFolderItems = getItemsByParentKey(newItems).value();
        folderItems = getItemsWithHistory(folderItems, newFolderItems,
            config.sourceController, item.editorOptions.source, config.keyProperty);
        folderItems.prepend([config.popupItems.getRecordById(folderId)]);
        return folderItems;
    },

    setItems: function(config, item, newItems) {
        if (config.nodeProperty) {
            config.popupItems = config.popupItems || config.items.clone();
            const folders = _private.getFolderIds(config.popupItems, config);
            let resultItems;
            factory(folders).each((folderId) => {
                if (!resultItems) {
                    resultItems = _private.getPreparedItems(config, item, newItems, folderId);
                } else {
                    resultItems.append(_private.getPreparedItems(config, item, newItems, folderId));
                }
            });
            config.popupItems.assign(resultItems);
            if (isHistorySource(item.editorOptions.source)) {
                config.popupItems = item.editorOptions.source.prepareItems(config.popupItems);
            }
        } else {
            config.popupItems = getItemsWithHistory(config.popupItems || config.items.clone(), newItems,
                config.sourceController, item.editorOptions.source, config.keyProperty);
        }
        config.items = getUniqItems(config.items, newItems, config.keyProperty);
    },

    loadSelectedItems: function(items, configs) {
        let pDef = new ParallelDeferred();
        factory(items).each(function(item) {
            if (_private.isFrequentItem(item) && configs[item.name]) {
                const config = configs[item.name];
                let keys = _private.getKeysUnloadedItems(config, item.value);
                if (keys.length) {
                    let editorOpts = {source: item.editorOptions.source};
                    editorOpts.filter = {...config.filter};

                    const keyProperty = config.keyProperty;
                    editorOpts.filter[keyProperty] = keys;
                    let result = _private.loadItemsFromSource({}, editorOpts.source, editorOpts.filter, null,
                        // FIXME https://online.sbis.ru/opendoc.html?guid=b6ca9523-38ce-42d3-a3ec-36be075bccfe
                        item.editorOptions.dataLoadCallback,
                        false).addCallback((newItems) => {

                        _private.setItems(config, item, newItems);
                    });
                    pDef.push(result);
                }
            }
        });
        return pDef.done().getResult();
    },

    loadItemsFromSource: function(instance, source, filter, navigation?, dataLoadCallback?, withHistory = true) {
        let queryFilter;
        if (instance.nodeProperty) {
            queryFilter = Merge(filter, {historyId: instance.historyId});
        }
            // As the data source can be history source, then you need to merge the filter
        queryFilter = withHistory ? historyUtils.getSourceFilter(filter, source) : filter;
        return _private.getSourceController(instance, source, navigation).load(queryFilter).addCallback(function(items) {
            instance.items = items;
            if (dataLoadCallback) {
                dataLoadCallback(items);
            }
            return items;
        });
    },

    getConfigByItem(self, item: IFilterItem): void {
        const options = item.editorOptions;
        self._configs[item.name] = Merge(self._configs[item.name] || {}, CoreClone(options), {ignoreRegExp: /dataLoadCallback/});
        self._configs[item.name].emptyText = item.emptyText;
        self._configs[item.name].emptyKey = item.hasOwnProperty('emptyKey') ? item.emptyKey : null;
        self._configs[item.name].sourceController = null;
        self._configs[item.name].popupItems = null;
    },

    loadItems: function(self, item) {
        const options = item.editorOptions;
        _private.getConfigByItem(self, item);
        if (options.source) {
            return _private.loadItemsFromSource(self._configs[item.name], options.source, options.filter, options.navigation, options.dataLoadCallback);
        } else {
            return Deferred.success();
        }
    },

    notifyChanges: function(self, items) {
        self._notify('filterChanged', [_private.getFilter(items)]);
        self._notify('itemsChanged', [items]);
    },

    getFilter: function(items) {
        var filter = {};
        factory(items).each(function(item) {
            if (_private.isItemChanged(item)) {
                filter[item.name] = item.value;
            }
        });
        return filter;
    },

    clearConfigs: function(source, configs) {
        let newConfigs = CoreClone(configs);
        factory(newConfigs).each((config, name) => {
            const item = _private.getItemByName(source, name);
            if (!item || !_private.isFrequentItem(item)) {
                delete configs[name];
            }
        });
    },

    reload: function(self, onlyChangedItems: boolean = false, hasSimplePanel = true, force?: boolean) {
        var pDef = new ParallelDeferred();
        factory(self._source).each(function(item) {
            if (_private.isFrequentItem(item)) {
                if (!onlyChangedItems || _private.isItemChanged(item)) {
                    if (hasSimplePanel) {
                        if (!item.textValue || force) {
                            const result = _private.loadItems(self, item);
                            pDef.push(result);
                        } else {
                            _private.getConfigByItem(self, item);
                        }
                    } else {
                        if (!self._configs?.[item.name]) {
                            self._configs[item.name] = {};
                        }
                        pDef.push(_private.loadSelectedItems([item], self._configs));
                    }
                }
            }
        });

        self._loadDeferred = pDef.done().getResult();

        // At first, we will load all the lists in order not to cause blinking of the interface and many redraws.
        return self._loadDeferred.addCallback(function() {
            return _private.loadSelectedItems(self._source, self._configs).addCallback(() => {
                _private.updateText(self, self._source, self._configs);

                // FIXME https://online.sbis.ru/opendoc.html?guid=0c3738a7-6e8f-4a12-8459-9c6a2034d927
                // history.Source не умеет сериализоваться - удаляем его из receivedState
                return { configs: deleteHistorySourceFromConfig(self._configs, 'source') };
            });
        });
    },

    setValue: function(self, selectedKeys, name) {
        const config = self._configs[name];
        const item = _private.getItemByName(self._source, name);
        const resetValue = object.getPropertyValue(item, 'resetValue');

        if (config.nodeProperty) {
            selectedKeys = _private.prepareHierarchySelection(selectedKeys, config, resetValue);
        }
        let value;
        if (selectedKeys instanceof Array && (!selectedKeys.length || selectedKeys.includes(resetValue) || isEqual(selectedKeys, resetValue)
            // empty item is selected, but emptyKey not set
            || item.emptyText && !item.hasOwnProperty('emptyKey') && selectedKeys.includes(null))) {
            value = object.getPropertyValue(item, 'resetValue');
        } else if (self._configs[name].multiSelect || self._configs[item.name].nodeProperty) {
            value = selectedKeys;
        } else {
            value = selectedKeys[0];
        }
        object.setPropertyValue(item, 'value', value);
    },

    getNewItems: function(self, selectedItems, config) {
        var newItems = [],
            curItems = config.items,
            keyProperty = config.keyProperty;

        factory(selectedItems).each(function(item) {
            if (item.has(keyProperty)) {
                newItems.push(item);
            }
        });
        return newItems;
    },

    getSelectedKeys: function(items, config) {
        var selectedKeys = {};

        let getHierarchySelectedKeys = () => {
            // selectedKeys - { folderId1: [selected keys for folder] , folderId2: [selected keys for folder], ... }
            let folderIds = _private.getFolderIds(config.items, config);
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
            getHierarchySelectedKeys();
        } else {
            selectedKeys = [];
            factory(items).each(function (item) {
                selectedKeys.push(object.getPropertyValue(item, config.keyProperty));
            });
        }
        return selectedKeys;
    },

    hasSelectorTemplate: function(source) {
        let hasSelectorTemplate;
        factory(source).each((item) => {
            if (_private.isFrequentItem(item) && item.editorOptions?.selectorTemplate) {
                hasSelectorTemplate = true;
            }
        });
        return !!hasSelectorTemplate;
    },

    getSelectedItems: function(items, selectedKeys) {
        let selectedItems = [];
        let flatKeys = factory(selectedKeys).flatten().value();

        factory(flatKeys).each((selectedKey) => {
            if (items.getRecordById(selectedKey)) {
                selectedItems.push(items.getRecordById(selectedKey));
            }
        });
        return selectedItems;
    },

    itemClick: function(result) {
        _private.setValue(this, result.selectedKeys, result.id);
        _private.updateText(this, this._source, this._configs);
        _private.updateHistory(this, result.id, result.data, result.selectedKeys);
    },

    prepareHierarchySelection: function(selectedKeys, curConfig, resetValue) {
        let folderIds = _private.getFolderIds(curConfig.items, curConfig);
        let isEmptySelection = true;
        let onlyFoldersSelected = true;

        let resultSelectedKeys = {};
        folderIds.forEach((parentKey, index) => {
            // selectedKeys - { folderId1: [selected keys for folder] , folderId2: [selected keys for folder], ... }
            let nodeSelectedKeys = selectedKeys[parentKey] || [];
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
    },

    applyClick: function(result) {
        const self = this;
        factory(result.selectedKeys).each(function(sKey, index) {
            if (sKey) {
                let curConfig = self._configs[index];
                _private.setValue(self, sKey, index);

                const selectedItems = _private.getSelectedItems(curConfig.items, sKey);
                _private.updateHistory(self, index, selectedItems);
            }
        });

        _private.updateText(this, this._source, this._configs);
    },

    selectorResult: function(result) {
        var curConfig = this._configs[result.id],
            curItem = _private.getItemByName(this._source, result.id),
            newItems = _private.getNewItems(this, result.data, curConfig);

        _private.updateHistory(this, result.id, factory(result.data).toArray());
        _private.setItems(curConfig, curItem, newItems);
        if (isHistorySource(curItem.editorOptions.source) && newItems.length) {
            curConfig.sourceController = null;
        }
        let selectedKeys = _private.getSelectedKeys(result.data, curConfig);
        _private.setValue(this, selectedKeys, result.id);
        _private.updateText(this, this._source, this._configs);
    },

    moreButtonClick: function(result) {
        this._idOpenSelector = result.id;
        this._configs[result.id].initSelectorItems = result.selectedItems;
    },

    isNeedReload(oldItems, newItems, configs): boolean {
        const optionsToCheck = ['source', 'filter', 'navigation'];
        const getOptionsChecker = (oldItem, newItem) => {
            return (changed, optName) => changed || !isEqual(oldItem.editorOptions[optName], newItem.editorOptions[optName]);
        };
        let result = false;

        if (oldItems.length !== newItems.length) {
            result = true;
        } else {
            factory(newItems).each((newItem) => {
                const oldItem = _private.getItemByName(oldItems, newItem.name);
                const isFrequent = _private.isFrequentItem(newItem);
                if (isFrequent && (!oldItem || !_private.isFrequentItem(oldItem) ||
                    optionsToCheck.reduce(getOptionsChecker(oldItem, newItem), false) ||
                    !isEqual(newItem.value, oldItem.value) && !configs[newItem.name])
                ) {
                    result = true;
                }
            });
        }
        return result;
    },

    updateHierarchyHistory: function(currentFilter, selectedItems, source) {
        let folderIds = _private.getFolderIds(currentFilter.items, currentFilter);

        let getNodeItems = (parentKey) => {
            let nodeItems = [];

            factory(selectedItems).each((item) => {
                if (item.get(currentFilter.parentProperty) === parentKey) {
                    nodeItems.push(item);
                }
            });
            return nodeItems;
        };

        factory(folderIds).each((parentKey) => {
            let nodeHistoryItems = getNodeItems(parentKey);
            if (nodeHistoryItems.length) {
                source.update(nodeHistoryItems, Merge(historyUtils.getMetaHistory(), {parentKey: parentKey}));
            }
        });
    },

    updateHistory: function(self, name, items, selectedKeys?) {
        let source = _private.getItemByName(self._source, name).editorOptions.source;
        if (isHistorySource(source)) {
            let currentFilter = self._configs[name];
            let selectedItems = items;
            if (selectedKeys) {
                selectedItems = _private.getSelectedItems(currentFilter.items, selectedKeys);
            }
            if (currentFilter.nodeProperty) {
                _private.updateHierarchyHistory(currentFilter, selectedItems, source);
            } else {
                source.update(selectedItems, historyUtils.getMetaHistory());
            }
            if (currentFilter.sourceController && source.getItems) {
                currentFilter.items = source.getItems();
            }
        }
    },

    isNeedHistoryReload: function(configs) {
        let needReload = false;
        factory(configs).each((config) => {
            if (!config.sourceController) {
                needReload = true;
            }
        });
        return needReload;
    },

    _loadDependencies: function(): Promise<unknown> {
        try {
            const detailPanelTemplateName = this._options.detailPanelTemplateName;

            if (!this._loadOperationsPanelPromise) {
                this._loadOperationsPanelPromise = Promise.all([
                   import('Controls/filterPopup'),
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
};
/**
 * Контрол "Объединенный фильтр". Предоставляет возможность отображать и редактировать фильтр в удобном для пользователя виде.
 * Состоит из кнопки-иконки, строкового представления выбранного фильтра и параметров быстрого фильтра.
 * @remark
 * При клике на кнопку-иконку или строковое представления открывается панель фильтров, созданная на основе {@link Controls/filterPopup:DetailPanel}.
 * При клике на параметры быстрого фильтра открывается панель "Быстрых фильтров", созданная на основе {@link Controls/filterPopup:SimplePanel}.
 *
 * Полезные ссылки:
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list/filter-and-search/filter-view/">руководство разработчика по работе с контролом</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list/filter-and-search/">руководство разработчика по организации поиска и фильтрации в реестре</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list/filter-and-search/component-kinds/">руководство разработчика по классификации контролов Wasaby и схеме их взаимодействия</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_filter.less">переменные тем оформления filter</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_filterPopup.less">переменные тем оформления filterPopup</a>
 *
 * @class Controls/_filter/View
 * @extends Core/Control
 * @mixes Controls/_filter/View/interface/IFilterItem
 * @public
 * @author Золотова Э.Е.
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
 * @extends Core/Control
 * @mixes Controls/_filter/interface/IFilterView
 *
 * @public
 * @author Золотова Э.Е.
 * @see Controls/filterPopup:SimplePanel
 * @see Controls/filterPopup:DetailPanel
 * @see Controls/filter:FastContainer
 */
var Filter = Control.extend({
    _template: template,
    _displayText: null,
    _configs: null,
    _source: null,
    _idOpenSelector: null,
    _dateRangeItem: null,
    _hasResetValues: true,
    _dependenciesTimer: null,
    _stickyOpener: null,
    _stackOpener: null,

    _beforeMount: function(options, context, receivedState) {
        this._configs = {};
        this._displayText = {};
        let resultDef;

        if (receivedState) {
            this._configs = receivedState.configs;
            _private.resolveItems(this, options.source);
            _private.calculateStateSourceControllers(this._configs, this._source);
            _private.updateText(this, this._source, this._configs);
        } else if (options.source) {
            _private.resolveItems(this, options.source);
            resultDef = _private.reload(this, true, options.panelTemplateName);
        }
        this._hasSelectorTemplate = _private.hasSelectorTemplate(this._source);
        return resultDef;
    },

    _mouseEnterHandler: function(event: SyntheticEvent<MouseEvent>) {
        if (!this._options.readOnly) {
            if (!this._dependenciesTimer) {
                this._dependenciesTimer = new DependencyTimer();
            }
            this._dependenciesTimer.start(_private._loadDependencies.bind(this));
        }
    },

    _beforeUpdate: function(newOptions) {
        if (newOptions.source && newOptions.source !== this._options.source) {
            const self = this;
            let resultDef;
            _private.resolveItems(this, newOptions.source);
            if (_private.isNeedReload(this._options.source, newOptions.source, this._configs) || _private.isNeedHistoryReload(this._configs)) {
                _private.clearConfigs(this._source, this._configs);
                resultDef = _private.reload(this, null, newOptions.panelTemplateName, true).addCallback(() => {
                    self._hasSelectorTemplate = _private.hasSelectorTemplate(self._source);
                });
            } else if (_private.isNeedHistoryReload(this._configs)) {
                resultDef = _private.reload(this,null, newOptions.panelTemplateName, true);
            } else if (this._loadDeferred && !this._loadDeferred.isReady()) {
                resultDef = this._loadDeferred.addCallback((): void => {
                    _private.loadSelectedItems(this._source, this._configs).addCallback(() => {
                        _private.updateText(self, self._source, self._configs);
                    });
                });
            } else {
                resultDef = _private.loadSelectedItems(this._source, this._configs).addCallback(() => {
                    _private.updateText(self, self._source, self._configs);
                });
            }
            return resultDef;
        }
    },

    _beforeUnmount() {
        if (this._loadDeferred) {
            this._loadDeferred.cancel();
            this._loadDeferred = null;
        }
        this._configs = null;
        this._displayText = null;
        UnregisterUtil(this, 'scroll');
        if (this._stickyOpener) {
            this._stickyOpener.destroy();
        }
        if (this._stackOpener) {
            this._stackOpener.destroy();
        }
    },

    openDetailPanel: function() {
        if (this._options.detailPanelTemplateName) {
            let panelItems = converterFilterItems.convertToDetailPanelItems(this._source);
            let popupOptions =  {
                fittingMode: {
                    horizontal: 'overflow',
                    vertical: 'adaptive'
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
            popupOptions.template = this._options.detailPanelTemplateName;
            popupOptions.className = 'controls-FilterButton-popup-orientation-' + (this._options.alignment === 'right' ? 'left' : 'right');
            popupOptions.templateOptions = this._options.detailPanelTemplateOptions || {};
            this._open(panelItems, popupOptions);
        } else {
            this._openPanel();
        }
    },

    _openPanel(event: SyntheticEvent<'click'>, name?: string) {
        const isLoading = this._loadDeferred && !this._loadDeferred.isReady();
        if (this._options.panelTemplateName && _private.sourcesIsLoaded(this._configs) && !isLoading) {
            const clickOnFrequentItem = !!name;
            const target = clickOnFrequentItem && event.currentTarget;
            return _private.loadUnloadedFrequentItems(this, this._configs, this._source).then(() => {
                const items = new RecordSet({
                    rawData: _private.getPopupConfig(this, this._configs, this._source)
                });
                const popupOptions = {
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
                    popupOptions.target = this._children[name] || target.getElementsByClassName('js-controls-FilterView__target')[0];
                    popupOptions.className = 'controls-FilterView-SimplePanel-popup';
                } else {
                    popupOptions.className = 'controls-FilterView-SimplePanel__buttonTarget-popup';
                }
                popupOptions.templateOptions = this._options.panelTemplateOptions || {};
                this._open(items, popupOptions);
            }, (error) => {
                // Если во время загрузки данных произошла ошибка, то попытаемся догрузить при следующем открытии
                this._configs = {};
                dataSourceError.process({ error })
            });
        } else if (!this._options.panelTemplateName) {
            this._showSelector(name);
        }
    },

    _open: function(items, panelPopupOptions) {
        if (this._options.readOnly) {
            return;
        }
        if (!detection.isMobileIOS) {
            RegisterUtil(this, 'scroll', this._handleScroll.bind(this));
        }
        const popupOptions = {
            opener: this,
            templateOptions: {
                items: items,
                historyId: this._options.historyId
            },
            target: this._container[0] || this._container,
            className: 'controls-FilterView-popup',
            closeOnOutsideClick: true,
            eventHandlers: {
                onResult: this._resultHandler.bind(this)
            }
        };
        this._getStickyOpener().open(Merge(popupOptions, panelPopupOptions));
    },

    _handleScroll(): void {
        const stickyOpener = this._getStickyOpener();
        if (stickyOpener.isOpened()) {
            stickyOpener.close();
        }
    },

    _getStickyOpener(): StickyOpener {
        if (!this._stickyOpener) {
            this._stickyOpener = new StickyOpener();
        }
        return this._stickyOpener;
    },

    _getStackOpener(): StackOpener {
        if (!this._stackOpener) {
            this._stackOpener = new StackOpener();
        }
        return this._stackOpener;
    },

    _rangeTextChangedHandler: function(event, textValue) {
        let dateRangeItem = _private.getDateRangeItem(this._source);
        dateRangeItem.textValue = textValue;
    },

    _rangeValueChangedHandler: function(event, start, end) {
        let dateRangeItem = _private.getDateRangeItem(this._source);
        dateRangeItem.value = [start, end];
        this._dateRangeItem = object.clone(dateRangeItem);
        _private.notifyChanges(this, this._source);
    },

    _resultHandler: function(result) {
        if (!result.action) {
            const filterSource = converterFilterItems.convertToFilterSource(result.items);
            _private.resolveItems(this, mergeSource(this._source, filterSource));
            _private.updateText(this, this._source, this._configs, true);
        } else {
            _private[result.action].call(this, result);
        }
        if (result.action !== 'moreButtonClick') {
            if (result.history) {
                this._notify('historyApply', [result.history]);
            }
            _private.notifyChanges(this, this._source);
        }
        this._getStickyOpener().close();
    },

    _onSelectorTemplateResult: function(items) {
        const config = this._configs[this._idOpenSelector];
        if (!config.items && items.getCount()) {
            config.items = factory(items).value(CollectionFactory.recordSet, {
                keyProperty: items.at(0).getKeyProperty(),
                adapter: items.at(0).getAdapter(),
                format: items.at(0).getFormat()
            });
        }
        let resultSelectedItems = this._notify('selectorCallback', [this._configs[this._idOpenSelector].initSelectorItems, items, this._idOpenSelector]) || items;
        this._resultHandler({action: 'selectorResult', id: this._idOpenSelector, data: resultSelectedItems});
    },

    _isFastReseted: function() {
        var isReseted = true;
        factory(this._source).each(function(item) {
            if (_private.isFrequentItem(item) && _private.isItemChanged(item)) {
                isReseted = false;
            }
        });
        return isReseted;
    },

    _needShowFastFilter(source: object[]): boolean {
        let needShowFastFilter = false;

        factory(source).each((item) => {
            if (!needShowFastFilter && _private.isFrequentItem(item)) {
                needShowFastFilter = true;
            }
        });

        return needShowFastFilter;
    },

    reset: function() {
        resetFilter(this._source);
        _private.notifyChanges(this, this._source);
        _private.updateText(this, this._source, this._configs);
    },

    _reset: function(event, item) {
        const stickyOpener = this._getStickyOpener();
        if (stickyOpener.isOpened()) {
            stickyOpener.close();
        }
        var newValue = object.getPropertyValue(item, 'resetValue');
        object.setPropertyValue(item, 'value', newValue);
        _private.notifyChanges(this, this._source);
        _private.updateText(this, this._source, this._configs);
    },

    _showSelector(filterName?: string): void {
        let item = null;
        if (filterName && filterName !== DEFAULT_FILTER_NAME) {
            item = _private.getItemByName(this._source, filterName);
        } else {
            item = factory(this._source).filter((item) => _private.isFrequentItem(item)).first();
        }
        if (item) {
            const name = item.name;

            if (!this._configs[name]) {
                _private.getConfigByItem(this, item);
            }
            if (item?.editorOptions.selectorTemplate) {
                const selectedItems = [];
                const items = this._configs[name]?.popupItems || this._configs[name]?.items;
                const selectedKeys = item.editorOptions.multiSelect ? item.value : [item.value];
                const selectorTemplate = item.editorOptions.selectorTemplate;
                const templateOptions = object.clone(selectorTemplate.templateOptions) || {};
                if (items) {
                    factory(selectedKeys).each((key) => {
                        if (key !== undefined && key !== null && items.getRecordById(key)) {
                            selectedItems.push(items.getRecordById(key));
                        }
                    });
                }
                templateOptions.multiSelect = item.editorOptions.multiSelect;
                templateOptions.selectedItems = items || new List({
                    items: selectedItems
                });
                this._idOpenSelector = name;
                this._configs[name].initSelectorItems = templateOptions.selectedItems;
                return this._getStackOpener().open({
                    opener: this,
                    template: item.editorOptions.selectorTemplate.templateName,
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
        }
    },

    _resetFilterText: function() {
        const stickyOpener = this._getStickyOpener();
        if (stickyOpener.isOpened()) {
            stickyOpener.close();
        }
        factory(this._source).each(function(item) {
            // Быстрые фильтры и фильтр выбора периода
            // не должны сбрасываться по клику на крестик строки выбранных параметров
            if (!_private.isFrequentItem(item) && item.type !== 'dateRange') {
                item.value = item.resetValue;
                if (object.getPropertyValue(item, 'visibility') !== undefined) {
                    object.setPropertyValue(item, 'visibility', false);
                }
                item.textValue = '';
            }
        });
        _private.notifyChanges(this, this._source);
        _private.updateText(this, this._source, this._configs);
    }
});

Filter.getDefaultOptions = function() {
    return {
        panelTemplateName: 'Controls/filterPopup:SimplePanel',
        alignment: 'right',
        itemTemplate: defaultItemTemplate
    };
};

Filter._theme = ['Controls/filter'];

Filter._private = _private;

export = Filter;
