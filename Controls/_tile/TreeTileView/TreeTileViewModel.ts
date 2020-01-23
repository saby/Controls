import TileViewModel = require('Controls/_tile/TileView/TileViewModel');
import {TreeViewModel} from 'Controls/treeGrid';
import cMerge = require('Core/core-merge');
import InvisibleFor = require('wml!Controls/_tile/TileView/resources/InvisibleFor');

var DEFAULT_FOLDER_WIDTH = 250;

var TreeTileViewModel = TreeViewModel.extend({
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
            prevItem, hoveredItem,
            current = TreeTileViewModel.superclass.getItemDataByItem.apply(this, arguments);

        current.scalingMode = this._options.tileScalingMode;
        if (current._treeTileViewModelCached) {
            return current;
        } else {
            current._treeTileViewModelCached = true;
        }
        hoveredItem = this._tileModel.getHoveredItem();

        if (current.hasMultiSelect) {
            current.multiSelectClassList += ' controls-TileView__checkbox js-controls-TileView__withoutZoom';
            current.multiSelectClassList += !current.isGroup && dispItem.isNode() ? ' controls-TreeTileView__checkbox' : '';
        }
        prevItem = this._display.at(current.index - 1);

        //before grouping and when moving from folders to records, you need to draw invisible items
        if (current.isGroup || prevItem && prevItem.isNode && prevItem.isNode() && !current.dispItem.isNode()) {
            current.beforeItemTemplate = InvisibleFor;
            current.beforeItemTemplateOptions = {
                type: prevItem && prevItem.isNode && prevItem.isNode() ? 'folder' : 'leaf'
            }
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

        current = cMerge(current, this.getTileItemData());
        if (current.dispItem.isNode && current.dispItem.isNode()) {
            current.itemsHeight = this._options.nodesHeight || current.itemsHeight;
        }

        current.isScaled = this.isScaled(current);

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

        return current;
    },
    isScaled: function(itemData) {
        return (itemData.item.get && itemData.item.get(itemData.displayProperty) || itemData.scalingMode !== 'none')
            && (!!itemData.isActive || !!itemData.isSwiped || !!itemData.isHovered);
    },
    getTileItemData: function () {
        var opts = this._tileModel.getTileItemData();
        opts.defaultFolderWidth = DEFAULT_FOLDER_WIDTH;
        return opts;
    },

    setTileMode: function (tileMode) {
        this._tileModel.setTileMode(tileMode);
    },

    getTileMode: function () {
        return this._tileModel.getTileMode();
    },

    setItemsHeight: function (itemsHeight) {
        this._tileModel.setItemsHeight(itemsHeight);
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

    setActiveItem: function (itemData) {
        this._tileModel.setActiveItem(itemData);
        TreeTileViewModel.superclass.setActiveItem.apply(this, arguments);
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
    }
});

export = TreeTileViewModel;
