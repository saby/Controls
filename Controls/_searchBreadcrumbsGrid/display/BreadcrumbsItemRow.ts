import { object } from 'Types/util';
import { Model } from 'Types/entity';
import { TemplateFunction } from 'UI/Base';
import SearchGridDataRow from './SearchGridDataRow';
import { TreeChildren } from 'Controls/display';
import SearchGridCollection from './SearchGridCollection';
import { GridDataRow, TColspanCallbackResult } from 'Controls/grid';
import { IColumn } from 'Controls/interface';

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

   isHasChildren(): boolean {
      return this.getLast().isHasChildren();
   }

    isRoot(): boolean {
        return false;
    }

    isGroupNode(): boolean {
        return false;
    }

    setExpanded(): void {/* хлебная крошка не умеет сворачиваться/разворачиваться */}

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

   protected _getColspan(column: IColumn, columnIndex: number): TColspanCallbackResult {
      return 'end';
   }

   protected _getMultiSelectAccessibility(): boolean|null {
      const value = object.getPropertyValue<boolean|null>(this.getLast().getContents(), this._$multiSelectAccessibilityProperty);
      return value === undefined ? true : value;
   }

   // endregion
}

Object.assign(BreadcrumbsItemRow.prototype, {
   '[Controls/_searchBreadcrumbsGrid/BreadcrumbsItemRow]': true,
   '[Controls/_display/BreadcrumbsItem]': true,
   _moduleName: 'Controls/searchBreadcrumbsGrid:BreadcrumbsItemRow',
   _instancePrefix: 'search-breadcrumbs-grid-row-',
   _cellModule: 'Controls/searchBreadcrumbsGrid:BreadcrumbsItemCell',
   _$cellTemplate: 'Controls/searchBreadcrumbsGrid:SearchBreadcrumbsItemTemplate',
   _$last: null,
   _$hasNodeWithChildren: false
});
