import * as Deferred from 'Core/Deferred';
import {Memory, Query, DataSet} from 'Types/source';
import { RecordSet } from 'Types/collection';

const DEFAULT_DELAY = 1000;
const SEARCH_DELAY = 5000;
const SEARCH_PAGE = 2;

interface IOptions {
    source: Memory;
}

export default class PortionedSearchSource {
    private source: Memory = null;
    protected _mixins: number[] = [];
    private _delayTimer: NodeJS.Timeout;
    private _limit: number = 0;
    private _delay: number = DEFAULT_DELAY;

    constructor(opts: IOptions) {
        this['[Types/_source/ICrud]'] = true;
        this.source = opts.source;
    }

    query(query: Query<unknown>): Promise<DataSet> {
        const isSearch = query.getWhere().title !== undefined;
        if (isSearch) {
            // имитируем порционную подгрузку. Подгружаем по несколько элементов.
            this._limit += SEARCH_PAGE;
            this._delay = SEARCH_DELAY;
        } else {
            this._limit = 0;
            this._delay = DEFAULT_DELAY;
        }

        const origQuery = this.source.query.apply(this.source, arguments);
        const loadDef = new Deferred();

        if (this._delayTimer) {
            clearTimeout(this._delayTimer);
        }
        this._delayTimer = setTimeout(() => {
            if (!loadDef.isReady()) {
                loadDef.callback();
            }
        }, DEFAULT_DELAY);
        loadDef.addCallback(() => {
            return origQuery.addCallback((dataSet) => {
                const recordSet = dataSet.getAll();

                let hasMore;
                let total = recordSet.getMetaData().total;
                if (isSearch && this._limit) {
                    total = recordSet.getCount();
                    hasMore = !!(recordSet.getCount() - this._limit);
                    this._limitRecordSet(recordSet);
                } else {
                    hasMore = query.getOffset() + query.getLimit() < total;
                }

                const metaData = {
                    ...recordSet.getMetaData(),
                    total,
                    more: hasMore,
                    iterative: isSearch
                }
                recordSet.setMetaData(metaData);
                return recordSet;
            });
        });
        return loadDef;
    }

    private _limitRecordSet(recordSet: RecordSet): void {
        // Нам нужно взять только SEARCH_PAGE элементов
        // Поэтому сперва удаляем элементы до предыдущего лимита
        const prevLimit = this._limit - SEARCH_PAGE;
        let countRemoved = 0;
        while (countRemoved !== prevLimit && recordSet.getCount() >= SEARCH_PAGE) {
            recordSet.removeAt(0);
            countRemoved++;
        }

        // А потом удаляем все элементы после лимита
        while (recordSet.getCount() > SEARCH_PAGE) {
            recordSet.removeAt(SEARCH_PAGE);
        }
    }
}
