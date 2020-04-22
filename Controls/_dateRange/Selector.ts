import RangeSelector from 'Controls/_dateRange/RangeSelector';
import {Logger} from 'UI/Utils';

class Component extends RangeSelector {
    constructor() {
        super();
        Logger.warn('Controls/dateRange:Selector: название контрола устарело, используйте Controls/dateRange:RangeSelector');
    }
}

export  default Component;
