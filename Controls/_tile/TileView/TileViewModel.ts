import {ListViewModel} from 'Controls/list';
import cMerge = require('Core/core-merge');
import {Logger} from 'UI/Utils';

var
    DEFAULT_ITEM_WIDTH = 250,
    DEFAULT_ITEM_HEIGHT = 200,
    ITEM_COMPRESSION_COEFFICIENT = 0.7;

var TileViewModel = ListViewModel.extend({
    constructor: function () {
        TileViewModel.superclass.constructor.apply(this, arguments);
        this._tileMode = this._options.tileMode;
        if (this._options.hasOwnProperty('itemsHeight')) {
            Logger.warn(this._moduleName + ': Используется устаревшая опция itemsHeight, используйте tileHeight', this);
        }
        this._itemsHeight = this._options.tileHeight || this._options.itemsHeight || DEFAULT_ITEM_HEIGHT;
    },

    getItemDataByItem: function (dispItem) {
        let current = TileViewModel.superclass.getItemDataByItem.apply(this, arguments);

        if (current._tileViewModelCached) {
            return current;
        } else {
            current._tileViewModelCached = true;
        }

        current.multiSelectClassList += current.hasMultiSelect ? ' controls-TileView__checkbox controls-TileView__checkbox_top js-controls-TileView__withoutZoom' : '';
        return current;
    },

    getCurrent: function () {
        var current = TileViewModel.superclass.getCurrent.apply(this, arguments);
        current = cMerge(current, this.getTileItemData());
        return current;
    },

    getTileItemData: function () {
        return {
            tileMode: this._tileMode,
            itemsHeight: this._itemsHeight,
            imageProperty: this._options.imageProperty,
            defaultItemWidth: DEFAULT_ITEM_WIDTH,
            defaultShadowVisibility: 'visible',
            itemCompressionCoefficient: ITEM_COMPRESSION_COEFFICIENT
        };
    },

    setTileMode: function (tileMode) {
        this._tileMode = tileMode;
        this._nextModelVersion();
    },

    getTileMode: function () {
        return this._tileMode;
    },

    setItemsHeight: function (itemsHeight) {
        this._itemsHeight = itemsHeight;
        this._nextModelVersion();
    },

    getItemsHeight: function () {
        return this._itemsHeight;
    },

    setHoveredItem: function (hoveredItem) {
        if (this._hoveredItem !== hoveredItem) {
            this._hoveredItem = hoveredItem;
            this._nextModelVersion(true, 'hoveredItemChanged');
        }
    },

    getHoveredItem: function () {
        return this._hoveredItem;
    },

    _calcItemVersion: function (item, key) {
        let version = TileViewModel.superclass._calcItemVersion.apply(this, arguments);

        if (this._hoveredItem && this._hoveredItem.key === key) {
            version = `HOVERED_${version}`;
        }

        return version;
    },

    // TODO работа с activeItem Должна производиться через item.isActive(),
    //  но из-за того, как в TileView организована работа с isHovered, isScaled и isAnimated
    //  мы не можем снять эти состояния при клике внутри ItemActions
    setActiveItem: function (activeItem) {
        if (!activeItem) {
            this.setHoveredItem(null);
        }
        TileViewModel.superclass.setActiveItem.apply(this, arguments);
    },

    _onCollectionChange: function() {
        this.setHoveredItem(null);
        TileViewModel.superclass._onCollectionChange.apply(this, arguments);
    },

    setDragEntity: function () {
        this.setHoveredItem(null);
        TileViewModel.superclass.setDragEntity.apply(this, arguments);
    },

    getItemPaddingClasses(): string {
        const leftSpacing = this._options.itemPadding && this._options.itemPadding.left || 'default';
        const rightSpacing = this._options.itemPadding && this._options.itemPadding.right || 'default';
        const theme = `_theme-${this._options.theme}`;

        const leftSpacingClass = `controls-TileView__itemPaddingContainer_spacingLeft_${leftSpacing}${theme}`;
        const rightSpacingClass = `controls-TileView__itemPaddingContainer_spacingRight_${rightSpacing}${theme}`;

        return `${leftSpacingClass} ${rightSpacingClass}`;
    }
});

export = TileViewModel;
