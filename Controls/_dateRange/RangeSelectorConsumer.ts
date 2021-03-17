import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_dateRange/RangeSelectorConsumer/RangeSelectorConsumer';
import DateRangeContext from 'Controls/_dateRange/DateRangeContext';
import IDateRangeContext from './interfaces/IDateRangeContext';

/**
 * Контрол позволяет пользователю выбрать временной период: месяц, квартал, полугодие, год. Выбор происходит с помощью панели большого выбора периода.
 * @class Controls/_dateRange/RangeSelectorConsumer
 * @extends UI/Base:Control
 * @mixes Controls/_interface/IResetValues
 * @mixes Controls/_dateRange/interfaces/ILinkView
 * @mixes Controls/_dateRange/interfaces/IDateRange
 * @mixes Controls/_dateRange/interfaces/IDatePickerSelectors
 * @mixes Controls/_interface/IDayTemplate
 * @mixes Controls/_dateRange/interfaces/IDateRangeSelectable
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IOpenPopup
 * @mixes Controls/_dateRange/interfaces/ICaptionFormatter
 * @mixes Controls/_interface/IDateRangeValidators
 * @remark
 * Контрол используется для работы с кнопками dateRange:ArrowButtonConsumer, которые двигают период.
 * Стоит использовать контрол только в связке с dateRange:ButtonsController.
 * @example
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/dateRange/ButtonsController/Index
 * @see Controls/_dateRange/ButtonsController
 * @see Controls/_buttons/ArrowButton
 * @see Controls/_dateRange/ArrowButtonConsumer
 */

export default class RangeSelectorConsumer extends Control {
    protected _template: TemplateFunction = template;
    protected _register: Function;

    protected _beforeMount(options: IControlOptions, context: IDateRangeContext): void {
        this._register = context.DateRangeContext.setShiftPeriod;
    }

    static contextTypes(): object {
        return {
            DateRangeContext
        };
    }
}
