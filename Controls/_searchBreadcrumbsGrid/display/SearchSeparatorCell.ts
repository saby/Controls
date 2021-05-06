import { GridCell } from 'Controls/grid';
import SearchSeparatorRow from 'Controls/_searchBreadcrumbsGrid/display/SearchSeparatorRow';

export default class SearchSeparatorCell extends GridCell<string, SearchSeparatorRow> {
   getTemplate(): string {
      if (this._$isFirstDataCell) {
         return 'Controls/searchBreadcrumbsGrid:SearchSeparatorTemplate';
      } else {
         return this._defaultCellTemplate;
      }
   }

   getWrapperClasses(theme: string, backgroundColorStyle: string, style: string = 'default', templateHighlightOnHover?: boolean, templateHoverBackgroundStyle?: string): string {
      let classes = super.getWrapperClasses(theme, backgroundColorStyle, style, templateHighlightOnHover);

      if (!this._$owner.hasMultiSelectColumn()) {
         classes += ` controls-Grid__cell_spacingFirstCol_${this._$owner.getLeftPadding()}`;
      }

      return classes;
   }

   hasCellContentRender(): boolean {
      return false;
   }

   getDefaultDisplayValue(): string {
      return '';
   }
}

Object.assign(SearchSeparatorCell.prototype, {
   '[Controls/_searchBreadcrumbsGrid/SearchSeparatorCell]': true,
   _moduleName: 'Controls/searchBreadcrumbsGrid:SearchSeparatorCell',
   _instancePrefix: 'search-separator-cell-'
});
