/**
 * Библиотека контролов, которые служат для задания и отображения диапазона дат в рамках одного или нескольких месяцев.
 * @library
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
 * @library
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

export {default as Month} from './_calendar/Month';
export {default as MonthList} from './_calendar/MonthList';
export {default as MonthSlider, Base as MonthSliderBase} from './_calendar/MonthSlider';
export {default as MonthModel} from './_calendar/Month/Model';
export {default as MonthViewModel} from './_calendar/MonthView/MonthViewModel';
export {default as MonthView} from './_calendar/MonthView';

export {default as IMonth} from './_calendar/interfaces/IMonth';
export {IMonthList} from './_calendar/interfaces/IMonthList';
export {IMonthListSource} from './_calendar/interfaces/IMonthListSource';
export {IMonthListVirtualPageSize} from './_calendar/interfaces/IMonthListVirtualPageSize';

import * as MonthViewDayTemplate from 'wml!Controls/_calendar/MonthView/dayTemplate';
import * as MonthViewDayHeaderTemplate from 'wml!Controls/_calendar/MonthView/dayHeaderTemplate';
import * as MonthListYearTemplate from 'wml!Controls/_calendar/MonthList/YearTemplate';
import * as MonthListMonthTemplate from 'wml!Controls/_calendar/MonthList/MonthTemplate';

export {
   MonthViewDayTemplate,
   MonthViewDayHeaderTemplate,
   MonthListYearTemplate,
   MonthListMonthTemplate
};
