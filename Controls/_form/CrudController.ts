import rk = require('i18n!Controls');
import {readWithAdditionalFields} from './crudProgression';
import {Model} from 'Types/entity';
import {Memory} from 'Types/source';

export default class CrudController {
    private readonly _crudOperationFinished: (result: string, args: [Error|Model, Model|string?, unknown?]) => void = null;
    private readonly _notifyRegisterPending: (args: [Promise<Model>, object]) => void = null;
    private readonly _notifyIndicator: (eType: string, args: unknown[]) => string = null;

    private readonly _showLoadingIndicator: boolean = false;

    private _dataSource: Memory = null;
    private _indicatorId: string = '';

    constructor(dataSource: Memory, crudOperationFinished: (result: string, args: [Error|Model, Model|string?, unknown?]) => void,
                notifyRegisterPending: (args: [Promise<Model>, object]) => void = null,
                indicatorNotifier: (eType: string, params: unknown[] | string[]) => string,
                showLoadingIndicator: boolean = true) {
        this._dataSource = dataSource;
        this._showLoadingIndicator = showLoadingIndicator;
        this._crudOperationFinished = crudOperationFinished;
        this._notifyRegisterPending = notifyRegisterPending;
        this._notifyIndicator = indicatorNotifier;
    }

    setDataSource(newDataSource: Memory): void {
        this._dataSource = newDataSource;
    }

    create(createMetaData: unknown): Promise<Model> {
        const promise = this._dataSource.create(createMetaData).then((record: Model) => {
            this._crudOperationFinished('createSuccessed', [record]);
            return record;
        }, (e: Error) => {
            this._crudOperationFinished('createFailed', [e]);
            return e;
        });
        this._notifyRegisterPending([promise, {showLoadingIndicator: this._showLoadingIndicator}]);
        return promise;
    }

    read(key: string, readMetaData: unknown): Promise<Model> {
        const id = this._indicatorId;
        const message = rk('Пожалуйста, подождите…');
        this._indicatorId = this._notifyIndicator('showIndicator', [{id, message}]);

        return readWithAdditionalFields(this._dataSource, key, readMetaData).then((record: Model) => {
            this._crudOperationFinished('readSuccessed', [record]);
            this._notifyIndicator('hideIndicator', [this._indicatorId]);
            return record;
        }, (e: Error) => {
            this._crudOperationFinished('readFailed', [e]);
            this._notifyIndicator('hideIndicator', [this._indicatorId]);
            return e;
        });
    }

    update(record: Model, isNewRecord: boolean, config?: unknown): Promise<void> | null {
        if (record.isChanged() || isNewRecord) {
            const updateMetaData = config?.additionalData;
            const resultUpdate = this._dataSource.update(record, updateMetaData);
            this._notifyRegisterPending([resultUpdate, {showLoadingIndicator: this._showLoadingIndicator}
            ]);
            return resultUpdate.then((key) => {
                this._crudOperationFinished('updateSuccessed', [record, key, config]);
                return key;
            }, (e: Error) => {
                this._crudOperationFinished('updateFailed', [e, record]);
                return e;
            });
        }

        return null;
    }

    delete(record: Model, destroyMeta: unknown): Promise<Model> {
        const promise = this._dataSource.destroy(record.getId(), destroyMeta);
        this._notifyRegisterPending([promise, { showLoadingIndicator: this._showLoadingIndicator }]);

        return promise.then(() => {
            this._crudOperationFinished('deleteSuccessed', [record]);
        }, (e: Error) => {
            this._crudOperationFinished('deleteFailed', [e]);
            return e;
        });
    }

    hideIndicator(): void {
        if (this._indicatorId) {
            this._notifyIndicator('hideIndicator', [this._indicatorId]);
        }
    }
}
