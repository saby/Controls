import { TemplateFunction } from 'UI/Base';
import TileCollectionItem from './TileCollectionItem';
import * as Template from 'wml!Controls/_tileNew/render/items/Invisible';

export default class InvisibleTileItem extends TileCollectionItem {
    readonly Markable: boolean = false;
    readonly SelectableItem: boolean = false;
    readonly DraggableItem: boolean = false;
    readonly ItemActionsItem: boolean = false;
    readonly DisplaySearchValue: boolean = false;

    getTemplate(): TemplateFunction {
        return Template;
    }

    getInvisibleClasses(): string {
        let classes = `controls-TileView__item controls-TileView__item_theme-${this.getTheme()}`;
        classes += ` controls-TileView__item_spacingLeft_${this.getLeftPadding()}_theme-${this.getTheme()}`;
        classes += ` controls-TileView__item_spacingRight_${this.getRightPadding()}_theme-${this.getTheme()}`;
        classes += ` controls-TileView__item_spacingTop_${this.getTopPadding()}_theme-${this.getTheme()}`;
        classes += ` controls-TileView__item_spacingBottom_${this.getBottomPadding()}_theme-${this.getTheme()}`;
        classes += ' controls-TileView__item_invisible';
        return classes;
    }

    getInvisibleStyles(templateWidth?: number): string {
        return this.getItemStyles('invisible', templateWidth);
    }

    isLastInvisibleItem(): boolean {
        return this._$lastInvisibleItem;
    }

    getContents(): object {
        return this.getInstanceId();
    }
}

Object.assign(InvisibleTileItem.prototype, {
    '[Controls/_tileNew/InvisibleTileItem]': true,
    _moduleName: 'Controls/tileNew:InvisibleTileItem',
    _instancePrefix: 'invisible-tile-item-',
    _$theme: 'default',
    _$leftPadding: 'default',
    _$rightPadding: 'default',
    _$topPadding: 'default',
    _$bottomPadding: 'default',
    _$tileWidth: null,
    _$lastInvisibleItem: false
});
