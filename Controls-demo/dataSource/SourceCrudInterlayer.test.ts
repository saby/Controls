import {assert} from 'chai';
import { ICrud, Memory, DataSet, Query, Remote } from 'Types/source';
import {Record} from 'Types/entity';
import {
    error as ErrorModule,
    ISourceErrorConfig,
    ISourceErrorData,
    SourceCrudInterlayer
} from '../../Controls/dataSource';
import {IOptions} from 'Types/_source/Local';
import {RecordSet} from 'Types/collection';

const NUMBER_OF_ITEMS = 100;

/**
 * Генератор данных
 * @param n
 */
const generateRawData = (n: number): any[] => {
    const rawData = [];
    for (let i = 0; i < n; i++) {
        rawData.push({
            id: i,
            title: `${i} item`
        });
    }
    return rawData;
};

class SourceFaker extends Remote {

    private _failed: boolean;

    constructor(options?: IOptions) {
        super(options);
    }

    create(meta?: object): Promise<Record> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this._failed) {
                    reject({
                        name: '400 Bad Request',
                        message: 'Сервер не отдал данные'
                    });
                } else {
                    resolve();
                }
            }, 2000);
        });
    }

    destroy(keys: number | string | number[] | string[], meta?: object): Promise<null> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this._failed) {
                    reject({
                        name: '400 Bad Request',
                        message: 'Сервер не отдал данные'
                    });
                } else {
                    resolve();
                }
            }, 2000);
        });
    }

    query(query?: Query): Promise<DataSet> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this._failed) {
                    reject({
                        name: '400 Bad Request',
                        message: 'Сервер не отдал данные'
                    });
                } else {
                    resolve(new DataSet({
                        rawData: generateRawData(NUMBER_OF_ITEMS),
                        keyProperty: 'id'
                    }));
                }
            }, 2000);
        });
    }

    read(key: number | string, meta?: object): Promise<Record> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this._failed) {
                    reject({
                        name: '400 Bad Request',
                        message: 'Сервер не отдал данные'
                    });
                } else {
                    resolve();
                }
            }, 2000);
        });
    }

    update(data: Record | RecordSet, meta?: object): Promise<null> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this._failed) {
                    reject({
                        name: '400 Bad Request',
                        message: 'Сервер не отдал данные'
                    });
                } else {
                    resolve();
                }
            }, 2000);
        });
    }

    setFailed(failed: boolean): void {
        this._failed = failed;
    }

    static instance(options?: IOptions, failed?: boolean): SourceFaker {
        const faker = new SourceFaker(options);
        faker.setFailed(failed);
        return faker;
    }
}

/*
 * const handlers = {
 *    handlers: [
 *        (config: HandlerConfig): error.ViewConfig) => ({
 *            template: LockedErrorTemplate,
 *            options: {
 *                // ...
 *            }
 *        })
 *        (config: HandlerConfig): error.ViewConfig) => ({
 *            template: LockedErrorTemplate,
 *            options: {
 *                // ...
 *            }
 *        })
 *    ]
 * }
 * const errorController = new error.Controller({handlers});
 * sourceCrudInterlayer.create(...)
 *     .then((record: Record) => {
 *         // ...
 *     })
 *     .catch((record: ISourceErrorData) => {
 *         this._showError(record.errorConfig);
 *     })
 */
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
        source = SourceFaker.instance({}, false);
        fallingSource = SourceFaker.instance({}, true);
        sourceCrudInterlayer = new SourceCrudInterlayer(source, errorConfig);
        fallingSourceCrudInterlayer = new SourceCrudInterlayer(fallingSource, errorConfig);
    });

    describe('create', () => {
        it('should return Promise<Record>', () => {
            sourceCrudInterlayer.create({
                id: 666,
                title: 'Запись 666'
            })
                 .then((record: Record) => {
                     assert.equal(record.get('title'), 'Запись 666');
                 })
                 .catch((errorData: ISourceErrorData) => {
                     assert.not
                     assert.equal(errorData.errorConfig.mode, errorConfig.mode);
                 });
        });

        it('should return Promise<Error>', () => {
            fallingSourceCrudInterlayer.create({
                id: 666,
                title: 'Запись 666'
            })
                .then((record: Record) => {
                    assert.equal(record.get('title'), 'Запись 666');
                })
                .catch((errorData: ISourceErrorData) => {
                    assert.equal(errorData.errorConfig.mode, errorConfig.mode);
                });
        });
    });
    describe('read', () => {

    });
    describe('update', () => {

    });
    describe('query', () => {

    });
    describe('destroy', () => {

    });
});
