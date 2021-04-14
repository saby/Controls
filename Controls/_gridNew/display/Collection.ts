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
import DataRow from './DataRow';
import { TemplateFunction } from 'UI/Base';
import {Model as EntityModel} from 'Types/entity';

export interface IOptions<
    S,
    T extends Row<S> = Row<S>
> extends IBaseOptions<S, T>, IGridMixinOptions { }

export default class Collection<
    S,
    T extends Row<S> = Row<S>
> extends mixin<BaseCollection<any>, GridMixin<any, any>>(BaseCollection, GridMixin) {
    protected _$hasStickyGroup: boolean = false;

    constructor(options: IOptions<S, T>) {
        super(options);
        GridMixin.call(this, options);
    }

    // region override

    setSearchValue(searchValue: string): boolean {
        const searchValueChanged = super.setSearchValue(searchValue);
        if (searchValueChanged) {
            this.getViewIterator().each((item: DataRow<S>) => {
                if (item.DisplaySearchValue) {
                    item.setSearchValue(searchValue);
                }
            });
        }
        return searchValueChanged;
    }

    setEmptyTemplate(emptyTemplate: TemplateFunction): boolean {
        const superResult = super.setEmptyTemplate(emptyTemplate);
        if (superResult) {
            if (this._$emptyTemplate) {
                if (this._$emptyGridRow) {
                    this._$emptyGridRow.setEmptyTemplate(this._$emptyTemplate);
                } else {
                    this._initializeEmptyRow();
                }
            } else {
                this._$emptyGridRow = undefined;
            }
        }
        return superResult;
    }

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
        this._updateHasStickyGroup();
        this._$results = null;
    }

    protected _removeItems(start: number, count?: number): T[] {
        const result = super._removeItems(start, count);

        if (this._$headerModel && !this._headerIsVisible(this._$header)) {
            this._$headerModel = null;
        }

        return result;
    }

    protected _getItemsFactory(): ItemsFactory<T> {
        const superFactory = super._getItemsFactory();
        return function CollectionItemsFactory(options?: IRowOptions<S>): T {
            options.columns = this._$columns;
            options.colspanCallback = this._$colspanCallback;
            options.columnSeparatorSize = this._$columnSeparatorSize;
            options.rowSeparatorSize = this._$rowSeparatorSize;
            options.hasStickyGroup = this._$hasStickyGroup;
            options.metaResults = this._$metaResults;
            return superFactory.call(this, options);
        };
    }

    protected _getGroupItemConstructor(): new() => GroupItem<T> {
        return GroupItem;
    }

    setGroupProperty(groupProperty: string): boolean {
        const groupPropertyChanged = super.setGroupProperty(groupProperty);
        if (groupPropertyChanged) {
            this._updateHasStickyGroup();
        }
        return groupPropertyChanged;
    }

    protected setMetaResults(metaResults: EntityModel) {
        super.setMetaResults(metaResults);
        this._$results?.setMetaResults(metaResults);
    }

    setEditing(editing: boolean): void {
        super.setEditing(editing);

        if (this._$headerModel && !this._headerIsVisible(this._$header)) {
            this._$headerModel = null;
        }
        this._nextVersion();
    }

    // endregion

    protected _updateHasStickyGroup(): void {
        const hasStickyGroup = this._hasStickyGroup();
        if (this._$hasStickyGroup !== hasStickyGroup) {
            this._$hasStickyGroup = hasStickyGroup;
            this.getViewIterator().each((item: DataRow<S>) => {
                if (item.LadderSupport) {
                    item.setHasStickyGroup(hasStickyGroup);
                }
            });
        }
    }

    protected _hasStickyGroup(): boolean {
        return !!(this.at(0)
            && this.at(0)['[Controls/_display/GroupItem]']
            && !(this.at(0) as unknown as GroupItem<S>).isHiddenGroup()
            && this._$stickyHeader);
    }
}

Object.assign(Collection.prototype, {
    '[Controls/_display/grid/Collection]': true,
    _moduleName: 'Controls/gridNew:GridCollection',
    _itemModule: 'Controls/gridNew:GridDataRow'
});
