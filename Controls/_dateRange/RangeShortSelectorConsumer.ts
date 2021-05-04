import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_dateRange/RangeShortSelectorConsumer/RangeShortSelectorConsumer';
import RangeShortSelector from 'Controls/_dateRange/RangeShortSelector';
import DateRangeSelectorConsumer from 'Controls/_dateRange/_DateRangeSelectorConsumer';

/**
 * Контрол позволяет пользователю выбрать диапазон дат с начальным и конечным значениями в календаре. Выбор происходит с помощью панели быстрого выбора периода.
 * @class Controls/_dateRange/RangeShortSelectorConsumer
 * @extends UI/Base:Control
 * @mixes Controls/interface:IResetValues
 * @mixes Controls/dateRange:ILinkView
 * @mixes Controls/dateRange:IPeriodLiteDialog
 * @mixes Controls/dateRange:IDateRange
 * @mixes Controls/interface:IDisplayedRanges
 * @mixes Controls/interface:IOpenPopup
 * @mixes Controls/interface:IFontSize
 * @mixes Controls/interface:IUnderline
 * @mixes Controls/interface:IFontWeight
 * @mixes Controls/interface:IFontColorStyle
 * @mixes Controls/dateRange:ICaptionFormatter
 * @remark
 * Контрол используется для работы с кнопками dateRange:ArrowButtonConsumer, которые двигают период.
 * Стоит использовать контрол только в связке с dateRange:DateRangeContextProvider.
 * @example
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/dateRange/DateRangeContextProvider/Index
 * @see Controls/_dateRange/DateRangeContextProvider
 * @see Controls/_buttons/ArrowButton
 * @see Controls/_dateRange/ArrowButtonConsumer
 */

/**
 * @name Controls/_dateRange/RangeShortSelectorConsumer#fontWeight
 * @demo Controls-demo/dateRange/LinkView/FontWeight/Index
 * @default bold
 */

export default class RangeShortSelectorConsumer extends Control {
    protected _template: TemplateFunction = template;
    protected _children: {
        dateRange: RangeShortSelector
        consumer: DateRangeSelectorConsumer
    };

    protected _afterMount(options: IControlOptions): void {
        const shiftPeriod = this._children.dateRange.shiftPeriod;
        this._children.consumer.setShiftPeriod(shiftPeriod);
    }
}
