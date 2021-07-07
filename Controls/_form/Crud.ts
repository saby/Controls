import rk = require('i18n!Controls');
import Control = require('Core/Control');
import tmpl = require('wml!Controls/_form/Crud/Crud');
import {readWithAdditionalFields} from './crudProgression';
import {Logger} from 'UI/Utils';
import {Model} from 'Types/entity';

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

let CRUD = Control.extend({
    _template: tmpl,
    showLoadingIndicator: false,

    _beforeMount(): void {
        Logger.error('HOC Controls.form:Crud устарел, используйте класс CrudController', 'Crud ', this);
    },

    _afterMount(cfg) {
        if (!cfg.dataSource) {
            Logger.error('Crud', 'Необходимо задать опцию dataSource', this);
        } else {
            this._dataSource = cfg.dataSource;
        }
    },
    _beforeUpdate(newOptions): void {
        if (this._options.dataSource !== newOptions.dataSource) {
            this._dataSource = newOptions.dataSource;
        }
    },

    create(initValues) {
        let def = this._dataSource.create(initValues);

        this._notify('registerPending', [def, {showLoadingIndicator: this._options.showLoadingIndicator}], {bubbling: true});

        let self = this;
        def.addCallback(function (record) {
            self._notify(CRUD_EVENTS.CREATE_SUCCESSED, [record]);
            return record;
        });
        def.addErrback(function (e) {
            self._notify(CRUD_EVENTS.CREATE_FAILED, [e]);
            return e;
        });

        return def;
    },
    read(key, readMetaData) {
        const def = readWithAdditionalFields(this._dataSource, key, readMetaData);
        const id = this._indicatorId;
        const message = rk('Пожалуйста, подождите…');
        this._indicatorId = this._notify('showIndicator', [{id, message}], {bubbling: true});

        def.addCallback((record) => {
            this._notify(CRUD_EVENTS.READ_SUCCESSED, [record]);
            this._notify('hideIndicator', [this._indicatorId], {bubbling: true});
            return record;
        });
        def.addErrback((e: Error) => {
            this._notify(CRUD_EVENTS.READ_FAILED, [e]);
            this._notify('hideIndicator', [this._indicatorId], {bubbling: true});
            return e;
        });

        return def;
    },

    update(record: Model, isNewRecord: boolean, config?: unknown): Promise<void> | null {
        const updateMetaData = config?.additionalData;

        if (record.isChanged() || isNewRecord) {
            const resultUpdate = this._dataSource.update(record, updateMetaData);
            const argsPending = [
                resultUpdate, {
                    showLoadingIndicator: this._options.showLoadingIndicator
                }
            ];
            this._notify('registerPending', argsPending, {bubbling: true});
            resultUpdate.addCallback((key) => {
                    this._notify(CRUD_EVENTS.UPDATE_SUCCESSED, [record, key, config]);
                    return key;
                }).addErrback((error) => {
                    this._notify(CRUD_EVENTS.UPDATE_FAILED, [error, record]);
                    return error;
                });
            return resultUpdate;
        }

        return null;
    },

    delete(record, destroyMeta) {
        let def = this._dataSource.destroy(record.getId(), destroyMeta);

        this._notify('registerPending', [def, {showLoadingIndicator: this._options.showLoadingIndicator}], {bubbling: true});

        let self = this;
        def.addCallback(function () {
            self._notify(CRUD_EVENTS.DELETE_SUCCESSED, [record]);
        });
        def.addErrback(function (e) {
            self._notify(CRUD_EVENTS.DELETE_FAILED, [e]);
            return e;
        });

        return def;
    },

    _beforeUnmount: function() {
        if (this._indicatorId) {
            this._notify('hideIndicator', [this._indicatorId], { bubbling: true });
        }
    }
});

export default CRUD;
