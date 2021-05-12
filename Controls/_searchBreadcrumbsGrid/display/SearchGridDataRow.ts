import { Model } from 'Types/entity';
import { TreeGridDataRow } from 'Controls/treeGrid';

export default class SearchGridDataRow<S extends Model> extends TreeGridDataRow<S> {
   getExpanderIcon(expanderIcon?: string): string {
      return this.isNode() === false ? 'hiddenNode' : 'none';
   }
}

Object.assign(SearchGridDataRow.prototype, {
   '[Controls/searchBreadcrumbsGrid:SearchGridDataRow]': true,
   _cellModule: 'Controls/searchBreadcrumbsGrid:SearchGridDataCell',
   _moduleName: 'Controls/searchBreadcrumbsGrid:SearchGridDataRow',
   _instancePrefix: 'search-grid-row-',
   _$hasNodeWithChildren: false
});
