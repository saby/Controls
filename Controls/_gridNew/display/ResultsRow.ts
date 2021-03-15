import { TemplateFunction } from 'UI/Base';
import { Model as EntityModel } from 'Types/entity';
import Collection from './Collection';
import Row from './Row';
import { IColumn } from 'Controls/interface';
import { TColspanCallbackResult, TResultsColspanCallback } from './mixins/Grid';
import ResultsCell from './ResultsCell';
import Cell from './Cell';
import ItemActionsCell from './ItemActionsCell';

export type TResultsPosition = 'top' | 'bottom';

export interface IOptions<T> {
    owner: Collection<T>;
    resultsTemplate: TemplateFunction;
    metaResults: EntityModel;
    resultsColspanCallback?: TResultsColspanCallback;
}

export default class ResultsRow<T> extends Row<T> {
    protected _$metaResults: EntityModel;
    protected _$resultsTemplate: TemplateFunction;
    protected _$resultsColspanCallback: TResultsColspanCallback;

    constructor(options?: IOptions<T>) {
        super(options);
    }

    getContents(): T {
        return 'results' as unknown as T
    }

    isSticked(): boolean {
        return this.isStickyHeader();
    }

    getItemClasses(): string {
        return `controls-Grid__results`;
    }

    getMetaResults(): EntityModel {
        return this._$metaResults;
    }

    setMetaResults(metaResults: EntityModel): void {
        this._$metaResults = metaResults;
        this._$columnItems.forEach((c) => (c as ResultsCell<T>).setMetaResults(metaResults));
        this._nextVersion();
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
            const factory = this.getColumnsFactory();
            const metaResults = this.getMetaResults();

            if (this._$resultsTemplate) {
                this._$columnItems = [factory({
                    column: {
                        resultTemplate: this._$resultsTemplate
                    },
                    colspan: this._$owner.getColumnsConfig().length,
                    metaResults
                })];
            } else {
                this._$columnItems = this._prepareColumnItems(this._$columns, (options) => {
                    return factory({
                        ...options,
                        metaResults
                    })
                });
            }

            if (this._$owner.isFullGridSupport()) {
                this._processStickyLadderCells();
            }

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
    _moduleName: 'Controls/gridNew:GridResults',
    _cellModule: 'Controls/gridNew:GridResultsCell',
    _$metaResults: null,
    _$resultsTemplate: null,
    _$resultsColspanCallback: null
});
