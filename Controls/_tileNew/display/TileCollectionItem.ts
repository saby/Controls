import { CollectionItem } from 'Controls/display';
import {Model} from 'Types/entity';
import { mixin } from 'Types/util';
import TileItem from 'Controls/_tileNew/display/mixins/TileItem';

export default class TileCollectionItem<T extends Model = Model>
    extends mixin<CollectionItem, TileItem>(CollectionItem, TileItem) {

    setActive(active: boolean, silent?: boolean): void {
        // TODO This is copied from TileViewModel, but there must be a better
        // place for it. For example, somewhere in ItemActions container
        if (!active && this.isActive() && this.isHovered()) {
            this.getOwner().setHoveredItem(null);
        }
        super.setActive(active, silent);
    }

    getMultiSelectClasses(theme: string): string {
        let classes = super.getMultiSelectClasses(theme);
        classes = classes.replace(`controls-ListView__checkbox_position-${this.getOwner().getMultiSelectPosition()}_theme-${theme}`, '');
        classes += ' controls-TileView__checkbox controls-TileView__checkbox_top js-controls-TileView__withoutZoom';
        return classes;
    }
}

Object.assign(TileCollectionItem.prototype, {
    '[Controls/_tileNew/TileCollectionItem]': true,
    _moduleName: 'Controls/tileNew:TileCollectionItem',
    _instancePrefix: 'tile-item-'
});
