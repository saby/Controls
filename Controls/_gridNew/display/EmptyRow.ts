import {TemplateFunction} from 'UI/Base';
import {IColspanParams, IColumn} from 'Controls/grid';

import Row, {IOptions as IRowOptions} from './Row';
import EmptyCell from './EmptyCell';
import {IItemTemplateParams} from './mixins/Row';
import {TColspanCallbackResult} from './mixins/Grid';

export interface IOptions<T> extends IRowOptions<T> {
}

export default class EmptyRow<T> extends Row<T> {
    protected _$columnItems: Array<EmptyCell<T>>;
    protected _$emptyTemplate: TemplateFunction;
    protected _$emptyTemplateColumns: Array<{
        template: TemplateFunction
    } & IColspanParams>;

    getContents(): T {
        return 'emptyRow' as unknown as T
    }

    getItemClasses(params: IItemTemplateParams = { theme: 'default' }): string {
        return `${this._getBaseItemClasses(params.style, params.theme)}`
            + ' js-controls-GridView__emptyTemplate controls-GridView__emptyTemplate';
    }

    setEmptyTemplate(emptyTemplate): void {
        this._$emptyTemplate = emptyTemplate;
        this._$columnItems = null;
        this._nextVersion();
    }

    _initializeColumns(): void {
        this._$columnItems = [];

        if (!(this._$emptyTemplate || this._$emptyTemplateColumns)) {
            return;
        }

        const factory = this._getColumnsFactory();

        if (this._$emptyTemplate) {
            const columns = this._$owner.getColumnsConfig();
            let endColumn = columns.length + 1;

            // todo Множественный stickyProperties можно поддержать здесь:
            const stickyLadderProperties = this.getStickyLadderProperties(columns[0]);
            const stickyLadderCellsCount = stickyLadderProperties && stickyLadderProperties.length || 0;

            if (stickyLadderCellsCount) {
                endColumn += stickyLadderCellsCount;
            }

            this._$columnItems = this._prepareColumnItems([{
                template: this._$emptyTemplate,
                startColumn: 1,
                endColumn
            }], (options) => {
                return factory({
                    ...options,
                    isFullColspan: true
                })
            });
        } else {
            this._$columnItems = this._prepareColumnItems(this._$emptyTemplateColumns, factory);
        }

        if (this._$owner.hasMultiSelectColumn()) {
            this._$columnItems.unshift(new factory({
                column: {}
            }));
        }
    }

    protected _getColspan(column: IColumn, columnIndex: number): TColspanCallbackResult {
        return column.endColumn - column.startColumn;
    }
}

Object.assign(EmptyRow.prototype, {
    '[Controls/_display/grid/EmptyRow]': true,
    _moduleName: 'Controls/gridNew:GridEmptyRow',
    _cellModule: 'Controls/gridNew:GridEmptyCell',
    _instancePrefix: 'grid-empty-row-',
    _$emptyTemplate: null,
    _$emptyTemplateColumns: null
});
