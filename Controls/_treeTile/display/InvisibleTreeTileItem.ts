import { InvisibleItem } from 'Controls/tile';
import {mixin} from 'Types/util';
import TreeTileCollectionItem from './TreeTileCollectionItem';

export default class InvisibleTreeTileItem extends mixin<TreeTileCollectionItem, InvisibleItem>(TreeTileCollectionItem, InvisibleItem) {
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

Object.assign(InvisibleTreeTileItem.prototype, {
    '[Controls/_treeTile/InvisibleTreeTileItem]': true,
    _moduleName: 'Controls/treeTile:InvisibleTreeTileItem',
    _instancePrefix: 'invisible-tree-tile-item-'
});
