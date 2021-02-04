import { register } from 'Types/di';
import SearchGridCollection from 'Controls/_searchBreadcrumbsGrid/display/SearchGridCollection';
import SearchGridDataRow from 'Controls/_searchBreadcrumbsGrid/display/SearchGridDataRow';
import SearchGridDataCell from 'Controls/_searchBreadcrumbsGrid/display/SearchGridDataCell';
import BreadcrumbsItemRow from 'Controls/_searchBreadcrumbsGrid/display/BreadcrumbsItemRow';
import BreadcrumbsItemCell from 'Controls/_searchBreadcrumbsGrid/display/BreadcrumbsItemCell';
import SearchSeparatorRow from 'Controls/_searchBreadcrumbsGrid/display/SearchSeparatorRow';
import SearchSeparatorCell from 'Controls/_searchBreadcrumbsGrid/display/SearchSeparatorCell';
import SearchView from 'Controls/_searchBreadcrumbsGrid/SearchView';
import View from 'Controls/_searchBreadcrumbsGrid/Search';
import * as SearchBreadcrumbsItemTemplate from 'wml!Controls/_searchBreadcrumbsGrid/render/Item';
import * as SearchSeparatorTemplate from 'wml!Controls/_searchBreadcrumbsGrid/render/SearchSeparatorTemplate';
import TreeGridItemDecorator from 'Controls/_searchBreadcrumbsGrid/display/TreeGridItemDecorator';

export {
   View,
   SearchView,
   SearchGridCollection,
   BreadcrumbsItemRow,
   SearchSeparatorRow,
   SearchBreadcrumbsItemTemplate,
   SearchSeparatorTemplate
};

register('Controls/searchBreadcrumbsGrid:SearchGridCollection', SearchGridCollection, {instantiate: false});
register('Controls/searchBreadcrumbsGrid:SearchGridDataRow', SearchGridDataRow, {instantiate: false});
register('Controls/searchBreadcrumbsGrid:SearchGridDataCell', SearchGridDataCell, {instantiate: false});
register('Controls/searchBreadcrumbsGrid:BreadcrumbsItemRow', BreadcrumbsItemRow, {instantiate: false});
register('Controls/searchBreadcrumbsGrid:BreadcrumbsItemCell', BreadcrumbsItemCell, {instantiate: false});
register('Controls/searchBreadcrumbsGrid:SearchSeparatorRow', SearchSeparatorRow, {instantiate: false});
register('Controls/searchBreadcrumbsGrid:SearchSeparatorCell', SearchSeparatorCell, {instantiate: false});
register('Controls/searchBreadcrumbsGrid:TreeGridItemDecorator', TreeGridItemDecorator, {instantiate: false});
