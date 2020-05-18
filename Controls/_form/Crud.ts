import rk = require('i18n!Controls');
import Control = require('Core/Control');
import tmpl = require('wml!Controls/_form/Crud/Crud');
import {readWithAdditionalFields} from './crudProgression';
import {Logger} from 'UI/Utils';
import {Model} from 'Types/entity';

let CRUD = Control.extend({
    _template: tmpl,
    showLoadingIndicator: false,

    _afterMount(cfg) {
        if (!cfg.dataSource) {
            Logger.error('Crud', 'Необходимо задать опцию dataSource', this);
        } else {
            this._dataSource = cfg.dataSource;
        }
    },

    create(initValues) {
        let def = this._dataSource.create(initValues);

        this._notify('registerPending', [def, {showLoadingIndicator: this._options.showLoadingIndicator}], {bubbling: true});

        let self = this;
        def.addCallback(function (record) {
            self._notify('createSuccessed', [record]);
            return record;
        });
        def.addErrback(function (e) {
            self._notify('createFailed', [e]);
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
            this._notify('readSuccessed', [record]);
            this._notify('hideIndicator', [this._indicatorId], {bubbling: true});
            return record;
        });
        def.addErrback((e: Error) => {
            this._notify('readFailed', [e]);
            this._notify('hideIndicator', [this._indicatorId], {bubbling: true});
            return e;
        });

        return def;
    },

    update(record: Model, isNewRecord: boolean, config?: unknown): Promise<void> | null {
        const updateMetaData = config?.additionalData;
        let def;
        if (record.isChanged() || isNewRecord) {
            def = this._dataSource.update(record, updateMetaData);
            this._notify('registerPending', [def, {showLoadingIndicator: this._options.showLoadingIndicator}], {bubbling: true});
            def.then((key) => {
                this._notify('updateSuccessed', [record, key]);
                return key;
            }, (e) => {
                this._notify('updateFailed', [e, record]);
                return e;
            });
        } else {
            def = null;
        }
        return def;
    },

    delete(record, destroyMeta) {
        let def = this._dataSource.destroy(record.getId(), destroyMeta);

        this._notify('registerPending', [def, {showLoadingIndicator: this._options.showLoadingIndicator}], {bubbling: true});

        let self = this;
        def.addCallback(function () {
            self._notify('deleteSuccessed', [record]);
        });
        def.addErrback(function (e) {
            self._notify('deleteFailed', [e]);
            return e;
        });

        return def;
    }
});

export = CRUD;

