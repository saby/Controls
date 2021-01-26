import {register} from 'Types/di';
import { object } from 'Types/util';
import { Model } from 'Types/entity';
import { TemplateFunction } from 'UI/Base';
import SearchGridDataRow from './SearchGridDataRow';
import { TreeChildren } from 'Controls/display';
import SearchGridCollection from './SearchGridCollection';
import { GridDataRow, IItemTemplateParams } from 'Controls/gridNew';

export interface IOptions<T extends Model> {
    owner?: SearchGridCollection<T>;
    last: SearchGridDataRow<T>;
}

/**
 * Хлебная крошка
 * @class Controls/_searchBreadcrumbsGrid/BreadcrumbsItem
 * @extends Controls/_display/CollectionItem
 * @private
 * @author Мальцев А.А.
 */
export default class BreadcrumbsItem<T extends Model = Model> extends GridDataRow<T> {
   readonly '[Controls/_display/IEditableCollectionItem]': boolean = false;
   readonly Markable: boolean = false;

   protected _$owner: SearchGridCollection<T>;

   /**
   * Последний элемент хлебной крошки
   */
   protected _$last: SearchGridDataRow<T>;

   protected _$template: TemplateFunction;

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

   getContents(): T {
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

   getTemplate(itemTemplateProperty: string, userTemplate: TemplateFunction | string): TemplateFunction | string {
      return this._$template;
   }

   getSearchValue(): string {
      return this.getOwner().getSearchValue();
   }

   getItemClasses(params: IItemTemplateParams = { theme: 'default' }): string {
      return super.getItemClasses(params) + ' controls-TreeGrid__row__searchBreadCrumbs js-controls-ListView__notEditable';
   }

   getWrapperClasses(
      theme: string,
      backgroundColorStyle: string,
      style: string = 'default',
      templateHighlightOnHover: boolean
   ): string {
      // let classes = 'controls-Grid__breadCrumbs ';
      // // TODO {{ itemData.columnScroll && !isColumnScrollVisible ? 'controls-TreeGrid__breadCrumbs_colspaned' }}

      const hoverBackgroundStyle = this._$owner.getHoverBackgroundStyle();
      let classes = `controls-Grid__row-cell_default_min_height-theme-${theme} `

      classes += `controls-Grid__row-cell controls-Grid__cell_default controls-Grid__row-cell_default_theme-${theme} `;
      classes += `controls-Grid__row-cell_withRowSeparator_size-${this.getRowSeparatorSize()} controls-Grid__no-rowSeparator controls-Grid__cell_fit `;
      classes += `controls-Grid__row-cell-background-hover-${hoverBackgroundStyle}_theme-${theme} controls-TreeGrid__row-cell_theme-${theme} `;
      classes += `controls-TreeGrid__row-cell_default_theme-${theme} controls-TreeGrid__row-cell__item_theme-${theme} `;
      classes += `controls-Grid__cell_spacingFirstCol_${this._$owner.getLeftPadding()}_theme-${theme} `;
      classes += 'controls-TreeGrid__row-cell__firstColumn__contentSpacing_null controls-TreeGrid__row ';
      classes += 'js-controls-ItemActions__swipeMeasurementContainer';

      return classes;
   }

   getContentClasses(theme: string, style: string = 'default'): string {
      let classes = `controls-Grid__row-cell__content_colspaned `;

      classes += `controls-Grid__cell_spacingLastCol_${this._$owner.getRightPadding()}_theme-${theme} `;
      classes += `controls-Grid__row-cell_rowSpacingTop_${this._$owner.getTopPadding()}_theme-${theme} `;
      classes += `controls-Grid__row-cell_rowSpacingBottom_${this._$owner.getBottomPadding()}_theme-${theme} `;

      return classes;
   }

   getItemStyles(): string {
      return 'grid-column: 1 / ' + (this._$owner.getColumnsConfig().length + 1);
   }

   protected _getMultiSelectAccessibility(): boolean|null {
      const value = object.getPropertyValue<boolean|null>(this.getLast().getContents(), this._$multiSelectAccessibilityProperty);
      return value === undefined ? true : value;
   }

   // endregion
}

Object.assign(BreadcrumbsItem.prototype, {
   '[Controls/_searchBreadcrumbsGrid/BreadcrumbsItem]': true,
   _moduleName: 'Controls/searchBreadcrumbsGrid:BreadcrumbsItem',
   _instancePrefix: 'search-breadcrumbs-grid-item-',
   _$last: null,
   _$template: 'Controls/searchBreadcrumbsGrid:SearchBreadcrumbsItemTemplate'
});

register('Controls/searchBreadcrumbsGrid:BreadcrumbsItem', BreadcrumbsItem, {instantiate: false});
