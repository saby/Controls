import rk = require('i18n!Controls');
import {readWithAdditionalFields} from './crudProgression';
import {Model} from 'Types/entity';
import {Memory} from 'Types/source';

export default class CrudController {
    private readonly _crudOperationFinished: (result: string, ...args: any) => void = null;
    private readonly _notifyRegisterPending: (params: any) => void = null;
    private readonly _notifyIndicator: (eType: string, params: any) => string = null;

    private readonly _showLoadingIndicator: boolean = false;

    private _dataSource: Memory = null;
    private _indicatorId: string = '';

    constructor(control: any, dataSource: Memory, showLoadingIndicator: boolean,
                crudOperationFinished: (result: string, ...args: any) => void,
                notifyRegisterPending: (params: any) => void = null,
                indicatorNotifier: (eType: string, params: any) => string) {
        this._dataSource = dataSource;
        this._showLoadingIndicator = showLoadingIndicator;
        this._crudOperationFinished = crudOperationFinished.bind(control);
        this._notifyRegisterPending = notifyRegisterPending.bind(control);
        this._notifyIndicator = indicatorNotifier.bind(control);
    }

    updateDataSource(newDataSource: Memory): void {
        this._dataSource = newDataSource;
    }

    create(initValues) {
        const def = this._dataSource.create(initValues);

        this._notifyRegisterPending([def, {showLoadingIndicator: this._showLoadingIndicator}]);

        def.addCallback((record) => {
            this._crudOperationFinished('createSuccessed', record);
            return record;
        });
        def.addErrback((e) => {
            this._crudOperationFinished('createFailed', e);
            return e;
        });

        return def;
    }

    read(key, readMetaData) {
        const def = readWithAdditionalFields(this._dataSource, key, readMetaData);
        const id = this._indicatorId;
        const message = rk('Пожалуйста, подождите…');
        this._indicatorId = this._notifyIndicator('showIndicator', [{id, message}]);

        def.addCallback((record) => {
            this._crudOperationFinished('readSuccessed', record);
            this._notifyIndicator('hideIndicator', [this._indicatorId]);
            return record;
        });
        def.addErrback((e: Error) => {
            this._crudOperationFinished('readFailed', e);
            this._notifyIndicator('hideIndicator', [this._indicatorId]);
            return e;
        });

        return def;
    }

    update(record: Model, isNewRecord: boolean, config?: unknown): Promise<void> | null {
        const updateMetaData = config?.additionalData;

        if (record.isChanged() || isNewRecord) {
            const resultUpdate = this._dataSource.update(record, updateMetaData);
            const argsPending = [
                resultUpdate, {
                    showLoadingIndicator: this._showLoadingIndicator
                }
            ];
            this._notifyRegisterPending(argsPending);
            resultUpdate.addCallback((key) => {
                this._crudOperationFinished('updateSuccessed', record, key, config);
                return key;
            }).addErrback((error) => {
                this._crudOperationFinished('updateFailed', error, record);
                return error;
            });
            return resultUpdate;
        }

        return null;
    }

    delete(record, destroyMeta) {
        const def = this._dataSource.destroy(record.getId(), destroyMeta);
        this._notifyRegisterPending([def, { showLoadingIndicator: this._showLoadingIndicator }]);

        def.addCallback(() => {
            this._crudOperationFinished('deleteSuccessed', record);
        });
        def.addErrback((e) => {
            this._crudOperationFinished('deleteFailed', e);
            return e;
        });

        return def;
    }

    hideIndicator(): void {
        if (this._indicatorId) {
            this._notifyIndicator('hideIndicator', [this._indicatorId]);
        }
    }

}
