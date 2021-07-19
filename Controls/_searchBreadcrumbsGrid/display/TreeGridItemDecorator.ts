import BreadcrumbsItemRow from './BreadcrumbsItemRow';
import SearchGridDataRow from './SearchGridDataRow';
import {Model} from 'Types/entity';
import {GridCell} from 'Controls/grid';
import {TreeGridDataRow} from 'Controls/treeGrid';

export interface IOptions<T extends Model> {
    source: SearchGridDataRow<T>;
    parent?: SearchGridDataRow<T> | BreadcrumbsItemRow<T>;
    multiSelectVisibility: string;
    multiSelectAccessibilityProperty: string;
}

/**
 * Tree item which is just a decorator for another one
 * @class Controls/_searchBreadcrumbsGrid/TreeGridItemDecorator
 * @extends Controls/_searchBreadcrumbsGrid/SearchGridDataRow
 * @author Панихин К.А.
 * @private
 */
export default class TreeGridItemDecorator<T extends Model> extends SearchGridDataRow<T> {
    protected _$source: SearchGridDataRow<T>;

    constructor(options?: IOptions<T>) {
        super({
            contents: options?.source?.contents,
            multiSelectVisibility: options?.multiSelectVisibility,
            multiSelectAccessibilityProperty: options?.multiSelectAccessibilityProperty
        });
        this._$source = options?.source;
        this._$parent = options?.parent;

        // Декоратор нужен, чтобы задать правильный parent для item-a, при этом не испортив оригинальный item
        // Прокидываем все методы из оригинального item-a в decorator, за исключением методов, связанных с parent
        const notRewriteProperties = ['getLevel', 'getParent', 'shouldDisplayExpanderBlock'];
        for (const property in this._$source) {
            if (typeof this._$source[property] === 'function' && !notRewriteProperties.includes(property)) {
                this[property] = this._$source[property].bind(this._$source);
            }
        }
    }

    getSource(): SearchGridDataRow<T> {
        return this._$source;
    }

    shouldDisplayExpanderBlock(column: GridCell<T, TreeGridDataRow<T>>): boolean {
        // Для детей хлебной крошки должен рисоваться всегда один отступ, поэтому в первой колонке разрешаем
        // отрисовать expanderBlock
        const columnIndex = column.getColumnIndex();
        const hasMultiSelect = this.hasMultiSelectColumn();
        return columnIndex === 0 && !hasMultiSelect || columnIndex === 1 && hasMultiSelect;
    }
}

Object.assign(TreeGridItemDecorator.prototype, {
    '[Controls/_searchBreadcrumbsGrid/TreeGridItemDecorator]': true,
    '[Controls/_display/TreeItemDecorator]': true,
    _moduleName: 'Controls/searchBreadcrumbsGrid:TreeGridItemDecorator',
    _$source: undefined
});
