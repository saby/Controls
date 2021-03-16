import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_dateRange/RangeShortSelectorConsumer/RangeShortSelectorConsumer';
import DateRangeContext from 'Controls/_dateRange/DateRangeContext';
import IDateRangeContext from './interfaces/IDateRangeContext';

/**
 * Контрол позволяет пользователю выбрать диапазон дат с начальным и конечным значениями в календаре. Выбор происходит с помощью панели быстрого выбора периода.
 * @class Controls/_dateRange/RangeShortSelectorConsumer
 * @extends UI/Base:Control
 * @mixes Controls/_interface/IResetValues
 * @mixes Controls/_dateRange/interfaces/ILinkView
 * @mixes Controls/_dateRange/interfaces/IPeriodLiteDialog
 * @mixes Controls/_dateRange/interfaces/IDateRange
 * @mixes Controls/_interface/IDisplayedRanges
 * @mixes Controls/_interface/IOpenPopup
 * @mixes Controls/_interface/IFontSize
 * @mixes Controls/_interface/IFontColorStyle
 * @mixes Controls/_dateRange/interfaces/ICaptionFormatter
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

export default class RangeShortSelectorConsumer extends Control {
    protected _template: TemplateFunction = template;

    protected _afterMount(options, context: IDateRangeContext): void {
        context.DateRangeContext.shiftPeriod = this._children.dateRange.shiftPeriod;
    }

    static contextTypes(): object {
        return {
            DateRangeContext
        };
    }
}
