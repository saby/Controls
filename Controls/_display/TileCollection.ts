import Collection from './Collection';
import TileCollectionItem from './TileCollectionItem';

import { register } from 'Types/di';

const DEFAULT_TILE_HEIGHT = 200;
const DEFAULT_TILE_WIDTH = 250;
const DEFAULT_COMPRESSION_COEFF = 0.7;
const DEFAULT_ZOOM_COEFF = 1.5;

interface ITileCollectionItemSize {
    width: number;
    height: number;
}

interface ITileCollectionItemPosition {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export default class TileCollection<
    S,
    T extends TileCollectionItem<S> = TileCollectionItem<S>
> extends Collection<S, T> {
    protected _$tileMode: string;

    protected _$tileHeight: number;

    protected _$imageProperty: string;

    protected _$tileScalingMode: string;

    protected _hoveredItem: T;

    setHoveredItem(item: T): void {
        if (this._hoveredItem === item) {
            return;
        }
        if (this._hoveredItem) {
            this._hoveredItem.setHovered(false);
        }
        if (item) {
            item.setHovered(true);
        }
        this._hoveredItem = item;
        this._nextVersion();
    }

    getHoveredItem(): T {
        return this._hoveredItem;
    }

    getTileMode(): string {
        return this._$tileMode;
    }

    getTileHeight(): number {
        return this._$tileHeight;
    }

    getTileWidth(): number {
        return DEFAULT_TILE_WIDTH;
    }

    getImageProperty(): string {
        return this._$imageProperty;
    }

    getTileScalingMode(): string {
        return this._$tileScalingMode;
    }

    getCompressionCoefficient(): number {
        return DEFAULT_COMPRESSION_COEFF;
    }

    getShadowVisibility(): string {
        return 'visible';
    }

    getZoomCoefficient(): number {
        if (this._$tileScalingMode !== 'none' && this._$tileScalingMode !== 'overlap') {
            return DEFAULT_ZOOM_COEFF;
        }
        return 1;
    }

    getItemContainerSize(itemContainer: HTMLElement): ITileCollectionItemSize {
        const zoomCoefficient = this.getZoomCoefficient();

        const itemContent: HTMLElement = itemContainer.querySelector('.controls-TileView__itemContent');
        const itemContentRect = itemContent.getBoundingClientRect();

        itemContent.classList.add('controls-TileView__item_hovered');
        itemContent.style.width = `${itemContentRect.width * zoomCoefficient}px`;

        let imageWrapper: HTMLElement;
        let imageWrapperRect: ClientRect | DOMRect;
        if (this._$tileMode === 'dynamic') {
            imageWrapper = itemContainer.querySelector('.controls-TileView__imageWrapper');
            imageWrapperRect = imageWrapper.getBoundingClientRect();
            imageWrapper.style.height = `${imageWrapperRect.height * zoomCoefficient}px`;
        }

        const afterZoomRect = itemContent.getBoundingClientRect();

        const result = {
            width: afterZoomRect.width,
            height: afterZoomRect.height
        };

        if (this._$tileMode === 'dynamic') {
            imageWrapper.style.height = `${imageWrapperRect.height}px`;
        }

        itemContent.style.width = '';
        itemContent.classList.remove('controls-TileView__item_hovered');

        return result;
    }

    getItemContainerPosition(
        targetItemSize: ITileCollectionItemSize,
        itemRect: ClientRect | DOMRect,
        viewContainerRect: ClientRect | DOMRect
    ): ITileCollectionItemPosition {
        const additionalWidth = (targetItemSize.width - itemRect.width) / 2;
        const additionalHeightBottom = targetItemSize.height - itemRect.height * this.getZoomCoefficient();
        const additionalHeight = (targetItemSize.height - itemRect.height - additionalHeightBottom) / 2;

        const leftOffset = itemRect.left - viewContainerRect.left - additionalWidth;
        const topOffset = itemRect.top - viewContainerRect.top - additionalHeight;
        const rightOffset = viewContainerRect.right - itemRect.right - additionalWidth;
        const bottomOffset = viewContainerRect.bottom - itemRect.bottom - additionalHeight - additionalHeightBottom;

        return this._createPositionInBounds(leftOffset, topOffset, rightOffset, bottomOffset);
    }

    getItemContainerStartPosition(
        itemRect: ClientRect | DOMRect,
        documentRect: ClientRect | DOMRect
    ): ITileCollectionItemPosition {
        return {
            top: itemRect.top,
            left: itemRect.left,
            right: documentRect.width - itemRect.right,
            bottom: documentRect.height - itemRect.bottom
        };
    }

    getItemContainerPositionInDocument(
        targetItemPosition: ITileCollectionItemPosition,
        viewContainerRect: ClientRect | DOMRect,
        documentRect: ClientRect | DOMRect
    ): ITileCollectionItemPosition {
        const left = targetItemPosition.left + viewContainerRect.left;
        const top = targetItemPosition.top + viewContainerRect.top;
        const right = targetItemPosition.right + documentRect.width - viewContainerRect.right;
        const bottom = targetItemPosition.bottom + documentRect.height - viewContainerRect.bottom;

        return this._createPositionInBounds(left, top, right, bottom);
    }

    protected _createPositionInBounds(
        left: number,
        top: number,
        right: number,
        bottom: number
    ): ITileCollectionItemPosition {
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
            return { left, top, right, bottom };
        }
    }
}

Object.assign(TileCollection.prototype, {
    '[Controls/_display/TileCollection]': true,
    _moduleName: 'Controls/display:TileCollection',
    _instancePrefix: 'tile-item-',
    _itemModule: 'Controls/display:TileCollectionItem',
    _$tileMode: 'static',
    _$tileHeight: DEFAULT_TILE_HEIGHT,
    _$imageProperty: '',
    _$tileScalingMode: 'none',
    _hoveredItem: null
});

register('Controls/display:TileCollection', TileCollection, {instantiate: false});
