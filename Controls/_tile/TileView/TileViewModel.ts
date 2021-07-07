import {ListViewModel} from 'Controls/list';
import cMerge = require('Core/core-merge');
import {Logger} from 'UI/Utils';
import {object} from 'Types/util';
import {Model} from 'Types/entity';
import {getImageUrl, getImageSize, getImageClasses, IMAGE_FIT} from './resources/imageUtil';

const DEFAULT_ITEM_WIDTH = 250;
const DEFAULT_ITEM_HEIGHT = 200;
const ITEM_COMPRESSION_COEFFICIENT = 0.7;
const DEFAULT_SCALE_COEFFICIENT = 1.5;
const DEFAULT_WIDTH_PROPORTION = 1;

const TILE_SIZES = {
    s: {
        horizontal: {
            width: 210,
            imageHeight: 180
        },
        vertical: {
            width: 390,
            imageWidth: 300
        }
    },
    m: {
        horizontal: {
            width: 310,
            imageHeight: 240
        },
        vertical: {
            width: 390,
            imageWidth: 160
        }
    },
    l: {
        horizontal: {
            width: 420,
            imageHeight: 320
        },
        vertical: {
            width: 640,
            imageWidth: 300
        }
    }
};

var TileViewModel = ListViewModel.extend({
    constructor() {
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

    getCurrent: function (dispItem) {
        var current = TileViewModel.superclass.getCurrent.apply(this, arguments);
        current = cMerge(current, this.getTileItemData(dispItem));
        return current;
    },

    getItemWidth(
        item: Model,
        imageHeightProperty: string,
        imageWidthProperty: string,
        tileMode: string,
        tileHeight: number,
        itemWidth: number
    ): number {
        const imageHeight = imageHeightProperty && Number(item.get(imageHeightProperty));
        const imageWidth = imageWidthProperty && Number(item.get(imageWidthProperty));
        let widthProportion = DEFAULT_WIDTH_PROPORTION;
        let resultWidth = null;
        if (imageHeight && imageWidth && tileMode === 'dynamic') {
            const imageProportion = imageWidth / imageHeight;
            widthProportion = Math.min(DEFAULT_SCALE_COEFFICIENT,
                              Math.max(ITEM_COMPRESSION_COEFFICIENT, imageProportion));
        } else {
            return itemWidth;
        }
        resultWidth = Math.floor(Number(tileHeight) * widthProportion);
        return itemWidth ? Math.max(resultWidth, itemWidth) : resultWidth;
    },

    getTileSizes(tileSize: string, imagePosition: string = 'top', imageViewMode: string = 'rectangle'): object {
        const sizeParams = object.clone(TILE_SIZES[tileSize]);
        const tileSizes = sizeParams[imagePosition === 'top' ? 'horizontal' : 'vertical'];
        if (imagePosition === 'top') {
            tileSizes.imageWidth = null;
            if (imageViewMode !== 'rectangle') {
                tileSizes.imageHeight = null;
            }
        } else if (imageViewMode !== 'rectangle') {
            tileSizes.imageHeight = tileSizes.imageWidth;
        }
        return tileSizes;
    },

    getImageData(itemWidth: number,
                 itemData: Record<string, any>,
                 item: Model): {url: string, class: string} {
        const {
            itemsHeight,
            tileMode,
            imageHeightProperty,
            imageWidthProperty,
            imageUrlResolver,
            imageProperty,
            imageFit} = itemData;
        const imageHeight = item.get(imageHeightProperty) && Number(item.get(imageHeightProperty));
        const imageWidth = item.get(imageWidthProperty) && Number(item.get(imageWidthProperty));
        let baseUrl = item.get(imageProperty);
        if (imageHeight && imageWidth && tileMode === 'static') {
            const sizes = getImageSize(
                Number(itemWidth),
                Number(itemsHeight),
                tileMode,
                imageHeight,
                imageWidth,
                imageFit);
            if (imageUrlResolver) {
                baseUrl = imageUrlResolver(sizes.width, sizes.height, baseUrl);
            } else {
                baseUrl = getImageUrl(sizes.width, sizes.height, baseUrl);
            }
        }
        return {
            url: baseUrl,
            class: getImageClasses(imageFit)
        };
    },

    getTileItemData: function (dispItem): Record<string, any> {
        const resultData: Record<string, any> =  {
            displayProperty: this._options.displayProperty,
            tileMode: this._tileMode,
            itemsHeight: this._itemsHeight,
            imageProperty: this._options.imageProperty,
            defaultItemWidth: DEFAULT_ITEM_WIDTH,
            defaultShadowVisibility: 'visible',
            itemCompressionCoefficient: ITEM_COMPRESSION_COEFFICIENT,
            imageHeightProperty: this._options.imageHeightProperty,
            imageWidthProperty: this._options.imageWidthProperty,
            imageFit: this._options.imageFit,
            imageUrlResolver: this._options.imageUrlResolver
        };
        if (this._options.tileSize) {
            resultData.getTileSizes = this.getTileSizes;
        }
        const itemContents = dispItem?.getContents();
        if (itemContents instanceof Model) {
            const itemWidth = itemContents.get(this._options.tileWidthProperty) || this._options.tileWidth;
            resultData.imageData = this.getImageData(
                itemWidth,
                resultData,
                itemContents
            );
            resultData.itemWidth = this.getItemWidth(
                itemContents,
                this._options.imageHeightProperty,
                this._options.imageWidthProperty,
                this._options.tileMode,
                this._itemsHeight,
                itemWidth
            );
        }
        return resultData;
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

    _onCollectionChange(event, action, newItems, newItemsIndex, removedItems, removedItemsIndex): void {
        // TODO https://online.sbis.ru/opendoc.html?guid=b8b8bd83-acd7-44eb-a915-f664b350363b
        //  Костыль, позволяющий определить, что мы загружаем файл и его прогрессбар изменяется
        //  Это нужно, чтобы не сбрасывался hovered в плитке при изменении прогрессбара
        if (!this._isLoadingPercentsChanged(newItems)) {
            this.setHoveredItem(null);
        }
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
