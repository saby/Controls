/**
 * Библиотека контролов, которые служат для <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/filter-search/">организации фильтрации в списках</a>.
 * @library Controls/filter
 * @includes ViewItemTemplate Controls/_filter/interface/ItemTemplate
 * @public
 * @author Крайнов Д.О.
 */

/*
 * filter library
 * @library Controls/filter
 * @includes ViewItemTemplate Controls/_filter/interface/ItemTemplate
 * @public
 * @author Крайнов Д.О.
 */

import Selector = require('Controls/_filter/Button');
import Fast = require('Controls/_filter/Fast');
import View = require('Controls/_filter/View');
import ViewItemTemplate = require('wml!Controls/_filter/View/ItemTemplate');
import FastContainer = require('Controls/_filter/Fast/Container');
import Controller = require('Controls/_filter/Controller');
import HistoryUtils = require('Controls/_filter/HistoryUtils');
import FilterUtils = require('Controls/_filter/resetFilterUtils');

export {default as ControllerClass, IFilterControllerOptions} from './_filter/ControllerClass';
export {default as ButtonContainer} from './_filter/Button/Container';
export {default as ViewContainer} from './_filter/View/Container';
export {default as DateRangeEditor} from './_filter/Editors/DateRange';
export {default as Prefetch} from 'Controls/_filter/Prefetch';
export {default as mergeSource} from 'Controls/_filter/Utils/mergeSource';
export {IFilterItem} from 'Controls/_filter/View/interface/IFilterView';

export {default as IPrefetch} from './_filter/IPrefetch';
export {default as IFastFilter} from './_filter/interface/IFastFilter';
export {default as IFilterButton} from './_filter/interface/IFilterButton';

export {
   Selector,
   Fast,
   View,
   ViewItemTemplate,
   FastContainer,
   Controller,
   HistoryUtils,
   FilterUtils
};
