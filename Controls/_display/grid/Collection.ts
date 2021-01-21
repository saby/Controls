import BaseCollection, { ItemsFactory, IOptions as IBaseOptions, IItemActionsTemplateConfig } from '../Collection';
import GroupItem from './GroupItem';
import * as GridLadderUtil from '../utils/GridLadderUtil';
import { mixin } from 'Types/util';
import GridMixin, { IOptions as IGridMixinOptions } from 'Controls/_display/grid/mixins/Grid';
import Row, {IOptions as IRowOptions} from 'Controls/_display/grid/Row';

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

    getItemHoveredContainerSelector(uniqueClass: string, index: number): string {
        return `.${uniqueClass} .controls-Grid__row:nth-child(${index}):hover .controls-Grid__row-cell:not(.controls-Grid__row-ladder-cell)`;
    }

    getItemHoverFreezeStyles(uniqueClass: string, index: number, backgroundColor: string): string {
        return `
              .${uniqueClass} .controls-Grid__row:not(:nth-child(${index})).controls-Grid__row_highlightOnHover_default_theme-${this._$theme}:hover .controls-Grid__item_background-hover_default_theme-${this._$theme}:not(.controls-Grid__row-ladder-cell__content),
              .${uniqueClass} .controls-Grid__row:not(:nth-child(${index})).controls-Grid__row_highlightOnHover_default_theme-${this._$theme}:hover .controls-Grid__row-cell-background-hover-default_theme-${this._$theme}:not(.controls-Grid__row-ladder-cell) {
                background-color: inherit!important;
              }
              .${uniqueClass} .controls-Grid__row:nth-child(${index}).controls-Grid__row_highlightOnHover_default_theme-${this._$theme} .controls-Grid__item_background-hover_default_theme-${this._$theme}:not(.controls-Grid__row-ladder-cell__content),
              .${uniqueClass} .controls-Grid__row:nth-child(${index}).controls-Grid__row_highlightOnHover_default_theme-${this._$theme} .controls-Grid__row-cell-background-hover-default_theme-${this._$theme}:not(.controls-Grid__row-ladder-cell) {
                background-color: ${backgroundColor}!important;
              }`;
    }

    getItemActionsOutsideFreezeStyles(uniqueClass: string, index: number): string {
        return `
              .${uniqueClass} .controls-Grid__row:nth-child(${index}) > .controls-Grid__row-cell  > .controls-itemActionsV_outside_theme-${this._$theme},
              .${uniqueClass} .controls-Grid__row:nth-child(${index}) > .controls-Grid__row-cell > .controls-Grid__table__relative-cell-wrapper  > .controls-itemActionsV_outside_theme-${this._$theme},
              .${uniqueClass} .controls-Grid__row:nth-child(${index}) > .controls-Grid__row-cell .controls-Grid__row-cell__content  > .controls-itemActionsV_outside_theme-${this._$theme},
              .${uniqueClass} .controls-Grid__row:nth-child(${index}) > .controls-itemActionsV__container > .controls-itemActionsV_outside_theme-${this._$theme} {
                 opacity: 1;
                 visibility: visible;
              }`;
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
    _moduleName: 'Controls/display:GridCollection',
    _itemModule: 'Controls/display:GridDataRow'
});
