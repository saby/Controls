import {TreeItem as BaseCollectionItem, ICollectionItemOptions as IBaseOptions} from 'Controls/display';
import Collection from './Collection';

export interface IOptions<T> extends IBaseOptions<T> {
    columnProperty: number;
    column: number;
}

export default class CollectionItem<T> extends BaseCollectionItem<T> {
    protected _$columnProperty: string;
    protected _$column: number = 0;
    protected _$owner: Collection<T>;

    constructor(options?: IOptions<T>) {
        super(options);
        this._$column = options?.column || 0;
    }

    getColumn(): number {
        return this._$column;
    }
    setColumn(column: number): void {
        if (this._$column === column) {
            return;
        }
        this._$column = column;
        this._nextVersion();
    }

    get index(): number {
        return this.getOwner().getIndex(this);
    }

    getWrapperClasses(templateHighlightOnHover: boolean = true, theme?: 'string', cursor: string|boolean = 'pointer'): string {
        let result: string = super.getWrapperClasses.apply(this, arguments);
        result += ' controls-ColumnsView__itemV';
        if (cursor === true || cursor === 'pointer') {
            result += ' controls-ListView__itemV_cursor-pointer';
        }
        return result;
    }

    getMultiSelectOffsetClass(): string {
        return `controls-ColumnsView__checkbox_position-${this.getOwner().getMultiSelectPosition()} `;
    }

    getContentClasses(): string {
        // Тут должен быть вызов метода суперкласса, НО нам не нужны почти все классы, которые он предлагает
        return ' controls-ColumnsView__itemContent';
    }

    getItemActionClasses(itemActionsPosition: string, theme?: string): string {
        return `controls-ColumnsView__itemActionsV_${itemActionsPosition}`;
    }
}

Object.assign(CollectionItem.prototype, {
    '[Controls/_columns/display/CollectionItem]': true,
    _moduleName: 'Controls/columns:ColumnsCollectionItem',
    _instancePrefix: 'columns-item-',
    _$column: 1
});
