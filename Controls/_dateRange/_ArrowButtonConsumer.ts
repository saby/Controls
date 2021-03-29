import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_dateRange/ArrowButtonConsumer/_ArrowButtonConsumer';
import DateRangeContext from 'Controls/_dateRange/DateRangeContext';
import {IArrowButtonOptions} from 'Controls/buttons';
import IDateRangeContext from './interfaces/IDateRangeContext';

export default class ArrowButtonConsumer extends Control<IArrowButtonOptions> {
    protected _template: TemplateFunction = template;
    shiftPeriod: Function;

    protected _beforeMount(options: IArrowButtonOptions, context: IDateRangeContext): void {
        this.shiftPeriod = context.DateRangeContext.shiftPeriod;
    }

    protected _beforeUpdate(options: IArrowButtonOptions, context: IDateRangeContext): void {
        this.shiftPeriod = context.DateRangeContext.shiftPeriod;
    }

    static contextTypes(): object {
        return {
            DateRangeContext
        };
    }
}
