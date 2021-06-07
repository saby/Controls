import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_dateRange/DateSelectorConsumer/DateSelectorConsumer';
import DateSelector from 'Controls/_dateRange/DateSelector';
import DateRangeSelectorConsumer from 'Controls/_dateRange/_DateRangeSelectorConsumer';

/**
 * Контрол позволяющий пользователю выбирать дату из календаря.
 * @class Controls/_dateRange/DateSelectorConsumer
 * @extends UI/Base:Control
 * @mixes Controls/interface:IResetValues
 * @mixes Controls/interface/IDateRange
 * @mixes Controls/dateRange:ILinkView
 * @mixes Controls/interface:IOpenPopup
 * @mixes Controls/dateRange:IDatePickerSelectors
 * @mixes Controls/dateRange:IDayTemplate
 * @mixes Controls/interface:IFontColorStyle
 * @mixes Controls/interface:IUnderline
 * @mixes Controls/interface:IFontWeight
 * @mixes Controls/dateRange:ICaptionFormatter
 * @mixes Controls/dateRange:IDateSelector
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
 * @name Controls/_dateRange/DateSelectorConsumer#fontWeight
 * @demo Controls-demo/dateRange/LinkView/FontWeight/Index
 * @default bold
 */

export default class DateSelectorConsumer extends Control {
    protected _template: TemplateFunction = template;
    protected _children: {
        dateRange: DateSelector
        consumer: DateRangeSelectorConsumer
    };

    protected _afterMount(options: IControlOptions): void {
        const shiftPeriod = this._children.dateRange.shiftPeriod;
        this._children.consumer.setShiftPeriod(shiftPeriod);
    }
}
