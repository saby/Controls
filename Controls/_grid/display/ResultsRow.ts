import {Model as EntityModel} from 'Types/entity';
import Row, {IOptions as IBaseRowOptions} from './Row';
import {IColumn, TColumns} from 'Controls/interface';
import {TColspanCallback, TResultsColspanCallback} from './mixins/Grid';
import ResultsCell from './ResultsCell';

export type TResultsPosition = 'top' | 'bottom';

export interface IOptions<T> extends IBaseRowOptions<T> {
    metaResults: EntityModel;

    //TODO: Здась другой тип, нужно внутри библиотеки переписать тип, добавить какой то абстрактный
    // колбек или поиграться с типом входных параметров.
    colspanCallback: TResultsColspanCallback;
}

export default class ResultsRow<T> extends Row<T> {
    protected _$metaResults: EntityModel;

    constructor(options?: IOptions<T>) {
        super({
            ...options,
            columns: options.columns.map((column) => ({...column, template: column.resultTemplate})),
            colspanCallback: ResultsRow._convertColspanCallback(options.colspanCallback)
        });
    }

    //region Overrides
    getContents(): T {
        return 'results' as unknown as T;
    }

    isSticked(): boolean {
        return this.isStickyHeader();
    }

    //endregion

    //region Аспект "Стилевое оформление"
    getItemClasses(): string {
        return 'controls-Grid__results';
    }

    //endregion

    //region Аспект "Результаты из метаданных"
    getMetaResults(): EntityModel {
        return this._$metaResults;
    }

    setMetaResults(metaResults: EntityModel): void {
        this._$metaResults = metaResults;
        this._$columnItems.forEach((c) => {
            if (c['[Controls/_display/grid/ResultsCell]']) {
                (c as unknown as ResultsCell<T>).setMetaResults(metaResults);
            }
        });
        this._nextVersion();
    }

    //endregion

    //region Аспект "Колонки. Создание, колспан."
    setColumns(newColumns: TColumns): void {
        super.setColumns(newColumns.map((column) => ({...column, template: column.resultTemplate})));
    }

    protected _initializeColumns(): void {
        super._initializeColumns({
            shouldAddStickyLadderCells: !this._$rowTemplate,
            addEmptyCellsForStickyLadder: true,
            extensionCellsConstructors: {
                stickyLadderCell: ResultsCell,
                multiSelectCell: this.getColumnsFactory({column: {}})
            }
        });
    }

    setColspanCallback(colspanCallback: TResultsColspanCallback): void {
        super.setColspanCallback(ResultsRow._convertColspanCallback(colspanCallback));
    }

    private static _convertColspanCallback(colspanCallback: TResultsColspanCallback): TColspanCallback {
        return colspanCallback ? (item, column, columnIndex, isEditing) => {
            return colspanCallback(column, columnIndex);
        } : undefined;
    }

    protected _getColumnFactoryParams(column: IColumn, columnIndex: number): Partial<IOptions<any>> & { metaResults: EntityModel<any> } {
        return {
            ...super._getColumnFactoryParams(column, columnIndex),
            metaResults: this.getMetaResults()
        };
    }

    //endregion
}

Object.assign(ResultsRow.prototype, {
    '[Controls/_display/grid/ResultsRow]': true,
    _moduleName: 'Controls/gridNew:GridResults',
    _cellModule: 'Controls/gridNew:GridResultsCell',
    _$metaResults: null
});
