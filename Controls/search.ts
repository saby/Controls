/**
 * Библиотека контролов, которые служат для {@link /doc/platform/developmentapl/interface-development/controls/list/filter-and-search/ организации поиска в списках}.
 * @markdown
 * @library
 * @includes IExpandableInput Controls/search:IExpandableInput
 * @public
 * @author Крайнов Д.О.
 */

/*
 * Search library
 * @library
 * @includes IExpandableInput Controls/search:IExpandableInput
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
