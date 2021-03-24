import { GridCell } from 'Controls/gridNew';
import SearchSeparatorRow from 'Controls/_searchBreadcrumbsGrid/display/SearchSeparatorRow';

export default class SearchSeparatorCell extends GridCell<string, SearchSeparatorRow> {
   getTemplate(): string {
      return 'Controls/searchBreadcrumbsGrid:SearchSeparatorTemplate';
   }

   getWrapperClasses(theme: string, backgroundColorStyle: string, style: string = 'default', templateHighlightOnHover: boolean): string {
      let classes = super.getWrapperClasses(theme, backgroundColorStyle, style, templateHighlightOnHover);

      if (!this._$owner.hasMultiSelectColumn()) {
         classes += ` controls-Grid__cell_spacingFirstCol_${this._$owner.getLeftPadding()}_theme-${theme}`;
      }

      return classes;
   }
}

Object.assign(SearchSeparatorCell.prototype, {
   '[Controls/_searchBreadcrumbsGrid/SearchSeparatorCell]': true,
   _moduleName: 'Controls/searchBreadcrumbsGrid:SearchSeparatorCell',
   _instancePrefix: 'search-separator-cell-'
});
