import TileCollectionItem from './TileCollectionItem';
import InvisibleItem from './mixins/InvisibleItem';
import { mixin } from 'Types/util';

export default class InvisibleTileItem extends mixin<TileCollectionItem, InvisibleItem>(TileCollectionItem, InvisibleItem) {
    constructor(options: any) {
        super(options);
        InvisibleItem.call(this, options);
    }

    // переопределяем key, т.к. по дефолту он берется из contents, но в пачке невидимых элементов одинаковый contents,
    // поэтому падает ошибка с дубликатами ключе в верстке
    get key(): string {
        return this._instancePrefix + this.getInstanceId();
    }
}

Object.assign(InvisibleTileItem.prototype, {
    '[Controls/_tile/InvisibleTileItem]': true,
    _moduleName: 'Controls/tile:InvisibleTileItem',
    _instancePrefix: 'invisible-tile-item-'
});
