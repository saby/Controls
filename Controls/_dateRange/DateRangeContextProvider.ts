import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_dateRange/DateRangeContextProvider/DateRangeContextProvider';
import DateRangeContext from 'Controls/_dateRange/DateRangeContext';

/**
 * Контрол-обертка для связи выбора периода и кнопок-стрелок, которые будут сдвигать период.
 *
 * @class Controls/_dateRange/DateRangeContextProvider
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/dateRange/DateRangeContextProvider/Index
 * @see Controls/_dateRange/ArrowButton
 */

/**
 * @name Controls/_dateRange/DateRangeContextProvider#content
 * @cfg {TemplateFunction|String} Пользовательский шаблон.
 * @example
 * <pre>
 *     <Controls.dateRange:DateRangeContextProvider>
 *         <Controls.dateRange:ArrowButtonConsumer direction="left"/>
 *         <Controls.dateRange:RangeSelectorConsumer bind:startValue="_startValue" bind:endValue="_endValue"/>
 *         <Controls.dateRange:ArrowButtonConsumer direction="right"/>
 *     </Controls.dateRange:DateRangeContextProvider>
 * </pre>
 */

export default class DateRangeContextProvider extends Control {
    protected _template: TemplateFunction = template;
    private _dateRangeContext: DateRangeContext = new DateRangeContext();

    _getChildContext(): object {
        return {
            DateRangeContext: this._dateRangeContext
        };
    }
}
