import { Model } from 'Types/entity';
import { TreeGridDataRow } from 'Controls/treeGridNew';

export default class SearchGridDataRow<S extends Model> extends TreeGridDataRow<S> {
   getWrapperClasses(
      templateHighlightOnHover: boolean = true,
      theme?: string,
      cursor: string = 'pointer',
      backgroundColorStyle?: string,
      style: string = 'default'
   ): string {
      let classes = super.getWrapperClasses(templateHighlightOnHover, theme, cursor, backgroundColorStyle, style);

      if (this.getLevel() === 1 && this.isNode() !== null) {
         classes += 'controls-TreeGrid__row-rootLeaf';
      }

      return classes;
   }

   getLevelIndentClasses(
      expanderSizeTmpl?: string,
      levelIndentSize?: string,
      theme: string = 'default'
   ): string {
      return `controls-TreeGrid__row-levelPadding_size_search_theme-${theme}`;
   }
}

Object.assign(SearchGridDataRow.prototype, {
   '[Controls/searchBreadcrumbsGrid:SearchGridDataRow]': true,
   _cellModule: 'Controls/searchBreadcrumbsGrid:SearchGridDataCell',
   _moduleName: 'Controls/searchBreadcrumbsGrid:SearchGridDataRow',
   _instancePrefix: 'search-grid-row-'
});
