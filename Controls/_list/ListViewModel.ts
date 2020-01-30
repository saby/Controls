/**
 * Created by kraynovdo on 16.11.2017.
 */
import ItemsViewModel = require('Controls/_list/ItemsViewModel');
import entityLib = require('Types/entity');
import ItemsUtil = require('Controls/_list/resources/utils/ItemsUtil');
import cInstance = require('Core/core-instance');
import { Object as EventObject } from 'Env/Event';
import {isEqual} from 'Types/object';
import { IObservable } from 'Types/collection';
import { CollectionItem } from 'Types/display';
import { CssClassList } from "../Utils/CssClassList";

/**
 *
 * @author Авраменко А.С.
 * @private
 */

var _private = {
    updateIndexes: function(self, startIndex, stopIndex) {
        self._startIndex = startIndex;
        self._stopIndex = stopIndex;
    },
    getItemPadding: function(cfg) {
        const itemPadding = cfg.itemPadding || {};
        const normalizeValue = (side) => (itemPadding[side] || 'default').toLowerCase();
        return {
            left: normalizeValue('left'),
            right: normalizeValue('right'),
            top: normalizeValue('top'),
            bottom: normalizeValue('bottom'),
        };
    },
    getSpacingClassList: function(cfg) {
        var
            classList = '',
            itemPadding = _private.getItemPadding(cfg);

        classList += ' controls-ListView__itemContent';
        classList += ' controls-ListView__item-topPadding_' + (itemPadding.top || 'default').toLowerCase();
        classList += ' controls-ListView__item-bottomPadding_' + (itemPadding.bottom || 'default').toLowerCase();
        classList += ' controls-ListView__item-rightPadding_' + (itemPadding.right || 'default').toLowerCase();

        if (cfg.multiSelectVisibility !== 'hidden') {
            classList += ' controls-ListView__itemContent_withCheckboxes';
        } else {
            classList += ' controls-ListView__item-leftPadding_' + (itemPadding.left || 'default').toLowerCase();
        }

        return classList;
    },
    getItemByMarkedKey: function(self, markedKey) {
        if (markedKey === null) {
            return;
        }
        if (self._editingItemData && self._editingItemData.isAdd) {
            return self._editingItemData.item;
        } else {
            return self.getItemById(markedKey, self._options.keyProperty);
        }
    },
    isSelected(self: ListViewModel, current: IListItemData): boolean {
        const markedItem = _private.getItemByMarkedKey(self, self._markedKey);
        if (markedItem) {
            const item = markedItem.getContents ? markedItem.getContents() : markedItem;
            return item.getId ? item.getId() === current.key : false;
        }
        return false;
    },
    getMultiSelectClassList: function (current): string {
        let
            checkboxOnHover = current.multiSelectVisibility === 'onhover',
            isSelected = current.multiSelectStatus !== undefined;

        return CssClassList.add('js-controls-ListView__checkbox')
                           .add('js-controls-ListView__notEditable')
                           .add('controls-ListView__checkbox-onhover', checkboxOnHover && !isSelected)
                           .compile();
    },
    needToDrawActions: function (editingItemData, currentItem, editingConfig, drawnActions) {
        if (editingItemData) {
            return !!(currentItem.key === editingItemData.key &&
                (drawnActions && drawnActions.length || editingConfig.toolbarVisibility));
        } else {
            return !!(drawnActions && drawnActions.length);
        }
    },
    getGroupPaddingClasses(current): { left: string; right: string } {
        const right = `controls-ListView__groupContent__rightPadding_${current.itemPadding.right}`;
        const left =  `controls-ListView__groupContent__leftPadding_${current.hasMultiSelect ? 'withCheckboxes' : current.itemPadding.left}`;
        return {right, left};
    }
};

var ListViewModel = ItemsViewModel.extend([entityLib.VersionableMixin], {
    _markedItem: null,
    _dragEntity: null,
    _draggingItemData: null,
    _dragTargetPosition: null,
    _actions: null,
    _actionsVersions: null,
    _selectedKeys: null,
    _markedKey: null,
    _hoveredItem: null,
    _menuState: '',
    _reloadedKeys: null,
    _singleItemReloadCount: 0,

    constructor: function(cfg) {
        var self = this;
        this._actions = {};
        this._actionsVersions = {};
        ListViewModel.superclass.constructor.apply(this, arguments);

        if (this._items && cfg.markerVisibility !== 'hidden') {
            if (cfg.markedKey !== null || cfg.markerVisibility === 'always' || cfg.markerVisibility === 'visible') {
                this._markedKey = cfg.markedKey;
                this.updateMarker(cfg.markedKey);
            }
        }

        this._selectedKeys = cfg.selectedKeys || [];

        // TODO надо ли?
        _private.updateIndexes(self, 0, self.getCount());

        this._reloadedKeys = {};
    },
    setEditingConfig: function(editingConfig) {
        this._options.editingConfig = editingConfig;
        this._nextModelVersion();
    },
    setItemPadding: function(itemPadding) {
        this._options.itemPadding = itemPadding;
        this._nextModelVersion();
    },
    getItemPadding: function() {
        return _private.getItemPadding(this._options);
    },
    setMenuState(state: string): void {
        this._menuState = state;
    },
    getItemDataByItem: function() {
        var
            self = this,
            itemsModelCurrent = ListViewModel.superclass.getItemDataByItem.apply(this, arguments),
            dragItems,
            drawnActions;

        if (itemsModelCurrent._listViewModelCached) {
            return itemsModelCurrent;
        } else {
            itemsModelCurrent._listViewModelCached = true;
        }

        itemsModelCurrent.isMenuShown = this._menuState === 'shown';
        itemsModelCurrent.itemActionsPosition = this._options.itemActionsPosition;
        itemsModelCurrent.actionsItem = this.getActionsItem(itemsModelCurrent.item);
        itemsModelCurrent.isSelected = _private.isSelected(this, itemsModelCurrent);
        itemsModelCurrent.itemActions = this.getItemActions(itemsModelCurrent.item);
        itemsModelCurrent.isActive = this._activeItem && itemsModelCurrent.dispItem.getContents() === this._activeItem.item;
        itemsModelCurrent.isSwiped = this._swipeItem && itemsModelCurrent.actionsItem === this._swipeItem.actionsItem;
        itemsModelCurrent.isRightSwiped = this._rightSwipedItem && itemsModelCurrent.dispItem.getContents() === this._rightSwipedItem.item;
        itemsModelCurrent.multiSelectStatus = this._selectedKeys[itemsModelCurrent.key];
        itemsModelCurrent.searchValue = this._options.searchValue;
        itemsModelCurrent.multiSelectVisibility = this._options.multiSelectVisibility;
        itemsModelCurrent.markerVisibility = this._options.markerVisibility;
        itemsModelCurrent.itemTemplateProperty = this._options.itemTemplateProperty;
        itemsModelCurrent.isSticky = itemsModelCurrent.isSelected && itemsModelCurrent.style === 'master';
        itemsModelCurrent.spacingClassList = _private.getSpacingClassList(this._options);
        itemsModelCurrent.itemPadding = _private.getItemPadding(this._options);
        itemsModelCurrent.hasMultiSelect = !!this._options.multiSelectVisibility && this._options.multiSelectVisibility !== 'hidden';
        itemsModelCurrent.multiSelectClassList = itemsModelCurrent.hasMultiSelect ? _private.getMultiSelectClassList(itemsModelCurrent) : '';
        itemsModelCurrent.showEditArrow = this._options.showEditArrow;
        itemsModelCurrent.calcCursorClasses = this._calcCursorClasses;
        if (itemsModelCurrent.isGroup) {
            itemsModelCurrent.isStickyHeader = this._options.stickyHeader;
        }

        itemsModelCurrent.shouldDrawMarker = (marker: boolean) => {
            const canDrawMarker = marker !== false && itemsModelCurrent.markerVisibility !== 'hidden';
            return canDrawMarker && (itemsModelCurrent.isAdd ? true : _private.isSelected(self, itemsModelCurrent));
        };

        itemsModelCurrent.getMarkerClasses = (): string => {
            return 'controls-ListView__itemV_marker ';
        };

        if (itemsModelCurrent.itemActions) {
           drawnActions = itemsModelCurrent.itemActions.showed;
        }

        if (itemsModelCurrent.isGroup) {
            itemsModelCurrent.groupPaddingClasses = _private.getGroupPaddingClasses(itemsModelCurrent);
        }

        itemsModelCurrent.drawActions = _private.needToDrawActions(this._editingItemData, itemsModelCurrent, this._options.editingConfig, drawnActions);

        if (itemsModelCurrent.drawActions && drawnActions) {
            itemsModelCurrent.hasActionWithIcon = false;
            for (var i = 0; i < drawnActions.length; i++) {
                if (drawnActions[i].icon) {
                    itemsModelCurrent.hasActionWithIcon = true;
                    break;
                }
            }
        }
        if (this._editingItemData && itemsModelCurrent.key === this._editingItemData.key) {
            itemsModelCurrent.isEditing = true;
            itemsModelCurrent.item = this._editingItemData.item;
        }

        if (this._dragEntity) {
            dragItems = this._dragEntity.getItems();
            if (dragItems[0] === itemsModelCurrent.key) {
                itemsModelCurrent.isDragging = true;
            }
            if (dragItems.indexOf(itemsModelCurrent.key) !== -1) {
                itemsModelCurrent.isVisible = dragItems[0] === itemsModelCurrent.key ? !this._dragTargetPosition : false;
            }
            if (this._draggingItemData && this._dragTargetPosition && this._dragTargetPosition.index === itemsModelCurrent.index) {
                itemsModelCurrent.dragTargetPosition = this._dragTargetPosition.position;
                itemsModelCurrent.draggingItemData = this._draggingItemData;
            }
        }
        return itemsModelCurrent;
    },

    _calcCursorClasses: function(clickable) {
        return ` controls-ListView__itemV ${clickable === false ? 'controls-ListView__itemV_cursor-default' : 'controls-ListView__itemV_cursor-pointer'}`;
    },

    _calcItemVersion: function(item, key) {
        var version = ListViewModel.superclass._calcItemVersion.apply(this, arguments);

        if (this._dragEntity && this._dragEntity.getItems().indexOf(key) !== -1) {
            version = 'DRAG_ITEM_' + version;
        }

        if (this._dragTargetPosition && this._dragTargetPosition.item === item) {
            version = 'DRAG_POSITION_' + this._dragTargetPosition.position + '_' + version;
        }

        if (this._markedKey === key) {
            version = 'MARKED_' + version;
        }
        if (this._activeItem && this._activeItem.item === item) {
            version = 'ACTIVE_' + version;
        }
        if (this._selectedKeys && this._selectedKeys.hasOwnProperty(key)) {
            version = 'SELECTED_' + this._selectedKeys[key] + '_' + version;
        }
        if (this._reloadedKeys[key]) {
            version = `RELOADED_${this._reloadedKeys[key]}_` + version;
        }
        version = (this._editingItemData ? 'WITH_EDITING_' : 'WITHOUT_EDITING_') + version;
        if (this._editingItemData && this._editingItemData.key === key) {
            version = 'EDITING_' + version;
        }
        if (this._swipeItem && this._swipeItem.key === key) {
            version = 'SWIPE_' + version;
        }
        if (this._actionsVersions.hasOwnProperty(key)) {
            version = 'ITEM_ACTION_' + this._actionsVersions[key] + version;
        }

        return version;
    },

    markAddingItem(): void {
        this._savedMarkedKey = this._markedKey;
        this._markedKey = this._editingItemData.key;
        this._nextModelVersion(true, 'markedKeyChanged');
        this._notify('onMarkedKeyChanged', this._markedKey);
    },

    restoreMarker(): void {
        if (this._savedMarkedKey) {
            this._markedKey = this._savedMarkedKey;
            this._savedMarkedKey = undefined;
            this._nextModelVersion(true, 'markedKeyChanged');
            this._notify('onMarkedKeyChanged', this._markedKey);
        }
    },

    setMarkedKey: function(key) {
        if (key === this._markedKey) {
            return;
        }
        this._markedKey = key;
        this._savedMarkedKey = undefined;
        this._updateMarker(key);
        this._nextModelVersion(true, 'markedKeyChanged');
        this._notify('onMarkedKeyChanged', this._markedKey);
    },

    _updateMarker: function(markedKey):void {
        this._markedKey = markedKey;
        if (this._options.markerVisibility === 'hidden' ||
            this._options.markerVisibility === 'onactivated' && this._markedKey === null) {
            return;
        }

        // If record with key equal markedKey not found in recordSet, set markedKey equal key first record in recordSet
        if (!_private.getItemByMarkedKey(this, markedKey) && this.getCount()) {
            this._markedKey = this._items.at(0).getId();
        }

    },



    updateMarker: function(markedKey):void {
        const curMarkedKey = this._markedKey;
        this._updateMarker(markedKey);
        if (curMarkedKey !== this._markedKey) {
            this._notify('onMarkedKeyChanged', this._markedKey);
            this._nextModelVersion(true);
        }
    },

    setMarkerVisibility: function(markerVisibility) {
        this._options.markerVisibility = markerVisibility;
        if (this._markedKey === null && markerVisibility === 'visible') {
            this.updateMarker(null);
        }
        this._nextModelVersion();
    },

    getFirstItem: function() {
        return ItemsUtil.getFirstItem(this._display);
    },
    getLastItem: function() {
        return ItemsUtil.getLastItem(this._display);
    },
    getIndexByKey: function(key) {
        var
            item = this.getItemById(key, this._options.keyProperty);
        return this._display.getIndex(item);
    },
    getNextItemKey: function(key) {
        var
            itemIdx = this.getIndexByKey(key),
            nextItemId = itemIdx + 1,
            nextItem,
            itemsCount = this._display.getCount();
        while (nextItemId < itemsCount) {
            nextItem = this._display.at(nextItemId).getContents();
            if (cInstance.instanceOfModule(nextItem, 'Types/entity:Model')) {
                return this._display.at(nextItemId).getContents().getId();
            }
            nextItemId++;
        }
    },
    getPreviousItemKey: function(key) {
        var
            itemIdx = this.getIndexByKey(key),
            prevItemId = itemIdx - 1,
            prevItem;
        while (prevItemId >= 0) {
            prevItem = this._display.at(prevItemId).getContents();
            if (cInstance.instanceOfModule(prevItem, 'Types/entity:Model')) {
                return this._display.at(prevItemId).getContents().getId();
            }
            prevItemId--;
        }
    },
    getMarkedKey: function() {
        return this._markedKey;
    },
    getMarkedItem: function() {
        return _private.getItemByMarkedKey(this, this._markedKey);
    },
    getSelectionStatus: function(key) {
        return this._selectedKeys[key] !== undefined;
    },

    getSwipeItem: function() {
        return this._swipeItem.actionsItem;
    },

    setActiveItem: function(itemData) {
        if (!this._activeItem || !itemData || itemData.dispItem.getContents() !== this._activeItem.item) {
            this._activeItem = itemData;
            this._nextModelVersion(true, 'activeItemChanged');
        }
    },

    setDragEntity: function(entity) {
        if (this._dragEntity !== entity) {
            this._dragEntity = entity;
            this._nextModelVersion(true);
        }
    },

    getDragEntity: function() {
        return this._dragEntity;
    },

    setDragItemData: function(itemData) {
        this._draggingItemData = itemData;
    },

    getDragItemData: function() {
        return this._draggingItemData;
    },

    calculateDragTargetPosition: function(targetData) {
        var
            position,
            prevIndex = -1;

        //If you hover on a record that is being dragged, then the position should not change.
        if (this._draggingItemData && this._draggingItemData.index === targetData.index) {
            return null;
        }

        if (this._dragTargetPosition) {
            prevIndex = this._dragTargetPosition.index;
        } else if (this._draggingItemData) {
            prevIndex = this._draggingItemData.index;
        }

        if (prevIndex === -1) {
            position = 'before';
        } else if (targetData.index > prevIndex) {
            position = 'after';
        } else if (targetData.index < prevIndex) {
            position = 'before';
        } else if (targetData.index === prevIndex) {
            position = this._dragTargetPosition.position === 'after' ? 'before' : 'after';
        }

        return {
            index: targetData.index,
            item: targetData.item,
            data: targetData,
            position: position
        };
    },

    setDragTargetPosition: function(position) {
        this._dragTargetPosition = position;
        this._nextModelVersion(true);
    },

    getDragTargetPosition: function() {
        return this._dragTargetPosition;
    },

    setSwipeItem: function(itemData) {
        if (!this._swipeItem || !itemData || itemData.item !== this._swipeItem.item) {
           this._swipeItem = itemData;
           this._nextModelVersion(true);
        }
    },

    setRightSwipedItem: function(itemData) {
        this._rightSwipedItem = itemData;
        this._nextModelVersion();
    },

    setHoveredItem: function(item){
        const changedItems = [];
        if (this._hoveredItem && typeof this._hoveredItem.getId === 'function') {
            changedItems.push(this.getItemById(this._hoveredItem.getId()));
        }
        if (item && typeof item.getId === 'function') {
            changedItems.push(this.getItemById(item.getId()));
        }

        this._hoveredItem = item;
        this._nextModelVersion(true, 'hoveredItemChanged', '', changedItems);
    },

    getHoveredItem: function () {
        return this._hoveredItem;
    },

    updateIndexes: function(startIndex, stopIndex) {
        if ((this._startIndex !== startIndex) || (this._stopIndex !== stopIndex)) {
            _private.updateIndexes(self, startIndex, stopIndex);
            this._nextModelVersion();
        }
    },

    getStartIndex: function() {
        return this._startIndex;
    },

    getStopIndex: function() {
        return this._stopIndex;
    },

    setItems: function(items) {
        var currentItems = this.getItems();

        ListViewModel.superclass.setItems.apply(this, arguments);

        //we should try to set markedKey by options, if there were no items before
        //this._markedKey setted in constructor only if items were in constructor config
        this.updateMarker(currentItems ? this._markedKey : this._options.markedKey);
        this._nextModelVersion();
    },

    _onBeginCollectionChange: function(action, newItems, newItemsIndex, removedItems, removedItemsIndex) {
        var
           self = this;
        if (action === IObservable.ACTION_REMOVE && removedItems && removedItems.length) {
            // TODO KINGO. При удалении элементов очищаем закешированные для них операции над записью. Тем самым:
            // а) избавляемся от утечек (не храним в памяти лишние ссылки);
            // б) при создании записи с таким же ID мы сгенерим для неё новые операции над записью, а не переиспользуем старые.
            // https://online.sbis.ru/opendoc.html?guid=905c3018-384a-4587-845c-aca5dc51944b
            removedItems.forEach(function(removedItem) {
                var
                   removedItemContents = removedItem.getContents();
                if (removedItemContents.get) {
                    delete self._actions[removedItemContents.get(self._options.keyProperty)];
                }
            });
        }
        _private.updateIndexes(this, 0, this.getCount());
        if (action === IObservable.ACTION_REMOVE && removedItems && removedItems.length) {
            const curenMarkerIndex = this.getIndexByKey(this._markedKey);
            const curentItem = _private.getItemByMarkedKey(this, this._markedKey);
            if (this._markedKey && curenMarkerIndex === -1 && !curentItem) {
                const prevValidItem = this.getPreviousItem(removedItemsIndex);
                const nextValidItem = this.getNextItem(removedItemsIndex);
                if (nextValidItem) {
                    this.updateMarker(nextValidItem);
                } else if (prevValidItem) {
                    this.updateMarker(prevValidItem);
                } else {
                    this.updateMarker(null);
                }
            }
        }
    },
    isValidItemForMarkedKey: function (item) {
        return !this._isGroup(item) && item.getId;
    },
    getPreviousItem: function (itemIndex) {
        var prevIndex = itemIndex - 1, prevItem;
        while (prevIndex >= 0) {
            prevItem = this._display.at(prevIndex).getContents();
            if (this.isValidItemForMarkedKey(prevItem)) {
                return prevItem.getId();
            }
            prevIndex--;
        }
    },
    getNextItem: function (itemIndex) {
        var nextIndex = itemIndex, nextItem, itemsCount = this._display.getCount();
        while (nextIndex < itemsCount) {
            nextItem = this._display.at(nextIndex).getContents();
            if (this.isValidItemForMarkedKey(nextItem)) {
                return nextItem.getId();
            }
            nextIndex++;
        }
    },
    setMarkerOnValidItem: function(index) {
        const prevValidItem = this.getPreviousItem(index);
        const nextValidItem = this.getNextItem(index);
        if (nextValidItem !== undefined) {
            this.setMarkedKey(nextValidItem);
        } else if (prevValidItem !== undefined) {
            this.setMarkedKey(prevValidItem);
        } else {
            this.setMarkedKey(null);
        }
    },
    _setEditingItemData: function(itemData) {
        const data = itemData ? itemData : this._editingItemData;
        this._editingItemData = itemData;
        this._onCollectionChange(
           new EventObject('oncollectionchange', this._display),
           IObservable.ACTION_CHANGE,
           [new CollectionItem({
              contents: data.item
           })],
           data.index,
           [],
           0
        );
        this._nextModelVersion(itemData === null);
    },

    getEditingItemData(): object | null {
        return this._editingItemData;
    },

    hasItemById: function(id, keyProperty) {
        return !!this.getItemById(id, keyProperty);
    },

    setItemActions: function(item, actions) {
        if (item.get) {
            const id = item.get(this._options.keyProperty);
            if (this.hasItemById(id, this._options.keyProperty)) {
               if (isEqual(this._actions[id], actions)) {
                   return 'none';
               }
               const result = Object.keys(this._actions).length ? 'partial' : 'all';
               this._actions[id] = actions;
               this._actionsVersions[id] = this._actionsVersions[id] ? ++this._actionsVersions[id] : 1;
               this.resetCachedItemData(this._convertItemKeyToCacheKey(id));
               return result;
            } else if (this._editingItemData && this._editingItemData.key === id) {
                this._editingItemData.itemActions = actions;
                this._editingItemData.drawActions = !!(actions && actions.all.length) ||
                   !!(this._options.editingConfig && this._options.editingConfig.toolbarVisibility);
                return 'all';
            }
        }
    },

    _prepareDisplayItemForAdd: function(item) {
        return ItemsUtil.getDefaultDisplayItem(this._display, item);
    },
    getActionsItem: function(item) {
      return item;
    },
    getItemActions: function(item) {
        const id = ItemsUtil.getPropertyValue(item, this._options.keyProperty);
        return this._actions[id];
    },

    updateSelection: function(selectedKeys) {
        this._selectedKeys = selectedKeys || [];
        this._nextModelVersion(true);
    },

    getActiveItem: function() {
        return this._activeItem;
    },

    setItemTemplateProperty: function(itemTemplateProperty) {
        this._options.itemTemplateProperty = itemTemplateProperty;
        this._nextModelVersion();
    },

    setMultiSelectVisibility: function(multiSelectVisibility) {
        this._options.multiSelectVisibility = multiSelectVisibility;
        this._nextModelVersion(true);
    },

    getMultiSelectVisibility: function() {
        return this._options.multiSelectVisibility;
    },

    setSorting: function(sorting) {
        this._options.sorting = sorting;
    },

    getSorting: function() {
        return this._options.sorting;
    },

    setSearchValue: function(value) {
        this._options.searchValue = value;
    },

    __calcSelectedItem: function(display, selKey, keyProperty) {

        // TODO надо вычислить индекс
        /* if(!this._markedItem) {
         if (!this._selectedIndex) {
         this._selectedIndex = 0;//переводим на первый элемент
         }
         else {
         this._selectedIndex++;//условно ищем ближайший элемент, рядом с удаленным
         }
         this._markedItem = this._display.at(this._selectedIndex);
         } */
    },

    clearReloadedMarks: function() {
        this._reloadedKeys = {};
    },
    markItemReloaded: function(key) {
        this._reloadedKeys[key] = ++this._singleItemReloadCount;
    }
});

ListViewModel._private = _private;

export = ListViewModel;
