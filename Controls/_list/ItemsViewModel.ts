/**
 * Created by kraynovdo on 16.11.2017.
 */
import BaseViewModel = require('Controls/_list/BaseViewModel');
import ItemsUtil = require('Controls/_list/resources/utils/ItemsUtil');
import cInstance = require('Core/core-instance');
import {view as constView} from 'Controls/Constants';
import {Logger} from 'UI/Utils';
import collection = require('Types/collection');
import * as Grouping from 'Controls/_list/Controllers/Grouping';
import {RecordSet} from 'Types/collection';
import {isEqual} from 'Types/object';

/**
 *
 * @author Авраменко А.С.
 * @private
 */

var _private = {
    isFullCacheResetAction: function(action) {
        return (
            action === collection.IObservable.ACTION_REMOVE ||
            action === collection.IObservable.ACTION_ADD ||
            action === collection.IObservable.ACTION_MOVE
        );
    },
    checkDeprecated: function(cfg) {
        if (cfg.leftSpacing && !this.leftSpacing) {
            this.leftSpacing = true;
            Logger.warn('IList', 'Option "leftSpacing" is deprecated and will be removed in 19.200. Use option "itemPadding.left".');
        }
        if (cfg.leftPadding && !this.leftPadding) {
            this.leftPadding = true;
            Logger.warn('IList', 'Option "leftPadding" is deprecated and will be removed in 19.200. Use option "itemPadding.left".');
        }
        if (cfg.rightSpacing && !this.rightSpacing) {
            this.rightSpacing = true;
            Logger.warn('IList', 'Option "rightSpacing" is deprecated and will be removed in 19.200. Use option "itemPadding.right".');
        }
        if (cfg.rightPadding && !this.rightPadding) {
            this.rightPadding = true;
            Logger.warn('IList', 'Option "rightPadding" is deprecated and will be removed in 19.200. Use option "itemPadding.right".');
        }
        if (cfg.groupMethod) {
            Logger.warn('IGrouped: Option "groupMethod" is deprecated and removed in 20.2000. Use option "groupProperty".', self);
        }
        if (cfg.groupingKeyCallback) {
            Logger.warn('IGrouped: Option "groupingKeyCallback" is deprecated and removed in 20.2000. Use option "groupProperty".', self);
        }

    },

    // проверка на то, нужно ли создавать новый инстанс рекордсета или же можно положить данные в старый
    isEqualItems: function(oldList, newList) {
        return oldList && cInstance.instanceOfModule(oldList, 'Types/collection:RecordSet') &&
            (newList.getModel() === oldList.getModel()) &&
            (newList.getKeyProperty() === oldList.getKeyProperty()) &&
            (Object.getPrototypeOf(newList).constructor == Object.getPrototypeOf(newList).constructor) &&
            (Object.getPrototypeOf(newList.getAdapter()).constructor == Object.getPrototypeOf(oldList.getAdapter()).constructor);
    },
    displayFilterGroups: function(item, index, displayItem) {
        return item === constView.hiddenGroup || !item.get || !this.collapsedGroups[displayItem.getOwner().getGroup()(item, index, displayItem)];
    },
    prepareCollapsedGroupsByArray: function(collapsedGroups) {
        var
            result = {};
        if (collapsedGroups) {
            collapsedGroups.forEach(function(group) {
                result[group] = true;
            });
        }
        return result;
    },
    prepareCollapsedGroupsByObject: function(collapsedGroups) {
        var
            result = [];
        if (collapsedGroups) {
            for (var group in collapsedGroups) {
                if (collapsedGroups.hasOwnProperty(group)) {
                    result.push(group);
                }
            }
        }
        return result;
    },
    getDisplayFilter: function(data, cfg) {
        var
            filter = [];
        if (cfg.groupingKeyCallback || cfg.groupProperty) {
            filter.push(_private.displayFilterGroups.bind({ collapsedGroups: data.collapsedGroups }));
        }
        if (cfg.itemsFilterMethod) {
            filter.push(cfg.itemsFilterMethod);
        }
        return filter;
    }
};
var ItemsViewModel = BaseViewModel.extend({
    _display: null,
    _items: null,
    _itemDataCache: null,
    _curIndex: 0,
    _onCollectionChangeFnc: null,
    _collapsedGroups: null,
    _prefixItemVersion: null,
    _updateIndexesCallback: null,
    _hasMoreData: false,
    _metaResults: null,

    constructor: function(cfg) {
        this._prefixItemVersion = 0;
        this._itemDataCache = {};
        ItemsViewModel.superclass.constructor.apply(this, arguments);
        this._onCollectionChangeFnc = this._onCollectionChange.bind(this);
        this._onMetaDataChanged = this._onMetaDataChanged.bind(this);
        this._collapsedGroups = _private.prepareCollapsedGroupsByArray(cfg.collapsedGroups);
        this._options.groupingKeyCallback = cfg.groupingKeyCallback || cfg.groupMethod;
        if (cfg.items) {
            if (cfg.itemsReadyCallback) {
                cfg.itemsReadyCallback(cfg.items);
            }
            this._items = cfg.items;
            this._updateSubscriptionOnMetaChange(null, cfg.items);
            this._updateResults(this._items);
            this._display = this._prepareDisplay(cfg.items, this._options);
            this._display.subscribe('onCollectionChange', this._onCollectionChangeFnc);
        }
    },

    getMetaResults() {
        return this._metaResults;
    },

    _prepareDisplay: function(items, cfg) {
        var
            filter = this.getDisplayFilter(this.prepareDisplayFilterData(), cfg);
        return ItemsUtil.getDefaultDisplayFlat(items, cfg, filter);
    },

    reset: function() {
        this._startIndex = Boolean(this._options.virtualScrollConfig) && !!this._startIndex ? this._startIndex : 0;
        this._curIndex = 0;
    },

    isEnd: function() {
        var endIndex;
        if (Boolean(this._options.virtualScrollConfig)) {
            endIndex = !!this._stopIndex ? this._stopIndex : 0;
        } else {
            endIndex = (this._display ? this._display.getCount() : 0);
        }
        return this._curIndex < endIndex;
    },

    isShouldBeDrawnItem: function() {
        return this._startIndex <= this._curIndex && this._curIndex <= this._stopIndex;
    },

    setUpdateIndexesCallback(updateIndexesCallback: Function): void {
        this._updateIndexesCallback = updateIndexesCallback;
    },

    setIndexes: function(newStartIndex: number, stopIndex: number): boolean {
        let
            newStopIndex = Math.min(stopIndex, this.getCount()),
            isUpdated = false;

        if (this._startIndex !== newStartIndex || this._stopIndex !== newStopIndex) {
            this._startIndex = newStartIndex;
            this._stopIndex = newStopIndex;
            isUpdated = true;
            this._nextModelVersion(true, 'indexesChanged');
            if (this._updateIndexesCallback) {
                this._updateIndexesCallback();
            }
        }

        return isUpdated;
    },

    isLast: function() {
        var lastIndex;
        if (Boolean(this._options.virtualScrollConfig)) {
            lastIndex = this._stopIndex - 1;
        } else {
            lastIndex = (this._display ? this._display.getCount() - 1 : 0);
        }
        return this._curIndex === lastIndex;
    },

    goToNext: function() {
        this._curIndex++;
    },

    getCurrent: function() {
        var dispItem = this._display.at(this._curIndex);
        return this.getItemDataByItem(dispItem);
    },

    setKeyProperty(keyProperty: string): void {
        this._options.keyProperty = keyProperty;
    },

    _nextModelVersion: function(notUpdatePrefixItemVersion, changesType, action, newItems, newItemsIndex, removedItems, removedItemsIndex) {
        let changedItems = [];

        if (!notUpdatePrefixItemVersion) {
            this._prefixItemVersion++;
        }
        this._nextVersion();

        if (notUpdatePrefixItemVersion && !_private.isFullCacheResetAction(action)) {
            if (Array.isArray(newItems) && newItems.length > 0) {
                changedItems = changedItems.concat(newItems);
            }
            if (Array.isArray(removedItems) && removedItems.length > 0) {
                changedItems = changedItems.concat(removedItems);
            }
        }
        this._resetCacheOnChange(changesType, changedItems);

        this._notify('onListChange', changesType, action, newItems, newItemsIndex, removedItems, removedItemsIndex);
    },

    nextModelVersion: function(notUpdatePrefixItemVersion, changesType) {
        this._nextModelVersion(notUpdatePrefixItemVersion, changesType);
    },

    _getItemVersion(item) {
        // records have defined method getVersion, groups haven't
        if (item.getVersion) {
            return '' + item.getVersion();
        }
        return '' + item;
    },

    _calcItemVersion: function(item) {
        var
            version = '' + this._prefixItemVersion;
        version += this._getItemVersion(item);
        return version;
    },

    getItemDataByItem: function(dispItem) {
        const cacheKey = this._getDisplayItemCacheKey(dispItem);

        if (this.isCachedItemData(cacheKey)) {
            return this.getCachedItemData(cacheKey);
        }

        var
            self = this,
            itemData = {
                getPropValue: ItemsUtil.getPropertyValue,
                style: this._options.style,
                keyProperty: this._options.keyProperty,
                displayProperty: this._options.displayProperty,
                index: this._display.getIndex(dispItem),
                item: dispItem.getContents(),
                dispItem: dispItem,
                theme: this._options.theme,

                //TODO: Выпилить в 19.200 или если закрыта -> https://online.sbis.ru/opendoc.html?guid=837b45bc-b1f0-4bd2-96de-faedf56bc2f6
                leftSpacing: this._options.leftSpacing || this._options.leftPadding,
                rightSpacing: this._options.rightSpacing || this._options.rightPadding,
                _preferVersionAPI: true,
                getVersion: function() {
                    return self._calcItemVersion(itemData.item, itemData.key);
                }
            };

        // The key of breadcrumbs row is the key of the last item in the crumbs.
        if (dispItem.getContents() instanceof Array) {
            let breadCrumbs = dispItem.getContents();
            itemData.key = ItemsUtil.getPropertyValue(breadCrumbs[breadCrumbs.length-1], this._options.keyProperty);
        } else {
            itemData.key = ItemsUtil.getPropertyValue(dispItem.getContents(), this._options.keyProperty);
        }

        if (this._options.groupingKeyCallback || this._options.groupProperty) {
            if (this._isGroup(itemData.item)) {
                itemData.isGroup = true;
                itemData.isHiddenGroup = itemData.item === constView.hiddenGroup;
                itemData.isGroupExpanded = !this._collapsedGroups[itemData.item];
                itemData.metaData = this._items.getMetaData();
            }
        }

        this.setCachedItemData(cacheKey, itemData);

        return itemData;
    },

    getCollapsedGroups(): Grouping.TArrayGroupId {
        return _private.prepareCollapsedGroupsByObject(this._collapsedGroups);
    },

    setCollapsedGroups(collapsedGroups: Grouping.TArrayGroupId): void {
        this._options.collapsedGroups = collapsedGroups;
        this._collapsedGroups = {};

        for (let i = 0; i < collapsedGroups.length; i++) {
            this._collapsedGroups[collapsedGroups[i]] = true;
        }
        this.setFilter(this.getDisplayFilter(this.prepareDisplayFilterData(), this._options));
        this._nextModelVersion();
    },

    isGroupExpanded(groupId: Grouping.TGroupId): boolean {
        return typeof this._collapsedGroups[groupId] === 'undefined';
    },

    toggleGroup(groupId: Grouping.TGroupId, state: boolean): void {
        if (typeof state === 'undefined') {
            state = !this.isGroupExpanded(groupId);
        }
        if (state) {
            delete this._collapsedGroups[groupId];
        } else {
            this._collapsedGroups[groupId] = true;
        }
        this.setFilter(this.getDisplayFilter(this.prepareDisplayFilterData(), this._options));
        this._nextModelVersion();
        this._notify('onGroupsExpandChange', {
            group: groupId,
            changeType: state ? 'expand' : 'collapse',
            collapsedGroups: _private.prepareCollapsedGroupsByObject(this._collapsedGroups)
        });
    },

    setFilter: function(filter) {
        this._display.setFilter(filter);
        this.nextModelVersion();
    },

    prepareDisplayFilterData: function() {
        return {
            collapsedGroups: this._collapsedGroups
        };
    },

    getDisplayFilter: function(data, cfg) {
        return _private.getDisplayFilter(data, cfg);
    },

    setGroupProperty(groupProperty: string): void {
        this._options.groupProperty = groupProperty;
    },

    getGroupProperty(): string {
        return this._options.groupProperty;
    },

    setGroupMethod: function(groupMethod) {
        this._options.groupMethod = groupMethod;
        this._nextModelVersion();
    },

    setGroupingKeyCallback: function(groupingKeyCallback) {
        this._options.groupingKeyCallback = groupingKeyCallback;
        this._nextModelVersion();
    },

    getNext: function() {
        var
            itemIndex = this._curIndex + 1,
            dispItem = this._display.at(itemIndex);
        return {
            getPropValue: ItemsUtil.getPropertyValue,
            keyProperty: this._options.keyProperty,
            displayProperty: this._options.displayProperty,
            index: itemIndex,
            item: dispItem.getContents(),
            dispItem: dispItem
        };
    },

    getCurrentIndex: function() {
        return this._curIndex;
    },

    getItemById: function(id, keyProperty) {
        return this._display ? ItemsUtil.getDisplayItemById(this._display, id, keyProperty) : undefined;
    },

    getCount: function() {
        return this._display ? this._display.getCount() : 0;
    },

    _onCollectionChange: function(event, action, newItems, newItemsIndex, removedItems, removedItemsIndex) {
        this._onBeginCollectionChange(action, newItems, newItemsIndex, removedItems, removedItemsIndex);

        /**
         * Virtual scroll should update indexes before onListChange event fires, otherwise subscribers of the onListChange event are going to work with the stale indexes.
         * It can cause all kinds of troubles, e.g. out of bounds access.
         * https://online.sbis.ru/opendoc.html?guid=e7978ebd-881c-494b-8449-d04af83f3404
         */
        const collectionChangeResult =
           this._notify.apply(this, ['onCollectionChange'].concat(Array.prototype.slice.call(arguments, 1)));

        const shouldNotUpdatePrefix =
            collectionChangeResult === 'updatePrefix' ? false : action !== collection.IObservable.ACTION_RESET;

        this._nextModelVersion(shouldNotUpdatePrefix, 'collectionChanged', action, newItems, newItemsIndex, removedItems, removedItemsIndex);
        this._onEndCollectionChange(action, newItems, newItemsIndex, removedItems, removedItemsIndex);
    },
    _onBeginCollectionChange: function() {
        // method may be implemented
    },
    _onEndCollectionChange: function() {
        // method may be implemented
    },

    _updateSubscriptionOnMetaChange(oldItems: RecordSet | null, newItems: RecordSet | null, isRecordSetEqual?: boolean): void {
        const execCommand = (items, command: 'subscribe' | 'unsubscribe') => {
            if (items && cInstance.instanceOfModule(items, 'Types/collection:RecordSet')) {
                if (!isRecordSetEqual) {
                    items[command]('onPropertyChange', this._onMetaDataChanged);
                }

                const meta = items.getMetaData();
                if (meta && meta.results && cInstance.instanceOfModule(meta.results, 'Types/entity:Model')) {
                    meta.results[command]('onPropertyChange', this._onMetaDataChanged);
                }
            }
        };

        execCommand(oldItems, 'unsubscribe');
        execCommand(newItems, 'subscribe');
    },

    _onMetaDataChanged(): void {
        if (this._updateResults(this._items)) {
            this._nextModelVersion(true);
        }
    },

    _updateResults(items: RecordSet): boolean {
        const metaData = items && items.getMetaData && items.getMetaData();
        const shouldUpdate = !!metaData && !isEqual(metaData, {}) && typeof metaData.results !== 'undefined';
        if (shouldUpdate) {
            this._updateSubscriptionOnMetaChange(this._items, items, true);
            this._metaResults =  metaData && metaData.results;
        }
        return shouldUpdate;
    },

    _convertItemKeyToCacheKey: function(itemKey) {
        // Model can have an item with the key 1 and a group with the key "1".
        // We need to differentiate between them in cache, so we add an _str postfix
        // to the string ids (for cache only)
        if (typeof itemKey === 'string') {
            return itemKey + '_str';
        }
        return itemKey;
    },
    _getDisplayItemCacheKey: function(dispItem) {
        const key = ItemsUtil.getDisplayItemKey(dispItem, this._options.keyProperty);
        return this._convertItemKeyToCacheKey(key);
    },
    isCachedItemData: function(itemKey) {
        return (
            typeof itemKey !== 'undefined' &&
            typeof this._itemDataCache[itemKey] !== 'undefined'
        );
    },
    getCachedItemData: function(itemKey) {
        return this._itemDataCache[itemKey];
    },
    setCachedItemData: function(itemKey, cache) {
        this._itemDataCache[itemKey] = cache;
    },
    resetCachedItemData: function(itemKey?) {
        if (typeof itemKey !== 'undefined') {
            delete this._itemDataCache[itemKey];
        } else {
            this._itemDataCache = {};
        }
    },
    _resetCacheOnChange: function(changesType, changedItems?) {
        if (
            changesType === 'indexesChanged' ||
            changesType === 'itemActionsUpdated'
        ) {
            return;
        } else if (Array.isArray(changedItems) && changedItems.length > 0) {
            changedItems.forEach((item) => {
                if (item) {
                    const key = this._getDisplayItemCacheKey(item);
                    this.resetCachedItemData(key);
                }
            });
        } else {
            // Full cache reset
            this.resetCachedItemData();
        }
    },

    _isGroup: function(item) {
        return item === constView.hiddenGroup || !item.get;
    },

    isAllGroupsCollapsed(): boolean {
        for (let i = 0; i < this._display.getItems().length; i++) {
            if (!this._collapsedGroups[this._display.getGroupByIndex(i)]) {
                return false;
            }
        }

        return true;
    },
    setItems: function(items) {
        if (_private.isEqualItems(this._items, items)) {
            this._items.setMetaData(items.getMetaData());
            this._items.assign(items);
            this._updateSubscriptionOnMetaChange(this._items, items, true);
        } else {
            if (this._options.itemsReadyCallback) {
                this._options.itemsReadyCallback(items);
            }
            this._updateSubscriptionOnMetaChange(this._items, items);
            this._items = items;
            this._updateResults(this._items);
            if (this._display) {
                this._display.unsubscribe('onCollectionChange', this._onCollectionChangeFnc);
                this._display.destroy();
            }
            this._display = this._prepareDisplay(this._items, this._options);
            this._display.subscribe('onCollectionChange', this._onCollectionChangeFnc);
            this.setIndexes(0, this.getCount());
            this._nextModelVersion();

            // Необходимо нотифицировать о ресете модели отсюда, иначе никто этого не сделает
            // и об изменениях модели никто не узнает. Вследствие этого скакнет virtualScroll
            // https://online.sbis.ru/opendoc.html?guid=569a3c15-462f-4765-b624-c913baed1a57
            this._notify('onListChange', 'collectionChanged', collection.IObservable.ACTION_RESET);
        }
        if (this._options.itemsSetCallback) {
            this._options.itemsSetCallback(this._items);
        }
    },

    getItems: function() {
        return this._items;
    },

    appendItems: function(items) {
        let shouldAppend = true;
        if (cInstance.instanceOfModule(items, 'Types/collection:RecordSet')) {
            this._items.setMetaData(items.getMetaData());
            shouldAppend = items.getCount() > 0;
        }
        if (shouldAppend) {
            this._items.append(items);
        }
    },

    acceptChanges(): void {
        if (this._items && this._items.isChanged()) {
            this._items.acceptChanges();
        }
    },

    mergeItems: function(items, options) {
        options = Object.assign({ remove: false }, options || {});
        this._items.merge(items, options);
    },

    prependItems: function(items) {
        let shouldPrepend = true;
        if (cInstance.instanceOfModule(items, 'Types/collection:RecordSet')) {
            this._items.setMetaData(items.getMetaData());
            shouldPrepend = items.getCount() > 0;
        }
        if (shouldPrepend) {
            this._items.prepend(items);
        }
    },

    getIndexBySourceItem: function(item) {
        return this._display ? this._display.getIndexBySourceItem(item) : undefined;
    },

    at: function(index) {
        return this._display ? this._display.at(index) : undefined;
    },

    getDisplay: function() {
        return this._display;
    },

    destroy: function() {
        ItemsViewModel.superclass.destroy.apply(this, arguments);
        if (this._display) {
            this._display.destroy();
            this._display = null;
        }
        this._items = null;
        this._itemDataCache = null;
        this._curIndex = null;
        this._onCollectionChangeFnc = null;
    },

    setHasMoreData: function(value: boolean) {
        this._hasMoreData = value;
    },

    getHasMoreData: function() {
        return this._hasMoreData;
    },
});

export = ItemsViewModel;
