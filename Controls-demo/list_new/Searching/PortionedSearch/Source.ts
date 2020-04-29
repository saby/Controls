import * as Deferred from 'Core/Deferred';
import {Memory} from 'Types/source';

const SEARCH_DELAY = 35000;

export default class PortionedSearchSource extends Memory {
    private source: Memory = null;

    constructor(opts) {
        super(opts);
        this.source = opts.source;
    }

    query(query) {
        const isSearch = query.getWhere().title !== undefined && (query.getOffset() === 10 || query.getOffset() === 30);
        const origQuery = this.source.query.apply(this.source, arguments);
        const loadDef = new Deferred();
        const delayTimer = isSearch ? SEARCH_DELAY : 0;

        setTimeout(() => {
            if (!loadDef.isReady()) {
                loadDef.callback();
            }
        }, delayTimer);
        loadDef.addCallback(() => {
            return origQuery;
        });
        return loadDef;
    }
}
