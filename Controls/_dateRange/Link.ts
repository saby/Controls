import DateSelector from 'Controls/_dateRange/DateSelector';
import {Logger} from 'UI/Utils';

class Component extends DateSelector {
    constructor() {
        super();
        Logger.warn('Controls/dateRange:Link: название контрола устарело, используйте Controls/dateRange:DateSelector');
    }
}

export default Component;
