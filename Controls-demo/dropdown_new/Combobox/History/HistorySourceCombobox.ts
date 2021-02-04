import {Source, Service} from 'Controls/history';
import {RecordSet} from 'Types/collection';
import {DataSet, Memory, Query} from 'Types/source';

const items = [
    { id: 1, title: 'admin.sbis.ru' },
    { id: 2, title: 'cloud.sbis.ru' },
    { id: 3, title: 'genie.sbis.ru' },
    { id: 4, title: 'my.sbis.ru' },
    { id: 5, title: 'online.sbis.ru' },
    { id: 6, title: 'sbis.ru' },
    { id: 7, title: 'tensor.ru' },
    { id: 8, title: 'wi.sbis.ru' },
    { id: 9, title: 'dev-online.sbis.ru' },
    { id: 10, title: 'fix-online.sbis.ru' }
];
const recentData = {
    _type: 'recordset',
    d: [],
    s: [
        { n: 'ObjectId', t: 'Строка' },
        { n: 'ObjectData', t: 'Строка' },
        { n: 'HistoryId', t: 'Строка' }
    ]
};

function _createRecordSet(data) {
    return new RecordSet({
        rawData: data,
        keyProperty: 'ObjectId',
        adapter: 'adapter.sbis'
    });
}

function createMemory(): Source {
    const srcData = new DataSet({
        rawData: {
            frequent: _createRecordSet(),
            pinned: _createRecordSet(),
            recent: _createRecordSet(recentData)
        },
        itemsProperty: '',
        keyProperty: 'ObjectId'
    });
    const hs = new Source({
        originSource: new Memory({
            keyProperty: 'id',
            data: items
        }),
        historySource: new Service({
            historyId: 'TEST_HISTORY_ID_COMBOBOX',
            pinned: true
        })
    });
    const query = new Query().where({
        $_history: true
    });
    hs._$historySource.query = function () {
        return Promise.resolve(srcData);
    };
    // Заглушка, чтобы демка не ломилась не сервис истории
    hs._$historySource.update = function () {
        return {};
    };
    hs.query(query);
    hs._$historySource.query();
    return hs;
}

export {
    createMemory
};
