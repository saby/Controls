import {register} from 'Types/di';
import {RecordSet} from 'Types/collection';
import Serializer = require('Core/Serializer');
import {getChangedHistoryItems} from './FilterItemsStorage';
import {DataSet} from 'Types/source';

const DEFAULT_HISTORY_ITEMS_COUNT = 3;
const MAX_HISTORY_ITEMS_COUNT = 6;
const DEFAULT_DEMO_HISTORY_ID = 'DEMO_HISTORY_ID';

const pinnedData = {
    _type: 'recordset',
    d: [],
    s: [
        {n: 'ObjectId', t: 'Строка'},
        {n: 'ObjectData', t: 'Строка'},
        {n: 'HistoryId', t: 'Строка'}
    ]
};
const frequentData = {
    _type: 'recordset',
    d: [
        [
            '6', 'History 6', 'TEST_HISTORY_ID_V1'
        ],
        [
            '4', 'History 4', 'TEST_HISTORY_ID_V1'
        ],
        [
            '9', 'History 9', 'TEST_HISTORY_ID_V1'
        ]
    ],
    s: [
        {n: 'ObjectId', t: 'Строка'},
        {n: 'ObjectData', t: 'Строка'},
        {n: 'HistoryId', t: 'Строка'}
    ]
};
const recentData = {
    _type: 'recordset',
    d: [
        [
            '8', JSON.stringify(getChangedHistoryItems(3), new Serializer().serialize), 'TEST_HISTORY_ID_2'
        ],
        [
            '5', JSON.stringify(getChangedHistoryItems(), new Serializer().serialize), 'TEST_HISTORY_ID_1'
        ],
        [
            '2', JSON.stringify(getChangedHistoryItems(2), new Serializer().serialize), 'TEST_HISTORY_ID_3'
        ],
        [
            '3', JSON.stringify(getChangedHistoryItems(4), new Serializer().serialize), 'TEST_HISTORY_ID_4'
        ],
        [
            '5', JSON.stringify(getChangedHistoryItems(5), new Serializer().serialize), 'TEST_HISTORY_ID_5'
        ],
        [
            '10', JSON.stringify(getChangedHistoryItems(1), new Serializer().serialize), 'TEST_HISTORY_ID_10'
        ]
    ],
    s: [
        {n: 'ObjectId', t: 'Строка'},
        {n: 'ObjectData', t: 'Строка'},
        {n: 'HistoryId', t: 'Строка'}
    ]
};

function createRecordSet(data: any): RecordSet {
    return new RecordSet({
        rawData: data,
        keyProperty: 'ObjectId',
        adapter: 'adapter.sbis'
    });
}

export default class DemoHistorySource {
    protected _recent: number = null;
    protected _historyItemsCount: number = 1;
    protected _historyId: string = 'DEMO_HISTORY_ID';

    constructor(cfg: Record<string, any>) {
        this._recent = cfg.recent;
        this._historyId = cfg.historyId;
        this._historyItemsCount = cfg.historyId === DEFAULT_DEMO_HISTORY_ID ?
            DEFAULT_HISTORY_ITEMS_COUNT :
            MAX_HISTORY_ITEMS_COUNT;
    }

    query(): Promise<any> {
        return new Promise((resolve): void => {
            resolve(this.getData(this._historyItemsCount));
        });
    }

    saveHistory(): void {
        // for demo
    }

    getHistoryId(): string {
        return this._historyId;
    }

    update(): object {
        return {};
    }

    private getRecentData(count: number): object {
        return {
            ...recentData,
            d: recentData.d.slice(0, count)
        };
    }

    private getData(historyItemsCount: number): DataSet {
        return new DataSet({
            rawData: {
                frequent: createRecordSet(frequentData),
                pinned: createRecordSet(pinnedData),
                recent: createRecordSet(this.getRecentData(historyItemsCount))
            },
            itemsProperty: '',
            keyProperty: 'ObjectId'
        });
    }
}
register('demoSourceHistory', DemoHistorySource);
