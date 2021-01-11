import { TemplateFunction } from 'UI/Base';
import { Model as EntityModel } from 'Types/entity';
import Collection from './Collection';
import Row from './Row';
import { IColumn } from 'Controls/grid';
import { TColspanCallbackResult, TResultsColspanCallback } from './mixins/Grid';
import ResultsCell from 'Controls/_display/grid/ResultsCell';
import Cell from 'Controls/_display/grid/Cell';
import ItemActionsCell from 'Controls/_display/grid/ItemActionsCell';


export type TResultsPosition = 'top' | 'bottom';

export interface IOptions<T> {
    owner: Collection<T>;
    resultsTemplate: TemplateFunction;
    results: EntityModel;
    resultsColspanCallback?: TResultsColspanCallback;
}

export default class ResultsRow<T> extends Row<T> {
    protected _$results: EntityModel;
    protected _$resultsTemplate: TemplateFunction;
    protected _$resultsColspanCallback: TResultsColspanCallback;

    constructor(options?: IOptions<T>) {
        super(options);
    }

    getContents(): T {
        return 'results' as unknown as T
    }

    isSticked(): boolean {
        return this.isStickyHeader() && this.getResultsPosition() === 'top';
    }

    getItemClasses(): string {
        return `controls-Grid__results`;
    }

    getResults(): EntityModel {
        return this._$results;
    }

    setResultsColspanCallback(resultsColspanCallback: TResultsColspanCallback): void {
        this._$resultsColspanCallback = resultsColspanCallback;
        this._reinitializeColumns();
    }

    protected _getColspan(column: IColumn, columnIndex: number): TColspanCallbackResult {
        const colspanCallback = this._$resultsColspanCallback;
        if (colspanCallback) {
            return colspanCallback(column, columnIndex);
        }
        return undefined;
    }
    protected _processStickyLadderCells(): void {
        // todo Множественный stickyProperties можно поддержать здесь:
        const stickyLadderProperties = this.getStickyLadderProperties(this._$columns[0]);
        const stickyLadderCellsCount = stickyLadderProperties && stickyLadderProperties.length || 0;

        if (stickyLadderCellsCount) {
            this._$columnItems.splice(1, 0, new ResultsCell({
                column: this._$columns[0],
                ladderCell: true,
                owner: this
            }));
        }

        if (stickyLadderCellsCount === 2) {
            this._$columnItems = ([
                new ResultsCell({
                    column: this._$columns[0],
                    ladderCell: true,
                    owner: this
                })
            ] as Array<Cell<T, Row<T>>>).concat(this._$columnItems);
        }
    }

    protected _initializeColumns(): void {
        if (this._$columns) {
            const factory = this._getColumnsFactory();

            if (this._$resultsTemplate) {
                this._$columnItems = [factory({
                    column: {
                        resultTemplate: this._$resultsTemplate
                    },
                    colspan: this._$owner.getColumnsConfig().length
                })];
            } else {
                this._$columnItems = this._prepareColumnItems(this._$columns, factory);
            }

            this._processStickyLadderCells();
            if (this._$columns && this.hasItemActionsSeparatedCell()) {
                this._$columnItems.push(new ItemActionsCell({
                    owner: this,
                    column: {}
                }));
            }
            if (this._$owner.hasMultiSelectColumn()) {
                this._$columnItems.unshift(factory({
                    column: {}
                }));
            }
        }
    }
}

Object.assign(ResultsRow.prototype, {
    '[Controls/_display/grid/ResultsRow]': true,
    _moduleName: 'Controls/display:GridResults',
    _cellModule: 'Controls/display:GridResultsCell',
    _$results: null,
    _$resultsTemplate: null,
    _$resultsColspanCallback: null
});
