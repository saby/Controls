import {object} from 'Types/util';
import {Model} from 'Types/entity';
import {TemplateFunction} from 'UI/Base';
import SearchGridDataRow from './SearchGridDataRow';
import {TreeChildren} from 'Controls/display';
import SearchGridCollection from './SearchGridCollection';
import {GridDataRow, TColspanCallbackResult} from 'Controls/grid';
import {IColumn} from 'Controls/interface';
import {IOptions as IBreadcrumbsItemCellOptions} from './BreadcrumbsItemCell';

export interface IOptions<T extends Model> {
    owner?: SearchGridCollection<T>;
    last: SearchGridDataRow<T>;
}

/**
 * Хлебная крошка
 * @class Controls/_searchBreadcrumbsGrid/BreadcrumbsItemRow
 * @extends Controls/_display/CollectionItem
 * @private
 * @author Мальцев А.А.
 */
export default class BreadcrumbsItemRow<T extends Model = Model> extends GridDataRow<T> {
    readonly '[Controls/_display/IEditableCollectionItem]': boolean = false;
    readonly Markable: boolean = false;

    protected _$owner: SearchGridCollection<T>;

    /**
     * Последний элемент хлебной крошки
     */
    protected _$last: SearchGridDataRow<T>;

    protected _$cellTemplate: TemplateFunction;

    protected _$colspanBreadcrumbs: boolean;

    protected _$breadCrumbsMode: 'row' | 'cell';

    protected get _first(): SearchGridDataRow<T> {
        const root = this._$owner ? this._$owner.getRoot() : {};
        let current = this._$last;

        while (current) {
            const parent = current.getParent();
            if (!parent || parent === root) {
                break;
            }
            current = parent;
        }

        return current;
    }

    get key(): unknown {
        const contents = this.getContents();
        return contents[contents.length - 1].getKey();
    }

    // region Public methods

    getContents(): T[] {
        const root = this._$owner ? this._$owner.getRoot() : {};
        let current = this._$last;
        const contents = [];

        // Go up from last item until end
        while (current) {
            contents.unshift(current.getContents());
            current = current.getParent();
            if (current === root) {
                break;
            }
        }

        return contents as any;
    }

    setContents(): void {
        throw new ReferenceError('BreadcrumbsItem contents is read only.');
    }

    /**
     * Returns branch level in tree
     */
    getLevel(): number {
        const first = this._first;
        return first ? first.getLevel() : 0;
    }

    getLast(): SearchGridDataRow<T> {
        return this._$last;
    }

    getParent(): SearchGridDataRow<T> {
        // Родителем хлебной крошки всегда является корневой узел, т.к. хлебная крошка это путь до корневого узла
        return this._$owner.getRoot();
    }

    getChildren(withFilter: boolean = true): TreeChildren<T> {
        return this._$owner.getChildren(this, withFilter);
    }

    hasChildren(): boolean {
        return this.getLast().hasChildren();
    }

    isGroupNode(): boolean {
        return false;
    }

    getTemplate(): TemplateFunction | string {
        // В старой поисковой модели в menu хлебные крошки отрисовывают с помощью itemTemplate,
        // у себы мы рисуем хлебные крошки с помощью searchBreadCrumbsItemTemplate
        if (this._$owner['[Controls/_display/Search]']) {
            return super.getTemplate.apply(this, arguments);
        } else {
            return this.getDefaultTemplate();
        }
    }

    getCellTemplate(): TemplateFunction | string {
        return this._$cellTemplate;
    }

    setColspanBreadcrumbs(colspanBreadcrumbs: boolean): void {
        if (this._$colspanBreadcrumbs !== colspanBreadcrumbs) {
            this._$colspanBreadcrumbs = colspanBreadcrumbs;
            this._reinitializeColumns();
        }
    }

    setBreadCrumbsMode(breadCrumbsMode: 'row' | 'cell'): void {
        if (this._$breadCrumbsMode === breadCrumbsMode) {
            return;
        }

        this._$breadCrumbsMode = breadCrumbsMode;
        this._reinitializeColumns();
    }

    isLastItem(): boolean {
        return this.getLast().getContents().getKey() === this.getOwner().getLastItem().getKey();
    }

    protected _getColspan(column: IColumn, columnIndex: number): TColspanCallbackResult {
        return this._$colspanBreadcrumbs ? 'end' : 1;
    }

    protected _getMultiSelectAccessibility(): boolean | null {
        const value = object.getPropertyValue<boolean | null>(this.getLast().getContents(), this._$multiSelectAccessibilityProperty);
        return value === undefined ? true : value;
    }

    // endregion

    protected _getColumnFactoryParams(column: IColumn, columnIndex: number): Partial<IBreadcrumbsItemCellOptions<T>> {
        return {
            ...super._getColumnFactoryParams(column, columnIndex),
            breadCrumbsMode: this._$breadCrumbsMode
        };
    }
}

Object.assign(BreadcrumbsItemRow.prototype, {
    '[Controls/_searchBreadcrumbsGrid/BreadcrumbsItemRow]': true,
    '[Controls/_display/BreadcrumbsItem]': true,
    _moduleName: 'Controls/searchBreadcrumbsGrid:BreadcrumbsItemRow',
    _instancePrefix: 'search-breadcrumbs-grid-row-',
    _cellModule: 'Controls/searchBreadcrumbsGrid:BreadcrumbsItemCell',
    _$cellTemplate: 'Controls/searchBreadcrumbsGrid:SearchBreadcrumbsItemTemplate',
    _$last: null,
    _$colspanBreadcrumbs: true,
    _$hasNodeWithChildren: false,
    _$breadCrumbsMode: 'row'
});
