import {IColumn} from 'Controls/interface';
import Row from './Row';
import {IItemTemplateParams} from './mixins/Row';
import {TColspanCallbackResult} from './mixins/Grid';

export default class EmptyRow<T> extends Row<T> {

    getContents(): string {
        return 'emptyRow';
    }

    getItemClasses(params: IItemTemplateParams = {theme: 'default'}): string {
        return 'js-controls-GridView__emptyTemplate'
            + ' controls-GridView__emptyTemplate'
            + ` ${this._getBaseItemClasses(params.style, params.theme)}`;
    }

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
}

Object.assign(EmptyRow.prototype, {
    '[Controls/_display/grid/EmptyRow]': true,
    _moduleName: 'Controls/gridNew:GridEmptyRow',
    _cellModule: 'Controls/gridNew:GridEmptyCell',
    _instancePrefix: 'grid-empty-row-'
});
