import { GridDataCell } from 'Controls/gridNew';
import { Model } from 'Types/entity';
import BreadcrumbsItemRow from 'Controls/_searchBreadcrumbsGrid/display/BreadcrumbsItemRow';
import { TemplateFunction } from 'UI/Base';

export default class BreadcrumbsItemCell<S extends Model, TOwner extends BreadcrumbsItemRow<S>> extends GridDataCell<any, any> {
   getTemplate(): TemplateFunction|string {
      return this.getOwner().getCellTemplate();
   }

   getSearchValue(): string {
      return this.getOwner().getSearchValue();
   }

   getContents(): S[] {
      return this.getOwner().getContents();
   }

   getKeyProperty(): string {
      return this.getOwner().getKeyProperty();
   }

   getDisplayProperty(): string {
      return this.getOwner().getDisplayProperty();
   }

   getWrapperClasses(theme: string, backgroundColorStyle: string, style: string = 'default', templateHighlightOnHover: boolean): string {
      return super.getWrapperClasses(theme, backgroundColorStyle, style, templateHighlightOnHover)
         + ' controls-TreeGrid__row__searchBreadCrumbs js-controls-ListView__notEditable';
   }

   getContentClasses(theme: string, style: string = 'default'): string {
      let classes = 'controls-Grid__row-cell__content_colspaned ';

      if (!this.getOwner().hasMultiSelectColumn()) {
         classes += `controls-Grid__cell_spacingFirstCol_${this.getOwner().getLeftPadding()}_theme-${theme} `;
      }

      classes += `controls-Grid__cell_spacingLastCol_${this.getOwner().getRightPadding()}_theme-${theme} `;
      classes += `controls-Grid__row-cell_rowSpacingTop_${this.getOwner().getTopPadding()}_theme-${theme} `;
      classes += `controls-Grid__row-cell_rowSpacingBottom_${this.getOwner().getBottomPadding()}_theme-${theme} `;

      return classes;
   }
}

Object.assign(BreadcrumbsItemCell.prototype, {
   '[Controls/_searchBreadcrumbsGrid/BreadcrumbsItemCell]': true,
   _moduleName: 'Controls/searchBreadcrumbsGrid:BreadcrumbsItemCell',
   _instancePrefix: 'search-breadcrumbs-grid-cell-'
});
