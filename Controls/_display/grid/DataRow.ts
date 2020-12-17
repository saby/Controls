import {TemplateFunction} from 'UI/Base';
import Row, {IOptions as IRowOptions} from './Row';
import DataCell from './DataCell';
import IMarkable from '../interface/IMarkable';
import ISelectableItem from '../interface/ISelectableItem';
import ILadderSupport from './interface/ILadderSupport';
import ItemActionsCell from './ItemActionsCell';

export interface IOptions<T> extends IRowOptions<T> {
}

export default class DataRow<T> extends Row<T> implements IMarkable, ILadderSupport, ISelectableItem {
    protected _$columnItems: Array<DataCell<T, this>>;

    readonly '[Controls/_display/IEditableCollectionItem]': boolean = true;
    readonly LadderSupport = true;
    readonly Markable = true;
    readonly SelectableItem = true;

    constructor(options?: IOptions<T>) {
        super(options);
    }

    getTemplate(itemTemplateProperty: string, userTemplate: TemplateFunction|string): TemplateFunction|string {
        const templateFromProperty = itemTemplateProperty ? this.getContents().get(itemTemplateProperty) : '';
        return templateFromProperty || userTemplate || this.getDefaultTemplate();
    }

    _initializeColumns(): void {
        super._initializeColumns();

        if (this._$columns && this.hasItemActionsSeparatedCell()) {
            this._$columnItems.push(new ItemActionsCell({
                owner: this,
                column: {}
            }))
        }
    }
}

Object.assign(DataRow.prototype, {
    '[Controls/_display/grid/DataRow]': true,
    _moduleName: 'Controls/display:GridDataRow',
    _cellModule: 'Controls/display:GridDataCell',
    _instancePrefix: 'grid-data-row-'
});
