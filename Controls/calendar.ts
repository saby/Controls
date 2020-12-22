/**
 * Библиотека контролов, которые служат для задания и отображения диапазона дат в рамках одного или нескольких месяцев.
 * @library Controls/calendar
 * @includes Month Controls/_calendar/Month
 * @includes MonthList Controls/_calendar/MonthList
 * @includes MonthSlider Controls/_calendar/MonthSlider
 * @includes MonthModel Controls/_calendar/Month/Model
 * @includes MonthViewDayTemplate Controls/calendar:MonthViewDayTemplate
 * @includes MonthViewModel Controls/_calendar/MonthView/MonthViewModel
 * @includes MonthView Controls/_calendar/MonthView
 * @includes IMonth Controls/_calendar/interfaces/IMonth
 * @includes IMonthList Controls/_calendar/interfaces/IMonthList
 * @includes IMonthListSource Controls/_calendar/interfaces/IMonthListSource
 * @includes IMonthListVirtualPageSize Controls/_calendar/interfaces/IMonthListVirtualPageSize
 * @includes MonthListMonthTemplate Controls/calendar:MonthListMonthTemplate
 * @includes MonthListYearTemplate Controls/calendar:MonthListYearTemplate
 * @public
 * @author Крайнов Д.О.
 */

/*
 * calendar library
 * @library Controls/calendar
 * @includes Month Controls/_calendar/Month
 * @includes MonthList Controls/_calendar/MonthList
 * @includes MonthSlider Controls/_calendar/MonthSlider
 * @includes MonthModel Controls/_calendar/Month/Model
 * @includes MonthViewDayTemplate Controls/calendar:MonthViewDayTemplate
 * @includes MonthViewModel Controls/_calendar/MonthView/MonthViewModel
 * @includes MonthView Controls/_calendar/MonthView
 * @includes IMonth Controls/_calendar/interfaces/IMonth
 * @includes IMonthList Controls/_calendar/interfaces/IMonthList
 * @includes IMonthListSource Controls/_calendar/interfaces/IMonthListSource
 * @includes IMonthListVirtualPageSize Controls/_calendar/interfaces/IMonthListVirtualPageSize
 * @includes MonthListMonthTemplate Controls/calendar:MonthListMonthTemplate
 * @includes MonthListYearTemplate Controls/calendar:MonthListYearTemplate
 * @public
 * @author Крайнов Д.О.
 */

import MonthViewDayTemplate = require('wml!Controls/_calendar/MonthView/dayTemplate');

import MonthListYearTemplate = require('wml!Controls/_calendar/MonthList/YearTemplate');
import MonthListMonthTemplate = require('wml!Controls/_calendar/MonthList/MonthTemplate');

export {default as Month} from './_calendar/Month';
export {default as MonthList} from './_calendar/MonthList';
export {default as MonthSlider} from './_calendar/MonthSlider';
export {Base as MonthSliderBase} from './_calendar/MonthSlider';
export {default as MonthModel} from './_calendar/Month/Model';
export {default as MonthViewModel} from './_calendar/MonthView/MonthViewModel';
export {default as MonthView} from './_calendar/MonthView';

export {default as IMonth} from './_calendar/interfaces/IMonth';
export {IMonthList} from './_calendar/interfaces/IMonthList';
export {IMonthListSource} from './_calendar/interfaces/IMonthListSource';
export {IMonthListVirtualPageSize} from './_calendar/interfaces/IMonthListVirtualPageSize';

export {
   MonthViewDayTemplate,
   MonthListYearTemplate,
   MonthListMonthTemplate
};
