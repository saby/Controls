import {TemplateFunction} from 'UI/Base';

import {IMarkable, ISelectableItem} from 'Controls/display';

import Row, {IOptions as IRowOptions} from './Row';
import DataCell from './DataCell';
import ILadderSupport from './interface/ILadderSupport';
import ItemActionsCell from './ItemActionsCell';

export interface IOptions<T> extends IRowOptions<T> {
}

export default class DataRow<T> extends Row<T> implements IMarkable, ILadderSupport, ISelectableItem {
    protected _$columnItems: Array<DataCell<T, this>>;

    readonly '[Controls/_display/IEditableCollectionItem]': boolean = true;
    readonly LadderSupport: boolean = true;
    readonly Markable: boolean = true;
    readonly SelectableItem: boolean = true;
    readonly DraggableItem: boolean = true;
    private _$editingColumnIndex: number;

    constructor(options?: IOptions<T>) {
        super(options);
    }

    getTemplate(itemTemplateProperty: string, userTemplate: TemplateFunction|string): TemplateFunction|string {
        const templateFromProperty = itemTemplateProperty ? this.getContents().get(itemTemplateProperty) : '';
        return templateFromProperty || userTemplate || this.getDefaultTemplate();
    }

    protected _initializeColumns(): void {
        super._initializeColumns();

        if (this._$columns && this.hasItemActionsSeparatedCell()) {
            this._$columnItems.push(new ItemActionsCell({
                owner: this,
                isFixed: true,
                column: {}
            }))
        }
    }

    setEditing(editing: boolean, editingContents?: T, silent?: boolean, columnIndex?: number): void {
        super.setEditing(editing, editingContents, silent, columnIndex);
        if (typeof columnIndex === 'number' && this._$editingColumnIndex !== columnIndex) {
            this._$editingColumnIndex = columnIndex;
        }
        this._reinitializeColumns();
    }

    getEditingColumnIndex(): number {
        return this._$editingColumnIndex;
    }
}

Object.assign(DataRow.prototype, {
    '[Controls/_display/grid/DataRow]': true,
    _moduleName: 'Controls/gridNew:GridDataRow',
    _cellModule: 'Controls/gridNew:GridDataCell',
    _instancePrefix: 'grid-data-row-',
    _$editingColumnIndex: null
});
