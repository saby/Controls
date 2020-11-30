import GridRow, {IOptions as IGridRowOptions} from './GridRow';
import GridDataCell from './GridDataCell';
import GridStickyLadderCell from "Controls/_display/GridStickyLadderCell";
import GridCell from "Controls/_display/GridCell";
import GridCheckboxCell from "Controls/_display/GridCheckboxCell";
import {IColumn} from "Controls/_grid/interface/IColumn";

export interface IOptions<T> extends IGridRowOptions<T> {
}

export default class GridDataRow<T> extends GridRow<T> {
    protected _$columnItems: Array<GridDataCell<T, this>>;

    readonly '[Controls/_display/IEditableCollectionItem]': boolean = true;

    constructor(options?: IOptions<T>) {
        super(options);
    }

    protected _initializeColumns(): boolean {
        if (this._$columns) {
            const createMultiSelectColumn = this.getMultiSelectVisibility() !== 'hidden';
            const factory = this._getColumnsFactory();

            if (this._$templateParams.colspan) {
                this._$columnItems = [factory({
                    column: {
                        template: this._$templateParams.colspanTemplate || this._$templateParams.content,
                        colspan: this._$owner.getColumnsConfig().length
                    }
                })];
            } else {
                // todo Множественный stickyProperties можно поддержать здесь:
                const stickyLadderProperties = this.getStickyLadderProperties(this._$columns[0]);
                const stickyLadderStyleForFirstProperty = stickyLadderProperties &&
                    this._getStickyLadderStyle(this._$columns[0], stickyLadderProperties[0]);
                const stickyLadderStyleForSecondProperty = stickyLadderProperties && stickyLadderProperties.length === 2 &&
                    this._getStickyLadderStyle(this._$columns[0], stickyLadderProperties[1]);

                this._$columnItems = this._$columns.map((column) => factory({column}));

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
            }

            if (createMultiSelectColumn) {
                this._$columnItems = ([
                    new GridCheckboxCell({
                        column: {} as IColumn,
                        owner: this
                    })
                ] as Array<GridCell<T, GridRow<T>>>).concat(this._$columnItems);
            }

            return true;
        }
        return false;
    }
}

Object.assign(GridRow.prototype, {
    '[Controls/_display/GridDataRow]': true,
    _moduleName: 'Controls/display:GridDataRow',
    _cellModule: 'Controls/display:GridDataCell',
    _instancePrefix: 'grid-data-row-'
});
