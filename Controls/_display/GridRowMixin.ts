import { IColumn, TColumns, IColspanParams } from 'Controls/_grid/interface/IColumn';
import GridHeaderRow from './GridHeaderRow';
import GridCollection from './GridCollection';
import { TemplateFunction } from 'UI/Base';
import GridCell, { IOptions as IGridCellOptions } from './GridCell';
import { TResultsPosition } from './GridResultsRow';
import { create } from 'Types/di';
import prepareColumns from './utils/GridColspanUtil';
import GridRow from './GridRow';
import { IOptions as IBaseOptions } from './CollectionItem';


interface IItemTemplateParams {
    content?: TemplateFunction;
    colspan?: boolean;
    colspanTemplate?: TemplateFunction;

    highlightOnHover: boolean;
    theme: string;
    style: string;
    cursor: 'default' | 'pointer';
    backgroundColorStyle: string
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

    protected _$templateParams: IItemTemplateParams;

    getDefaultTemplate(): TemplateFunction | string {
        return 'Controls/gridNew:ItemTemplate';
    }

    setTemplateParams(params: IItemTemplateParams): void {
        const oldParams: Partial<IItemTemplateParams> = this._$templateParams || {};
        this._$templateParams = this._getInitializedItemTemplateParams(params);

        // TODO: Здесь инвалидйтить все, что нужно
        if (oldParams.colspan !== this._$templateParams.colspan) {
            this._reinitializeColumns() || this._initializeColumns();
        }
    }

    protected _getInitializedItemTemplateParams(params: IItemTemplateParams): IItemTemplateParams {
        if (params.colspan && !params.colspanTemplate && !params.content) {
            // TODO: Написать норм ошибку
            throw Error('При колспане необходим контент!');
        }

        // TODO: Здесь можно валидировать опции шаблона.

        return {
            colspan: params.colspan || undefined,
            content: params.content || undefined,
            colspanTemplate: params.colspanTemplate,
            backgroundColorStyle: params.backgroundColorStyle || 'default',
            style: params.style || 'default',
            theme: params.theme || 'default',
            cursor: params.cursor || 'pointer',
            highlightOnHover: params.highlightOnHover || true
        }
    }

    getItemClasses(): string {
        const {style, theme, highlightOnHover} = this._$templateParams;
        const navigation = this.getOwner().getNavigation();
        const isLastItem = (!navigation || navigation.view !== 'infinity' || !this.getOwner().getHasMoreData())
            && this.isLastItem();
        let itemClasses = `controls-ListView__itemV ${this._getCursorClasses(this._$templateParams.cursor)}`;

        itemClasses += ` controls-Grid__row controls-Grid__row_${style}_theme-${theme}`;

        if (highlightOnHover !== false && !this.isEditing()) {
            itemClasses += ` controls-Grid__row_highlightOnHover_${style}_theme-${theme}`;
        }

        if (isLastItem) {
            itemClasses += ' controls-Grid__row_last';
        }

        return itemClasses;
    }

    isLastItem(): boolean {
        return (this.getOwner().getItems()[this.getOwner().getCount() - 1] === this);
    }

    getColumns(): Array<GridCell<T, GridRow<T>>> {
        if (!this._$columnItems) {
            this._initializeColumns();
        }
        return this._$columnItems;
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

    protected _reinitializeColumns(): boolean {
        if (this._$columnItems) {
            const result = this._initializeColumns();
            this._nextVersion();
            return result;
        }
        return false;
    }

    abstract _initializeColumns(): boolean;

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

    abstract getOwner(): GridCollection<T>;
    abstract getMultiSelectVisibility(): string;
    abstract isEditing(): boolean;
    protected abstract _getCursorClasses(cursor: string, clickable?: boolean): string;
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
