import * as Deferred from 'Core/Deferred';
import {Memory, Query, DataSet} from 'Types/source';

const DELAY_STEP = 500;
const DEFAULT_DELAY = 1000;

interface IOptions {
    source: Memory;
}

function getRandomCount(): number {
    const min = 0;
    const max = 2;
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
            this._limit += getRandomCount();
            query.limit(this._limit);

            // С каждой подгрузкой поиск происходит дольше
            this._delay = DELAY_STEP;
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
                recordSet.setMetaData({...recordSet.getMetaData(), iterative: isSearch});
                return recordSet;
            });
        });
        return loadDef;
    }
}
