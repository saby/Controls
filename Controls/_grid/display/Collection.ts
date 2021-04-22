import { mixin } from 'Types/util';

import {
    Collection as BaseCollection,
    ICollectionOptions as IBaseOptions,
    ItemsFactory,
    IItemActionsTemplateConfig,
    GridLadderUtil
} from 'Controls/display';

import GroupRow from './GroupRow';
import GridMixin, { IOptions as IGridMixinOptions } from './mixins/Grid';
import Row, {IOptions as IRowOptions} from './Row';
import DataRow from './DataRow';
import { TemplateFunction } from 'UI/Base';
import {Model as EntityModel} from 'Types/entity';
import {IObservable} from 'Types/collection';

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

    setEmptyTemplate(emptyTemplate: TemplateFunction): boolean {
        const superResult = super.setEmptyTemplate(emptyTemplate);
        if (superResult) {
            if (this._$emptyTemplate) {
                if (this._$emptyGridRow) {
                    this._$emptyGridRow.setRowTemplate(this._$emptyTemplate);
                } else {
                    this._initializeEmptyRow();
                }
            } else {
                this._$emptyGridRow = undefined;
            }
        }
        return superResult;
    }

    setEmptyTemplateOptions(options: object): boolean {
        if (super.setEmptyTemplateOptions(options)) {
            if (this.getEmptyGridRow()) {
                this.getEmptyGridRow().setRowTemplateOptions(options);
            }
            return true;
        }
        return false;
    }

    setMultiSelectVisibility(visibility: string): void {
        super.setMultiSelectVisibility(visibility);

        [this.getColgroup(), this.getHeader(), this.getResults(), this.getFooter(), this.getEmptyGridRow()].forEach((gridUnit) => {
            gridUnit?.setMultiSelectVisibility(visibility);
        });
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
        this.getColgroup()?.reBuild();
    }

    setIndexes(start: number, stop: number): void {
        super.setIndexes(start, stop);
        if (GridLadderUtil.isSupportLadder(this._$ladderProperties)) {
            this._prepareLadder(this._$ladderProperties, this._$columns);
            this._updateItemsLadder();
        }
        this._updateItemsColumns();
    }

    protected _handleAfterCollectionChange(changedItems: T[] = [], changeAction?: string): void {
        super._handleAfterCollectionChange(changedItems, changeAction);
        if (GridLadderUtil.isSupportLadder(this._$ladderProperties)) {
            this._prepareLadder(this._$ladderProperties, this._$columns);
            this._updateItemsLadder();
        }

        // Сбрасываем модель заголовка если его видимость зависит от наличия данных и текущее действие
        // это смена записей.
        // При headerVisibility === 'visible' вроде как пока не требуется перерисовывать заголовок, т.к.
        // он есть всегда. Но если потребуется, то нужно поправить это условие
        if (this._$headerVisibility === 'hasdata' && changeAction === IObservable.ACTION_RESET) {
            this._$headerModel = null;
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
            return superFactory.call(this, options);
        };
    }

    protected _getGroupItemConstructor(): new() => GroupRow<T> {
        return GroupRow;
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
            && !(this.at(0) as unknown as GroupRow<S>).isHiddenGroup()
            && this._$stickyHeader);
    }
}

Object.assign(Collection.prototype, {
    '[Controls/_display/grid/Collection]': true,
    _moduleName: 'Controls/grid:GridCollection',
    _itemModule: 'Controls/grid:GridDataRow'
});
