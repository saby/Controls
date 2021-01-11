import TileViewModel = require('Controls/_tile/TileView/TileViewModel');
import {TreeViewModel} from 'Controls/tree';
import cMerge = require('Core/core-merge');
import InvisibleFor = require('wml!Controls/_tile/TileView/resources/InvisibleFor');
import {SyntheticEvent} from 'UI/Vdom';
import {Model} from 'Types/entity';

var DEFAULT_FOLDER_WIDTH = 250;

var TreeTileViewModel = TreeViewModel.extend({
    '[Controls/_tile/TreeTileViewModel]': true,

    constructor: function (cfg) {
        TreeTileViewModel.superclass.constructor.apply(this, arguments);
        this._tileModel = new TileViewModel(cfg);
        this._onListChangeFn = function(event, changesType) {
            this._nextVersion();
            this._resetCacheOnChange(changesType);
            this._notify('onListChange', changesType);
        }.bind(this);
        this._tileModel.subscribe('onListChange', this._onListChangeFn);
    },

    getItemDataByItem: function (dispItem) {
        var
            prevItem, nextItem, hoveredItem,
            current = TreeTileViewModel.superclass.getItemDataByItem.apply(this, arguments);

        current.scalingMode = this._options.tileScalingMode;
        if (current._treeTileViewModelCached) {
            return current;
        } else {
            current._treeTileViewModelCached = true;
        }
        hoveredItem = this._tileModel.getHoveredItem();
        // New Model compatibility
        if (!(current.isHiddenGroup instanceof Function)) {
            const isHiddenGroup = current.isHiddenGroup;
            current.isHiddenGroup = () => isHiddenGroup;
        }
        current.getGroupPaddingClasses = (theme: string, direction: string) => current.groupPaddingClasses[direction];
        if (!(current.isExpanded instanceof Function)) {
            const collapsedGroups = this.getCollapsedGroups() || [];
            current.isExpanded = () => !collapsedGroups.includes(dispItem.getContents());
        }
        current.isStickyHeader = () => this._options.stickyHeader;
        if (current.hasMultiSelect) {
            current.multiSelectClassList += ' controls-TileView__checkbox js-controls-TileView__withoutZoom';
            current.multiSelectClassList += !current.isGroup && dispItem.isNode() ? ' controls-TreeTileView__checkbox' : '';
        }
        prevItem = this._display.at(current.index - 1);
        nextItem = this._display.at(current.index + 1);

        if (!nextItem && !current.isGroup && current.dispItem.isNode()) {
            current.afterItemTemplate = InvisibleFor;
            current.afterItemTemplateOptions = {
                type: 'folder'
            };
        }

        //before grouping and when moving from folders to records, you need to draw invisible items
        if (current.isGroup || prevItem && prevItem.isNode && prevItem.isNode() && !current.dispItem.isNode()) {
            current.beforeItemTemplate = InvisibleFor;
            current.beforeItemTemplateOptions = {
                type: prevItem && prevItem.isNode && prevItem.isNode() ? 'folder' : 'leaf'
            };
        }

        if (hoveredItem && hoveredItem.key === current.key) {
            current.isHovered = true;
            if (hoveredItem.position) {
                current.isFixed = true;
                current.position = hoveredItem.position;
            }
            current.canShowActions = hoveredItem.canShowActions;
            current.isAnimated = hoveredItem.isAnimated;
            current.zoomCoefficient = hoveredItem.zoomCoefficient;
        }

        current = cMerge(current, this.getTileItemData(dispItem));
        if (current.dispItem.isNode && current.dispItem.isNode()) {
            current.itemsHeight = this._options.nodesHeight || current.itemsHeight;
        }

        current.isScaled = this.isScaled(current);
        current.isUnscaleable = !current.scalingMode || current.scalingMode === 'none';
        current.isUnfixed = current.isSwiped() || !current.isScaled && !current.isUnscaleable;

        var
            originalGetVersion = current.getVersion;

        current.getVersion = function () {
            var
                version = originalGetVersion();
            if (current.isHovered) {
                version = 'HOVERED_' + version;
            }
            if (current.isAnimated) {
                version = 'ANIMATED_' + version;
            }
            return version;
        };

        // Совместимость с newModel, https://online.sbis.ru/opendoc.html?guid=0bca7ba3-f49f-46da-986a-a1692deb9c47
        current.isStickyHeader = () => {
            return this._options.stickyHeader;
        }

        return current;
    },
    isScaled: function(itemData) {
        return (itemData.item.get && itemData.item.get(itemData.displayProperty) || itemData.scalingMode !== 'none')
            && (!!itemData.isActive() || !!itemData.isSwiped() || !!itemData.isHovered);
    },
    getTileItemData: function (dispItem) {
        var opts = this._tileModel.getTileItemData(dispItem);
        opts.defaultFolderWidth = DEFAULT_FOLDER_WIDTH;
        if (this._options.tileSize) {
            opts.tileSize = this._options.tileSize;
        }
        const itemContents = dispItem?.getContents();
        if (itemContents instanceof Model) {
            opts.itemWidth = this.getItemWidth(
                itemContents,
                dispItem.isNode(),
                this._options.imageWidthProperty,
                this._options.imageHeightProperty
            );
            opts.imageData = this.getImageData(
                opts.itemWidth,
                opts,
                itemContents
            );
        } else {
            opts.itemWidth = dispItem?.isNode && dispItem.isNode() ? this._options.folderWidth :
            this._options.tileWidth;
        }
        return opts;
    },

    setTileMode: function (tileMode) {
        this._tileModel.setTileMode(tileMode);
    },

    setTileSize(size: string): void {
        this._options.tileSize = size;
        this._nextModelVersion();
    },

    setRoundBorder(value): void {
        this._tileMode.setRoundBorder(value);
    },

    getTileMode: function () {
        return this._tileModel.getTileMode();
    },

    setItemsHeight: function (itemsHeight) {
        this._tileModel.setItemsHeight(itemsHeight);
    },

    setItemsContainerPadding(padding) {
        this._tileModel.setItemsContainerPadding(padding);
    },

    getItemsContainerPadding() {
        return this._tileModel.getItemsContainerPadding();
    },

    getItemsHeight: function () {
        return this._tileModel.getItemsHeight();
    },

    setHoveredItem: function (itemData) {
        this._tileModel.setHoveredItem(itemData);
    },

    getHoveredItem: function () {
        return this._tileModel.getHoveredItem();
    },

    /**
     * TODO работа с activeItem Должна производиться через item.isActive(),
     *  но из-за того, как в TileView организована работа с isHovered, isScaled и isAnimated
     *  мы не можем снять эти состояния при клике внутри ItemActions
     * @param itemData
     */
    setActiveItem: function (itemData) {
        this._tileModel.setActiveItem(itemData);
        TreeTileViewModel.superclass.setActiveItem.apply(this, arguments);
    },

    setDragItemData(itemData: any): void {
        // Когда д-н-д начали перетаскивание увеличенной плитки, то все эти свойства сохраняются в draggedItemData.
        // Из-за этого перетаскиваемая плитка остается увеличенной с position=fixed и не меняет позицию
        if (itemData) {
            itemData.isFixed = false;
            itemData.isHovered = false;
            itemData.position = null;
            itemData.canShowActions = false;
            itemData.isAnimated = false;
            itemData.zoomCoefficient = null;
        }

        TreeTileViewModel.superclass.setDragItemData.apply(this, arguments);
    },

    setDragEntity: function (entity) {
        this._tileModel.setDragEntity(entity);
        TreeTileViewModel.superclass.setDragEntity.apply(this, arguments);
    },

    setRoot: function () {
        this._tileModel.setHoveredItem(null);
        TreeTileViewModel.superclass.setRoot.apply(this, arguments);
    },

    setNodesHeight: function(nodesHeight) {
        this._options.nodesHeight = nodesHeight;
        this._nextModelVersion();
    },

    destroy: function () {
        this._tileModel.unsubscribe('onListChange', this._onListChangeFn);
        this._tileModel.destroy();
        TreeTileViewModel.superclass.destroy.apply(this, arguments);
    },

    prepareDisplayFilterData: function() {
        var
           filterData = TreeTileViewModel.superclass.prepareDisplayFilterData.apply(this, arguments);
        // Для плитки свернутых и развернутых узлов не существует. Есть просто узлы, в которые можно проваливаться и
        // листья, в которые проваливаться нельзя.
        filterData.expandedItems = [];
        filterData.collapsedItems = [];
        return filterData;
    },

    getItemPaddingClasses(): string {
        return this._tileModel.getItemPaddingClasses();
    },

    getItemWidth(
        item: Model,
        isFolder: boolean,
        imageWidthProperty: string,
        imageHeightProperty: string
    ): number {
        if (isFolder) {
            return this._options.folderWidth || DEFAULT_FOLDER_WIDTH;
        } else {
            return this._tileModel.getTileWidth(item, imageWidthProperty, imageHeightProperty);
        }
    },

    getImageData(itemWidth: number, itemData: Record<string, any>,  item: Model): {url: string, class: string} {
        return this._tileModel.getImageData(itemWidth, itemData, item);
    },

    getItemsPaddingContainerClasses(): string {
        return this._tileModel.getItemsPaddingContainerClasses();
    },

    getRoundBorderClasses(): string {
        return this._tileModel.getRoundBorderClasses();
    }
});

export = TreeTileViewModel;
