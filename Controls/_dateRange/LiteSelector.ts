import RangeShortSelector from 'Controls/_dateRange/RangeShortSelector';
import {Logger} from 'UI/Utils';

class Component extends RangeShortSelector {
    constructor() {
        super();
        Logger.warn('Controls/dateRange:LiteSelector: название контрола устарело, используйте Controls/dateRange:RangeShortSelector');
    }
}

export  default Component;
