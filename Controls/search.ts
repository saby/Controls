/**
 * Библиотека контролов, которые служат для организации поиска в списках.
 * Подробнее об организации поиска и фильтрации данных в реестре <a href="/doc/platform/developmentapl/interface-development/controls/list/filter-and-search/">здесь</a>.
 * @library Controls/search
 * @includes InputContainer Controls/_search/Input/Container
 * @includes Misspell Controls/_search/Misspell
 * @includes MisspellContainer Controls/_search/Misspell/Container
 * @includes Input Controls/_search/Input/Search
 * @includes ExpandableInput Controls/_search/Input/ExpandableInput/Search
 * @includes SearchResolver Controls/_search/SearchResolver
 * @includes ControllerClass Controls/_search/ControllerClass
 * @public
 * @author Крайнов Д.О.
 */

/*
 * Search library
 * @library Controls/search
 * @includes InputContainer Controls/_search/Input/Container
 * @includes Misspell Controls/_search/Misspell
 * @includes MisspellContainer Controls/_search/Misspell/Container
 * @includes Input Controls/_search/Input/Search
 * @includes ExpandableInput Controls/_search/Input/ExpandableInput/Search
 * @includes SearchResolver Controls/_search/SearchResolver
 * @includes ControllerClass Controls/_search/ControllerClass
 * @public
 * @author Крайнов Д.О.
 */

export {default as Misspell} from 'Controls/_search/Misspell';
export {default as ExpandableInput} from 'Controls/_search/Input/ExpandableInput/Search';
export {default as MisspellContainer} from 'Controls/_search/Misspell/Container';
export {default as ControllerClass} from './_search/ControllerClass';
export {default as InputContainer} from './_search/Input/Container';
export {default as SearchResolver} from './_search/SearchResolver';
export { default as Input } from 'Controls/_search/Input/WrappedSearch';

import getSwitcherStrFromData = require('Controls/_search/Misspell/getSwitcherStrFromData');
export {
   getSwitcherStrFromData
};
