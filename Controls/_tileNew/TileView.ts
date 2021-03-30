import {ListView} from 'Controls/list';
import template = require('wml!Controls/_tileNew/render/TileView');
import defaultItemTpl = require('wml!Controls/_tileNew/render/items/Default');
import {TouchContextField} from 'Controls/context';
import { TILE_SCALING_MODE, ZOOM_COEFFICIENT} from './utils/Constants';
import {isEqual} from 'Types/object';
import { TemplateFunction } from 'UI/Base';
import TileCollectionItem from './display/TileCollectionItem';
import TileCollection from './display/TileCollection';
import {SyntheticEvent} from 'UI/Vdom';
import {Model} from 'Types/entity';
import {constants} from 'Env/Env';
import {debounce} from 'Types/function';

const HOVERED_ITEM_CHANGE_DELAY = 150;

export default class TileView extends ListView {
    protected _template: TemplateFunction = template;
    protected _defaultItemTemplate: TemplateFunction = defaultItemTpl;
    protected _hoveredItem: TileCollectionItem;
    protected _mouseMoveTimeout: number;
    protected _listModel: TileCollection;

    protected _animatedItem: TileCollectionItem<unknown> = null;
    protected _animatedItemTargetPosition: string;
    protected _shouldPerformAnimation: boolean;

    protected _beforeMount(options: any): void {
        super._beforeMount(options);
    }

    _afterMount(options: any): void {
        this._notify('register', ['controlResize', this, this._onResize], {bubbling: true});
        this._notify('register', ['scroll', this, this._onScroll, {listenAll: true}], {bubbling: true});
        super._afterMount(options);
    }

    _onResize(): void {
        this._listModel.setHoveredItem(null);
    }

    _beforeUpdate(newOptions: any): void {
        if (this._options.tileMode !== newOptions.tileMode) {
            this._listModel.setTileMode(newOptions.tileMode);
        }
        if (this._options.itemsContainerPadding !== newOptions.itemsContainerPadding) {
            this._listModel.setItemsContainerPadding(newOptions.itemsContainerPadding);
        }
        if (this._options.tileHeight !== newOptions.tileHeight) {
            this._listModel.setTileHeight(newOptions.tileHeight);
        }
        if (!isEqual(this._options.roundBorder, newOptions.roundBorder)) {
            this._listModel.setRoundBorder(newOptions.roundBorder);
        }
        super._beforeUpdate(newOptions);
        if (newOptions.listModel !== this._listModel) {
            this._animatedItem = null;
            this._setHoveredItem(this, null);
        }
        this._shouldPerformAnimation =
            this._animatedItem && !this._animatedItem.destroyed && this._animatedItem.isFixed();
    }

    protected _afterUpdate(): void {
        super._afterUpdate();
        if (this._animatedItem) {
            if (this._animatedItem.destroyed) {
                this._animatedItem = null;
            } else if (
                this._shouldPerformAnimation &&
                this._animatedItem.isFixed() &&
                !this._animatedItem.isAnimated()
            ) {
                this._animatedItem.setAnimated(true);
                this._animatedItem.setFixedPositionStyle(this._animatedItemTargetPosition);
                this._animatedItem.setCanShowActions(true);
                this._animatedItem = null;
            }
        }
    }

    _beforeUnmount(): void {
        this._notify('unregister', ['controlResize', this], {bubbling: true});
        this._notify('unregister', ['scroll', this, {listenAll: true}], {bubbling: true});
    }

    getActionsMenuConfig(
        item: Model,
        clickEvent: SyntheticEvent,
        action: object,
        isContextMenu: boolean,
        menuConfig: object,
        itemData: TileCollectionItem
    ): Record<string, any> {
        const isActionMenu = !!action && !action.isMenu;
        if (this._shouldOpenExtendedMenu(isActionMenu, isContextMenu, itemData) && menuConfig) {
            const MENU_MAX_WIDTH = 200;
            const menuOptions = menuConfig.templateOptions;
            const itemContainer = clickEvent.target.closest('.controls-TileView__item');
            const imageWrapper = itemContainer.querySelector('.controls-TileView__imageWrapper');
            if (!imageWrapper) {
                return null;
            }
            let previewWidth = imageWrapper.clientWidth;
            let previewHeight = imageWrapper.clientHeight;
            menuOptions.image = itemData.getImageUrl();
            menuOptions.title = itemData.getDisplayValue();
            menuOptions.additionalText = itemData.item.get(menuOptions.headerAdditionalTextProperty);
            menuOptions.imageClasses = itemData.getImageClasses();
            if (this._options.tileScalingMode === TILE_SCALING_MODE.NONE) {
                previewHeight = previewHeight * ZOOM_COEFFICIENT;
                previewWidth = previewWidth * ZOOM_COEFFICIENT;
            }
            menuOptions.previewHeight = previewHeight;
            menuOptions.previewWidth = previewWidth;

            return {
                templateOptions: menuOptions,
                closeOnOutsideClick: true,
                maxWidth: menuOptions.previewWidth + MENU_MAX_WIDTH,
                target: imageWrapper,
                className: 'controls-TileView__itemActions_menu_popup',
                targetPoint: {
                    vertical: 'top',
                    horizontal: 'left'
                },
                opener: menuConfig.opener,
                template: 'Controls/tileNew:ActionsMenu',
                actionOnScroll: 'close'
            };
        } else {
            return null;
        }
    }

    _shouldOpenExtendedMenu(isActionMenu: boolean, isContextMenu: boolean, item: TileCollectionItem): boolean {
        const isScalingTile = this._options.tileScalingMode !== 'none' &&
            this._options.tileScalingMode !== 'overlap';
        return this._options.actionMenuViewMode === 'preview' && !isActionMenu && !(isScalingTile && isContextMenu);
    }

    protected _onItemMouseEnter(e: SyntheticEvent<MouseEvent>, item: TileCollectionItem): void {
        super._onItemMouseEnter(e, item);
        if (this._shouldProcessHover()) {
            this._setHoveredItem(this, item, e);
        }
    }

    protected _onItemMouseLeave(event: SyntheticEvent, item: TileCollectionItem): void {
        if (!this._context?.isTouch?.isTouch && !item.isActive()) {
            this._setHoveredItem(this, null, event);
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

        super._onItemMouseMove(event, item);
    }

    protected _setHoveredItemPosition(e: SyntheticEvent<MouseEvent>, item: TileCollectionItem<unknown>): void {
        const target = e.target as HTMLElement;
        const tileScalingMode = this._listModel.getTileScalingMode();

        if (tileScalingMode === 'none' || target.closest('.js-controls-TileView__withoutZoom')) {
            item.setCanShowActions(true);
            return;
        }

        const itemContainer: HTMLElement = target.closest('.controls-TileView__item');
        const itemContainerRect = itemContainer.getBoundingClientRect();

        const viewContainer = tileScalingMode === 'inside'
            ? this.getItemsContainer()
            : constants.isBrowserPlatform && document.documentElement;
        const viewContainerRect = viewContainer.getBoundingClientRect();

        const targetItemSize = this._listModel.getItemContainerSize(itemContainer);
        const targetItemPosition = this._listModel.getItemContainerPosition(
            targetItemSize,
            itemContainerRect,
            viewContainerRect
        );

        const documentRect = constants.isBrowserPlatform && document.documentElement.getBoundingClientRect();
        const targetItemPositionInDocument = this._listModel.getItemContainerPositionInDocument(
            targetItemPosition,
            viewContainerRect,
            documentRect
        );

        // TODO This should probably be moved to some kind of animation manager
        if (targetItemPositionInDocument) {
            const targetPositionStyle = this._convertPositionToStyle(targetItemPositionInDocument);
            if (tileScalingMode !== 'overlap') {
                const startItemPositionInDocument = this._listModel.getItemContainerStartPosition(
                    itemContainerRect,
                    documentRect
                );
                item.setFixedPositionStyle(this._convertPositionToStyle(startItemPositionInDocument));
                this._animatedItem = item;
                this._animatedItemTargetPosition = targetPositionStyle;
            } else {
                item.setFixedPositionStyle(targetPositionStyle);
                item.setCanShowActions(true);
            }
        }
    }

    protected _convertPositionToStyle(position: object): string {
        let result = '';
        for (const key in position) {
            if (position.hasOwnProperty(key)) {
                result += `${key}: ${position[key]}px;`;
            }
        }
        return result;
    }

    private _setHoveredItem(self: TileView, item: TileCollectionItem, event: SyntheticEvent): void {
        if (
            !this._destroyed &&
            this._listModel && !this._listModel.destroyed &&
            this._listModel.getHoveredItem() !== item &&
            !this._listModel.getActiveItem()
        ) {
            this._listModel.setHoveredItem(item);
        }

        if (this._needUpdateActions(item, event)) {
            const itemWidth = event.target.closest('.controls-TileView__item').clientWidth;
            this._notify('updateItemActionsOnItem', [item.getContents().getKey(), itemWidth], { bubbling: true });
        }
    }

    protected _needUpdateActions(item: TileCollectionItem, event: SyntheticEvent): boolean {
        return item && this._options.actionMode === 'adaptive' && event;
    }

    _getZoomCoefficient(): number {
        return this._options.tileScalingMode !== TILE_SCALING_MODE.NONE && this._options.tileScalingMode !== TILE_SCALING_MODE.OVERLAP
            ? ZOOM_COEFFICIENT
            : 1;
    }

    getItemsPaddingContainerClasses(): string {
        const theme = `_theme-${this._options.theme}`;
        let classes = 'controls-TileView__itemPaddingContainer ';

        if (this._listModel.getCount()) {
            const itemPadding = this._options.itemPadding;
            if (this._options.itemsContainerPadding) {
                classes += `controls-TileView__itemsPaddingContainer_spacingLeft_${this._options.itemsContainerPadding.left || 'default'}_itemPadding_${itemPadding?.left || 'default'}${theme}`;
                classes += ` controls-TileView__itemsPaddingContainer_spacingRight_${this._options.itemsContainerPadding.right || 'default'}_itemPadding_${itemPadding?.right || 'default'}${theme}`;
                classes += ` controls-TileView__itemsPaddingContainer_spacingTop_${this._options.itemsContainerPadding.top || 'default'}_itemPadding_${itemPadding?.top || 'default'}${theme}`;
                classes += ` controls-TileView__itemsPaddingContainer_spacingBottom_${this._options.itemsContainerPadding.bottom || 'default'}_itemPadding_${itemPadding?.bottom || 'default'}${theme}`;
            } else {
                classes += `controls-TileView__itemsPaddingContainer_spacingLeft_${itemPadding?.left || 'default'}${theme}`;
                classes += ` controls-TileView__itemsPaddingContainer_spacingRight_${itemPadding?.right || 'default'}${theme}`;
                classes += ` controls-TileView__itemsPaddingContainer_spacingTop_${itemPadding?.top || 'default'}${theme}`;
                classes += ` controls-TileView__itemsPaddingContainer_spacingBottom_${itemPadding?.bottom || 'default'}${theme}`;
            }
        }

        return classes;
    }

    _onItemWheel(): void {
        this.onScroll();
    }

    _onScroll(): void {
        this.onScroll();
    }

    getItemsContainer(): object {
        return this._children.tileContainer;
    }

    _onTileViewKeyDown(): void {}

    private _getPositionInContainer(itemNewSize: object, itemRect: object, containerRect: object, zoomCoefficient: number, withoutCorrection: boolean = false): object {
        const
            additionalWidth = (itemNewSize.width - itemRect.width) / 2,
            additionalHeightBottom = (itemNewSize.height - itemRect.height * zoomCoefficient),
            additionalHeight = (itemNewSize.height - itemRect.height - additionalHeightBottom) / 2,
            left = itemRect.left - (containerRect.left + additionalWidth),
            top = itemRect.top - (containerRect.top + additionalHeight),
            right = containerRect.right - (itemRect.right + additionalWidth),
            bottom = containerRect.bottom - (itemRect.bottom + additionalHeight + additionalHeightBottom);

        return withoutCorrection ? {left, right, top, bottom} : this.getCorrectPosition(top, right, bottom, left);
    }

    private _getPositionInDocument(position: object, containerRect: object, documentRect: object, withoutCorrection: boolean = false): object {
        const
            left = position.left + containerRect.left,
            right = position.right + (documentRect.width - containerRect.right),
            top = position.top + containerRect.top,
            bottom = position.bottom + (documentRect.height - containerRect.bottom);

        return withoutCorrection ? {left, right, top, bottom} : this.getCorrectPosition(top, right, bottom, left);
    }

    private getCorrectPosition(top: number, right: number, bottom: number, left: number): object {
        if (left < 0) {
            right += left;
            left = 0;
        } else if (right < 0) {
            left += right;
            right = 0;
        }
        if (top < 0) {
            bottom += top;
            top = 0;
        } else if (bottom < 0) {
            top += bottom;
            bottom = 0;
        }

        if (left < 0 || right < 0 || top < 0 || bottom < 0) {
            return null;
        } else {
            return {left, right, top, bottom};
        }
    }

    private _getItemStartPosition(itemContainerRect: object, containerRect: object): object {
        return {
            top: itemContainerRect.top,
            left: itemContainerRect.left,
            right: containerRect.width - itemContainerRect.right,
            bottom: containerRect.height - itemContainerRect.bottom
        };
    }

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
        return (
            !this._context?.isTouch?.isTouch &&
            !document.body.classList.contains('ws-is-drag')
        );
    }

    static _theme: string[] = ['Controls/tile'];

    static getDefaultOptions(): object {
        return {
            itemsHeight: 150,
            tileMode: 'static',
            tileScalingMode: TILE_SCALING_MODE.NONE
        };
    }

    static contextTypes(): object {
        return {
            isTouch: TouchContextField
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
