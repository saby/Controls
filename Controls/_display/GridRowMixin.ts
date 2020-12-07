import { IColumn, TColumns, IColspanParams } from 'Controls/_grid/interface/IColumn';
import GridHeaderRow from './GridHeaderRow';
import GridCollection from './GridCollection';
import { TemplateFunction } from 'UI/Base';
import GridCell, { IOptions as IGridCellOptions } from './GridCell';
import { TResultsPosition } from './GridResultsRow';
import GridStickyLadderCell from './GridStickyLadderCell';
import { create } from 'Types/di';
import prepareColumns from './utils/GridColspanUtil';
import GridCheckboxCell from './GridCheckboxCell';
import GridRow from './GridRow';
import { IOptions as IBaseOptions } from './CollectionItem';

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
}

export default abstract class GridRowMixin<T> {
    readonly '[Controls/_display/GridRowMixin]': boolean;
    readonly '[Controls/_display/ILadderedCollectionItem]': boolean;

    // По умолчанию любая абстрактная строка таблицы не имеет возможности редактироваться.
    // Данная возможность доступна только строке с данными.
    readonly '[Controls/_display/IEditableCollectionItem]': boolean;

    protected _$owner: GridCollection<T>;
    protected _cellModule: string;

    protected _$columns: TColumns;
    protected _$columnItems: Array<GridCell<T, GridRow<T>>>;
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

    getColumns(): Array<GridCell<T, GridRow<T>>> {
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

    getColumnIndex(column: GridCell<T, GridRow<T>>): number {
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

    getHeader(): GridHeaderRow<T> {
        return this._$owner.getHeader();
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

    protected _reinitializeColumns(): void {
        if (this._$columnItems) {
            this._initializeColumns();
            this._nextVersion();
        }
    }

    protected _initializeColumns(): void {
        if (this._$columns) {
            const createMultiSelectColumn = this.getMultiSelectVisibility() !== 'hidden';
            // todo Множественный stickyProperties можно поддержать здесь:
            const stickyLadderProperties = this.getStickyLadderProperties(this._$columns[0]);
            const stickyLadderStyleForFirstProperty = stickyLadderProperties &&
                this._getStickyLadderStyle(this._$columns[0], stickyLadderProperties[0]);
            const stickyLadderStyleForSecondProperty = stickyLadderProperties && stickyLadderProperties.length === 2 &&
                this._getStickyLadderStyle(this._$columns[0], stickyLadderProperties[1]);
            const factory = this._getColumnsFactory();

            this._$columnItems = this._$columns.map((column) => factory({ column }));

            if (stickyLadderStyleForSecondProperty || stickyLadderStyleForFirstProperty) {
                this._$columnItems[0].setHiddenForLadder(true);
            }

            if (stickyLadderStyleForSecondProperty) {
                this._$columnItems.splice(1, 0, new GridStickyLadderCell({
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
                    new GridStickyLadderCell({
                        column: this._$columns[0],
                        owner: this,
                        wrapperStyle: stickyLadderStyleForFirstProperty,
                        contentStyle: stickyLadderStyleForSecondProperty ? `left: 0; right: -${this._$columns[0].width};` : '',
                        stickyProperty: stickyLadderProperties[0],
                        stickyHeaderZIndex: 2
                    })
                ] as Array<GridCell<T, GridRow<T>>>).concat(this._$columnItems);
            }

            if (createMultiSelectColumn) {
                this._$columnItems = ([
                    new GridCheckboxCell({
                        column: {} as IColumn,
                        owner: this
                    })
                ] as Array<GridCell<T, GridRow<T>>>).concat(this._$columnItems);
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

    prepareColspanedColumns<TColumn>(columns: TColumn & IColspanParams[]): Array<TColumn & Required<IColspanParams>> {
        return prepareColumns({
            columns,
            hasMultiSelect: this.getMultiSelectVisibility() !== 'hidden',
            gridColumnsCount: this._$owner.getColumnsConfig().length
        });
    }

    protected _getColumnsFactory(): (options: Partial<IGridCellOptions<T>>) => GridCell<T, GridRow<T>> {
        if (!this._cellModule) {
            throw new Error('Controls/_display/GridRow:_getColumnsFactory can not resolve cell module!');
        }
        return (options) => {
            options.owner = this;
            return create(this._cellModule, options as IGridCellOptions<T>);
        };
    }

    getIndex(): number {
        return this._$owner.getRowIndex(this);
    }

    abstract getOwner(): GridCollection<T>;
    abstract getMultiSelectVisibility(): string;
    abstract getTemplate(): TemplateFunction | string;
    abstract isEditing(): boolean;
    protected abstract _getCursorClasses(cursor: string, clickable: boolean): string;
    protected abstract _nextVersion(): void;
}

Object.assign(GridRowMixin.prototype, {
    '[Controls/_display/GridRowMixin]': true,
    '[Controls/_display/ILadderedCollectionItem]': true,
    '[Controls/_display/IEditableCollectionItem]': false,
    _cellModule: null,
    _$columns: null,
    _$columnItems: null
});
