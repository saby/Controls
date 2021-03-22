import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_dateRange/DateSelectorConsumer/DateSelectorConsumer';
import DateRangeContext from 'Controls/_dateRange/DateRangeContext';
import IDateRangeContext from './interfaces/IDateRangeContext';

/**
 * Контрол позволяющий пользователю выбирать дату из календаря.
 * @class Controls/_dateRange/DateSelectorConsumer
 * @extends UI/Base:Control
 * @mixes Controls/_interface/IResetValues
 * @mixes Controls/interface/IDateRange
 * @mixes Controls/_dateRange/interfaces/ILinkView
 * @mixes Controls/_interface/IOpenPopup
 * @mixes Controls/_dateRange/interfaces/IDatePickerSelectors
 * @mixes Controls/_interface/IDayTemplate
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_dateRange/interfaces/ICaptionFormatter
 * @mixes Controls/_dateRange/interfaces/IDateSelector
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

export default class DateSelectorConsumer extends Control {
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
