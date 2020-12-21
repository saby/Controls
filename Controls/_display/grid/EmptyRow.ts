import {TemplateFunction} from 'UI/Base';
import Row, {IOptions as IRowOptions} from './Row';
import EmptyCell from './EmptyCell';
import {IItemTemplateParams} from './mixins/Row';
import { IColspanParams } from 'Controls/grid';


export interface IOptions<T> extends IRowOptions<T> {
}

export default class EmptyRow<T> extends Row<T> {
    protected _$columnItems: Array<EmptyCell<T>>;
    protected _$emptyTemplate: TemplateFunction;
    protected _$emptyColumns: Array<{
        template: TemplateFunction
    } & IColspanParams>;

    getContents(): T {
        return 'emptyRow' as unknown as T
    }

    getItemClasses(params: IItemTemplateParams = { theme: 'default' }): string {
        return `${this._getBaseItemClasses(params.style, params.theme)}`
            + ' js-controls-GridView__emptyTemplate controls-GridView__emptyTemplate';
    }

    _initializeColumns(): void {
        this._$columnItems = [];

        if (!(this._$emptyTemplate || this._$emptyColumns)) {
            return;
        }

        const factory = this._getColumnsFactory();

        if (this._$owner.needMultiSelectColumn()) {
            this._$columnItems.push(new factory({
                column: {},
                isCheckBoxCell: true
            }));
        }

        if (this._$emptyTemplate) {
            this._$columnItems.push(new factory({
                column: {
                    template: this._$emptyTemplate,
                    startColumn: 1,
                    endColumn: super.getColumnsConfig().length + 1,
                },
                isFullColspan: true
            }));
        } else {
            this._$emptyColumns.forEach((column) => {
                this._$columnItems.push(new factory({ column }));
            })
        }
    }
}

Object.assign(EmptyRow.prototype, {
    '[Controls/_display/grid/EmptyRow]': true,
    _moduleName: 'Controls/display:GridEmptyRow',
    _cellModule: 'Controls/display:GridEmptyCell',
    _instancePrefix: 'grid-empty-row-',
    _$emptyTemplate: null,
    _$emptyColumns: null
});
