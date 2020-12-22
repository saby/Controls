import { TemplateFunction } from 'UI/Base';
import { create } from 'Types/di';
import { IColumn, TColumns, IColspanParams } from 'Controls/_grid/interface/IColumn';
import { IOptions as IBaseOptions } from '../../CollectionItem';
import Collection from '../Collection';
import Cell, { IOptions as ICellOptions } from '../Cell';
import { TResultsPosition } from '../ResultsRow';
import StickyLadderCell from '../StickyLadderCell';
import CheckboxCell from '../CheckboxCell';
import {Model as EntityModel} from 'Types/entity';
import { THeader } from '../../../_grid/interface/IHeaderCell';
import { TColspanCallback } from './Grid';

const DEFAULT_GRID_ROW_TEMPLATE = 'Controls/gridNew:ItemTemplate';

interface IItemTemplateParams {
    highlightOnHover?: boolean,
    style?: string,
    cursor?: 'default' | 'pointer',
    theme: string,

    // Deprecated, use cursor
    clickable?: boolean,
}

export interface IOptions<T> extends IBaseOptions<T> {
    columns: TColumns;
    colspanCallback: TColspanCallback;
}

export default abstract class Row<T> {
    readonly '[Controls/_display/grid/mixins/Row]': boolean;

    protected _$owner: Collection<T>;
    protected _cellModule: string;

    protected _$columns: TColumns;
    protected _$columnItems: Array<Cell<T, Row<T>>>;
    protected _$colspanCallback: TColspanCallback;
    protected _$ladder: {};

    getDefaultTemplate(): string {
        return DEFAULT_GRID_ROW_TEMPLATE;
    }

    getItemClasses(params: IItemTemplateParams = { theme: 'default' }): string {
        const navigation = this.getOwner().getNavigation();
        const isLastItem = (!navigation || navigation.view !== 'infinity' || !this.getOwner().getHasMoreData())
            && this.isLastItem();
        let itemClasses = `controls-ListView__itemV ${this._getCursorClasses(params.cursor, params.clickable)}`;

        itemClasses += ` controls-Grid__row controls-Grid__row_${params.style}_theme-${params.theme}`;

        if (params.highlightOnHover !== false && !this.isEditing()) {
            itemClasses += ` controls-Grid__row_highlightOnHover_${params.style}_theme-${params.theme}`;
        }

        if (isLastItem) {
            itemClasses += ' controls-Grid__row_last';
        }

        return itemClasses;
    }

    isLastItem(): boolean {
        return (this.getOwner().getItems()[this.getOwner().getCount() - 1] === this);
    }

    isFullGridSupport(): boolean {
        return this._$owner.isFullGridSupport();
    }

    getColumns(): Array<Cell<T, Row<T>>> {
        if (!this._$columnItems) {
            this._initializeColumns();
        }
        return this._$columnItems;
    }

    getColumnsConfig(): TColumns {
        return this._$owner.getColumnsConfig();
    }

    getHeaderConfig(): THeader {
        return this._$owner.getHeaderConfig();
    }

    getColumnsCount(): number {
        return this.getColumns().length;
    }

    getColumnIndex(column: Cell<T, Row<T>>): number {
        return this.getColumns().indexOf(column);
    }

    getTopPadding(): string {
        return this._$owner.getTopPadding().toLowerCase();
    }

    getBottomPadding(): string {
        return this._$owner.getBottomPadding().toLowerCase();
    }

    getLeftPadding(): string {
        return this._$owner.getLeftPadding().toLowerCase();
    }

    getRightPadding(): string {
        return this._$owner.getRightPadding().toLowerCase();
    }

    getItemSpacing(): { left: string, right: string, row: string } {
        return {
            left: this._$owner.getLeftPadding().toLowerCase(),
            right: this._$owner.getRightPadding().toLowerCase(),
            row: this._$owner.getTopPadding().toLowerCase()
        };
    }

    getHoverBackgroundStyle(): string {
        return this._$owner.getHoverBackgroundStyle();
    }

    getEditingBackgroundStyle(): string {
        return this._$owner.getEditingBackgroundStyle();
    }

    hasHeader(): boolean {
        return this._$owner.hasHeader();
    }

    getResultsPosition(): TResultsPosition {
        return this._$owner.getResultsPosition();
    }

    getStickyLadderProperties(column: IColumn): string[] {
        let stickyProperties = column && column.stickyProperty;
        if (stickyProperties && !(stickyProperties instanceof Array)) {
            stickyProperties = [stickyProperties];
        }
        return stickyProperties as string[];
    }

    shouldDrawLadderContent(ladderProperty: string, stickyProperty: string): boolean {
        const stickyLadder = this.getStickyLadder();
        const stickyProperties = this.getStickyLadderProperties(this._$columns[0]);

        if (!stickyLadder) {
            return true;
        }

        const index = stickyProperties.indexOf(stickyProperty);
        const hasMainCell = !!(stickyLadder[stickyProperties[0]].ladderLength);

        if (!this.getOwner().getItemsDragNDrop() && stickyProperty && ladderProperty && stickyProperty !== ladderProperty && (
            index === 1 && !hasMainCell || index === 0 && hasMainCell)) {
            return false;
        }
        return true;
    }

    getLadderWrapperClasses(ladderProperty: string, stickyProperty: string): string {
        let ladderWrapperClasses = 'controls-Grid__row-cell__ladder-content';
        const ladder = this.getLadder();
        const stickyLadder = this.getStickyLadder();
        const stickyProperties = this.getStickyLadderProperties(this._$columns[0]);
        const index = stickyProperties?.indexOf(stickyProperty);
        const hasMainCell = stickyLadder && !!(stickyLadder[stickyProperties[0]].ladderLength);

        if (stickyProperty && ladderProperty && stickyProperty !== ladderProperty && (
            index === 1 && !hasMainCell || index === 0 && hasMainCell)) {
            ladderWrapperClasses += ' controls-Grid__row-cell__ladder-content_displayNoneForLadder';
        }

        if (stickyProperty === ladderProperty && index === 1 && hasMainCell) {
            ladderWrapperClasses += ' controls-Grid__row-cell__ladder-content_additional-with-main';
        }

        if (!ladder || !ladder[ladderProperty] || (stickyProperty === ladderProperty || !stickyProperty) && ladder[ladderProperty].ladderLength >= 1) {

        } else {
            ladderWrapperClasses += ' controls-Grid__row-cell__ladder-content_hiddenForLadder';
        }
        return ladderWrapperClasses;
    }

    setLadder(ladder: {}): void {
        if (this._$ladder !== ladder) {
            this._$ladder = ladder;
            this._reinitializeColumns();
        }
    }

    setColumns(newColumns: TColumns): void {
        if (this._$columns !== newColumns) {
            this._$columns = newColumns;
            this._nextVersion();
            this._reinitializeColumns();
        }
    }

    setColspanCallback(colspanCallback: TColspanCallback): void {
        this._$colspanCallback = colspanCallback;
        this._nextVersion();
        this._reinitializeColumns();
    }

    getLadder(): {} {
        let result;
        if (this._$ladder && this._$ladder.ladder) {
            result = this._$ladder.ladder[this._$owner.getIndex(this)];
        }
        return result;
    }

    getStickyLadder(): {} {
        let result;
        if (this._$ladder && this._$ladder.stickyLadder) {
            result = this._$ladder.stickyLadder[this._$owner.getIndex(this)];
        }
        return result;
    }

    editArrowIsVisible(item: EntityModel): boolean {
        return this._$owner.editArrowIsVisible(item);
    }

    protected _reinitializeColumns(): void {
        if (this._$columnItems) {
            this._initializeColumns();
            this._nextVersion();
        }
    }

    protected _getColspan(column: IColumn, columnIndex: number): number {
        const colspanCallback = this._$colspanCallback;
        if (colspanCallback) {
            return colspanCallback(this.getContents(), column, columnIndex, this.isEditing());
        }
        return undefined;
    }

    protected _prepareColumnItems(columns: IColspanParams[], factory: (options: Partial<ICellOptions<T>>) => Cell<T, Row<T>>): Array<Cell<T, Row<T>>> {
        const columnItems = [];
        for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
            const column = columns[columnIndex];
            const colspan = this._getColspan(column, columnIndex);
            if (colspan) {
                columnIndex += colspan - 1;
            }
            columnItems.push(factory({
                column,
                colspan,
                isFixed: columnIndex < this.getStickyColumnsCount()
            }));
        }
        return columnItems;
    }

    protected _initializeColumns(): void {
        if (this._$columns) {
            const createMultiSelectColumn = this.needMultiSelectColumn();
            // todo Множественный stickyProperties можно поддержать здесь:
            const stickyLadderProperties = this.getStickyLadderProperties(this._$columns[0]);
            const stickyLadderStyleForFirstProperty = stickyLadderProperties &&
                this._getStickyLadderStyle(this._$columns[0], stickyLadderProperties[0]);
            const stickyLadderStyleForSecondProperty = stickyLadderProperties && stickyLadderProperties.length === 2 &&
                this._getStickyLadderStyle(this._$columns[0], stickyLadderProperties[1]);

            this._$columnItems = this._prepareColumnItems(this._$columns, this._getColumnsFactory());


            if (stickyLadderStyleForSecondProperty || stickyLadderStyleForFirstProperty) {
                this._$columnItems[0].setHiddenForLadder(true);
            }

            if (stickyLadderStyleForSecondProperty) {
                this._$columnItems.splice(1, 0, new StickyLadderCell({
                    column: this._$columns[0],
                    owner: this,
                    wrapperStyle: stickyLadderStyleForSecondProperty,
                    contentStyle: `left: -${this._$columns[0].width}; right: 0;`,
                    stickyProperty: stickyLadderProperties[1],
                    stickyHeaderZIndex: 1
                }));
            }

            if (stickyLadderStyleForFirstProperty) {
                this._$columnItems = ([
                    new StickyLadderCell({
                        column: this._$columns[0],
                        owner: this,
                        wrapperStyle: stickyLadderStyleForFirstProperty,
                        contentStyle: stickyLadderStyleForSecondProperty ? `left: 0; right: -${this._$columns[0].width};` : '',
                        stickyProperty: stickyLadderProperties[0],
                        stickyHeaderZIndex: 2
                    })
                ] as Array<Cell<T, Row<T>>>).concat(this._$columnItems);
            }

            if (createMultiSelectColumn) {
                this._$columnItems = ([
                    new CheckboxCell({
                        column: {} as IColumn,
                        owner: this
                    })
                ] as Array<Cell<T, Row<T>>>).concat(this._$columnItems);
            }
        }
    }

    protected _getStickyLadderStyle(column: IColumn, stickyProperty: string): string {
        const stickyLadder = this.getStickyLadder();
        return stickyLadder && stickyLadder[stickyProperty].headingStyle;
    }

    protected _redrawColumns(target: 'first'|'last'|'all'): void {
        if (this._$columnItems) {
            switch (target) {
                case 'first':
                    this._$columnItems[0].nextVersion();
                    break;
                case 'last':
                    this._$columnItems[this.getColumnsCount() - 1].nextVersion();
                    break;
                case 'all':
                    this._$columnItems.forEach((column) => column.nextVersion());
                    break;
            }
        }
    }

    protected _getColumnsFactory(): (options: Partial<ICellOptions<T>>) => Cell<T, Row<T>> {
        if (!this._cellModule) {
            throw new Error('Controls/_display/Row:_getColumnsFactory can not resolve cell module!');
        }
        return (options) => {
            options.owner = this;
            return create(this._cellModule, options as ICellOptions<T>);
        };
    }

    needMultiSelectColumn(): boolean {
        return this._$owner.needMultiSelectColumn();
    }

    getIndex(): number {
        return this._$owner.getRowIndex(this);
    }

    hasColumnScroll(): boolean {
        return this._$owner.hasColumnScroll();
    }

    getStickyColumnsCount(): number {
        return this._$owner.getStickyColumnsCount();
    }

    protected hasItemActionsSeparatedCell(): boolean {
        return this._$owner.hasItemActionsSeparatedCell();
    }

    abstract getContents(): T;
    abstract getOwner(): Collection<T>;
    abstract getMultiSelectVisibility(): string;
    abstract getTemplate(): TemplateFunction | string;
    abstract isEditing(): boolean;
    protected abstract _getCursorClasses(cursor: string, clickable: boolean): string;
    protected abstract _nextVersion(): void;
}

Object.assign(Row.prototype, {
    '[Controls/_display/grid/mixins/Row]': true,
    _cellModule: null,
    _$columns: null,
    _$colspanCallback: null,
    _$columnItems: null
});
