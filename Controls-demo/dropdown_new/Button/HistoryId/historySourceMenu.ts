import {DataSet, Memory} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';
import {Source, Service} from 'Controls/history';

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
    d: [],
    s: [
        {n: 'ObjectId', t: 'Строка'},
        {n: 'ObjectData', t: 'Строка'},
        {n: 'HistoryId', t: 'Строка'}
    ]
};
const recentData = {
    _type: 'recordset',
    d: [],
    s: [
        {n: 'ObjectId', t: 'Строка'},
        {n: 'ObjectData', t: 'Строка'},
        {n: 'HistoryId', t: 'Строка'}
    ]
};

export function getItems(): any[] {
    const hierarchyItems = [
        {key: 1, title: 'Task in development', parent: null},
        {key: 2, title: 'Error in development', parent: null},
        {key: 3, title: 'Commission', parent: null},
        {key: 4, title: 'Assignment', parent: null},
        {key: 5, title: 'Coordination', '@parent': true},
        {key: 6, title: 'Development', '@parent': true},
        {key: 7, title: 'Assignment for accounting', parent: null},
        {key: 8, title: 'Assignment for delivery', parent: null},
        {key: 9, title: 'Assignment for logisticians', parent: null}
    ];

    const coordSub = ['Coordination', 'Negotiate the discount', 'Harmonization of price changes', 'Approval of participation in trading',
        'Matching the layout', 'Matching the layout of the mobile application', 'Harmonization of the standard', 'Harmonization of themes',
        'Harmonization of the mobile application standard', 'Coordination of the change in a limited period',
        'Harmonization of the change of the contract template'];

    const devSub = ['The task in development', 'Merge request', 'Error in development',
        'Run on the test bench', 'Harmonization of changes in the database', 'Changing the operation rule',
        'Creating (changing) a printed form', 'The task of developing a standard component (test)', 'Code review',
        'Service update', 'Run on the working', 'Adding / changing a sample application code',
        'Component development (test)', 'Release report', 'Acceptance of the project (functional testing)'
    ];

    if (hierarchyItems[4].parent !== null) {
        hierarchyItems[4].parent = null;
        for (let i = 0; i < coordSub.length; i++) {
            hierarchyItems.push({
                key: i + 10,
                title: coordSub[i],
                parent: 5,
                '@parent': false
            });
        }
        hierarchyItems[5].parent = null;
        for (let j = 0; j < devSub.length; j++) {
            hierarchyItems.push({
                key: j + 22,
                title: devSub[j],
                parent: 6,
                '@parent': false
            });
        }
    }
    return hierarchyItems;
}

class HistorySourceMenu extends Source {
    private _srcData: DataSet = null;
    constructor(config) {
        super(config);
        this._srcData = this._createDataSet(frequentData, pinnedData, recentData);
        this._$parentProperty = 'parent';
        this._$originSource = new Memory({
            keyProperty: 'key',
            data: getItems()
        });

        this._$historySource = new Service({
            historyId: 'TEST_HISTORY_ID',
            pinned: true
        });
        this._$historySource.query = this._serviceQuery.bind(this);
        this._$historySource.update = this._serviceUpdate.bind(this);
    }

    // Заглушка, чтобы демка не ломилась не сервис истории
    private _serviceUpdate(item, meta) {
        const pinned = this._srcData.getRow().get('pinned');
        const recent = this._srcData.getRow().get('recent');
        let historyItem;
        if (meta['$_pinned']) {
            historyItem = new Model({
                rawData: {
                    d: [String(item.getKey()), item.getKey()],
                    s: [{ n: 'ObjectId', t: 'Строка' },
                        { n: 'HistoryId', t: 'Строка' }]
                },
                adapter: pinned.getAdapter()
            });
            pinned.append([historyItem]);
        } else if (meta['$_pinned'] === false) {
            pinned.remove(pinned.getRecordById(item.getKey()));
        } else if (meta['$_history'] && !recent.getRecordById(item.getKey())) {
            historyItem = new Model({
                rawData: {
                    d: [String(item.getKey()), item.getKey()],
                    s: [{ n: 'ObjectId', t: 'Строка' },
                        { n: 'HistoryId', t: 'Строка' }]
                },
                adapter: pinned.getAdapter()
            });
            recent.prepend([historyItem]);
        }
        this._srcData = this._createDataSet(frequentData, pinned.getRawData(), recentData);
        return Promise.resolve();
    }

    private _serviceQuery(): Promise<DataSet> {
        return Promise.resolve(this._srcData);
    }

    private _createRecordSet(data) {
        return new RecordSet({
            rawData: data,
            keyProperty: 'ObjectId',
            adapter: 'adapter.sbis'
        });
    }

    private _createDataSet(frData, pinData, recData) {
        return new DataSet({
            rawData: {
                frequent: this._createRecordSet(frData),
                pinned: this._createRecordSet(pinData),
                recent: this._createRecordSet(recData)
            },
            itemsProperty: '',
            keyProperty: 'ObjectId'
        });
    }
}

export default HistorySourceMenu;
