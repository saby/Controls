/**
 * Библиотека контролов, которые служат для отображения элемента коллекции или выбора элемента из выпадающего окна с возможностью сохранения истории выбора.
 * @library Controls/history
 * @includes Constants Controls/_history/Constants
 * @includes Service Controls/_history/Service
 * @includes Source Controls/_history/Source
 * @includes Controller Controls/_history/Controller
 * @public
 * @author Крайнов Д.О.
 */

/*
 * history library
 * @library Controls/history
 * @includes Constants Controls/_history/Constants
 * @includes FilterSource Controls/_history/FilterSource
 * @includes Service Controls/_history/Service
 * @includes Source Controls/_history/Source
 * @includes Controller Controls/_history/Controller
 * @public
 * @author Крайнов Д.О.
 */

import Constants = require('Controls/_history/Constants');
import FilterSource = require('Controls/_history/FilterSource');
export {Controller} from 'Controls/_history/Controller';

export {default as Source} from './_history/Source';
export {default as Service} from './_history/Service';
export {default as IHistoryController, IHistoryControllerOptions} from 'Controls/_history/IHistoryController';

export {
    Constants,
    FilterSource
};
