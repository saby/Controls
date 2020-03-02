import {assert} from 'chai';
import { ICrud, DataSet} from 'Types/source';
import {Record} from 'Types/entity';
import {
    error as ErrorModule,
    ISourceErrorConfig,
    SourceCrudInterlayer
} from 'Controls/dataSource';
import {getGridData, SourceFaker} from 'Controls-demo/List/Utils/listDataGenerator';

const NUMBER_OF_ITEMS = 100;

const rawData = getGridData(NUMBER_OF_ITEMS, {
    title: 'Заголовок',
    text: {
        type: 'string',
        randomData: true
    }
});

describe('Controls/_dataSource/SourceCrudInterlayer', () => {
    let errorConfig: ISourceErrorConfig;
    let source: ICrud;
    let sourceCrudInterlayer: SourceCrudInterlayer;
    let fallingSource: ICrud;
    let fallingSourceCrudInterlayer: SourceCrudInterlayer;

    beforeEach(() => {
        errorConfig = {
            mode: ErrorModule.Mode.include,
            onBeforeProcessError: (error: Error) => {
                assert.isNotEmpty(error.message);
            }
        };
        source = new SourceFaker({data: rawData, failed: false, keyProperty: 'id'});
        fallingSource = new SourceFaker({data: rawData, failed: true, keyProperty: 'id'});
        sourceCrudInterlayer = new SourceCrudInterlayer({source, errorConfig});
        fallingSourceCrudInterlayer = new SourceCrudInterlayer({source: fallingSource, errorConfig});
    });

    describe('create', () => {
        it('should return Promise<Record>', () => {
            return sourceCrudInterlayer.create({
                id: 666,
                title: 'Запись 666'
            })
                 .then((record: Record) => {
                     assert.equal(record.get('title'), 'Запись 666');
                 })
                 .catch((errorData: ErrorModule.ViewConfig) => {
                     assert.isNotTrue(true, 'This call should not throw any exceptions');
                 });
        });

        it('should return Promise<Error>', () => {
            return fallingSourceCrudInterlayer.create({
                id: 666,
                title: 'Запись 666'
            })
                .then((record: Record) => {
                    assert.isNotTrue(true, 'This call should throw an exception');
                })
                .catch((errorData: ErrorModule.ViewConfig) => {
                    assert.equal(errorData.mode, errorConfig.mode);
                });
        });
    });
    describe('read', () => {
        it('should return Promise<Record>', () => {
            const _record = new Record();
            _record.setRawData(rawData[4]);
            return sourceCrudInterlayer.read(4)
                .then((record: Record) => {
                    assert.equal(record.get('id'), _record.get('id'));
                })
                .catch((errorData: ErrorModule.ViewConfig) => {
                    assert.isNotTrue(true, 'This call should not throw any exceptions');
                });
        });

        it('should return Promise<Error>', () => {
            return fallingSourceCrudInterlayer.read(5)
                .then((record: Record) => {
                    assert.isNotTrue(true, 'This call should throw an exception');
                })
                .catch((errorData: ErrorModule.ViewConfig) => {
                    assert.equal(errorData.mode, errorConfig.mode);
                });
        });
    });
    describe('update', () => {
        let record: Record;

        beforeEach(() => {
            record = new Record();
            record.setRawData(rawData[4]);
        });

        it('should return Promise<null>', () => {
            return sourceCrudInterlayer.update(record)
                .then((nulled: unknown) => {
                    assert.isNull(nulled);
                })
                .catch((errorData: ErrorModule.ViewConfig) => {
                    assert.isNotTrue(true, 'This call should not throw any exceptions');
                });
        });

        it('should return Promise<Error>', () => {
            return fallingSourceCrudInterlayer.update(record)
                .then((nulled: unknown) => {
                    assert.isNotTrue(true, 'This call should throw an exception');
                })
                .catch((errorData: ErrorModule.ViewConfig) => {
                    assert.equal(errorData.mode, errorConfig.mode);
                });
        });
    });
    describe('query', () => {
        it('should return Promise<DataSet>', () => {
            const record = new Record();
            record.setRawData(rawData[4]);
            return sourceCrudInterlayer.query({
                filter: {},
                sorting: [{id: true}]
            })
                .then((dataSet: DataSet) => {
                    assert.equal(dataSet.getAll().at(4).get('id'), record.get('id'));
                })
                .catch((errorData: ErrorModule.ViewConfig) => {
                    assert.isNotTrue(true, 'This call should not throw any exceptions');
                });
        });

        it('should return Promise<Error>', () => {
            return fallingSourceCrudInterlayer.query({
                filter: {},
                sorting: [{id: true}]
            })
                .then((dataSet: DataSet) => {
                    assert.isNotTrue(true, 'This call should throw an exception');
                })
                .catch((errorData: ErrorModule.ViewConfig) => {
                    assert.equal(errorData.mode, errorConfig.mode);
                });
        });
    });
    describe('destroy', () => {
        it('should return Promise<null>', () => {
            return sourceCrudInterlayer.destroy(5)
                .then((nulled: unknown) => {
                    assert.isNull(nulled);
                })
                .catch((errorData: ErrorModule.ViewConfig) => {
                    assert.isNotTrue(true, 'This call should not throw any exceptions');
                });
        });

        it('should return Promise<Error>', () => {
            return fallingSourceCrudInterlayer.destroy(5)
                .then((nulled: unknown) => {
                    assert.isNotTrue(true, 'This call should throw an exception');
                })
                .catch((errorData: ErrorModule.ViewConfig) => {
                    assert.equal(errorData.mode, errorConfig.mode);
                });
        });
    });
});
