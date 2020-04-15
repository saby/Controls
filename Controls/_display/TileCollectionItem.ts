import CollectionItem from './CollectionItem';
import { register } from 'Types/di';
import { TileCollection } from '../display';

export default class TileCollectionItem<T> extends CollectionItem<T> {
    protected _$owner: TileCollection<T>;

    protected _$fixedPosition: string;

    protected _$animated: boolean;

    protected _$canShowActions: boolean;

    getTileWidth(templateWidth?: number): number {
        return templateWidth || this._$owner.getTileWidth();
    }

    getTileHeight(): number {
        return this._$owner.getTileHeight();
    }

    getCompressionCoefficient(): number {
        return this._$owner.getCompressionCoefficient();
    }

    getShadowVisibility(templateShadowVisibility?: string): string {
        return templateShadowVisibility || this._$owner.getShadowVisibility();
    }

    getImageProperty(): string {
        return this._$owner.getImageProperty();
    }

    isScaled(): boolean {
        const scalingMode = this._$owner.getTileScalingMode();
        return (
            (scalingMode !== 'none' || !!this.getDisplayProperty()) &&
            (this.isHovered() || this.isActive() || this.isSwiped())
        );
    }

    getFixedPositionStyle(): string {
        return this.isScaled() ? this._$fixedPosition || undefined : undefined;
    }

    setFixedPositionStyle(position: string, silent?: boolean): void {
        if (this._$fixedPosition === position) {
            return;
        }
        this._$fixedPosition = position;
        this._nextVersion();
        if (!silent) {
            this._notifyItemChangeToOwner('fixedPosition');
        }
    }

    setActive(active: boolean, silent?: boolean): void {
        // TODO This is copied from TileViewModel, but there must be a better
        // place for it. For example, somewhere in ItemAcrions container
        if (!active && this.isActive() && this.isHovered()) {
            this._$owner.setHoveredItem(null);
        }
        super.setActive(active, silent);
    }

    isFixed(): boolean {
        return !!this.getFixedPositionStyle();
    }

    setAnimated(animated: boolean, silent?: boolean): void {
        if (this._$animated === animated) {
            return;
        }
        this._$animated = animated;
        this._nextVersion();
        if (!silent) {
            this._notifyItemChangeToOwner('animated');
        }
    }
    setCanShowActions(canShowActions: boolean, silent?: boolean): void {
        if (this._$canShowActions === canShowActions) {
            return;
        }
        this._$canShowActions = canShowActions;
        this._nextVersion();
        if (!silent) {
            this._notifyItemChangeToOwner('canShowActions');
        }
    }
    canShowActions(): boolean {
        return this._$canShowActions;
    }
    isAnimated(): boolean {
        if (this._$animated && !this.isScaled()) {
            // FIXME This is bad, but there is no other obvious place to
            // reset the animation state. Should probably be in that same
            // animation manager
            this.setAnimated(false, true);
            this.setFixedPositionStyle('', true);
            this.setCanShowActions(false);
        }
        return this._$animated;
    }

    getWrapperClasses(templateClickable?: boolean): string {
        let classes = 'controls-TileView__item controls-ListView__itemV';
        if (templateClickable !== false) {
            classes += ' controls-ListView__itemV_cursor-pointer';
        }
        return classes;
    }

    getWrapperStyle(templateWidth?: number): string {
        const width = this.getTileWidth(templateWidth);
        const compressedWidth = width * this.getCompressionCoefficient();
        return `
        -ms-flex-preferred-size: ${compressedWidth}px;
        flex-basis: ${compressedWidth}px;
        height: ${this.getTileHeight()}px;
        max-width: ${width}px;
        `;
    }

    getTileContentClasses(templateShadowVisibility?: string, templateMarker?: boolean): string {
        let classes = 'controls-TileView__itemContent js-controls-SwipeControl__actionsContainer';
        classes += ` controls-ListView__item_shadow_${this.getShadowVisibility(templateShadowVisibility)}`;
        if (this.isActive()) {
            classes += ' controls-TileView__item_active';
        }
        if (this.isActive() || this.isHovered()) {
            classes += ' controls-TileView__item_hovered';
        }
        if (this.canShowActions()) {
            classes += ' controls-ListView__item_showActions';
        }
        if (this.isScaled()) {
            classes += ' controls-TileView__item_scaled';
        }
        if (this.isFixed()) {
            classes += ' controls-TileView__item_fixed';
        }
        if (this.isSwiped()) {
            classes += ' controls-TileView__item_swiped';
        }
        if (this.isAnimated()) {
            classes += ' controls-TileView__item_animated';
        }
        if (this.shouldDisplayMarker(templateMarker)) {
            classes += ' controls-TileView__item_withMarker';
        } else {
            classes += ' controls-TileView__item_withoutMarker';
        }
        return classes;
    }

    getImageWrapperClasses(templateHasTitle?: boolean): string {
        let classes = 'controls-TileView__imageWrapper';
        if (this.isAnimated()) {
            classes += ' controls-TileView__item_animated';
        }
        if (templateHasTitle) {
            classes += ' controls-TileView__imageWrapper_reduced';
        }
        return classes;
    }

    getImageWrapperStyle(): string {
        let height = this._$owner.getTileHeight();
        if (this.isScaled() && this.isAnimated()) {
            height *= this._$owner.getZoomCoefficient();
        }
        return `height: ${height}px;`;
    }

    getTitleClasses(templateHasTitle?: boolean): string {
        let classes = 'controls-TileView__title';
        if (!templateHasTitle) {
            classes += ' controls-TileView__title_invisible';
        }
        return classes;
    }

    getMultiSelectClasses(theme): string {
        return (
            super.getMultiSelectClasses(theme) +
            ' controls-TileView__checkbox controls-TileView__checkbox_top js-controls-TileView__withoutZoom'
        );
    }
}

Object.assign(TileCollectionItem.prototype, {
    '[Controls/_display/TileCollectionItem]': true,
    _moduleName: 'Controls/display:TileCollectionItem',
    _instancePrefix: 'tile-item-',
    _$fixedPosition: undefined,
    _$animated: false,
    _$canShowActions: false,
});

register('Controls/display:TileCollectionItem', TileCollectionItem, {instantiate: false});
