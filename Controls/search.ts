/**
 * Библиотека контролов, которые служат для организации поиска в списках.
 * Подробнее об организации поиска и фильтрации данных в реестре <a href="/doc/platform/developmentapl/interface-development/controls/list/filter-and-search/">здесь</a>.
 * @library Controls/search
 * @includes InputContainer Controls/_search/Input/Container
 * @includes Misspell Controls/_search/Misspell
 * @includes MisspellContainer Controls/_search/Misspell/Container
 * @includes Controller Controls/_search/Controller
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
 * @includes Controller Controls/_search/Controller
 * @includes Input Controls/_search/Input/Search
 * @includes ExpandableInput Controls/_search/Input/ExpandableInput/Search
 * @includes SearchResolver Controls/_search/SearchResolver
 * @includes ControllerClass Controls/_search/ControllerClass
 * @public
 * @author Крайнов Д.О.
 */

import {default as Misspell} from 'Controls/_search/Misspell';
import {default as ExpandableInput} from 'Controls/_search/Input/ExpandableInput/Search';
import MisspellContainer = require('Controls/_search/Misspell/Container');
import {default as Controller} from 'Controls/_search/Controller';

import getSwitcherStrFromData = require('Controls/_search/Misspell/getSwitcherStrFromData');

export {default as ControllerClass} from './_search/ControllerClass';
export {default as InputContainer} from './_search/Input/Container';
export {default as SearchResolver} from './_search/SearchResolver';
export {default as Input} from './_search/Input/Search';
export {
   ISearchResolverOptions,
   ISearchInputContainerOptions,
   ISearchControllerOptions,
   ISearchController,
   ISearchResolver
} from './_search/interface';

export {
   Misspell,
   MisspellContainer,
   Controller,
   ExpandableInput,

   getSwitcherStrFromData
};
