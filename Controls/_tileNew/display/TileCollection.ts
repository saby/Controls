import TileCollectionItem from './TileCollectionItem';
import {Model} from 'Types/entity';
import {Collection, ItemsFactory, itemsStrategy, TreeItem} from 'Controls/display';
import Tile from 'Controls/_tileNew/display/mixins/Tile';
import { mixin } from 'Types/util';
import {IOptions} from 'Controls/_tileNew/display/mixins/TileItem';
import InvisibleStrategy from './strategies/Invisible';

export default class TileCollection<
    S extends Model = Model,
    T extends TileCollectionItem<S> = TileCollectionItem<S>
> extends mixin<Collection<S, T>, Tile>(Collection, Tile) {
    constructor(options: any) {
        super(options);
    }

    protected _getItemsFactory(): ItemsFactory<T> {
        const parent = super._getItemsFactory();

        return function TileItemsFactory(options: IOptions<S>): T {
            const params = this._getItemsFactoryParams(options);
            return parent.call(this, params);
        };
    }

    protected _createComposer(): itemsStrategy.Composer<any, TreeItem<any>> {
        const composer = super._createComposer();

        composer.append(InvisibleStrategy, {
            display: this
        });

        return composer;
    }
}

Object.assign(TileCollection.prototype, {
    '[Controls/_tileNew/TileCollection]': true,
    _moduleName: 'Controls/tileNew:TileCollection',
    _itemModule: 'Controls/tileNew:TileCollectionItem'
});
