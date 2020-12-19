import { TemplateFunction } from 'UI/Base';
import { Model as EntityModel } from 'Types/entity';

import { TColumns } from 'Controls/_grid/interface/IColumn';
import { THeader } from 'Controls/_grid/interface/IHeaderCell';

import { IViewIterator } from '../../Collection';
import * as GridLadderUtil from '../../utils/GridLadderUtil';
import Header from '../Header';
import TableHeader from '../TableHeader';
import TableHeaderRow from '../TableHeaderRow';
import Colgroup from '../Colgroup';
import GridRow from '../Row';
import HeaderRow from '../HeaderRow';
import DataRow from '../DataRow';
import FooterRow from '../FooterRow';
import ResultsRow, { TResultsPosition } from '../ResultsRow';
import GridRowMixin from './Row';
import EmptyRow from '../EmptyRow';


type THeaderVisibility = 'visible' | 'hasdata';
type TResultsVisibility = 'visible' | 'hasdata';

/**
 * @typedef {Function} TEditArrowVisibilityCallback
 * @description
 * Функция обратного вызова для определения видимости кнопки редактирования
 * @param item Model
 */
export type TEditArrowVisibilityCallback = (item: EntityModel) => boolean;

export interface IOptions {
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
    showEditArrow?: boolean;
    editArrowVisibilityCallback?: TEditArrowVisibilityCallback;
    columnScroll?: boolean;
    stickyColumnsCount?: number;
    emptyTemplate: TemplateFunction;
    emptyColumns;
}

export default abstract class Grid<S, T extends GridRowMixin<S>> {
    readonly '[Controls/_display/grid/mixins/Grid]': boolean;

    protected _$columns: TColumns;
    protected _$headerConfig: THeader;
    protected _$colgroup: Colgroup<S>;
    protected _$header: Header<S>;
    protected _$footer: FooterRow<S>;
    protected _$results: ResultsRow<S>;
    protected _$ladder: {};
    protected _$ladderProperties: string[];
    protected _$stickyColumn: {};
    protected _$resultsPosition: TResultsPosition;
    protected _$headerVisibility: THeaderVisibility;
    protected _$resultsVisibility: TResultsVisibility;
    protected _$showEditArrow: boolean;
    protected _$editArrowVisibilityCallback: TEditArrowVisibilityCallback;
    protected _$isFullGridSupport: boolean;
    protected _$columnScroll: boolean;
    protected _$stickyColumnsCount: number;
    protected _$emptyTemplate: TemplateFunction;
    protected _$emptyColumns: EmptyRow<S>;

    protected constructor(options: IOptions) {
        if (GridLadderUtil.isSupportLadder(this._$ladderProperties)) {
            this._prepareLadder(this._$ladderProperties, this._$columns);
        }

        this._$resultsPosition = options.resultsPosition;

        if (this._headerIsVisible(options)) {
            this._$headerConfig = options.header;
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

        if (this._$emptyTemplate || this._$emptyColumns) {
            this._$emptyGridRow = new EmptyRow<S>({
                owner: this,
                emptyTemplate: this._$emptyTemplate,
                emptyColumns: this._$emptyColumns
            });
        }
    }

    getColumnsConfig(): TColumns {
        return this._$columns;
    }

    getHeaderConfig(): THeader {
        return this._$headerConfig;
    }

    getColgroup(): Colgroup<S> {
        return this._$colgroup;
    }

    getHeader(): Header<S> {
        return this._$header;
    }

    getEmptyGridRow(): EmptyRow<S> {
        return this._$emptyGridRow;
    }

    getFooter(): FooterRow<S> {
        return this._$footer;
    }

    getResults(): ResultsRow<S> {
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

    editArrowIsVisible(item: EntityModel): boolean {
        if (!this._$editArrowVisibilityCallback) {
            return this._$showEditArrow;
        }
        return this._$editArrowVisibilityCallback(item);
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
            if (item.LadderSupport) {
                item.setLadder(this._$ladder);
            }
        });
    }

    protected _updateItemsColumns(): void {
        this.getViewIterator().each((item: GridRowMixin<S>) => {
            if (item.LadderSupport) {
                item.setColumns(this._$columns);
            }
        });
    }

    protected _headerIsVisible(options: IOptions): boolean {
        const hasHeader = options.header && options.header.length;
        return hasHeader && (this._$headerVisibility === 'visible' || this.getCollectionCount() > 0);
    }

    protected _resultsIsVisible(): boolean {
        const hasResultsPosition = !!this._$resultsPosition;
        const hasMoreData = this.getHasMoreData();
        return hasResultsPosition && (this._$resultsVisibility === 'visible' || hasMoreData || this.getCollectionCount() > 1);
    }

    protected _initializeHeader(options: IOptions): Header<S> {
        const _options = {
            ...options,
            owner: this,
            header: options.header
        };
        return this._$isFullGridSupport ? new Header(_options) : new TableHeader(_options);
    }

    protected _initializeFooter(options: IOptions): FooterRow<S> {
        return new FooterRow({
            ...options,
            owner: this,
            footer: options.footer,
            footerTemplate: options.footerTemplate
        });
    }

    protected _initializeResults(options: IOptions): ResultsRow<S> {
        return new ResultsRow({
            ...options,
            owner: this,
            results: this.getMetaResults(),
            resultsTemplate: options.resultsTemplate
        });
    }

    protected _initializeColgroup(options: IOptions): Colgroup<S> {
        return new Colgroup({
            owner: this
        });
    }

    getRowIndex(row: GridRow<T>): number {
        const getHeaderOffset = () => {
            if (this._$header) {
                const {start, end} = this._$header.getBounds().row;
                return end - start;
            } else {
                return 0;
            }
        };

        if (row instanceof TableHeaderRow) {
            return this._$header.getRows().indexOf(row);
        } else if (row instanceof HeaderRow) {
            return 0;
        } else if (row instanceof ResultsRow) {
            let index = getHeaderOffset();
            if (this.getResultsPosition() !== 'top') {
                index += this.getCount();
            }
            return index;
        } else if (row instanceof DataRow) {
            let index = getHeaderOffset() + this.getItems().indexOf(row);
            if (this._$results) {
                index++;
            }
            return index;
        } else if (row instanceof FooterRow) {
            let index = getHeaderOffset() + this.getCount();
            if (this._$results) {
                index++;
            }
            return index;
        } else {
            return -1;
        }
    }

    needMultiSelectColumn(): boolean {
        return this.getMultiSelectVisibility() !== 'hidden' && this.getMultiSelectPosition() !== 'custom';
    }

    hasColumnScroll(): boolean {
        return this._$columnScroll;
    }

    getStickyColumnsCount(): number {
        return this._$stickyColumnsCount;
    }

    setStickyColumnsCount(stickyColumnsCount: number): void {
        this._$stickyColumnsCount = stickyColumnsCount;
        this._nextVersion();
    }

    protected hasItemActionsSeparatedCell(): boolean {
        return !!this.getColumnsConfig() && this.hasColumnScroll() && (this.getActionsTemplateConfig()?.itemActionsPosition !== 'custom');
    }

    // region Controls/_display/CollectionItem

    abstract getMetaResults(): EntityModel;
    abstract getHasMoreData(): boolean;
    abstract getCollectionCount(): number;
    abstract getViewIterator(): IViewIterator;
    abstract getStartIndex(): number;
    abstract getStopIndex(): number;
    abstract getRowSeparatorSize(): string;
    abstract getMultiSelectVisibility(): string;
    abstract getMultiSelectPosition(): string;

    protected abstract _nextVersion(): void;

    // endregion
}

Object.assign(Grid.prototype, {
    '[Controls/_display/grid/mixins/Grid]': true,
    _$columns: null,
    _$headerVisibility: 'hasdata',
    _$resultsVisibility: 'hasdata',
    _$resultsPosition: null,
    _$ladderProperties: null,
    _$stickyColumn: null,
    _$isFullGridSupport: true,
    _$showEditArrow: false,
    _$editArrowVisibilityCallback: null,
    _$columnScroll: false,
    _$stickyColumnsCount: 1,
    _$emptyTemplate: null,
    _$emptyColumns: null
});
