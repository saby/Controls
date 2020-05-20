import {assert} from 'chai';
import {Memory} from 'Types/source';
import {Record} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {CrudWrapper} from 'Controls/dataSource';
import {error as dsError} from 'Controls/dataSource';

const data = [
    {
        id : 1,
        title : 'Первый',
        type: 1
    },
    {
        id : 2,
        title : 'Второй',
        type: 2
    },
    {
        id : 3,
        title : 'Третий',
        type: 2
    }
];

describe('Controls/_dataSource/CrudWrapper', () => {
    let source: Memory;
    let crudWrapper: CrudWrapper;

    describe('create', () => {
        it('should return Promise<Record>', () => {
            source = new Memory({
                data,
                keyProperty: 'id'
            });
            crudWrapper = new CrudWrapper({source});
            return crudWrapper.create({
                id: 666,
                title: 'Запись 666'
            })
                 .then((record: Record) => {
                     assert.equal(record.get('title'), 'Запись 666');
                 })
                 .catch((errorData: dsError.ViewConfig) => {
                     assert.isNotTrue(true, 'This call should not throw any exceptions');
                 });
        });
    });

    describe('read', () => {
        it('should return Promise<Record>', () => {
            source = new Memory({
                data,
                keyProperty: 'id'
            });
            crudWrapper = new CrudWrapper({source});
            return crudWrapper.read(1)
                .then((record: Record) => {
                    assert.equal(record.get('title'), 'Первый');
                }).catch((errorData: dsError.ViewConfig) => {
                    assert.isNotTrue(true, 'This call should not throw any exceptions');
                });
        });
    });
    describe('update', () => {
        let record: Record;

        beforeEach(() => {
            record = new Record();
            record.setRawData({
                id : 1,
                title : 'Первый_',
                type: 1
            });
        });

        it('should return Promise<null>', () => {
            source = new Memory({
                data,
                keyProperty: 'id'
            });
            crudWrapper = new CrudWrapper({source});
            return crudWrapper.update(record)
                .then(() => {
                    assert.isTrue(true, 'This call should not throw any exceptions');
                })
                .catch((errorData: dsError.ViewConfig) => {
                    assert.isNotTrue(true, 'This call should not throw any exceptions');
                });
        });
    });
    describe('query', () => {
        it('should return Promise<DataSet>', () => {
            source = new Memory({
                data,
                keyProperty: 'id'
            });
            crudWrapper = new CrudWrapper({source});
            return crudWrapper.query({
                filter: {},
                sorting: []
            })
                .then((recordSet: RecordSet) => {
                    assert.equal(recordSet.at(0).get('id'), 1);
                })
                .catch((errorData: dsError.ViewConfig) => {
                    assert.isNotTrue(true, 'This call should not throw any exceptions');
                });
        });

    });
    describe('destroy', () => {
        it('should return Promise<null>', () => {
            source = new Memory({
                data,
                keyProperty: 'id'
            });
            crudWrapper = new CrudWrapper({source});
            return crudWrapper.destroy(1)
                .then(() => {
                    assert.isTrue(true, 'This call should not throw any exceptions');
                })
                .catch((errorData: dsError.ViewConfig) => {
                    assert.isNotTrue(true, 'This call should not throw any exceptions');
                });
        });
    });
});
