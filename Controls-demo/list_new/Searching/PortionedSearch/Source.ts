import * as Deferred from 'Core/Deferred';
import {Memory, Query, DataSet} from 'Types/source';
import { RecordSet } from 'Types/collection';

const DEFAULT_DELAY = 5000;

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
            this._limit += 2;
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

                let hasMore = recordSet.getMetaData().more;
                if (isSearch && this._limit) {
                    // удаляем из рекордсета лишние записи, оставляем только limit
                    // сделано так чтобы можно было посчитать more
                    hasMore = this._limitRecordSet(recordSet);
                }

                const metaData = {
                    ...recordSet.getMetaData(),
                    more: hasMore,
                    iterative: isSearch
                }
                recordSet.setMetaData(metaData);
                return recordSet;
            });
        });
        return loadDef;
    }

    private _limitRecordSet(recordSet: RecordSet): boolean {
        const countRemovedItems = recordSet.getCount() - this._limit;
        for (let i = this._limit; i < recordSet.getCount(); i++) {
            recordSet.removeAt(i);
        }
        return !!countRemovedItems;
    }
}
