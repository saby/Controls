import * as DataContext from 'Core/DataContext';

export default class DateRangeContext extends DataContext {
    _moduleName: string;
    shiftPeriod: Function;
    constructor() {
        super();
    }
}

DateRangeContext.prototype._moduleName = 'Controls/_dateRange/dateRangeContext';
