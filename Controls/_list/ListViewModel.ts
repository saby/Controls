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
import { Model } from 'Types/entity';
import { CollectionItem, IEditingConfig, ISwipeConfig, ANIMATION_STATE } from 'Controls/display';
import { CssClassList } from "../Utils/CssClassList";
import {Logger} from 'UI/Utils';
import {IItemAction, IItemActionsTemplateConfig} from 'Controls/itemActions';
import { IDragPosition, IFlatItemData } from 'Controls/listDragNDrop';
import {JS_SELECTORS as EDIT_IN_PLACE_JS_SELECTORS} from 'Controls/editInPlace';

interface IListSeparatorOptions {
    rowSeparatorSize?: null | 's' | 'l';
}

/**
 *
 * @author Авраменко А.С.
 * @private
 */

const _private = {
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
        let classList = '';
        const itemPadding = _private.getItemPadding(cfg);
        const style = cfg.style === 'masterClassic' || !cfg.style ? 'default' : cfg.style;

        classList += ` controls-ListView__itemContent controls-ListView__itemContent_${style}_theme-${cfg.theme}`;
        classList += ` controls-ListView__item_${style}-topPadding_${itemPadding.top}_theme-${cfg.theme}`;
        classList += ` controls-ListView__item_${style}-bottomPadding_${itemPadding.bottom}_theme-${cfg.theme}`;
        classList += ` controls-ListView__item-rightPadding_${itemPadding.right}_theme-${cfg.theme}`;

        if (cfg.multiSelectVisibility !== 'hidden') {
            classList += ' controls-ListView__itemContent_withCheckboxes' + `_theme-${cfg.theme}`;
        } else {
            classList += ' controls-ListView__item-leftPadding_' + (itemPadding.left || 'default').toLowerCase() + `_theme-${cfg.theme}`;
        }

        if (cfg.rowSeparatorSize) {
            classList += ` controls-ListView__rowSeparator_size-${cfg.rowSeparatorSize}_theme-${cfg.theme}`;
        }

        return classList;
    },
    getItemByMarkedKey: function(self, markedKey) {
        if (markedKey === null) {
            return;
        }
        return self.getItemById(markedKey, self.getKeyProperty());
    },

    getMultiSelectClassList(current, checkboxOnHover: boolean): string {
        const isSelected = current.isSelected();
        const checkboxVisible = isSelected !== false && isSelected !== undefined; // так как null - это тоже выбрано

        return CssClassList.add('js-controls-ListView__checkbox')
                           .add(EDIT_IN_PLACE_JS_SELECTORS.NOT_EDITABLE)
                           .add('controls-ListView__checkbox-onhover', checkboxOnHover && !checkboxVisible)
                           .compile();
    },

    getGroupPaddingClasses(current, theme: string): { left: string; right: string } {
        const right = `controls-ListView__groupContent__rightPadding_${current.itemPadding.right}_theme-${theme}`;
        const left =  `controls-ListView__groupContent__leftPadding_${current.hasMultiSelect ? 'withCheckboxes' : current.itemPadding.left}_theme-${theme}`;
        return {right, left};
    },

    // New Model compatibility
    addNewModelCompatibilityForItem(itemsModelCurrent: any): void {
        itemsModelCurrent.setActions = (actions: {showed: IItemAction[], all: IItemAction[]},
                                        silent: boolean = true): void => {
            itemsModelCurrent.dispItem.setActions(actions, silent);
        };
        itemsModelCurrent.getActions = (): {showed: IItemAction[], all: IItemAction[]} => (
            itemsModelCurrent.dispItem.getActions()
        );
        itemsModelCurrent.setActive = (state: boolean, silent?: boolean): void => {
            if (itemsModelCurrent.dispItem.setActive !== undefined) {
                itemsModelCurrent.dispItem.setActive(state, silent);
            }
        };
        itemsModelCurrent.isActive = (): boolean => (
            itemsModelCurrent.dispItem.isActive() !== undefined ? itemsModelCurrent.dispItem.isActive() : false
        );
        itemsModelCurrent.setSwiped = (state: boolean, silent?: boolean): void => {
            if (itemsModelCurrent.dispItem.setSwiped !== undefined) {
                itemsModelCurrent.dispItem.setSwiped(state, silent);
            }
        };
        itemsModelCurrent.isSwiped = (): boolean => (
            itemsModelCurrent.dispItem.isSwiped !== undefined ? itemsModelCurrent.dispItem.isSwiped() : false
        );
        itemsModelCurrent.isRightSwiped = (): boolean => (
            itemsModelCurrent.dispItem.isRightSwiped !== undefined ? itemsModelCurrent.dispItem.isRightSwiped() : false
        );
        itemsModelCurrent.getContents = () => (
            itemsModelCurrent.dispItem.getContents ? itemsModelCurrent.dispItem.getContents() : null
        );
        itemsModelCurrent.hasVisibleActions = (): boolean => (
            itemsModelCurrent.dispItem.hasVisibleActions !== undefined ? itemsModelCurrent.dispItem.hasVisibleActions() : false
        );
        itemsModelCurrent.hasActionWithIcon = (): boolean => (
            itemsModelCurrent.dispItem.hasActionWithIcon !== undefined ? itemsModelCurrent.dispItem.hasActionWithIcon() : false
        );
        itemsModelCurrent.isSelected = (): boolean => (
            itemsModelCurrent.dispItem.isSelected()
        );
        itemsModelCurrent.setSelected = (selected: boolean|null, silent?: boolean): void => {
            itemsModelCurrent._isSelected = true;
            if (itemsModelCurrent.dispItem.setSelected !== undefined) {
                itemsModelCurrent.dispItem.setSelected(selected, silent);
            }
        };
        itemsModelCurrent.setEditing = (editing: boolean): void => {
            if (itemsModelCurrent.dispItem.setEditing !== undefined) {
                itemsModelCurrent.dispItem.setEditing(editing, itemsModelCurrent.item, true);
            }
        };
        itemsModelCurrent.isEditing = (): boolean => itemsModelCurrent.dispItem.isEditing();
        itemsModelCurrent.isMarked = (): boolean => itemsModelCurrent.dispItem.isMarked();
        itemsModelCurrent.getItemActionClasses = (itemActionsPosition: string, theme?: string): string => (
            itemsModelCurrent.dispItem.getItemActionClasses ?
                itemsModelCurrent.dispItem.getItemActionClasses(itemActionsPosition, theme) : ''
        );
        itemsModelCurrent.getItemActionPositionClasses = (itemActionsPosition: string, itemActionsClass: string, itemPadding: {top?: string, bottom?: string}, theme: string, useNewModel?: boolean): string => (
            itemsModelCurrent.dispItem.getItemActionPositionClasses ?
                itemsModelCurrent.dispItem.getItemActionPositionClasses(itemActionsPosition, itemActionsClass, itemPadding, theme, useNewModel) : ''
        );
    },
    getSeparatorSizes(options: IListSeparatorOptions): IListSeparatorOptions['rowSeparatorSize'] {
        return options.rowSeparatorSize ? options.rowSeparatorSize.toLowerCase() : null;
    }
};

const ListViewModel = ItemsViewModel.extend([entityLib.VersionableMixin], {
    _markedItem: null,
    _dragEntity: null,
    _draggingItemData: null,
    _dragTargetPosition: null,
    _markedKey: null,
    _hoveredItem: null,
    _reloadedKeys: null,
    _singleItemReloadCount: 0,
    _editingItemData: null,

    constructor(cfg): void {
        const self = this;
        ListViewModel.superclass.constructor.apply(this, arguments);

        // TODO надо ли?
        _private.updateIndexes(self, 0, self.getCount());

        this._reloadedKeys = {};
        this.options = cfg;
        this.options.rowSeparatorSize = _private.getSeparatorSizes(this.options);
    },
    setItemPadding: function(itemPadding, silent = false) {
        this._options.itemPadding = itemPadding;
        if (!silent) {
            this._nextModelVersion();
        }
    },
    getItemPadding: function() {
        return _private.getItemPadding(this._options);
    },
    getItemDataByItem: function() {
        const self = this;
        const itemsModelCurrent = ListViewModel.superclass.getItemDataByItem.apply(this, arguments);
        let dragItems;

        if (itemsModelCurrent._listViewModelCached) {
            return itemsModelCurrent;
        } else {
            itemsModelCurrent._listViewModelCached = true;
        }

        // New Model compatibility
        _private.addNewModelCompatibilityForItem(itemsModelCurrent);

        itemsModelCurrent.itemActionsPosition = this._options.itemActionsPosition;
        itemsModelCurrent._isSelected = itemsModelCurrent.dispItem.isMarked();
        itemsModelCurrent.searchValue = this._options.searchValue;
        itemsModelCurrent.markerVisibility = this._options.markerVisibility;
        itemsModelCurrent.itemTemplateProperty = this._options.itemTemplateProperty;
        itemsModelCurrent.isStickedMasterItem = itemsModelCurrent._isSelected && this._isSupportStickyMarkedItem();
        itemsModelCurrent.spacingClassList = _private.getSpacingClassList(this._options);
        itemsModelCurrent.itemPadding = _private.getItemPadding(this._options);
        itemsModelCurrent.hasMultiSelect = !!this._options.multiSelectVisibility && this._options.multiSelectVisibility !== 'hidden';
        itemsModelCurrent.multiSelectClassList = itemsModelCurrent.hasMultiSelect ?
            _private.getMultiSelectClassList(itemsModelCurrent, this._options.multiSelectVisibility === 'onhover') : '';
        itemsModelCurrent.calcCursorClasses = this._calcCursorClasses;
        itemsModelCurrent.backgroundStyle = this._options.backgroundStyle || this._options.style;
        itemsModelCurrent.hoverBackgroundStyle = this._options.hoverBackgroundStyle || this._options.style;
        if (itemsModelCurrent.isGroup) {
            itemsModelCurrent.isStickyHeader = this._options.stickyHeader;
            itemsModelCurrent.virtualScrollConfig = this._isSupportVirtualScroll();
        }

        itemsModelCurrent.getMarkerClasses = (): string => {
            const style = this._options.style || 'default';
            return `controls-ListView__itemV_marker
                    controls-ListView__itemV_marker_${style}_theme-${self._options.theme}
                    controls-ListView__itemV_marker_${style}_topPadding-${itemsModelCurrent.itemPadding.top}_theme-${self._options.theme}
                    controls-ListView__itemV_marker_${style}_bottomPadding-${itemsModelCurrent.itemPadding.bottom}_theme-${self._options.theme}`;
        };

        if (itemsModelCurrent.isGroup) {
            itemsModelCurrent.groupPaddingClasses = _private.getGroupPaddingClasses(itemsModelCurrent, self._options.theme);
        }

        if (this._editingItemData && itemsModelCurrent.key === this._editingItemData.key) {
            itemsModelCurrent.item = this._editingItemData.item;
        }

        if (this._dragEntity) {
            dragItems = this._dragEntity.getItems();
            if (this._draggingItemData && this._draggingItemData.key === itemsModelCurrent.key) {
                itemsModelCurrent.isDragging = true;
            }
            if (dragItems.indexOf(itemsModelCurrent.key) !== -1) {
                itemsModelCurrent.isVisible = this._draggingItemData.key === itemsModelCurrent.key ? !this._dragTargetPosition : false;
            }
            if (this._draggingItemData && this._dragTargetPosition && this._dragTargetPosition.index === itemsModelCurrent.index) {
                itemsModelCurrent.dragTargetPosition = this._dragTargetPosition.position;
                itemsModelCurrent.draggingItemData = this._draggingItemData;
            }
        }
        return itemsModelCurrent;
    },

    _isSupportStickyMarkedItem(): boolean {
        return this._options.stickyMarkedItem !== false &&
            (this._options.style === 'master' || this._options.style === 'masterClassic');
    },

    _isSupportStickyItem(): boolean {
        const display = this.getDisplay();
        return (this._options.stickyHeader && display && display.getGroup()) ||
            this._isSupportStickyMarkedItem();
    },

    _isStickedItem(itemData: { isStickedMasterItem?: boolean, isGroup?: boolean }): boolean {
        return itemData.isStickedMasterItem || itemData.isGroup;
    },

    _getCurIndexForReset(startIndex: number): number {
        if (this._isSupportStickyItem() && startIndex > 0) {
            // Если поддерживается sticky элементов, то индекс не просто нужно сбросить на 0, а взять индекс ближайшего
            // к startIndex застиканного элемента, если таковой имеется. Если же его нет, то оставляем 0.
            // https://online.sbis.ru/opendoc.html?guid=28edae33-62ba-46ae-882c-2bc282b4ee75
            let idx = startIndex;
            while (idx >= 0) {
                const itemData = this.getItemDataByItem(this._display.at(idx));
                if (this._isStickedItem(itemData)) {
                    return idx;
                }
                idx--;
            }
        }
        return startIndex;
    },

    isShouldBeDrawnItem: function(item) {
        var isInRange = ListViewModel.superclass.isShouldBeDrawnItem.apply(this, arguments);
        return isInRange || (item?.isGroup && item?.isStickyHeader) || item?.isStickedMasterItem;
    },

    _calcCursorClasses: function(clickable, cursor) {
        const cursorStyle = cursor || (clickable === false ? 'default' : 'pointer');
        if (typeof clickable !== 'undefined') {
            Logger.warn('Controls/list:BaseItemTemplate', 'Option "clickable" is deprecated and will be removed in 20.3000. Use option "cursor" with value "default".');
        }
        return ` controls-ListView__itemV controls-ListView__itemV_cursor-${cursorStyle}`;
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
        const isSelected = this.getItemBySourceKey(key)?.isSelected();
        if (isSelected === true || isSelected === null) {
            version = 'SELECTED_' + isSelected + '_' + version;
        }
        if (this._reloadedKeys[key]) {
            version = `RELOADED_${this._reloadedKeys[key]}_` + version;
        }
        version = (this._editingItemData ? 'WITH_EDITING_' : 'WITHOUT_EDITING_') + version;
        if (this._editingItemData && this._editingItemData.key === key) {
            version = 'EDITING_' + version;
            version = `MULTISELECT-${this._options.multiSelectVisibility}_${version}`;
        }
        if (this._swipeItem && this._swipeItem.key === key) {
            version = 'SWIPE_' + version;
        }
        return version;
    },

    /**
     * Проставить маркер
     * @param key ключ элемента, в котором задается состояние marked
     * @param status значение marked
     */
    setMarkedKey(key: number|string, status: boolean): void {
        // status - для совместимости с новой моделью, чтобы сбросить маркер нужно передать false
        if (this._markedKey === key && status !== false) {
            return;
        }

        const changedItems = [
            this.getItemById(this._markedKey),
            this.getItemById(key)
        ];

        const item = this.getItemBySourceKey(key);
        if (item) {
            item.setMarked(status);
        }

        if (status === false) {
            this._markedKey = null;
        } else {
            this._markedKey = key;
        }

        this._nextModelVersion(true, 'markedKeyChanged', '', changedItems);
    },

    setMarkerVisibility: function(markerVisibility) {
        this._options.markerVisibility = markerVisibility;
        this._nextModelVersion();
    },

    getFirstItem: function() {
        return ItemsUtil.getFirstItem(this._display);
    },
    getLastItem: function() {
        return ItemsUtil.getLastItem(this._display);
    },

    getIndexByKey(key: string | number) {
        return this._display.getIndexByKey(key);
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

    // для совместимости с новой моделью
    getNextByKey(key: string|number): Model {
        const nextKey = this.getNextItemKey(key);
        return this.getItemBySourceKey(nextKey);
    },
    // для совместимости с новой моделью
    getPrevByKey(key: string|number): Model {
        const nextKey = this.getPreviousItemKey(key);
        return this.getItemBySourceKey(nextKey);
    },

    getMarkedKey: function() {
        return this._markedKey;
    },
    getMarkedItem: function() {
        return _private.getItemByMarkedKey(this, this._markedKey);
    },
    getSelectionStatus: function(key) {
        return this.getItemBySourceKey(key)?.isSelected();
    },

    getActiveItem: function() {
        return this._activeItem;
    },

    /**
     * TODO работа с activeItem Должна производиться через item.isActive(),
     *  но из-за того, как в TileView организована работа с isHovered, isScaled и isAnimated
     *  мы не можем снять эти состояния при клике внутри ItemActions
     * @param itemData
     */
    setActiveItem(itemData: CollectionItem<Model>): void {
        if (itemData === this._activeItem) {
            return;
        }
        const oldActiveItem = this.getActiveItem();
        if (oldActiveItem) {
            oldActiveItem.setActive(false, true);
        }
        // TODO костыль. В TileView вместо item передаётся объект, поэтому проверяем на function
        //  надо передавать настроенный item
        if (itemData && typeof itemData.setActive === 'function') {
            itemData.setActive(true, true);
        }
        this._activeItem = itemData;
        this._nextModelVersion(false, 'activeItemChanged');
    },

    setDraggedItems(draggedItem: IFlatItemData, dragEntity): void {
        this.setDragItemData(draggedItem);
        this.setDragEntity(dragEntity);
    },
    setDragPosition(position: IDragPosition): void {
        this.setDragTargetPosition(position);
    },
    resetDraggedItems(): void {
        this._dragEntity = null;
        this._draggingItemData = null;
        this._dragTargetPosition = null;
        this._nextModelVersion(true);
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

    setItems(items, cfg): void {
        ListViewModel.superclass.setItems.apply(this, arguments);
        this._nextModelVersion();
    },

    _onBeginCollectionChange: function(action, newItems, newItemsIndex, removedItems, removedItemsIndex) {
        if (!this._isSupportVirtualScroll()) {
            _private.updateIndexes(this, 0, this.getCount());
        }
    },
    isValidItemForMarkedKey: function (item) {
        return item && !this._isGroup(item) && item.getId;
    },
    getPreviousItem: function (itemIndex) {
        var prevIndex = itemIndex - 1, prevItem;
        while (prevIndex >= 0) {
            prevItem = this._display.at(prevIndex)?.getContents();
            if (this.isValidItemForMarkedKey(prevItem)) {
                return prevItem.getId();
            }
            prevIndex--;
        }
    },
    getNextItem: function (itemIndex) {
        var nextIndex = itemIndex, nextItem, itemsCount = this._display.getCount();
        while (nextIndex > -1 && nextIndex < itemsCount) {
            nextItem = this._display.at(nextIndex).getContents();
            if (this.isValidItemForMarkedKey(nextItem)) {
                return nextItem.getId();
            }
            nextIndex++;
        }
    },

    // для совместимости с новой моделью
    getNextByIndex(index: number): Model {
        const id = this.getNextItem(index);
        return this.getItemBySourceKey(id);
    },
    // для совместимости с новой моделью
    getPrevByIndex(index: number): Model {
        const id = this.getPreviousItem(index);
        return this.getItemBySourceKey(id);
    },
    // для совместимости с новой моделью
    getIndexBySourceIndex(sourceIndex: number): number {
        return this.getDisplay().getIndexBySourceIndex(sourceIndex);
    },

    getValidItemForMarker: function(index) {
        const prevValidItemKey = this.getPreviousItem(index);
        const nextValidItemKey = this.getNextItem(index);
        if (nextValidItemKey !== undefined) {
            return this.getItemBySourceKey(nextValidItemKey);
        } else if (prevValidItemKey !== undefined) {
            return this.getItemBySourceKey(prevValidItemKey);
        } else {
            return null;
        }
    },
    _setEditingItemData: function(itemData) {
        const data = itemData ? itemData : this._editingItemData;
        this._editingItemData = itemData;
        data.setEditing(itemData !== null);
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
        if (!this.isEditing()) {
            return null;
        }
        // TODO: Нужно убрать проверку на item. isEditing должно сбрасываться при сворачивании/
        const editingItem = this.getEditingItem();
        return !!editingItem ? this.getItemDataByItem(editingItem) : null;
    },

    hasItemById: function(id, keyProperty) {
        return !!this.getItemById(id, keyProperty);
    },

    _prepareDisplayItemForAdd: function(item) {
        return ItemsUtil.getDefaultDisplayItem(this._display, item);
    },

    // New Model compatibility
    getItemBySourceKey(key: number | string): Model {
        return this.getItemById(key, this.getKeyProperty());
    },

    // New Model compatibility
    nextVersion(): void {
        this._nextVersion();
    },

    // New Model compatibility
    isActionsAssigned(): boolean {
        return this._display ? this._display.isActionsAssigned() : false;
    },

    // New Model compatibility
    setActionsAssigned(assigned: boolean): void {
        if (this._display) {
            this._display.setActionsAssigned(assigned)
        }
    },

    // Old method
    setEditingConfig(editingConfig: IEditingConfig): void {
        if (!isEqual(editingConfig, this._options.editingConfig)) {
            this._options.editingConfig = editingConfig;
            this._nextModelVersion();
        }
    },

    // New Model compatibility
    getEditingConfig(): IEditingConfig {
        return this._options?.editingConfig;
    },

    // New Model compatibility
    getActionsTemplateConfig(): IItemActionsTemplateConfig {
        return this._display ? this._display.getActionsTemplateConfig() : {};
    },

    // New Model compatibility
    setActionsTemplateConfig(config: IItemActionsTemplateConfig): void {
        if (this._display) {
            this._display.setActionsTemplateConfig(config);
        }
    },

    // New Model compatibility
    getActionsMenuConfig(): any {
        return this._display ? this._display.getActionsMenuConfig() : {};
    },

    // New Model compatibility
    setActionsMenuConfig(config: any): void {
        if (this._display) {
            this._display.setActionsMenuConfig(config);
        }
    },

    // New Model compatibility
    getSwipeConfig(): ISwipeConfig {
        return this._display ? this._display.getSwipeConfig() : {};
    },

    // New Model compatibility
    setSwipeConfig(config: ISwipeConfig): void {
        if (this._display) {
            this._display.setSwipeConfig(config);
        }
    },

    // New Model compatibility
    setSwipeAnimation(animation: ANIMATION_STATE): void {
        if (this._display) {
            this._display.setSwipeAnimation(animation);
        }
    },

    // New Model compatibility
    getSwipeAnimation(): ANIMATION_STATE {
        return this._display ? this._display.getSwipeAnimation() : {};
    },

    // New Model compatibility
    setEventRaising(enabled: boolean, analyze: boolean): void {
        if (this._display) {
            this._display.setEventRaising(enabled, analyze);
        }
    },

    /**
     * Возвращает состояние "Модель в режиме редактирования".
     * В случае создания нового Item этот Item отсутствует в коллекции и мы не можем
     * в контроллере ItemActions определить, надо ли скрывать у остальных элементов его опции.
     * Если true, опции ItemActions не дожны быть отрисованы
     * New Model compatibility
     */
    isEditing(): boolean {
        return this._display ? this._display.isEditing() : false;
    },

    getEditingItem() {
        return this._display ? this._display.getEditingItem() : null;
    },

    setEditingItem(item) {
        if (this._display) {
            this._display.setEditingItem(item);
        }
    },

    /**
     * Устанавливает состояние "Модель в режиме редактирования".
     * В случае создания нового Item этот Item отсутствует в коллекции и мы не можем
     * в контроллере ItemActions определить, надо ли скрывать у остальных элементов его опции
     * Если true, опции ItemActions не дожны быть отрисованы
     * New Model compatibility
     */
    setEditing(editing): void {
        if (this._display) {
            this._display.setEditing(editing);
        }
    },

    setSelectedItems(items: Model[], selected: boolean|null): void {
        this._display.setSelectedItems(items, selected);
    },

    setItemTemplateProperty: function(itemTemplateProperty) {
        this._options.itemTemplateProperty = itemTemplateProperty;
        this._nextModelVersion();
    },

    setMultiSelectVisibility: function(multiSelectVisibility) {
        this._options.multiSelectVisibility = multiSelectVisibility;
        this._nextModelVersion();
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
    },
    setRowSeparatorSize(rowSeparatorSize: IListSeparatorOptions['rowSeparatorSize']): void {
        this._options.rowSeparatorSize = _private.getSeparatorSizes({rowSeparatorSize});
        this._nextModelVersion();
    }
});

ListViewModel._private = _private;

export = ListViewModel;
