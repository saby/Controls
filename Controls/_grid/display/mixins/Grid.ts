import { TemplateFunction } from 'UI/Base';
import { Model as EntityModel } from 'Types/entity';

import {
    THeader,
    IColumn,
    TColumns,
    TColumnSeparatorSize
} from 'Controls/interface';

import { IViewIterator, GridLadderUtil, ILadderObject} from 'Controls/display';

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
import ArraySimpleValuesUtil = require('Controls/Utils/ArraySimpleValuesUtil');


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
 * @param {Controls/interface:IColumn} column Колонка грида
 * @param {Number} columnIndex Индекс колонки грида
 * @param {Boolean} isEditing Актуальное состояние редактирования элемента
 * @returns {Controls/grid:TColspanCallbackResult} Количество объединяемых колонок, учитывая текущую. Для объединения всех колонок, начиная с текущей, из функции нужно вернуть специальное значение 'end'.
 */
export type TColspanCallback = (item: EntityModel, column: IColumn, columnIndex: number, isEditing: boolean) => TColspanCallbackResult;

/**
 * @typedef {Function} TResultsColspanCallback
 * @description
 * Функция обратного вызова для расчёта объединения колонок строки (колспана).
 * @param {Controls/interface:IColumn} column Колонка грида
 * @param {Number} columnIndex Индекс колонки грида
 * @returns {Controls/grid:TColspanCallbackResult} Количество объединяемых колонок, учитывая текущую. Для объединения всех колонок, начиная с текущей, из функции нужно вернуть специальное значение 'end'.
 */
export type TResultsColspanCallback = (column: IColumn, columnIndex: number) => TColspanCallbackResult;

/**
 * @typedef {Object} IEmptyTemplateColumn
 * @description
 * Объект конфигурации колонки представления {@link /doc/platform/developmentapl/interface-development/controls/list/grid/empty-grid/ пустой таблицы}.
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
    sorting?: Array<{[p: string]: string}>;
    emptyTemplateColumns?: IEmptyTemplateColumn[];
    columnSeparatorSize?: TColumnSeparatorSize;
    multiSelectVisibility?: string;
    itemActionsPosition?: 'inside' | 'outside' | 'custom';
    isFullGridSupport?: boolean;
}

export default abstract class Grid<S, T extends GridRowMixin<S>> {
    readonly '[Controls/_display/grid/mixins/Grid]': boolean;

    protected _$columns: TColumns;
    protected _$colgroup: Colgroup<S>;
    protected _$header: THeader;
    protected _$headerModel: Header<S>;
    protected _$headerVisibility: THeaderVisibility;
    protected _$multiSelectVisibility: string;
    protected _$footer: FooterRow<S>;
    protected _$results: ResultsRow<S>;
    protected _$ladder: ILadderObject;
    protected _$ladderProperties: string[];
    protected _$stickyColumn: {};
    protected _$resultsPosition: TResultsPosition;
    protected _$resultsVisibility: TResultsVisibility;
    protected _$showEditArrow: boolean;
    protected _$editArrowVisibilityCallback: TEditArrowVisibilityCallback;
    protected _$colspanCallback: TColspanCallback;
    protected _$columnSeparatorSize: TColumnSeparatorSize;
    protected _$resultsColspanCallback: TResultsColspanCallback;
    protected _$resultsTemplate: TemplateFunction;
    protected _$isFullGridSupport: boolean;
    protected _$columnScroll: boolean;
    protected _$stickyColumnsCount: number;
    protected _$emptyGridRow: EmptyRow<S>;
    protected _$emptyTemplate: TemplateFunction;
    protected _$sorting: Array<{[p: string]: string}>;
    protected _$emptyTemplateColumns: IEmptyTemplateColumn[];
    protected _$itemActionsPosition: 'inside' | 'outside' | 'custom';

    protected constructor(options: IOptions) {
        const supportLadder = GridLadderUtil.isSupportLadder(this._$ladderProperties);
        if (supportLadder) {
            this._prepareLadder(this._$ladderProperties, this._$columns);
        }

        this._$resultsPosition = options.resultsPosition;

        if (this._headerIsVisible(options.header)) {
            this._initializeHeader(options);
        }
        if (options.footerTemplate || options.footer) {
            this._$footer = this._initializeFooter(options);
        }
        if (this._resultsIsVisible()) {
            this._initializeResults(options);
        }
        if (!this._$isFullGridSupport) {
            this._initializeColgroup(options);
        }

        if (this._$emptyTemplate || this._$emptyTemplateColumns) {
            this._initializeEmptyRow();
        }
        if (supportLadder) {
            this._updateItemsLadder();
        }
    }

    getColumnsConfig(): TColumns {
        return this._$columns;
    }

    getHeaderConfig(): THeader {
        return this._$header;
    }

    getColgroup(): Colgroup<S> {
        return this._$colgroup;
    }

    getHeader(): Header<S> {
        if (!this._$headerModel && this._headerIsVisible(this._$header)) {
            this._initializeHeader({
                columns: this._$columns,
                owner: this,
                header: this._$header,
                sorting: this._$sorting
            } as IOptions);
        }

        return this._$headerModel;
    }

    hasHeader(): boolean {
        return !!this.getHeader();
    }

    getEmptyGridRow(): EmptyRow<S> {
        return this._$emptyGridRow;
    }

    setFooter(footerTemplate: TemplateFunction, footer: TFooter, silent?: boolean): void {
        if (this.getFooter()) {
            this.getFooter().setFooter(footerTemplate, footer);
        } else {
            this._$footer = this._initializeFooter({
                multiSelectVisibility: this._$multiSelectVisibility,
                footerTemplate,
                footer,
                columnSeparatorSize: this._$columnSeparatorSize
            });
        }
        if (!silent) {
            this._nextVersion();
        }
    }

    getFooter(): FooterRow<S> {
        return this._$footer;
    }

    getResults(): ResultsRow<S> {
        if (!this._$results && this._resultsIsVisible()) {
            this._initializeResults({
                columns: this._$columns,
                multiSelectVisibility: this._$multiSelectVisibility,
                resultsTemplate: this._$resultsTemplate,
                resultsColspanCallback: this._$resultsColspanCallback
            });
        }
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
            results.setColspanCallback(resultsColspanCallback);
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
        return emptyTemplateClasses;
    }

    getStickyColumn(): GridLadderUtil.IStickyColumn {
        return GridLadderUtil.getStickyColumn({
            stickyColumn: this._$stickyColumn,
            columns: this._$columns
        });
    }

    setHeader(header: THeader): void {
        this._$header = header;
        this._$headerModel = null;
    }

    setColumns(newColumns: TColumns): void {
        this._$columns = newColumns;
        this._nextVersion();
        // Строки данных, группы
        this._updateItemsColumns();

        // В столбцах может измениться stickyProperty, поэтому нужно пересчитать ladder
        // Проверка, что точно изменился stickyProperty, это не быстрая операция, т.к. columns - массив объектов
        const supportLadder = GridLadderUtil.isSupportLadder(this._$ladderProperties);
        if (supportLadder) {
            this._prepareLadder(this._$ladderProperties, this._$columns);
            this._updateItemsLadder();
        }

        [this.getColgroup(), this.getHeader(), this.getResults(), this.getFooter()].forEach((gridUnit) => {
            gridUnit?.setColumns(newColumns);
        });
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
        this._$columnSeparatorSize = columnSeparatorSize;
        this._nextVersion();

        const header = this.getHeader();
        if (header) {
            header.setColumnSeparatorSize(columnSeparatorSize);
        }
        this.getViewIterator().each((item: GridRowMixin<S>) => {
            if (item.LadderSupport) {
                item.setColumnSeparatorSize(columnSeparatorSize);
            }
        });
    }

    // TODO удалить после https://online.sbis.ru/opendoc.html?guid=76c1ba00-bfc9-4eb8-91ba-3977592e6648
    getLadderProperties(): string[] {
        return this._$ladderProperties;
    }

    protected _initializeEmptyRow(): void {
        this._$emptyGridRow = new EmptyRow<S>({
            owner: this,
            columns: this._$emptyTemplateColumns,
            rowTemplate: this._$emptyTemplate,
            rowTemplateOptions: this._$emptyTemplateOptions,
            multiSelectVisibility: this._$multiSelectVisibility
        });
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
        this.getViewIterator().each((item: GridRowMixin<S>, index: number) => {
            let ladder;
            let stickyLadder;
            if (this._$ladder) {
                if (this._$ladder.ladder) {
                    ladder = this._$ladder.ladder[index];
                }
                if (this._$ladder.stickyLadder) {
                    stickyLadder = this._$ladder.stickyLadder[index];
                }
            }
            if (item.LadderSupport) {
                item.updateLadder(ladder, stickyLadder);
            }
        });
    }

    protected _updateItemsColumns(): void {
        this.getViewIterator().each((item: GridRowMixin<S>) => {
            item.setColumns(this._$columns);
        });
    }

    protected _headerIsVisible(header: THeader): boolean {
        const hasHeader = header && header.length;
        return hasHeader && (this._$headerVisibility === 'visible' || this.getCount() > 0);
    }

    protected _resultsIsVisible(): boolean {
        return !!this._$resultsPosition && (this._$resultsVisibility === 'visible' || this.getCollectionCount() > 1);
    }

    protected _initializeHeader(options: IOptions): Header<S> {
        const _options = {
            ...options,
            owner: this,
            header: options.header
        };
        this._$headerModel = (this._$isFullGridSupport ? new Header(_options) : new TableHeader(_options));
    }

    protected _initializeFooter(options: IOptions): FooterRow<S> {
        return new FooterRow({
            owner: this,
            multiSelectVisibility: options.multiSelectVisibility,
            columns: options.footer,
            rowTemplate: options.footerTemplate,
            rowTemplateOptions: {},
            columnSeparatorSize: options.columnSeparatorSize
        });
    }

    protected _initializeResults(options: IOptions): void {
        const resultsRowClass = this.getResultsRowClass();
        this._$results = new resultsRowClass({
            owner: this,
            multiSelectVisibility: options.multiSelectVisibility,
            columns: options.columns,
            rowTemplate: options.resultsTemplate,
            rowTemplateOptions: {},
            metaResults: this.getMetaResults(),
            colspanCallback: options.resultsColspanCallback
        });
    }

    protected _initializeColgroup(options: IOptions): Colgroup<S> {
        this._$colgroup = new Colgroup({
            owner: this
        });
    }

    protected _handleAfterCollectionItemChange(item: S, index: number, properties?: object): void {
        const collectionItem = this.getItemBySourceItem(item);
        if (collectionItem instanceof DataRow) {
            collectionItem.updateContentsVersion();
        }
    }

    protected _handleCollectionActionChange(newItems: S[]): void {
        newItems.forEach((item) => {
            const collectionItem = this.getItemBySourceItem(item);
            if (collectionItem instanceof DataRow) {
                collectionItem.updateContentsVersion();
            }
        })
    }

    getResultsRowClass() {
        return ResultsRow;
    }

    getRowIndex(row: GridRow<T>): number {
        const getHeaderOffset = () => {
            if (this._$headerModel) {
                const {start, end} = this._$headerModel.getBounds().row;
                return end - start;
            } else {
                return 0;
            }
        };

        if (row instanceof TableHeaderRow) {
            return this._$headerModel.getRows().indexOf(row);
        } else if (row instanceof HeaderRow) {
            return 0;
        } else if (row instanceof this.getResultsRowClass()) {
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

    setColumnScroll(columnScroll: boolean) {
        this._$columnScroll = columnScroll;
        this._nextVersion();
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
        return !!this.getColumnsConfig() && this.hasColumnScroll() && this._$itemActionsPosition !== 'custom';
    }

    // FIXME: Временное решение - аналог RowEditor из старых таблиц(редактирование во всю строку).
    //  Первая ячейка редактируемой строки растягивается, а ее шаблон заменяется на
    //  itemEditorTemplate (обычная колонка с прикладным контентом).
    //  Избавиться по https://online.sbis.ru/opendoc.html?guid=80420a0d-1f45-4acb-8feb-281bf1007821
    getItemEditorTemplate(): TemplateFunction {
        return this._$itemEditorTemplate;
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
    abstract getItemBySourceItem(item: S): T;

    protected abstract _nextVersion(): void;

    // endregion
}

Object.assign(Grid.prototype, {
    '[Controls/_display/grid/mixins/Grid]': true,
    _$columns: null,
    _$header: null,
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
    _$columnSeparatorSize: null,
    _$resultsTemplate: null,
    _$columnScroll: false,
    _$stickyColumnsCount: 1,
    _$sorting: null,
    _$emptyTemplateColumns: null,
    _$itemEditorTemplate: null,
    _$itemActionsPosition: 'inside'
});
