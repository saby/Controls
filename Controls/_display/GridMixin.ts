import { TColumns } from 'Controls/_grid/interface/IColumn';
import * as GridLadderUtil from 'Controls/_display/utils/GridLadderUtil';
import GridHeaderRow from 'Controls/_display/GridHeaderRow';
import GridColgroup from 'Controls/_display/GridColgroup';
import { Model as EntityModel } from 'Types/entity';
import { IViewIterator } from 'Controls/_display/Collection';
import { TemplateFunction } from 'UI/Base';
import { THeader } from 'Controls/_grid/interface/IHeaderCell';
import GridRowMixin from 'Controls/_display/GridRowMixin';
import GridFooterRow from 'Controls/_display/GridFooterRow';
import GridResultsRow, { TResultsPosition } from 'Controls/_display/GridResultsRow';

type THeaderVisibility = 'visible' | 'hasdata';
type TResultsVisibility = 'visible' | 'hasdata';

export interface IGridMixinOptions {
    columns: TColumns;
    // TODO: Написать интерфейс и доку для TFooter
    footer?: TFooter;
    footerTemplate?: TemplateFunction;
    header?: THeader;
    resultsTemplate?: TemplateFunction;
    resultsPosition?: TResultsPosition;
    headerVisibility?: THeaderVisibility;
    resultsVisibility?: TResultsVisibility;
    ladderProperties?: string[];
    stickyColumn?: {};
}

export default abstract class GridMixin<S, T extends GridRowMixin<S>> {
    readonly '[Controls/_display/GridMixin]': boolean;

    protected _$columns: TColumns;
    protected _$colgroup: GridColgroup<S>;
    protected _$header: GridHeaderRow<S>;
    protected _$footer: GridFooterRow<S>;
    protected _$results: GridResultsRow<S>;
    protected _$ladder: {};
    protected _$ladderProperties: string[];
    protected _$stickyColumn: {};
    protected _$resultsPosition: TResultsPosition;
    protected _$headerVisibility: THeaderVisibility;
    protected _$resultsVisibility: TResultsVisibility;


    protected _$isFullGridSupport: boolean;

    protected constructor(options: IGridMixinOptions) {
        if (GridLadderUtil.isSupportLadder(this._$ladderProperties)) {
            this._prepareLadder(this._$ladderProperties, this._$columns);
        }

        this._$resultsPosition = options.resultsPosition;

        if (this._headerIsVisible(options)) {
            this._$header = this._initializeHeader(options);
        }
        if (options.footerTemplate || options.footer) {
            this._$footer = this._initializeFooter(options);
        }
        if (this._resultsIsVisible()) {
            this._$results = this._initializeResults(options);
        }
        if (!this._$isFullGridSupport) {
            this._$colgroup = this._initializeColgroup(options);
        }
    }

    getColumns(): TColumns {
        throw Error('GridCollection.getColumns is deprecated. Use GridCollection.getColumnsConfig');
    }

    getColumnsConfig(): TColumns {
        return this._$columns;
    }

    getColgroup(): GridColgroup<S> {
        return this._$colgroup;
    }

    getHeader(): GridHeaderRow<S> {
        return this._$header;
    }

    getFooter(): GridFooterRow<S> {
        return this._$footer;
    }

    getResults(): GridResultsRow<S> {
        return this._$results;
    }

    getResultsPosition(): TResultsPosition {
        return this._$resultsPosition;
    }

    isFullGridSupport(): boolean {
        return this._$isFullGridSupport;
    }

    getEmptyTemplateClasses(theme?: string): string {
        const rowSeparatorSize = this.getRowSeparatorSize();
        let emptyTemplateClasses = 'controls-GridView__emptyTemplate js-controls-GridView__emptyTemplate';
        emptyTemplateClasses += ` controls-Grid__row-cell_withRowSeparator_size-${rowSeparatorSize}`;
        emptyTemplateClasses += ` controls-Grid__row-cell_withRowSeparator_size-${rowSeparatorSize}_theme-${theme}`;
        return emptyTemplateClasses;
    }

    getStickyColumn(): GridLadderUtil.IStickyColumn {
        return GridLadderUtil.getStickyColumn({
            stickyColumn: this._$stickyColumn,
            columns: this._$columns
        });
    }

    setColumns(newColumns: TColumns): void {
        this._$columns = newColumns;
        this._$colgroup?.reBuild();
        this._nextVersion();
        this._updateItemsColumns();
    }

    protected _prepareLadder(ladderProperties: string[], columns: TColumns): void {
        this._$ladder = GridLadderUtil.prepareLadder({
            columns,
            ladderProperties,
            startIndex: this.getStartIndex(),
            stopIndex: this.getStopIndex(),
            display: this
        });
    }

    protected _updateItemsLadder(): void {
        this.getViewIterator().each((item: GridRowMixin<S>) => {
            if (item['[Controls/_display/ILadderedCollectionItem]']) {
                item.setLadder(this._$ladder);
            }
        });
    }

    protected _updateItemsColumns(): void {
        this.getViewIterator().each((item: GridRowMixin<S>) => {
            if (item['[Controls/_display/ILadderedCollectionItem]']) {
                item.setColumns(this._$columns);
            }
        });
    }

    protected _headerIsVisible(options: IGridMixinOptions): boolean {
        const hasHeader = options.header && options.header.length;
        return hasHeader && (this._$headerVisibility === 'visible' || this.getCollectionCount() > 0);
    }

    protected _resultsIsVisible(): boolean {
        const hasResultsPosition = !!this._$resultsPosition;
        const hasMoreData = this.getHasMoreData();
        return hasResultsPosition && (this._$resultsVisibility === 'visible' || hasMoreData || this.getCollectionCount() > 1);
    }

    protected _initializeHeader(options: IGridMixinOptions): GridHeaderRow<S> {
        return new GridHeaderRow({
            ...options,
            owner: this,
            header: options.header
        });
    }

    protected _initializeFooter(options: IGridMixinOptions): GridFooterRow<S> {
        return new GridFooterRow({
            ...options,
            owner: this,
            footer: options.footer,
            footerTemplate: options.footerTemplate
        });
    }

    protected _initializeResults(options: IGridMixinOptions): GridResultsRow<S> {
        return new GridResultsRow({
            ...options,
            owner: this,
            results: this.getMetaResults(),
            resultsTemplate: options.resultsTemplate
        });
    }

    protected _initializeColgroup(options: IGridMixinOptions): GridColgroup<S> {
        return new GridColgroup({
            owner: this
        });
    }

    // region Controls/_display/CollectionItem

    abstract getMetaResults(): EntityModel;
    abstract getHasMoreData(): boolean;
    abstract getCollectionCount(): number;
    abstract getViewIterator(): IViewIterator;
    abstract getStartIndex(): number;
    abstract getStopIndex(): number;
    abstract getRowSeparatorSize(): string;

    protected abstract _nextVersion(): void;

    // endregion
}

Object.assign(GridMixin.prototype, {
    '[Controls/_display/GridMixin]': true,
    _$columns: null,
    _$headerVisibility: 'hasdata',
    _$resultsVisibility: 'hasdata',
    _$resultsPosition: null,
    _$ladderProperties: null,
    _$stickyColumn: null,
    _$isFullGridSupport: true
});
