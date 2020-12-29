import {ListViewModel} from 'Controls/list';
import cMerge = require('Core/core-merge');
import {Logger} from 'UI/Utils';
import {object} from 'Types/util';
import {Model} from 'Types/entity';
import {getImageUrl, getImageSize, getImageClasses, IMAGE_FIT, getImageRestrictions} from './resources/imageUtil';
import {ZOOM_DELAY, ZOOM_COEFFICIENT, TILE_SCALING_MODE} from './resources/Constants';
import {SyntheticEvent} from 'Vdom/Vdom';

const DEFAULT_ITEM_WIDTH = 250;
const DEFAULT_ITEM_HEIGHT = 200;
const ITEM_COMPRESSION_COEFFICIENT = 0.7;
const DEFAULT_SCALE_COEFFICIENT = 1.5;
const DEFAULT_WIDTH_PROPORTION = 1;
const AVAILABLE_CONTAINER_VERTICAL_PADDINGS = ['null', 'default'];
const AVAILABLE_CONTAINER_HORIZONTAL_PADDINGS = ['null', 'default', 'xs', 's', 'm', 'l', 'xl', '2xl'];
const AVAILABLE_ITEM_PADDINGS = ['null', 'default', '3xs', '2xs', 'xs', 's', 'm'];
interface IItemPadding {
    left: string;
    right: string;
    bottom: string;
    top: string;
}

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
        // todo remove multiSelectVisibility, multiSelectPosition and multiSelectClassList by task:
        // https://online.sbis.ru/opendoc.html?guid=50811b1e-7362-4e56-b52c-96d63b917dc9
        current.multiSelectVisibility = this._options.multiSelectVisibility;
        current.multiSelectPosition = this._options.multiSelectPosition;

        current = cMerge(current, this.getTileItemData(dispItem));

        // Совместимость с newModel, https://online.sbis.ru/opendoc.html?guid=0bca7ba3-f49f-46da-986a-a1692deb9c47
        current.isStickyHeader = () => {
            return this._options.stickyHeader;
        }

        if (current.hasMultiSelect) {
            current.multiSelectClassList += ` controls-TileView__checkbox_position-${current.multiSelectPosition}_theme-${current.theme} ` +
                'controls-TileView__checkbox controls-TileView__checkbox_top js-controls-TileView__withoutZoom';
        }
        return current;
    },

    getCurrent: function (dispItem) {
        var current = TileViewModel.superclass.getCurrent.apply(this, arguments);
        current = cMerge(current, this.getTileItemData(dispItem));
        return current;
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

    getImageProportion(proportion: string = '1:1'): number {
        const [width, height]: string[] = proportion.split(':');
        if (width && height) {
            return +(Number(width) / Number(height)).toFixed(2);
        }
        return 1;
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
        let restrictions;
        const imageHeight = item.get(imageHeightProperty) && Number(item.get(imageHeightProperty));
        const imageWidth = item.get(imageWidthProperty) && Number(item.get(imageWidthProperty));
        let baseUrl = item.get(imageProperty);
        if (imageFit === IMAGE_FIT.COVER) {
            const sizes = getImageSize(
                Number(itemWidth),
                Number(itemsHeight),
                tileMode,
                imageHeight,
                imageWidth,
                imageFit);
            baseUrl = getImageUrl(sizes.width, sizes.height, baseUrl, item, imageUrlResolver);
            if (imageHeight && imageWidth) {
                restrictions = getImageRestrictions(imageHeight, imageWidth, Number(itemsHeight), Number(itemWidth));
            }
        }
        return {
            url: baseUrl,
            class: getImageClasses(imageFit, restrictions)
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
            imageUrlResolver: this._options.imageUrlResolver,
            itemClasses: this.getItemPaddingClasses(),
            itemContentClasses: this.getRoundBorderClasses()
        };
        if (this._options.tileSize) {
            resultData.getTileSizes = this.getTileSizes;
        }
        resultData.getImageProportion = this.getImageProportion;
        const itemContents = dispItem?.getContents();
        if (itemContents instanceof Model) {
            resultData.itemWidth = this.getTileWidth(
                itemContents, this._options.imageWidthProperty, this._options.imageHeightProperty);
        } else {
            resultData.itemWidth = this._options.tileWidth || DEFAULT_ITEM_WIDTH;
        }
        return resultData;
    },

    setTileMode: function (tileMode) {
        this._tileMode = tileMode;
        this._nextModelVersion();
    },

    setRoundBorder(value): void {
        this._options.roundBorder = value;
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

    setItemsContainerPadding(padding) {
        this._options.itemsContainerPadding = padding;
        this._nextModelVersion();
    },

    getItemsContainerPadding() {
        return this._options.itemsContainerPadding;
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
        const padding = this.getPadding('itemPadding');
        const theme = `_theme-${this._options.theme}`;
        const leftSpacingClass = `controls-TileView__item_spacingLeft_${padding.left}${theme}`;
        const rightSpacingClass = `controls-TileView__item_spacingRight_${padding.right}${theme}`;
        const topSpacingClass = `controls-TileView__item_spacingTop_${padding.top}${theme}`;
        const bottomSpacingClass = `controls-TileView__item_spacingBottom_${padding.bottom}${theme}`;

        return `${leftSpacingClass} ${rightSpacingClass} ${topSpacingClass} ${bottomSpacingClass}`;
    },

    getPadding(paddingOption: string): IItemPadding {
        return {
            left: this._options[paddingOption]?.left || 'default',
            right: this._options[paddingOption]?.right || 'default',
            top: this._options[paddingOption]?.top || 'default',
            bottom: this._options[paddingOption]?.bottom || 'default'
        };
    },

    preparePadding(availablePadding: string[], padding: IItemPadding): void {
        Object.keys(padding).forEach((key) => {
            if (!availablePadding.includes(padding[key])) {
                padding[key] = 'default';
            }
        });
    },

    getItemsPaddingContainerClasses(): string {
        const theme = `_theme-${this._options.theme}`;
        const itemPadding = this.getPadding('itemPadding');
        let leftSpacingClass = '';
        let rightSpacingClass = '';
        let bottomSpacingClass = '';
        let topSpacingClass = '';
        if (this._options.itemsContainerPadding) {
            const itemsContainerPadding = this.getPadding('itemsContainerPadding');
            this.preparePadding(AVAILABLE_ITEM_PADDINGS, itemPadding);
            if (!AVAILABLE_CONTAINER_VERTICAL_PADDINGS.includes(itemsContainerPadding.top)) {
                itemsContainerPadding.top = 'default';
            }
            if (!AVAILABLE_CONTAINER_VERTICAL_PADDINGS.includes(itemsContainerPadding.bottom)) {
                itemsContainerPadding.bottom = 'default';
            }
            if (!AVAILABLE_CONTAINER_HORIZONTAL_PADDINGS.includes(itemsContainerPadding.left)) {
                itemsContainerPadding.left = 'default';
            }
            if (!AVAILABLE_CONTAINER_HORIZONTAL_PADDINGS.includes(itemsContainerPadding.right)) {
                itemsContainerPadding.right = 'default';
            }
            leftSpacingClass = `controls-TileView__itemsPaddingContainer_spacingLeft_${itemsContainerPadding.left}_itemPadding_${itemPadding.left}${theme}`;
            rightSpacingClass = `controls-TileView__itemsPaddingContainer_spacingRight_${itemsContainerPadding.right}_itemPadding_${itemPadding.right}${theme}`;
            topSpacingClass = `controls-TileView__itemsPaddingContainer_spacingTop_${itemsContainerPadding.top}_itemPadding_${itemPadding.top}${theme}`;
            bottomSpacingClass = `controls-TileView__itemsPaddingContainer_spacingBottom_${itemsContainerPadding.bottom}_itemPadding_${itemPadding.bottom}${theme}`;
        } else {
            leftSpacingClass = `controls-TileView__itemsPaddingContainer_spacingLeft_${itemPadding.left}${theme}`;
            rightSpacingClass = `controls-TileView__itemsPaddingContainer_spacingRight_${itemPadding.right}${theme}`;
            topSpacingClass = `controls-TileView__itemsPaddingContainer_spacingTop_${itemPadding.top}${theme}`;
            bottomSpacingClass = `controls-TileView__itemsPaddingContainer_spacingBottom_${itemPadding.bottom}${theme}`;
        }
        return `${leftSpacingClass} ${rightSpacingClass} ${topSpacingClass} ${bottomSpacingClass}`;
    },

    getTileWidth(
        item: Model,
        imageWidthProperty: string,
        imageHeightProperty: string
    ): number {
        const imageHeight = imageHeightProperty && Number(item.get(imageHeightProperty));
        const imageWidth = imageWidthProperty && Number(item.get(imageWidthProperty));
        const itemWidth = item.get(this._options.tileWidthProperty) || this._options.tileWidth || DEFAULT_ITEM_WIDTH;
        let widthProportion = DEFAULT_WIDTH_PROPORTION;
        let resultWidth = null;
        if (this.getTileMode() === 'dynamic') {
            if (imageHeight && imageWidth) {
                const imageProportion = imageWidth / imageHeight;
                widthProportion = Math.min(DEFAULT_SCALE_COEFFICIENT,
                    Math.max(imageProportion, ITEM_COMPRESSION_COEFFICIENT));
            } else if (this._options.tileFitProperty) {
                return this._itemsHeight * (item.get(this._options.tileFitProperty) || ITEM_COMPRESSION_COEFFICIENT);
            }
        } else {
            return itemWidth;
        }
        resultWidth = Math.floor(Number(this._itemsHeight) * widthProportion);
        return itemWidth ? Math.max(resultWidth, itemWidth) : resultWidth;
    },

    shouldOpenExtendedMenu(isActionMenu: boolean, isContextMenu: boolean, itemData: Record<string, any>): boolean {
        const isScalingTile = this._options.tileScalingMode !== 'none' &&
                              this._options.tileScalingMode !== 'overlap' &&
                              !itemData.dispItem.isNode();
        return this._options.actionMenuViewMode === 'preview' && !isActionMenu && !(isScalingTile && isContextMenu);
    },

    getActionsMenuConfig(
        itemData,
        clickEvent: SyntheticEvent,
        opener,
        templateOptions,
        isActionMenu,
        isContextMenu
    ): Record<string, any> {
        if (this.shouldOpenExtendedMenu(isActionMenu, isContextMenu, itemData)) {
            const MENU_MAX_WIDTH = 200;
            const menuOptions = templateOptions;
            /* TODO Вынести этот код из модели в контрол плитки
               https://online.sbis.ru/opendoc.html?guid=7f6ac2cf-15e6-4b75-afc6-928a86ade83e */
            const itemContainer = clickEvent.target.closest('.controls-TileView__item');
            const itemContentContainer = itemContainer.querySelector('.controls-TileView__itemContent');
            if (!itemContentContainer) {
                return null;
            }
            let previewWidth = itemContentContainer.clientWidth;
            let previewHeight = itemContentContainer.clientHeight;
            menuOptions.image = itemData.imageData.url;
            menuOptions.title = itemData.item.get(itemData.displayProperty);
            menuOptions.additionalText = itemData.item.get(templateOptions.headerAdditionalTextProperty);
            menuOptions.imageClasses = itemData.imageData?.class;
            if (this._options.tileScalingMode === TILE_SCALING_MODE.NONE) {
                previewHeight = previewHeight * ZOOM_COEFFICIENT;
                previewWidth = previewWidth * ZOOM_COEFFICIENT;
            }
            menuOptions.previewHeight = previewHeight;
            menuOptions.previewWidth = previewWidth;

            return {
                templateOptions,
                closeOnOutsideClick: true,
                maxWidth: menuOptions.previewWidth + MENU_MAX_WIDTH,
                target: itemContentContainer,
                className: 'controls-TileView__itemActions_menu_popup',
                targetPoint: {
                    vertical: 'top',
                    horizontal: 'left'
                },
                opener,
                template: 'Controls/tile:ActionsMenu',
                actionOnScroll: 'close'
            };
        } else {
            return null;
        }
    },

    getRoundBorderClasses(): string {
        const theme = `_theme-${this._options.theme}`;
        const topLeftBorder = this._options.roundBorder?.tl || 'default';
        const topRightBorder = this._options.roundBorder?.tr || 'default';
        const bottomLeftBorder = this._options.roundBorder?.bl || 'default';
        const bottomRightBorder = this._options.roundBorder?.br || 'default';
        const topLeftClass = `controls-TileView__item_roundBorder_topLeft_${topLeftBorder}${theme}`;
        const topRightClass = `controls-TileView__item_roundBorder_topRight_${topRightBorder}${theme}`;
        const bottomLeftClass = `controls-TileView__item_roundBorder_bottomLeft_${bottomLeftBorder}${theme}`;
        const bottomRightClass = `controls-TileView__item_roundBorder_bottomRight_${bottomRightBorder}${theme}`;

        return `${topLeftClass} ${topRightClass} ${bottomLeftClass} ${bottomRightClass}`;
    }
});

export = TileViewModel;
