import {IItemPadding, ListView} from 'Controls/baseList';
import template = require('wml!Controls/_tile/render/TileView');
import defaultItemTpl = require('wml!Controls/_tile/render/items/Default');
import { TouchDetect } from 'Env/Touch';
import { TILE_SCALING_MODE, ZOOM_COEFFICIENT, ZOOM_DELAY} from './utils/Constants';
import {isEqual} from 'Types/object';
import { TemplateFunction } from 'UI/Base';
import TileCollectionItem from './display/TileCollectionItem';
import TileCollection from './display/TileCollection';
import {SyntheticEvent} from 'UI/Vdom';
import {Model} from 'Types/entity';
import {constants} from 'Env/Env';
import {getItemSize} from './utils/imageUtil';
import {createPositionInBounds} from './utils/createPosition';
import 'css!Controls/tile';
import CollectionItem from 'Controls/_display/CollectionItem';

const AVAILABLE_CONTAINER_VERTICAL_PADDINGS = ['null', 'default'];
const AVAILABLE_CONTAINER_HORIZONTAL_PADDINGS = ['null', 'default', 'xs', 's', 'm', 'l', 'xl', '2xl'];
const AVAILABLE_ITEM_PADDINGS = ['null', 'default', '3xs', '2xs', 'xs', 's', 'm'];

/**
 * Представление плиточного контрола
 */
export default class TileView extends ListView {
    protected _template: TemplateFunction = template;
    protected _defaultItemTemplate: TemplateFunction = defaultItemTpl;
    protected _hoveredItem: TileCollectionItem;
    protected _mouseMoveTimeout: number;
    protected _listModel: TileCollection;

    protected _animatedItemTargetPosition: string;
    protected _shouldPerformAnimation: boolean;
    protected _targetItemRect: ClientRect;

    protected _beforeMount(options: any): void {
        super._beforeMount(options);
    }

    protected _afterMount(options: any): void {
        this._notify('register', ['controlResize', this, this._onResize], {bubbling: true});
        this._notify('register', ['scroll', this, this._onScroll, {listenAll: true}], {bubbling: true});
        super._afterMount(options);
    }

    protected _onItemContextMenu(event: Event, item: TileCollectionItem): void {
        if (this._listModel.getTileScalingMode() === 'preview') {

            // не начинаем анимацию, если открываем меню, иначе, из-за анимации, меню может позиционироваться криво
            if (!item.isScaled()) {
                item.setAnimated(false);
                item.setFixedPositionStyle('');
            }
        }
        super._onItemContextMenu(event, item);
    }

    private _onResize(event: SyntheticEvent<AnimationEvent>): void {
        // TODO Если включены операции над записью с задержкой, то после завершения анимации попап стреляет Resize
        //  https://online.sbis.ru/opendoc.html?guid=d8d0bf9e-fc25-4882-84d9-9ff5e20d52da
        if (event?.type !== 'animationend') {
            this._listModel.setHoveredItem(null);
        }
    }

    protected _beforeUpdate(newOptions: any): void {
        super._beforeUpdate(newOptions);

        // region Update Model
        if (this._options.tileMode !== newOptions.tileMode) {
            this._listModel.setTileMode(newOptions.tileMode);
        }
        if (this._options.tileSize !== newOptions.tileSize) {
            this._listModel.setTileSize(newOptions.tileSize);
        }
        if (this._options.itemsContainerPadding !== newOptions.itemsContainerPadding) {
            this._listModel.setItemsContainerPadding(newOptions.itemsContainerPadding);
        }
        if (this._options.tileHeight !== newOptions.tileHeight) {
            this._listModel.setTileHeight(newOptions.tileHeight);
        }
        if (this._options.tileWidth !== newOptions.tileWidth) {
            this._listModel.setTileWidth(newOptions.tileWidth);
        }
        if (this._options.tileWidthProperty !== newOptions.tileWidthProperty) {
            this._listModel.setTileWidthProperty(newOptions.tileWidthProperty);
        }
        if (this._options.tileFitProperty !== newOptions.tileFitProperty) {
            this._listModel.setTileFitProperty(newOptions.tileFitProperty);
        }
        if (this._options.tileScalingMode !== newOptions.tileScalingMode) {
            this._listModel.setTileScalingMode(newOptions.tileScalingMode);
        }
        if (this._options.imageProperty !== newOptions.imageProperty) {
            this._listModel.setImageProperty(newOptions.imageProperty);
        }
        if (this._options.imageFit !== newOptions.imageFit) {
            this._listModel.setImageFit(newOptions.imageFit);
        }
        if (this._options.imageHeightProperty !== newOptions.imageHeightProperty) {
            this._listModel.setImageHeightProperty(newOptions.imageHeightProperty);
        }
        if (this._options.imageWidthProperty !== newOptions.imageWidthProperty) {
            this._listModel.setImageWidthProperty(newOptions.imageWidthProperty);
        }
        if (this._options.imageUrlResolver !== newOptions.imageUrlResolver) {
            this._listModel.setImageUrlResolver(newOptions.imageUrlResolver);
        }
        if (!isEqual(this._options.roundBorder, newOptions.roundBorder)) {
            this._listModel.setRoundBorder(newOptions.roundBorder);
        }
        // endregion Update Model

        if (newOptions.listModel !== this._listModel) {
            this._setHoveredItem(this, null, null);
        }
        const hoveredItem = this._listModel.getHoveredItem();
        this._shouldPerformAnimation = hoveredItem && !hoveredItem.destroyed
            && hoveredItem['[Controls/_tile/mixins/TileItem]'] && hoveredItem.isFixed();
    }

    protected _afterUpdate(): void {
        super._afterUpdate();

        const hoveredItem = this._listModel.getHoveredItem();
        if (hoveredItem && !hoveredItem.destroyed &&  hoveredItem['[Controls/_tile/mixins/TileItem]']) {
            // actions нужно всегда показать после отрисовки hoveredItem
            hoveredItem.setCanShowActions(true);

            if (
                this._shouldPerformAnimation &&
                hoveredItem.isFixed() &&
                !hoveredItem.isAnimated()
            ) {
                hoveredItem.setAnimated(true);
                hoveredItem.setFixedPositionStyle(this._animatedItemTargetPosition);
            }
        }
    }

    protected _isPendingRedraw(event, changesType, action, newItems) {
        return !this.isLoadingPercentsChanged(action) && super._isPendingRedraw(event, changesType, action, newItems);
    }
    /**
     * TODO https://online.sbis.ru/opendoc.html?guid=b8b8bd83-acd7-44eb-a915-f664b350363b
     *  Костыль, позволяющий определить, что мы загружаем файл и его прогрессбар изменяется
     *  Это нужно, чтобы в ListView не вызывался resize при изменении прогрессбара и не сбрасывался hovered в плитке
     */
    isLoadingPercentsChanged(newItems: Array<CollectionItem<Model>>): boolean {
        return newItems &&
            newItems[0] &&
            newItems[0].getContents() &&
            newItems[0].getContents().getChanged &&
            newItems[0].getContents().getChanged().indexOf('docviewLoadingPercent') !== -1 &&
            newItems[0].getContents().getChanged().indexOf('docviewIsLoading') === -1;
    }

    protected _beforeUnmount(): void {
        this._notify('unregister', ['controlResize', this], {bubbling: true});
        this._notify('unregister', ['scroll', this, {listenAll: true}], {bubbling: true});
    }

    getActionsMenuConfig(
        contents: Model,
        clickEvent: SyntheticEvent,
        action: object,
        isContextMenu: boolean,
        menuConfig: object,
        item: TileCollectionItem
    ): Record<string, any> {
        const isActionMenu = !!action && !action.isMenu;
        if (this._shouldOpenExtendedMenu(isActionMenu, isContextMenu, item) && menuConfig) {
            const MENU_MAX_WIDTH = 200;
            const menuOptions = menuConfig.templateOptions;
            const itemContainer = clickEvent.target.closest('.controls-TileView__item');
            const imageWrapper = itemContainer.querySelector('.controls-TileView__imageWrapper');
            if (!imageWrapper) {
                return null;
            }

            const targetItemSize = getItemSize(itemContainer, this._listModel.getZoomCoefficient(), this._listModel.getTileMode());

            menuOptions.image = item.getImageUrl();
            menuOptions.title = item.getDisplayValue();
            menuOptions.additionalText = item.item.get(menuOptions.headerAdditionalTextProperty);
            menuOptions.imageClasses = item.getImageClasses();
            menuOptions.previewHeight = this._targetItemRect && item.isScaled() ? this._targetItemRect.height : targetItemSize.height;
            menuOptions.previewWidth = this._targetItemRect && item.isScaled() ? this._targetItemRect.width : targetItemSize.width;

            return {
                templateOptions: menuOptions,
                closeOnOutsideClick: true,
                maxWidth: menuOptions.previewWidth + MENU_MAX_WIDTH,
                target: this._targetItemRect ? {getBoundingClientRect: () => this._targetItemRect} : imageWrapper,
                className: `controls-TileView__itemActions_menu_popup
                            controls_popupTemplate_theme-${this._options.theme}
                            controls_list_theme-${this._options.theme}`,
                targetPoint: {
                    vertical: 'top',
                    horizontal: 'left'
                },
                fittingMode: {
                    vertical: 'overflow'
                },
                opener: menuConfig.opener,
                template: 'Controls/tile:ActionsMenu',
                actionOnScroll: 'close'
            };
        } else {
            return null;
        }
    }

    private _shouldOpenExtendedMenu(isActionMenu: boolean, isContextMenu: boolean, item: TileCollectionItem): boolean {
        return this._options.actionMenuViewMode === 'preview' && !isActionMenu;
    }

    protected _onItemMouseEnter(e: SyntheticEvent<MouseEvent>, item: TileCollectionItem): void {
        super._onItemMouseEnter(e, item);
        this._setHoveredItemIfNeed(e, item);
    }

    protected _onItemMouseLeave(event: SyntheticEvent, item: TileCollectionItem): void {
        if (!TouchDetect.getInstance().isTouch() && !item.isActive()) {
            this._setHoveredItem(this, null, event);
            // С помощью флага canShowActions отображают itemActions. Когда показываются itemActions, скрывается title.
            // Поэтому после того как увели мышь с итема, нужно сбросить флаг canShowActions, чтобы показать title.
            if (item['[Controls/_tile/mixins/TileItem]']) {
                item.setCanShowActions(false);
            }
        }
        this._clearMouseMoveTimeout();
        super._onItemMouseLeave(event, item);
    }

    protected _onItemMouseMove(event: SyntheticEvent, item: TileCollectionItem): void {
        if (!item['[Controls/_display/GroupItem]'] &&
            this._shouldProcessHover() &&
            !this._listModel.isDragging() &&
            !item.isFixed()
        ) {
            this._setHoveredItemPosition(event, item);
        }
        this._setHoveredItemIfNeed(event, item);

        super._onItemMouseMove(event, item);
    }

    private _setHoveredItemIfNeed(event: SyntheticEvent, item: TileCollectionItem): void {
        if (this._shouldProcessHover() && (this._listModel.getHoveredItem() !== item)) {
            this._clearMouseMoveTimeout();
            this._mouseMoveTimeout = setTimeout(() => {
                this._setHoveredItem(this, item, event);
                this._clearMouseMoveTimeout();
            }, ZOOM_DELAY);
        }
    }

    private _setHoveredItemPosition(e: SyntheticEvent<MouseEvent>, item: TileCollectionItem): void {
        const target = e.target as HTMLElement;
        const tileScalingMode = this._listModel.getTileScalingMode();

        if (tileScalingMode === 'none' || target.closest('.js-controls-TileView__withoutZoom')) {
            if (item && item['[Controls/_tile/mixins/TileItem]'] && this._options.actionMode !== 'adaptive') {
                // canShowActions можно проставить без задержки, если они не будут пересчитаны
                item.setCanShowActions(true);
            }
            return;
        }

        const itemContainer: HTMLElement = target.closest('.controls-TileView__item');
        const itemContainerRect = itemContainer.getBoundingClientRect();

        const viewContainer = tileScalingMode === 'inside'
            ? this.getItemsContainer()
            : constants.isBrowserPlatform && document.documentElement;
        const viewContainerRect = viewContainer.getBoundingClientRect();

        const targetItemSize = getItemSize(itemContainer, this._listModel.getZoomCoefficient(), this._listModel.getTileMode());
        const targetItemPosition = this._listModel.getItemContainerPosition(
            targetItemSize,
            itemContainerRect,
            viewContainerRect
        );

        // Если один из параметров позиции посчитается отрицательным, то позиция не корректна и возвращается null
        if (!targetItemPosition) {
            return;
        }

        const documentRect = constants.isBrowserPlatform && document.documentElement.getBoundingClientRect();
        const targetItemPositionInDocument = this._listModel.getItemContainerPositionInDocument(
            targetItemPosition,
            viewContainerRect,
            documentRect
        );
        this._targetItemRect = {...targetItemSize, ...targetItemPositionInDocument};
        // TODO This should probably be moved to some kind of animation manager
        if (targetItemPositionInDocument) {
            const targetPositionStyle = this._convertPositionToStyle(targetItemPositionInDocument);
            if (tileScalingMode !== 'overlap' && tileScalingMode !== 'none') {
                const startItemPositionInDocument = this._listModel.getItemContainerStartPosition(
                    itemContainerRect,
                    documentRect
                );
                item.setFixedPositionStyle(this._convertPositionToStyle(startItemPositionInDocument));
                this._animatedItemTargetPosition = targetPositionStyle;
            } else {
                item.setFixedPositionStyle(targetPositionStyle);
            }
        }
    }

    private _convertPositionToStyle(position: object): string {
        let result = '';
        for (const key in position) {
            if (position.hasOwnProperty(key)) {
                result += `${key}: ${position[key]}px;`;
            }
        }
        return result;
    }

    private _setHoveredItem(self: TileView, item: TileCollectionItem, event: SyntheticEvent): void {
        if (this._destroyed || !this._listModel || this._listModel.destroyed) {
            return;
        }

        // Элемент могут удалить, но hover на нем успеет сработать. Проверяем что элемент точно еще есть в модели.
        // Может прийти null, чтобы сбросить элемент
        const hasItem = item === null || !!this._listModel.getItemBySourceItem(item.getContents());
        if (!hasItem) {
            return;
        }

        if (this._listModel.getHoveredItem() !== item && !this._listModel.getActiveItem()) {
            this._listModel.setHoveredItem(item);
        }

        if (this._needUpdateActions(item, event)) {
            let itemWidth;
            const itemContainer = event.target.closest('.controls-TileView__item');
            if (event.target.closest('.js-controls-TileView__withoutZoom')) {
                itemWidth = itemContainer.clientWidth;
            } else {
                const itemSizes = getItemSize(itemContainer, this._getZoomCoefficient(), this._options.tileMode);
                itemWidth = itemSizes.width;
            }
            this._notify('updateItemActionsOnItem', [item.getContents().getKey(), itemWidth], { bubbling: true });
        }
    }

    protected _needUpdateActions(item: TileCollectionItem, event: SyntheticEvent): boolean {
        return item && this._options.actionMode === 'adaptive' && !!event;
    }

    private _getZoomCoefficient(): number {
        return this._options.tileScalingMode !== TILE_SCALING_MODE.NONE && this._options.tileScalingMode !== TILE_SCALING_MODE.OVERLAP
            ? ZOOM_COEFFICIENT
            : 1;
    }

    private _getPadding(paddingOption: string): IItemPadding {
        return {
            left: this._options[paddingOption]?.left || 'default',
            right: this._options[paddingOption]?.right || 'default',
            top: this._options[paddingOption]?.top || 'default',
            bottom: this._options[paddingOption]?.bottom || 'default'
        };
    }

    private _preparePadding(availablePadding: string[], padding: IItemPadding): void {
        Object.keys(padding).forEach((key) => {
            if (!availablePadding.includes(padding[key])) {
                padding[key] = 'default';
            }
        });
    }

    protected _getViewClasses(): string {
        let classes = `controls_list_theme-${this._options.theme} controls-TileView_new`;

        // если показывается emptyTemplate отступы между элементом и границей вьюхи не нужны.
        // Иначе будут прыжки при переключении viewMode
        if (!this._options.needShowEmptyTemplate) {
            classes += this._getItemsPaddingContainerClasses();
        }

        return classes;
    }

    private _getItemsPaddingContainerClasses(): string {
        let classes = ' controls-TileView__itemPaddingContainer';

        const itemPadding = this._getPadding('itemPadding');
        if (this._options.itemsContainerPadding) {
            const itemsContainerPadding = this._getPadding('itemsContainerPadding');
            this._preparePadding(AVAILABLE_ITEM_PADDINGS, itemPadding);
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
            classes += ` controls-TileView__itemsPaddingContainer_spacingLeft_${itemsContainerPadding.left}_itemPadding_${itemPadding.left}`;
            classes += ` controls-TileView__itemsPaddingContainer_spacingRight_${itemsContainerPadding.right}_itemPadding_${itemPadding.right}`;
            classes += ` controls-TileView__itemsPaddingContainer_spacingTop_${itemsContainerPadding.top}_itemPadding_${itemPadding.top}`;
            classes += ` controls-TileView__itemsPaddingContainer_spacingBottom_${itemsContainerPadding.bottom}_itemPadding_${itemPadding.bottom}`;
        } else {
            classes += ` controls-TileView__itemsPaddingContainer_spacingLeft_${itemPadding.left}`;
            classes += ` controls-TileView__itemsPaddingContainer_spacingRight_${itemPadding.right}`;
            classes += ` controls-TileView__itemsPaddingContainer_spacingTop_${itemPadding.top}`;
            classes += ` controls-TileView__itemsPaddingContainer_spacingBottom_${itemPadding.bottom}`;
        }
        return classes;
    }

    protected _onItemWheel(): void {
        this.onScroll();
    }

    protected _onScroll(): void {
        this.onScroll();
    }

    getItemsContainer(): object {
        return this._children.tileContainer;
    }

    protected _onTileViewKeyDown(): void {}

    private onScroll(): void {
        this._clearMouseMoveTimeout(this);
        this._listModel.setHoveredItem(null);
    }

    private _clearMouseMoveTimeout(): void {
        clearTimeout(this._mouseMoveTimeout);
        this._mouseMoveTimeout = null;
    }

    private _getPositionStyle(position: object): string {
        let result = '';
        if (position) {
            for (const side in position) {
                if (position.hasOwnProperty(side)) {
                    result += side + ': ' + position[side] + 'px; ';
                }
            }
        }
        return result;
    }

    // TODO Нужен синглтон, который говорит, идет ли сейчас перетаскивание
    // https://online.sbis.ru/opendoc.html?guid=a838cfd3-a49b-43a8-821a-838c1344288b
    private _shouldProcessHover(): boolean {
        // document не инициализирован в юнит тестах
        return (
            !TouchDetect.getInstance().isTouch() &&
            !document?.body?.classList?.contains('ws-is-drag')
        );
    }

    static getDefaultOptions(): object {
        return {
            itemsHeight: 150,
            tileMode: 'static',
            tileScalingMode: TILE_SCALING_MODE.NONE
        };
    }
}

Object.defineProperty(TileView, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return TileView.getDefaultOptions();
   }
});
