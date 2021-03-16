import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_dateRange/ArrowButtonConsumer/ArrowButtonConsumer';
import DateRangeContext from 'Controls/_dateRange/DateRangeContext';
import {IArrowButtonOptions} from 'Controls/buttons';
import IDateRangeContext from './interfaces/IDateRangeContext';

/**
 * Контрол кнопка для переключения периода.
 * @class Controls/_dateRange/ArrowButtonConsumer
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/dateRange/ButtonsController/Index
 * @see Controls/_dateRange/ButtonsController
 * @see Controls/_buttons/ArrowButton
 */

export default class ButtonsController extends Control<IArrowButtonOptions> {
    protected _template: TemplateFunction = template;
    protected _dateRangeContext: DateRangeContext;

    protected _beforeMount(options: IArrowButtonOptions, context: IDateRangeContext): void {
        this._dateRangeContext = context.DateRangeContext;
    }

    protected _clickHandler(): void {
        const delta = this._options.direction === 'left' ? -1 : 1;
        this._dateRangeContext.shiftPeriod(delta);
    }

    static contextTypes(): object {
        return {
            DateRangeContext
        };
    }
}
