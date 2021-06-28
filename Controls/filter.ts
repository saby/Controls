/**
 * Библиотека контролов, которые служат для <a href="/doc/platform/developmentapl/interface-development/controls/list/filter-and-search/">организации фильтрации в списках</a>.
 * @library
 * @includes View Controls/_filter/View
 * @includes IEditorOptions Controls/filter:EditorOptions
 * @includes ViewItemTemplate Controls/filter:ItemTemplate
 * @includes ViewContainer Controls/_filter/View/Container
 * @includes IFastFilter Controls/_filter/View/interface/IFastFilter
 * @includes IFilterButton Controls/_filter/View/interface/IFilterButton
 * @public
 * @author Крайнов Д.О.
 */

/*
 * filter library
 * @library
 * @includes View Controls/_filter/View
 * @includes IEditorOptions Controls/filter:EditorOptions
 * @includes ViewItemTemplate Controls/filter:ItemTemplate
 * @includes ViewContainer Controls/_filter/View/Container
 * @includes IFastFilter Controls/_filter/View/interface/IFastFilter
 * @includes IFilterButton Controls/_filter/View/interface/IFilterButton
 * @includes Prefetch Controls/_filter/Prefetch
 * @public
 * @author Крайнов Д.О.
 */

import ViewItemTemplate = require('wml!Controls/_filter/View/ItemTemplate');
import HistoryUtils = require('Controls/_filter/HistoryUtils');
import FilterUtils = require('Controls/_filter/resetFilterUtils');

export {default as View} from 'Controls/_filter/View';
export {default as ControllerClass, IFilterControllerOptions} from './_filter/ControllerClass';
export {default as ViewContainer} from './_filter/View/Container';
export {default as DateRangeEditor} from './_filter/Editors/DateRange';
export {default as Prefetch} from 'Controls/_filter/Prefetch';
export {default as mergeSource} from 'Controls/_filter/Utils/mergeSource';
export {IFilterItem} from 'Controls/_filter/View/interface/IFilterItem';
export {IFilterViewOptions, IFilterView} from 'Controls/_filter/View/interface/IFilterView';

export {
   ViewItemTemplate,
   HistoryUtils,
   FilterUtils
};
