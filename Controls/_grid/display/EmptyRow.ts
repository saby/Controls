import { IColumn } from './interface/IColumn';
import Row, {IOptions as IBaseRowOptions} from './Row';
import {IItemTemplateParams} from './mixins/Row';
import {TColspanCallbackResult} from './mixins/Grid';

class EmptyRow<T> extends Row<T> {

    getContents(): string {
        return 'emptyRow';
    }

    getItemClasses(params: IItemTemplateParams = {theme: 'default'}): string {
        return 'js-controls-GridView__emptyTemplate'
            + ' controls-GridView__emptyTemplate'
            + ` ${this._getBaseItemClasses(params.style, params.theme)}`;
    }

    //region Аспект "Колонки. Создание, колспан."
    _initializeColumns(): void {
        super._initializeColumns({
            shouldAddStickyLadderCells: !this._$rowTemplate,
            shouldAddMultiSelectCell: !this._$rowTemplate,
            extensionCellsConstructors: {
                multiSelectCell: this.getColumnsFactory({column: {}})
            }
        });
    }

    protected _getColspan(column: IColumn, columnIndex: number): TColspanCallbackResult {
        return column.endColumn - column.startColumn;
    }

    //endregion
}

Object.assign(EmptyRow.prototype, {
    '[Controls/_display/grid/EmptyRow]': true,
    _moduleName: 'Controls/grid:GridEmptyRow',
    _cellModule: 'Controls/grid:GridEmptyCell',
    _instancePrefix: 'grid-empty-row-'
});

export default EmptyRow;
export {
    EmptyRow,
    IBaseRowOptions as IEmptyRowOptions
};
