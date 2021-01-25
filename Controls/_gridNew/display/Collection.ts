import { mixin } from 'Types/util';

import {
    Collection as BaseCollection,
    ICollectionOptions as IBaseOptions,
    ItemsFactory,
    IItemActionsTemplateConfig,
    GridLadderUtil
} from 'Controls/display';

import GroupItem from './GroupItem';
import GridMixin, { IOptions as IGridMixinOptions } from './mixins/Grid';
import Row, {IOptions as IRowOptions} from './Row';

export interface IOptions<
    S,
    T extends Row<S> = Row<S>
> extends IBaseOptions<S, T>, IGridMixinOptions { }

export default class Collection<
    S,
    T extends Row<S> = Row<S>
> extends mixin<BaseCollection<any>, GridMixin<any, any>>(BaseCollection, GridMixin) {
    constructor(options: IOptions<S, T>) {
        super(options);
        GridMixin.call(this, options);
    }

    // region override

    setMultiSelectVisibility(visibility: string): void {
        super.setMultiSelectVisibility(visibility);

        if (this.getFooter()) {
            this.getFooter().setMultiSelectVisibility(visibility);
        }
        if (this.getResults()) {
            this.getResults().setMultiSelectVisibility(visibility);
        }

        if (this.getHeader()) {
            this.getHeader().setMultiSelectVisibility(visibility);
        }

        this._$colgroup?.reBuild();
    }

    setActionsTemplateConfig(config: IItemActionsTemplateConfig) {
        super.setActionsTemplateConfig(config);
        if (this.getFooter()) {
            this.getFooter().setActionsTemplateConfig(config);
        }
    }

    setHasMoreData(hasMoreData: boolean): void {
        super.setHasMoreData(hasMoreData);
        if (this.getFooter()) {
            this.getFooter().setHasMoreData(hasMoreData);
        }
    }

    protected _reBuild(reset?: boolean): void {
        if (GridLadderUtil.isSupportLadder(this._$ladderProperties) && !!this._$ladder) {
            this._prepareLadder(this._$ladderProperties, this._$columns);
        }
        super._reBuild(reset);
        this._$colgroup?.reBuild();
    }

    setIndexes(start: number, stop: number): void {
        super.setIndexes(start, stop);
        if (GridLadderUtil.isSupportLadder(this._$ladderProperties)) {
            this._prepareLadder(this._$ladderProperties, this._$columns);
            this._updateItemsLadder();
        }
        this._updateItemsColumns();
    }

    protected _handleAfterCollectionChange(): void {
        super._handleAfterCollectionChange();
        if (GridLadderUtil.isSupportLadder(this._$ladderProperties)) {
            this._prepareLadder(this._$ladderProperties, this._$columns);
            this._updateItemsLadder();
        }
    }

    protected _getItemsFactory(): ItemsFactory<T> {
        const superFactory = super._getItemsFactory();
        return function CollectionItemsFactory(options?: IRowOptions<S>): T {
            options.columns = this._$columns;
            options.colspanCallback = this._$colspanCallback;
            options.columnSeparatorSize = this._$columnSeparatorSize;
            options.rowSeparatorSize = this._$rowSeparatorSize;
            return superFactory.call(this, options);
        };
    }

    protected _getGroupItemConstructor(): new() => GroupItem<T> {
        return GroupItem;
    }

    // endregion
}

Object.assign(Collection.prototype, {
    '[Controls/_display/grid/Collection]': true,
    _moduleName: 'Controls/gridNew:GridCollection',
    _itemModule: 'Controls/gridNew:GridDataRow'
});
