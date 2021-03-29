import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_dateRange/_DateRangeSelectorConsumer/_DateRangeSelectorConsumer';
import DateRangeContext from 'Controls/_dateRange/DateRangeContext';
import IDateRangeContext from './interfaces/IDateRangeContext';

export default class RangeSelectorConsumer extends Control {
    protected _template: TemplateFunction = template;
    setShiftPeriod: Function;

    protected _beforeMount(options: IControlOptions, context: IDateRangeContext): void {
        this.setShiftPeriod = context.DateRangeContext.setShiftPeriod;
    }

    static contextTypes(): object {
        return {
            DateRangeContext
        };
    }
}
