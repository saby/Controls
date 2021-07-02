import { TemplateFunction } from 'UI/Base';
import { Model as EntityModel } from 'Types/entity';

import { IColumn, TColumns, TColumnSeparatorSize } from '../interface/IColumn';
import { THeader } from '../interface/IHeaderCell';

import { IViewIterator, GridLadderUtil, ILadderObject, IBaseCollection, isFullGridSupport } from 'Controls/display';

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
import { EnumeratorCallback } from 'Types/collection';
import {INavigationOptionValue, INavigationSourceConfig} from 'Controls/interface';

type THeaderVisibility = 'visible' | 'hasdata';
type TResultsVisibility = 'visible' | 'hasdata';

export type TEditArrowVisibilityCallback = (item: EntityModel) => boolean;

export type TColspanCallbackResult = number | 'end';

export type TColspanCallback = (item: EntityModel, column: IColumn, columnIndex: number, isEditing: boolean) => TColspanCallbackResult;

export type TResultsColspanCallback = (column: IColumn, columnIndex: number) => TColspanCallbackResult;

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
    backgroundStyle: string;
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
    protected _$columnScroll: boolean;
    protected _$stickyColumnsCount: number;
    protected _$emptyGridRow: EmptyRow<S>;
    protected _$emptyTemplate: TemplateFunction;
    protected _$sorting: Array<{[p: string]: string}>;
    protected _$emptyTemplateColumns: IEmptyTemplateColumn[];
    protected _$colspanGroup: boolean;
    protected _$backgroundStyle: string;
    protected _$newDesign: boolean;

    protected _isFullGridSupport: boolean = isFullGridSupport();
    protected _footer: FooterRow<S>;

    protected constructor(options: IOptions) {
        const supportLadder = GridLadderUtil.isSupportLadder(this._$ladderProperties);
        if (supportLadder) {
            this._prepareLadder(this._$ladderProperties, this._$columns);
        }

        this._$resultsPosition = options.resultsPosition;

        if (this._headerIsVisible(options.header)) {
            this._initializeHeader(options);
        }
        if (this._resultsIsVisible()) {
            this._initializeResults(options);
        }
        if (!this.isFullGridSupport()) {
            this._initializeColgroup(options);
        }

        if (this._$emptyTemplate || this._$emptyTemplateColumns) {
            this._initializeEmptyRow();
        }
        if (supportLadder) {
            this._updateItemsLadder();
        }
    }

    getGridColumnsConfig(): TColumns {
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
                header: this._$header,
                columns: this._$columns,
                backgroundStyle: this._$backgroundStyle,
                columnSeparatorSize: this._$columnSeparatorSize,
                sorting: this._$sorting,
                multiSelectVisibility: this._$multiSelectVisibility,
                hasMoreDataUp: this.hasMoreDataUp()
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

    setEmptyTemplateOptions(options: object): void {
        this.getEmptyGridRow()?.setRowTemplateOptions(options);
    }

    setFooter(options: IOptions): void {
        const footerModel = this.getFooter();

        if (footerModel) {
            footerModel.setRowTemplate(options.footerTemplate);
            footerModel.setColumnsConfig(options.footer);
        } else {
            this._footer = this._initializeFooter({
                multiSelectVisibility: this._$multiSelectVisibility,
                footerTemplate: options.footerTemplate,
                footer: options.footer,
                columns: options.columns,
                backgroundStyle: this._$backgroundStyle,
                columnSeparatorSize: this._$columnSeparatorSize
            });
        }

        this._nextVersion();
    }

    getResults(): ResultsRow<S> {
        if (!this._$results && this._resultsIsVisible()) {
            this._initializeResults({
                columns: this._$columns,
                multiSelectVisibility: this._$multiSelectVisibility,
                resultsTemplate: this._$resultsTemplate,
                backgroundStyle: this._$backgroundStyle,
                columnSeparatorSize: this._$columnSeparatorSize,
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
        this._updateItemsProperty('setColspanCallback', this._$colspanCallback, 'setColspanCallback');
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

    setColspanGroup(colspanGroup: boolean): void {
        if (this._$colspanGroup !== colspanGroup) {
            this._$colspanGroup = colspanGroup;
            this._updateItemsProperty('setColspanGroup', this._$colspanGroup, '[Controls/_display/grid/GroupRow]');
            this._nextVersion();
        }
    }

    getColspanGroup(): boolean {
        return this._$colspanGroup;
    }

    getColspanCallback(): TColspanCallback {
        return this._$colspanCallback;
    }

    isFullGridSupport(): boolean {
        return this._isFullGridSupport;
    }

    getEmptyTemplateClasses(theme?: string): string {
        const rowSeparatorSize = this.getRowSeparatorSize();
        let emptyTemplateClasses = 'controls-GridView__emptyTemplate js-controls-GridView__emptyTemplate';
        emptyTemplateClasses += ` controls-Grid__row-cell_withRowSeparator_size-${rowSeparatorSize}`;
        return emptyTemplateClasses;
    }

    protected _isRowSeparatorsEnabled(): boolean {
        const isVisibleByHeaderOrFooter = (
            this._headerIsVisible(this._$header) || this._resultsIsVisible() || !!this.getFooter());
        return !this._$newDesign || (this._$newDesign && isVisibleByHeaderOrFooter);
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

    setHeaderVisibility(headerVisibility: THeaderVisibility): void {
        this._$headerVisibility = headerVisibility;
        this._$headerModel = null;

        this._nextVersion();
    }

    setColumns(newColumns: TColumns): void {
        this._$columns = newColumns;
        this._nextVersion();
        // Строки данных, группы
        this._updateItemsProperty('setGridColumnsConfig', this._$columns);

        // В столбцах может измениться stickyProperty, поэтому нужно пересчитать ladder
        // Проверка, что точно изменился stickyProperty, это не быстрая операция, т.к. columns - массив объектов
        const supportLadder = GridLadderUtil.isSupportLadder(this._$ladderProperties);
        if (supportLadder) {
            this._prepareLadder(this._$ladderProperties, this._$columns);
            this._updateItemsLadder();
        }

        [this.getColgroup(), this.getHeader(), this.getResults(), this.getFooter(), this.getEmptyGridRow()].forEach((gridUnit) => {
            gridUnit?.setGridColumnsConfig(newColumns);
        });
    }

    setLadderProperties(ladderProperties: string[]) {
        if (this._$ladderProperties !== ladderProperties) {
            this._$ladderProperties = ladderProperties;
            this._nextVersion();

            const supportLadder = GridLadderUtil.isSupportLadder(this._$ladderProperties);
            if (supportLadder) {
                this._prepareLadder(this._$ladderProperties, this._$columns);
                this._updateItemsLadder();
            }
            this._getItems().forEach((item) => {
                item.resetColumns();
            });
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
        this._$columnSeparatorSize = columnSeparatorSize;
        this._nextVersion();

        const header = this.getHeader();
        if (header) {
            header.setColumnSeparatorSize(columnSeparatorSize);
        }
        this._updateItemsProperty('setColumnSeparatorSize', this._$columnSeparatorSize, 'setColumnSeparatorSize');
    }

    // TODO удалить после https://online.sbis.ru/opendoc.html?guid=76c1ba00-bfc9-4eb8-91ba-3977592e6648
    getLadderProperties(): string[] {
        return this._$ladderProperties;
    }

    protected _initializeEmptyRow(): void {
        this._$emptyGridRow = new EmptyRow<S>({
            owner: this,
            columnsConfig: this._$emptyTemplateColumns,
            gridColumnsConfig: this._$columns,
            rowTemplate: this._$emptyTemplate,
            rowTemplateOptions: this._$emptyTemplateOptions,
            multiSelectVisibility: this._$multiSelectVisibility
        });
    }

    setEmptyTemplateColumns(emptyTemplateColumns): void {
        this._$emptyTemplateColumns = emptyTemplateColumns;
        this._nextVersion();
        if (this._$emptyGridRow) {
            this._$emptyGridRow.setColumnsConfig(emptyTemplateColumns);
        } else {
            this._initializeEmptyRow();
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
        this.each((item: GridRowMixin<S>, index: number) => {
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

    protected _headerIsVisible(header: THeader): boolean {
        const hasHeader = header && header.length;
        return hasHeader && (this._$headerVisibility === 'visible' || this.getCount() > 0);
    }

    setResultsPosition(resultsPosition: TResultsPosition): void {
        if (this._$resultsPosition !== resultsPosition) {
            this._$resultsPosition = resultsPosition;
            if (!this._$resultsPosition) {
                this._$results = null;
            }
            this._nextVersion();
        }
    }

    setResultsVisibility(resultsVisibility: TResultsVisibility): void {
        if (this._$resultsVisibility !== resultsVisibility) {
            this._$resultsVisibility = resultsVisibility;
            this._nextVersion();
        }
    }

    protected _hasItemsToCreateResults(): boolean {
        return this.getCollectionCount() > (this._$resultsVisibility === 'visible' ? 0 : 1);
    }

    protected _resultsIsVisible(): boolean {
        return !!this._$resultsPosition && this._hasItemsToCreateResults();
    }

    protected _initializeHeader(options: IOptions): void {
        const cOptions = {
            ...options,
            owner: this,
            columnsConfig: options.header,
            gridColumnsConfig: options.columns
        };
        const headerConstructor = this.getHeaderConstructor();
        this._$headerModel = new headerConstructor(cOptions);
    }

    getHeaderConstructor(): typeof Header {
        return this.isFullGridSupport() ? Header : TableHeader;
    }

    protected _initializeFooter(options: IOptions): FooterRow<S> {
        if (!options.footerTemplate && !options.footer) {
            return;
        }

        return new FooterRow({
            owner: this,
            multiSelectVisibility: options.multiSelectVisibility,
            gridColumnsConfig: options.columns,
            columnsConfig: options.footer,
            rowTemplate: options.footerTemplate,
            rowTemplateOptions: {},
            backgroundStyle: options.backgroundStyle,
            columnSeparatorSize: options.columnSeparatorSize,
            shouldAddFooterPadding: options.itemActionsPosition === 'outside'
        });
    }

    protected _initializeResults(options: IOptions): void {
        const resultsRowClass = this.getResultsConstructor();
        this._$results = new resultsRowClass({
            owner: this,
            multiSelectVisibility: options.multiSelectVisibility,
            columnsConfig: options.columns,
            gridColumnsConfig: options.columns,
            rowTemplate: options.resultsTemplate,
            rowTemplateOptions: {},
            metaResults: this.getMetaResults(),
            backgroundStyle: options.backgroundStyle,
            columnSeparatorSize: options.columnSeparatorSize,
            colspanCallback: options.resultsColspanCallback
        });
    }

    protected _initializeColgroup(options: IOptions): Colgroup<S> {
        this._$colgroup = new Colgroup({
            owner: this,
            gridColumnsConfig: options.columns
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
        });
    }

    getResultsConstructor(): typeof ResultsRow {
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
        } else if (row instanceof this.getResultsConstructor()) {
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
        this._updateItemsProperty('setStickyColumnsCount', stickyColumnsCount, 'setStickyColumnsCount');
        if (this.getHeader()) {
            this.getHeader().setStickyColumnsCount(stickyColumnsCount);
        }

        this._nextVersion();
    }

    hasItemActionsSeparatedCell(): boolean {
        return !!this.getGridColumnsConfig() && this.hasColumnScroll() && this._$itemActionsPosition !== 'custom';
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
    abstract hasMoreData(): boolean;
    abstract hasMoreDataUp(): boolean;
    abstract getCollectionCount(): number;
    abstract getViewIterator(): IViewIterator;
    abstract getStartIndex(): number;
    abstract getStopIndex(): number;
    abstract getRowSeparatorSize(): string;
    abstract getMultiSelectVisibility(): string;
    abstract getMultiSelectPosition(): string;
    abstract getItemBySourceItem(item: S): T;
    abstract getItemBySourceKey(key: string | number): T;
    abstract getCollection(): IBaseCollection<S, T>;
    abstract getFooter(): FooterRow<S>;
    abstract each(callback: EnumeratorCallback<T>, context?: object): void;
    abstract getNavigation(): INavigationOptionValue<INavigationSourceConfig>;

    protected abstract _nextVersion(): void;
    protected abstract _getItems(): T[];
    protected abstract _updateItemsProperty(updateMethodName: string,
                                            newPropertyValue: any,
                                            conditionProperty?: string,
                                            silent?: boolean): void;

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
    _$showEditArrow: false,
    _$editArrowVisibilityCallback: null,
    _$colspanCallback: null,
    _$resultsColspanCallback: null,
    _$columnSeparatorSize: null,
    _$resultsTemplate: null,
    _$colspanGroup: true,
    _$columnScroll: false,
    _$stickyColumnsCount: 1,
    _$sorting: null,
    _$emptyTemplateColumns: null,
    _$itemEditorTemplate: null
});
