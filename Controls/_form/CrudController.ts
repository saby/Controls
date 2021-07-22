import rk = require('i18n!Controls');
import {readWithAdditionalFields} from './crudProgression';
import {Model} from 'Types/entity';
import {Memory} from 'Types/source';

export const enum CRUD_EVENTS {
    CREATE_STARTED = 'createstarted',
    CREATE_SUCCESSED = 'createsuccessed',
    CREATE_FAILED = 'createfailed',
    READ_STARTED = 'readstarted',
    READ_SUCCESSED = 'readsuccessed',
    READ_FAILED = 'readfailed',
    UPDATE_STARTED = 'updatestarted',
    UPDATE_SUCCESSED = 'updatesuccessed',
    UPDATE_FAILED = 'updatefailed',
    DELETE_STARTED = 'deletestarted',
    DELETE_SUCCESSED = 'deletesuccessed',
    DELETE_FAILED = 'deletefailed'
}

export interface ICrudConfig {
    showLoadingIndicator: boolean;
}

/**
 * Контроллер, который инициирует запросы к источнику данных (см. {@link Controls/form:Controller#source source}) для чтения, создания, удаления или обновления записи.
 * Контроллер используется в {@link Controls/form:Controller}.
 * @public
 * @author Красильников А.С.
 *
 * @see Controls/form:Controller
 * @see Types/source:SbisService
 * @see Types/source:Memory
 */
export default class CrudController {
    private readonly _crudOperationFinished: (result: string, args: [Error|Model, Model|string?, unknown?]) => void = null;
    private readonly _notifyRegisterPending: (args: [Promise<Model>, object]) => void = null;

    private _dataSource: Memory = null;

    constructor(dataSource: Memory, crudOperationFinished: (result: string, args: [Error|Model, Model|string?, unknown?]) => void,
                notifyRegisterPending: (args: [Promise<Model>, object]) => void = null) {
        this._dataSource = dataSource;
        this._crudOperationFinished = crudOperationFinished;
        this._notifyRegisterPending = notifyRegisterPending;
    }

    setDataSource(newDataSource: Memory): void {
        this._dataSource = newDataSource;
    }

    protected _registerPending(promise: Promise<Model>, config?: ICrudConfig): boolean {
        const showLoadingIndicator = typeof config?.showLoadingIndicator === 'undefined' ? true : config.showLoadingIndicator;
        this._notifyRegisterPending([promise, {showLoadingIndicator}]);
    }
    /**
     * Создает пустую запись через источник данных.
     * @function Controls/_form/CrudController#create
     * @param [meta] Дополнительные метаданные, которые могут понадобиться для создания записи.
     */
    create(createMetaData: unknown, config?: ICrudConfig): Promise<Model> {
        const promise = this._dataSource.create(createMetaData);
        this._registerPending(promise, config);
        return new Promise((res, rej) => {
            promise.then((record: Model) => {
                this._crudOperationFinished(CRUD_EVENTS.CREATE_SUCCESSED, [record]);
                res(record);
            }, (e: Error) => {
                this._crudOperationFinished(CRUD_EVENTS.CREATE_FAILED, [e]);
                rej(e);
            });
        });
    }
    /**
     * Читает запись из источника данных по идентификатору.
     * @function Controls/_form/CrudController#read
     * @param {Number|String}key Первичный ключ записи.
     * @param {Object} [meta] Дополнительные метаданные.
     * @param {ICrudConfig} [config]
     */
    read(key: string, readMetaData: unknown, config?: ICrudConfig): Promise<Model> {
        const promise: Promise<Model> = new Promise((res, rej) => {
            readWithAdditionalFields(this._dataSource, key, readMetaData).then((record: Model) => {
                this._crudOperationFinished(CRUD_EVENTS.READ_SUCCESSED, [record]);
                res(record);
            }, (e: Error) => {
                this._crudOperationFinished(CRUD_EVENTS.READ_FAILED, [e]);
                rej(e);
            });
        });
        this._registerPending(promise, config);
        return promise;
    }
    /**
     * Обновляет запись в источнике данных.
     * @function Controls/_form/CrudController#update
     * @param {Record|RecordSet} Обновляемая запись или рекордсет.
     * @param {Object} [meta] Дополнительные метаданные.
     */
    update(record: Model, isNewRecord: boolean, config?: unknown): Promise<void> | null {
        if (record.isChanged() || isNewRecord) {
            const updateMetaData = config?.additionalData;
            const resultUpdate = this._dataSource.update(record, updateMetaData);
            this._registerPending(resultUpdate, config);
            return new Promise((res, rej) => {
                resultUpdate.then((key) => {
                    this._crudOperationFinished(CRUD_EVENTS.UPDATE_SUCCESSED, [record, key, config]);
                    res(key);
                }).catch((e: Error) => {
                    this._crudOperationFinished(CRUD_EVENTS.UPDATE_FAILED, [e, record]);
                    rej(e);
                });
            });
        }

        return null;
    }

    /**
     * Удаляет запись из источника данных.
     * @function Controls/_form/CrudController#delete
     * @param {Number|String} Первичный ключ или массив первичных ключей записи.
     * @param {Object} [meta] Дополнительные метаданные.
     */
    delete(record: Model, destroyMeta: unknown, config?: ICrudConfig): Promise<Model> {
        const promise = this._dataSource.destroy(record.getId(), destroyMeta);
        this._registerPending(promise, config);

        return new Promise((res, rej) => {
            promise.then(() => {
                this._crudOperationFinished(CRUD_EVENTS.DELETE_SUCCESSED, [record]);
                res();
            }, (e: Error) => {
                this._crudOperationFinished(CRUD_EVENTS.DELETE_FAILED, [e]);
                rej(e);
            });
        });
    }
}
