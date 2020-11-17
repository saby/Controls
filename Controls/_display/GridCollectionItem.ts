import CollectionItem, { IOptions as IBaseOptions } from './CollectionItem';
import GridCollection from './GridCollection';
import GridColumn, { IOptions as IGridColumnOptions } from './GridColumn';
import { IColumn, TColumns } from 'Controls/grid';
import GridCheckboxColumn from './GridCheckboxColumn';
import GridHeader from './GridHeader';
import { TResultsPosition } from './GridResults';
import GridStickyLadderColumn from './GridStickyLadderColumn';
import {INavigationOptionValue} from 'Controls/_interface/INavigation';

export interface IOptions<T> extends IBaseOptions<T> {
    owner: GridCollection<T>;
    columns: TColumns;
}

export default class GridCollectionItem<T> extends CollectionItem<T> {
    protected _$owner: GridCollection<T>;
    protected _$columns: TColumns;
    protected _$columnItems: GridColumn<T>[];
    protected _$ladder: {};

    readonly '[Controls/_display/ILadderedCollectionItem]': boolean = true;

    constructor(options?: IOptions<T>) {
        super(options);
    }

    getItemClasses(templateHighlightOnHover: boolean = true,
                   theme: string = 'default',
                   style: string = 'default',
                   cursor: string = 'pointer',
                   clickable: boolean = true,
                   navigation: INavigationOptionValue = null): string {
        const isLastItem = (!navigation || navigation.view !== 'infinity' || !this.getOwner().getHasMoreData()) &&
            (this.getOwner().getItems()[this.getOwner().getCount() - 1] === this);

        let itemClasses = `controls-ListView__itemV ${this._getCursorClasses(cursor, clickable)}`;

        itemClasses += ` controls-Grid__row controls-Grid__row_${style}_theme-${theme}`;

        if (templateHighlightOnHover !== false && !this.isEditing()) {
            itemClasses += ` controls-Grid__row_highlightOnHover_${style}_theme-${theme}`;
        }

        if (isLastItem) {
            itemClasses += ' controls-Grid__row_last';
        }

        return itemClasses;
    }

    getColumns(): Array<GridColumn<T>> {
        if (!this._$columnItems) {
            this._initializeColumns();
        }
        return this._$columnItems;
    }

    getColumnsCount(): number {
        return this._$columns.length;
    }

    getColumnIndex(column: IColumn): number {
        return this._$columns.indexOf(column);
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

    getHeader(): GridHeader<T> {
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

    getLadderWrapperClasses(ladderProperty: string, stickyProperty: string): string {
        let ladderWrapperClasses = 'controls-Grid__row-cell__ladder-content';
        const ladder = this.getLadder();
        const stickyLadder = this.getStickyLadder();
        const stickyProperties = this.getStickyLadderProperties(this._$columns[0]);
        const index = stickyProperties.indexOf(stickyProperty);
        const hasMainCell = !!(stickyLadder[stickyProperties[0]].ladderLength);

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

    setLadder(ladder: {}) {
        if (this._$ladder !== ladder) {
            this._$ladder = ladder;
            this._reinitializeColumns();
        }
    }

    setMultiSelectVisibility(multiSelectVisibility: string): boolean {
        const isChangedMultiSelectVisibility = super.setMultiSelectVisibility(multiSelectVisibility)
        if (isChangedMultiSelectVisibility) {
            this._reinitializeColumns();
        }
        return isChangedMultiSelectVisibility;
    }

    setColumns(newColumns: TColumns): void {
        if (this._$columns !== newColumns) {
            this._$columns = newColumns;
            this._nextVersion();
            this._reinitializeColumns();
        }
    }

    // region overrides

    setMarked(marked: boolean, silent?: boolean): void {
        const changed = marked !== this.isMarked();
        super.setMarked(marked, silent);
        if (changed) {
            this._redrawColumns('first');
        }
    }

    setSelected(selected: boolean|null, silent?: boolean): void {
        const changed = this._$selected !== selected;
        super.setSelected(selected, silent);
        if (changed) {
            this._redrawColumns('first');
        }
    }

    setActive(active: boolean, silent?: boolean): void {
        const changed = active !== this.isActive();
        super.setActive(active, silent);
        if (changed) {
            this._redrawColumns('all');
        }
    }

    // endregion

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
            this._$columnItems.forEach((columnItem) => {
                columnItem.destroy();
            });
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
                this._$columnItems.splice(1,0,new GridStickyLadderColumn({
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
                    new GridStickyLadderColumn({
                        column: this._$columns[0],
                        owner: this,
                        wrapperStyle: stickyLadderStyleForFirstProperty,
                        contentStyle: stickyLadderStyleForSecondProperty ? `left: 0; right: -${this._$columns[0].width};` : '',
                        stickyProperty: stickyLadderProperties[0],
                        stickyHeaderZIndex: 2
                    })
                ] as GridColumn<T>[]).concat(this._$columnItems);
            }

            if (createMultiSelectColumn) {
                this._$columnItems = ([
                    new GridCheckboxColumn({
                        column: {} as IColumn,
                        owner: this
                    })
                ] as GridColumn<T>[]).concat(this._$columnItems);
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

    protected _getColumnsFactory(): (options: Partial<IGridColumnOptions<T>>) => GridColumn<T> {
        return (options) => {
            options.owner = this;
            return new GridColumn(options as IGridColumnOptions<T>);
        };
    }
}

Object.assign(GridCollectionItem.prototype, {
    '[Controls/_display/GridCollectionItem]': true,
    _moduleName: 'Controls/display:GridCollectionItem',
    _instancePrefix: 'grid-item-',
    _$columns: null,
    _$columnItems: null
});
