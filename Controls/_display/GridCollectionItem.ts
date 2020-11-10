import CollectionItem, { IOptions as IBaseOptions } from './CollectionItem';
import GridCollection from './GridCollection';
import GridColumn, { IOptions as IGridColumnOptions } from './GridColumn';
import { IColumn, TColumns } from 'Controls/grid';
import GridLadderColumn from "./GridLadderColumn";
import GridCheckboxColumn from "./GridCheckboxColumn";

export interface IOptions<T> extends IBaseOptions<T> {
    owner: GridCollection<T>;
    columns: TColumns;
}

export default class GridCollectionItem<T> extends CollectionItem<T> {
    protected _$owner: GridCollection<T>;
    protected _$columns: TColumns;
    protected _$columnItems: GridColumn<T>[];

    constructor(options?: IOptions<T>) {
        super(options);
    }

    getItemClasses(templateHighlightOnHover: boolean = true,
                   theme: string = 'default',
                   style: string = 'default',
                   cursor: string = 'pointer',
                   clickable: boolean = true): string {
        /* todo (!navigation || navigation.view !== 'infinity' || !this.getHasMoreData()) &&
                (this.getCount() - 1 === current.index)*/
        const isLastItem = false;

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

    getLadderWrapperClasses(ladderProperty: string): string {
        let ladderWrapperClasses = 'controls-Grid__row-cell__ladder-content';
        const ladder = this._$owner.getLadder(this);
        if (ladder && !(ladder[ladderProperty].ladderLength >= 1)) {
            ladderWrapperClasses += ' controls-Grid__row-cell__ladder-content_hiddenForLadder';
        }
        return ladderWrapperClasses;
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

    protected _initializeColumns(): void {
        if (this._$columns) {
            const createMultiSelectColumn = this.getMultiSelectVisibility() !== 'hidden';
            // todo Множественный stickyProperties можно поддержать здесь:
            const stickyLadderStyle = this._getStickyLadderStyle(this._$columns[0]);
            const createLadderColumn = !!stickyLadderStyle;
            const factory = this._getColumnsFactory();

            this._$columnItems = this._$columns.map((column) => factory({ column }));

            if (createLadderColumn) {
                // todo ladderFactory сделать через наследование от базового columnFactory, т.к. row span нужен только
                //      для лесенки (будет ли он нужен для обычных строк и как он будет работать в таком случае?)
                this._$columnItems[0].setHiddenForLadder(true);
                this._$columnItems = ([
                    new GridLadderColumn({
                        column: this._$columns[0],
                        owner: this,
                        style: stickyLadderStyle
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

    protected _getStickyLadderStyle(column: IColumn): string {
        let stickyProperties = column && column.stickyProperty;
        if (stickyProperties && !(stickyProperties instanceof Array)) {
            stickyProperties = [stickyProperties];
        }
        if (!stickyProperties) {
            return '';
        }
        // todo Множественный stickyProperties можно поддержать здесь:
        const stickyLadder = this._$owner.getStickyLadder(this);
        const stickyColumn = this._$owner.getStickyColumn();
        return stickyColumn && stickyColumn.index === 0 &&
               stickyLadder && stickyLadder[stickyProperties[0]].headingStyle;
    }

    protected _redrawColumns(target: 'first'|'last'|'all'): void {
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
