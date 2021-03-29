import * as DataContext from 'Core/DataContext';

export default class DateRangeContext extends DataContext {
    _moduleName: string;
    shiftPeriod: Function;
    constructor() {
        super();
        this.setShiftPeriod = this.setShiftPeriod.bind(this);
    }
    setShiftPeriod(shiftPeriod: Function): void {
        this.shiftPeriod = shiftPeriod;
        this.updateConsumers();
    }
}

DateRangeContext.prototype._moduleName = 'Controls/_dateRange/DateRangeContext';
