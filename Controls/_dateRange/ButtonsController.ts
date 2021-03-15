import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_dateRange/ButtonsController/ButtonsController';
import DateRangeContext from 'Controls/_dateRange/DateRangeContext';

/**
 * Контрол-обертка для связи выбора периода и кнопок-стрелок, которые будут сдвигать период.
 *
 * @class Controls/_dateRange/ButtonsController
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/dateRange/ButtonsController/Index
 * @see Controls/_dateRange/ArrowButton
 */

/**
 * @name Controls/_dateRange/ButtonsController#content
 * @cfg {TemplateFunction} Пользовательский шаблон.
 * @example
 * <pre>
 *     <Controls.dateRange:ButtonsController>
 *         <Controls.dateRange:ArrowButtonConsumer direction="left"/>
 *         <Controls.dateRange:RangeSelectorConsumer bind:startValue="_startValue" bind:endValue="_endValue"/>
 *         <Controls.dateRange:ArrowButtonConsumer direction="right"/>
 *     </Controls.dateRange:ButtonsController>
 * </pre>
 */

export default class ButtonsController extends Control {
    protected _template: TemplateFunction = template;
    private _dateRangeContext: DateRangeContext = new DateRangeContext();

    _getChildContext(): object {
        return {
            DateRangeContext: this._dateRangeContext
        };
    }
}
