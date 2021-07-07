import {View as TreeGrid} from 'Controls/treeGridNew';
import { TemplateFunction } from 'UI/Base';
import SearchView from 'Controls/_searchBreadcrumbsGrid/SearchView';

export default class Search extends TreeGrid {
   protected _viewName: TemplateFunction;

   _beforeMount(options: any): Promise<void> {
      const result = super._beforeMount(options);
      this._viewName = SearchView;
      return result;
   }

   protected _getModelConstructor(): string {
      return 'Controls/searchBreadcrumbsGrid:SearchGridCollection';
   }
}
