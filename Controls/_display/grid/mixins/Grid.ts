import { TemplateFunction } from 'UI/Base';
import { Model as EntityModel } from 'Types/entity';

import { IColumn, TColumns, TColumnSeparatorSize } from 'Controls/_grid/interface/IColumn';
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
import FooterRow, { TFooter } from '../FooterRow';
import ResultsRow, { TResultsPosition } from '../ResultsRow';
import GridRowMixin from './Row';
import EmptyRow from '../EmptyRow';
import {ILadderObject} from '../../utils/GridLadderUtil';


type THeaderVisibility = 'visible' | 'hasdata';
type TResultsVisibility = 'visible' | 'hasdata';

/**
 * @typedef {Function} TEditArrowVisibilityCallback
 * @description
 * Функция обратного вызова для определения видимости кнопки редактирования
 * @param item Model
 */
export type TEditArrowVisibilityCallback = (item: EntityModel) => boolean;

/**
 * @description
 * Тип результата, возвращаемого из функции colspanCallback (функции обратного вызова для расчёта объединения колонок строки).
 */
export type TColspanCallbackResult = number | 'end';

/**
 * @typedef {Function} TColspanCallback
 * @description
 * Функция обратного вызова для расчёта объединения колонок строки (колспана).
 * @param {Types/entity:Model} item Элемент, для которого рассчитывается объединение
 * @param {Controls/grid:IColumn} column Колонка грида
 * @param {Number} columnIndex Индекс колонки грида
 * @param {Boolean} isEditing Актуальное состояние редактирования элемента
 * @returns {Controls/display:TColspanCallbackResult} Количество объединяемых колонок, учитывая текущую. Для объединения всех колонок, начиная с текущей, из функции нужно вернуть специальное значение 'end'.
 */
export type TColspanCallback = (item: EntityModel, column: IColumn, columnIndex: number, isEditing: boolean) => TColspanCallbackResult;

/**
 * @typedef {Function} TResultsColspanCallback
 * @description
 * Функция обратного вызова для расчёта объединения колонок строки (колспана).
 * @param {Controls/grid:IColumn} column Колонка грида
 * @param {Number} columnIndex Индекс колонки грида
 * @returns {Controls/display:TColspanCallbackResult} Количество объединяемых колонок, учитывая текущую. Для объединения всех колонок, начиная с текущей, из функции нужно вернуть специальное значение 'end'.
 */
export type TResultsColspanCallback = (column: IColumn, columnIndex: number) => TColspanCallbackResult;

/**
 * @typedef {Object} IEmptyTemplateColumn
 * @description
 * Объект конфигурации колонки представления пустой таблицы.
 * @param {TemplateFunction} template Элемент, для которого рассчитывается объединение
 * @param {Number} startColumn Начальный индекс колонки.
 * @param {Number} endColumn Конечный индекс колонки.
 */
export interface IEmptyTemplateColumn {
    template: TemplateFunction;
    startColumn?: number;
    endColumn?: number;
}

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
    colspanCallback?: TColspanCallback;
    resultsColspanCallback?: TResultsColspanCallback;
    editArrowVisibilityCallback?: TEditArrowVisibilityCallback;
    columnScroll?: boolean;
    stickyColumnsCount?: number;
    emptyTemplate?: TemplateFunction;
    sorting?: Array<{[p: string]: string}>;
    emptyTemplateColumns?: IEmptyTemplateColumn[];
    columnSeparatorSize?: TColumnSeparatorSize;
}

export default abstract class Grid<S, T extends GridRowMixin<S>> {
    readonly '[Controls/_display/grid/mixins/Grid]': boolean;

    protected _$columns: TColumns;
    protected _$headerConfig: THeader;
    protected _$colgroup: Colgroup<S>;
    protected _$header: Header<S>;
    protected _$footer: FooterRow<S>;
    protected _$results: ResultsRow<S>;
    protected _$ladder: ILadderObject;
    protected _$ladderProperties: string[];
    protected _$stickyColumn: {};
    protected _$resultsPosition: TResultsPosition;
    protected _$headerVisibility: THeaderVisibility;
    protected _$resultsVisibility: TResultsVisibility;
    protected _$showEditArrow: boolean;
    protected _$editArrowVisibilityCallback: TEditArrowVisibilityCallback;
    protected _$colspanCallback: TColspanCallback;
    protected _$resultsColspanCallback: TResultsColspanCallback;
    protected _$resultsTemplate: TemplateFunction;
    protected _$isFullGridSupport: boolean;
    protected _$columnScroll: boolean;
    protected _$stickyColumnsCount: number;
    protected _$emptyGridRow: EmptyRow<S>;
    protected _$emptyTemplate: TemplateFunction;
    protected _$sorting: Array<{[p: string]: string}>;
    protected _$emptyTemplateColumns: IEmptyTemplateColumn[];

    protected constructor(options: IOptions) {
        const supportLadder = GridLadderUtil.isSupportLadder(this._$ladderProperties);
        if (supportLadder) {
            this._prepareLadder(this._$ladderProperties, this._$columns);
        }

        this._$resultsPosition = options.resultsPosition;

        if (this._headerIsVisible(options.header)) {
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

        if (options.columnSeparatorSize) {
            this.setColumnSeparatorSize(options.columnSeparatorSize);
        }

        if (this._$emptyTemplate || this._$emptyTemplateColumns) {
            this._$emptyGridRow = new EmptyRow<S>({
                owner: this,
                emptyTemplate: this._$emptyTemplate,
                emptyTemplateColumns: this._$emptyTemplateColumns
            });
        }
        if (supportLadder) {
            this._updateItemsLadder();
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

    hasHeader(): boolean {
        return !!this.getHeader();
    }

    getEmptyGridRow(): EmptyRow<S> {
        return this._$emptyGridRow;
    }

    getFooter(): FooterRow<S> {
        return this._$footer;
    }

    setFooter(footerTemplate: TemplateFunction, footer: TFooter): void {
        if (this.getFooter()) {
            this._$footer.setFooter(footerTemplate, footer);
        } else {
            this._$footer = this._initializeFooter({footerTemplate, footer, columns: this.getColumnsConfig()});
        }
        this._nextVersion();
    }

    getResults(): ResultsRow<S> {
        return this._$results;
    }

    getResultsPosition(): TResultsPosition {
        return this._$resultsPosition;
    }

    setColspanCallback(colspanCallback: TColspanCallback): void {
        this._$colspanCallback = colspanCallback;
        this.getViewIterator().each((item: GridRowMixin<S>) => {
            if (item.setColspanCallback) {
                item.setColspanCallback(colspanCallback);
            }
        });
        this._nextVersion();
    }

    setResultsColspanCallback(resultsColspanCallback: TResultsColspanCallback): void {
        this._$resultsColspanCallback = resultsColspanCallback;
        const results = this.getResults();
        if (results) {
            results.setResultsColspanCallback(resultsColspanCallback);
        }
        this._nextVersion();
    }

    getColspanCallback(): TColspanCallback {
        return this._$colspanCallback;
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

    setHeader(header: THeader): void {
        this._$headerConfig = header;
        if (this._headerIsVisible(header)) {
            this._$headerConfig = header;
            this._$header = this._initializeHeader({
                columns: this._$columns,
                owner: this,
                header: header,
                sorting: this._$sorting
            } as IOptions);
        }
    }

    setColumns(newColumns: TColumns): void {
        this._$columns = newColumns;
        this._$colgroup?.reBuild();
        this._nextVersion();
        this._updateItemsColumns();
        const header = this.getHeader();
        if (header) {
            header.setColumns(newColumns);
        }
    }

    setSorting(sorting: Array<{[p: string]: string}>): void {
        this._$sorting = sorting;
        this._nextVersion();
        if (this.hasHeader()) {
            this.getHeader().setSorting(sorting);
        }
    }

    editArrowIsVisible(item: EntityModel): boolean {
        if (!this._$editArrowVisibilityCallback) {
            return this._$showEditArrow;
        }
        return this._$editArrowVisibilityCallback(item);
    }

    setColumnSeparatorSize(columnSeparatorSize: TColumnSeparatorSize): void {
        const header = this.getHeader();
        if (header) {
            header.setColumnSeparatorSize(columnSeparatorSize);
        }
        this._nextVersion();
        this.getViewIterator().each((item: GridRowMixin<S>) => {
            if (item.LadderSupport) {
                item.setColumnSeparatorSize(columnSeparatorSize);
            }
        });
    }

    // TODO зарефакторить по задаче https://online.sbis.ru/doc/83a835c0-e24b-4b5a-9b2a-307f8258e1f8
    showLoadingIndicator(): void {
        this._nextVersion();
        if (this.getFooter()) {
            this.getFooter()._nextVersion();
        }
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
        this.getHeader()?.getRow()?.setLadder(this._$ladder);
        this.getResults()?.setLadder(this._$ladder);
    }

    protected _updateItemsColumns(): void {
        if (this._$results) {
            this._$results.setColumns(this._$columns);
        }

        this.getViewIterator().each((item: GridRowMixin<S>) => {
            if (item.LadderSupport) {
                item.setColumns(this._$columns);
            }
        });
    }

    protected _headerIsVisible(header: THeader): boolean {
        const hasHeader = header && header.length;
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
            footerTemplate: options.footerTemplate,
            multiSelectVisibility: this.getMultiSelectVisibility()
        });
    }

    protected _initializeResults(options: IOptions): ResultsRow<S> {
        return new ResultsRow({
            ...options,
            owner: this,
            results: this.getMetaResults(),
            resultsColspanCallback: options.resultsColspanCallback,
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

    hasMultiSelectColumn(): boolean {
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

    hasItemActionsSeparatedCell(): boolean {
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
    _$colspanCallback: null,
    _$resultsColspanCallback: null,
    _$resultsTemplate: null,
    _$columnScroll: false,
    _$stickyColumnsCount: 1,
    _$emptyTemplate: null,
    _$sorting: null,
    _$emptyTemplateColumns: null
});
