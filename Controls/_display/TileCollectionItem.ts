import CollectionItem from './CollectionItem';
import { register } from 'Types/di';
import { TileCollection } from '../display';

export default class TileCollectionItem<T> extends CollectionItem<T> {
    protected _$owner: TileCollection<T>;

    protected _$fixedPosition: string;

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

    getFixedPositionStyle(): string {
        return this._$fixedPosition;
    }

    setFixedPositionStyle(position: string, silent?: boolean): void {
        // _$fixedPosition should specifically by undefined when not set,
        // because then the template engine will remove the attribute
        // correctly
        const converted = position || undefined;
        if (this._$fixedPosition === converted) {
            return;
        }
        this._$fixedPosition = converted;
        this._nextVersion();
        if (!silent) {
            this._notifyItemChangeToOwner('fixedPosition');
        }
    }

    getTileWrapperStyle(templateWidth?: number): string {
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
        // {{!!itemData.isActive ? ' controls-TileView__item_active'}}
        // {{itemData.isHovered ? ' controls-TileView__item_hovered'}}
        // {{itemData.isScaled ? ' controls-TileView__item_scaled'}}
        // {{itemData.isFixed ? ' controls-TileView__item_fixed'}}
        // {{itemData.isAnimated ? ' controls-TileView__item_animated'}}
        // {{itemData.isHovered ? ' controls-ListView__item_showActions'}}
        let classes = 'controls-TileView__itemContent js-controls-SwipeControl__actionsContainer';
        classes += ` controls-ListView__item_shadow_${this.getShadowVisibility(templateShadowVisibility)}`;
        if (this.isSwiped()) {
            classes += ' controls-TileView__item_swiped';
        }
        if (templateMarker !== false && this.isMarked()) {
            classes += ' controls-TileView__item_withMarker';
        } else {
            classes += ' controls-TileView__item_withoutMarker';
        }
        return classes;
    }

    getImageWrapperClasses(templateHasTitle?: boolean): string {
        // {{itemData.isAnimated ? ' controls-TileView__item_animated'}}
        let classes = 'controls-TileView__imageWrapper';
        if (templateHasTitle) {
            classes += ' controls-TileView__imageWrapper_reduced';
        }
        return classes;
    }

    getImageWrapperStyle(): string {
        // {{'height: ' + (itemData.isAnimated && itemData.zoomCoefficient ? itemData.zoomCoefficient * itemData.itemsHeight : itemData.itemsHeight) + 'px;'}}
        return `height: ${this.getTileHeight()}px;`;
    }

    getTitleClasses(templateHasTitle?: boolean): string {
        let classes = 'controls-TileView__title';
        if (!templateHasTitle) {
            classes += ' controls-TileView__title_invisible';
        }
        return classes;
    }

    getMultiSelectClasses(): string {
        return (
            super.getMultiSelectClasses() +
            ' controls-TileView__checkbox controls-TileView__checkbox_top js-controls-TileView__withoutZoom'
        );
    }
}

Object.assign(TileCollectionItem.prototype, {
    '[Controls/_display/TileCollectionItem]': true,
    _moduleName: 'Controls/display:TileCollectionItem',
    _instancePrefix: 'tile-item-',
    _$fixedPosition: undefined
});

register('Controls/display:TileCollectionItem', TileCollectionItem, {instantiate: false});
