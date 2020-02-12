import rk = require('i18n!Controls');
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as cInstance from 'Core/core-instance';
import tmpl = require('wml!Controls/_form/FormController/FormController');
import * as Deferred from 'Core/Deferred';
import {Logger} from 'UI/Utils';
import {error as dataSourceError} from 'Controls/dataSource';
import {IContainerConstructor, Controller} from 'Controls/_dataSource/error';
import {Model} from 'Types/entity';
import {Memory} from 'Types/source';
import {SyntheticEvent} from 'Vdom/Vdom';
import {IErrorControllerOptions} from 'Controls/_interface/IErrorController';

interface IFormController extends IControlOptions {
    createMetaData?: object;
    destroyMetaData?: object;
    errorContainer?: IContainerConstructor;
    isNewRecord?: boolean;
    key?: string;
    keyProperty?: string;
    readMetaData?: object;
    record?: Model;
    errorController?: IErrorControllerOptions;
    source?: Memory;

    //удалить при переходе на новые опции
    dataSource?: Memory;
    initValues?: object;
    destroyMeta?: object;
    idProperty?: string;
}

interface IReceivedState {
    data?: Model;
    errorConfig?: dataSourceError.ViewConfig;
}

interface ICrudResult extends IReceivedState {
    error: Error;
}

interface IAdditionalData {
    key?: string;
    record?: object;
    isNewRecord?: boolean;
    error?: Error;
}

interface IResultData {
    formControllerEvent: string;
    record: Model;
    additionalData: IAdditionalData;
}

interface IDataValid {
    data: {
        validationErrors: undefined| Array<string>
    };
}
interface IValidateResult {
    [key: number]: boolean;
    hasErrors?: boolean;
}

/**
 * Контроллер, в котором определена логика CRUD-методов, выполняемых над редактируемой записью.
 * В частном случае контрол применяется для создания <a href="https://wi.sbis.ru/doc/platform/developmentapl/interface-development/forms-and-validation/editing-dialog/">диалогов редактирования записи</a>. Может выполнять запросы CRUD-методов на БЛ.
 * @category FormController
 * @class Controls/_form/FormController
 * @extends Core/Control
 * @mixes Controls/_interface/ISource
 * @mixes Controls/interface/IFormController
 * @implements Controls/_interface/IErrorController
 * @demo Controls-demo/Popup/Edit/Opener
 * @control
 * @public
 * @author Красильников А.С.
 */

/*
 * Record editing controller. The control stores data about the record and can execute queries CRUD methods on the BL.
 * <a href="https://wi.sbis.ru/doc/platform/developmentapl/interface-development/forms-and-validation/editing-dialog/">More information and details.</a>.
 * @category FormController
 * @class Controls/_form/FormController
 * @extends Core/Control
 * @mixes Controls/_interface/ISource
 * @mixes Controls/interface/IFormController
 * @implements Controls/_interface/IErrorController
 * @demo Controls-demo/Popup/Edit/Opener
 * @control
 * @public
 * @author Красильников А.С.
 */

/**
 * Объект с состоянием, полученным при серверном рендеринге.
 * @typedef {Object}
 * @name ReceivedState
 * @property {*} [data]
 * @property {Controls/dataSource:error.ViewConfig} [errorConfig]
 */

/*
 * Object with state from server side rendering
 * @typedef {Object}
 * @name ReceivedState
 * @property {*} [data]
 * @property {Controls/dataSource:error.ViewConfig} [errorConfig]
 */

/**
 * @typedef {Object}
 * @name CrudResult
 * @property {*} [data]
 * @property {Controls/dataSource:error.ViewConfig} [errorConfig]
 * @property {Controls/dataSource:error.ViewConfig} [error]
 */

/**
 * Удаляет оригинал ошибки из CrudResult перед вызовом сриализатора состояния,
 * который не сможет нормально разобрать/собрать экземпляр случайной ошибки.
 * @param {CrudResult} crudResult
 * @return {ReceivedState}
 */
const getState = (crudResult: ICrudResult): IReceivedState => {
    delete crudResult.error;
    return crudResult;
}


/**
 * Получение результата из обертки <CrudResult>
 * @param {CrudResult} [crudResult]
 * @return {Promise}
 */

/*
 * getting result from <CrudResult> wrapper
 * @param {CrudResult} [crudResult]
 * @return {Promise}
 */
const getData = (crudResult: ICrudResult): Promise<undefined | Model> => {
    if (!crudResult) {
        return Promise.resolve();
    }
    if (crudResult.data) {
        return Promise.resolve(crudResult.data);
    }
    return Promise.reject(crudResult.error);
}

class FormController extends Control<IFormController> {
    protected _template: TemplateFunction = tmpl;
    protected _record: Model;
    protected _isNewRecord: boolean = false;
    protected _createMetaDataOnUpdate: any;
    protected _errorContainer: IContainerConstructor;
    protected __errorController: IErrorControllerOptions | Controller;
    protected _source: Memory;
    protected _createdInMounting: any
    protected _isMount: boolean;
    protected _readInMounting: any;
    protected _wasCreated: boolean;
    protected _wasRead: boolean;
    protected _wasDestroyed: boolean;
    protected _pendingPromise: any;
    protected _options: IFormController;
    protected __error: dataSourceError.ViewConfig;

    protected _beforeMount(options: IFormController, context: object, receivedState: IReceivedState): Promise<ICrudResult> | void {
        this.__errorController = options.errorController || new dataSourceError.Controller({});
        this._errorContainer = dataSourceError.Container;
        this._source = options.source || options.dataSource;
        if (options.dataSource) {
            Logger.warn('FormController: Use option "source" instead of "dataSource"', this);
        }
        if (options.initValues) {
            Logger.warn('FormController: Use option "createMetaData" instead of "initValues"', this);
        }
        if (options.destroyMeta) {
            Logger.warn('FormController: Use option "destroyMetaData " instead of "destroyMeta"', this);
        }
        if (options.idProperty) {
            Logger.warn('FormController: Use option "keyProperty " instead of "idProperty"', this);
        }

        receivedState = receivedState || {};
        let receivedError = receivedState.errorConfig;
        let receivedData = receivedState.data;

        if (receivedError) {
            return this._showError(receivedError);
        }
        let record = receivedData || options.record;

        // use record
        if (record && this._checkRecordType(record)) {
            this._setRecord(record);
            this._isNewRecord = !!options.isNewRecord;

            // If there is a key - read the record. Not waiting for answer BL
            if (options.key !== undefined && options.key !== null) {
                this._readRecordBeforeMount(this, options);
            }
        } else if (options.key !== undefined && options.key !== null) {
            return this._readRecordBeforeMount(this, options);
        } else {
            return this._createRecordBeforeMount(this, options);
        }
    }

    protected _afterMount(): void {
        // если рекорд был создан во время beforeMount, уведомим об этом
        if (this._createdInMounting) {
            this._createRecordBeforeMountNotify(this);
        }

        // если рекорд был прочитан через ключ во время beforeMount, уведомим об этом
        if (this._readInMounting) {
            this._readRecordBeforeMountNotify(this);
        }
        this._createChangeRecordPending();
        this._isMount = true;
    }

    protected _beforeUpdate(newOptions: IFormController): void {
        let self = this;
        if (newOptions.dataSource || newOptions.source) {
            this._source = newOptions.source || newOptions.dataSource;
            //Сбрасываем состояние, только если данные поменялись, иначе будет зацикливаться
            // создание записи -> ошибка -> beforeUpdate
            if (this._source !== this._options.source && this._source !== this._options.dataSource) {
                this._createMetaDataOnUpdate = null;
            }
        }

        if (newOptions.record && this._options.record !== newOptions.record) {
            this._setRecord(newOptions.record);
        }
        if (newOptions.key !== undefined && this._options.key !== newOptions.key) {
            if (newOptions.record && newOptions.record.isChanged()) {
                this._showConfirmPopup('yesno').addCallback((answer) => {
                    if (answer === true) {
                        self.update().addCallback((res) => {
                            self.read(newOptions.key, newOptions.readMetaData);
                            return res;
                        });
                    } else {
                        self._tryDeleteNewRecord().addCallback(() => {
                            self.read(newOptions.key, newOptions.readMetaData);
                        });
                    }
                });
            } else {
                self.read(newOptions.key, newOptions.readMetaData);
            }
            return;
        }
        // Если нет ключа и записи - то вызовем метод создать. Состояние isNewRecord обновим после того, как запись вычитается
        // Иначе можем удалить рекорд, к которому новое значение опции isNewRecord не относится
        const createMetaData = newOptions.initValues || newOptions.createMetaData;
        // Добавил защиту от циклических вызовов: У контрола стреляет _beforeUpdate, нет рекорда и ключа => вызывается
        // создание записи. Метод падает с ошибкой. У контрола стреляет _beforeUpdate, вызов метода создать повторяется бесконечно.
        // Нельзя чтобы контрол ддосил БЛ.
        if (newOptions.key === undefined && !newOptions.record && this._createMetaDataOnUpdate !== createMetaData) {
            this._createMetaDataOnUpdate = createMetaData;
            this.create(newOptions.initValues || newOptions.createMetaData).addCallback(() => {
                if (newOptions.hasOwnProperty('isNewRecord')) {
                    self._isNewRecord = newOptions.isNewRecord;
                }
                self._createMetaDataOnUpdate = null;
            });
        } else {
            if (newOptions.hasOwnProperty('isNewRecord')) {
                this._isNewRecord = newOptions.isNewRecord;
            }
        }
    }

    protected _afterUpdate(): void {
        if (this._wasCreated || this._wasRead || this._wasDestroyed) {
            // сбрасываем результат валидации, если только произошло создание, чтение или удаление рекорда
            this._children.validation.setValidationResult(null);
            this._wasCreated = false;
            this._wasRead = false;
            this._wasDestroyed = false;
        }
    }

    protected _beforeUnmount(): void {
        if (this._pendingPromise) {
            this._pendingPromise.callback();
            this._pendingPromise = null;
        }
        // when FormController destroying, its need to check new record was saved or not. If its not saved, new record trying to delete.
        this._tryDeleteNewRecord();
    }

    protected _setRecord(record: Model): void {
        if (!record || this._checkRecordType(record)) {
            this._record = record;
        }
    }

    protected _getRecordId(): number | string {
        if (!this._record.getId && !this._options.idProperty && !this._options.keyProperty) {
            Logger.error('FormController: Рекорд не является моделью и не задана опция idProperty, указывающая на ключевое поле рекорда', this);
            return null;
        }
        let keyProperty = this._options.idProperty || this._options.keyProperty;
        return keyProperty ? this._record.get(keyProperty) : this._record.getId();
    }

    protected _tryDeleteNewRecord(): Promise<undefined> {
        if (this._needDestroyRecord()) {
            return this._source.destroy(this._getRecordId(), this._options.destroyMeta || this._options.destroyMetaData);
        }
        return (new Deferred()).callback();
    }

    protected _needDestroyRecord(): number | string {
        // Destroy record when:
        // 1. The record obtained by the method "create"
        // 2. The "create" method returned the key
        return this._record && this._isNewRecord && this._getRecordId();
    }

    protected _createChangeRecordPending(): void {
        const self = this;
        self._pendingPromise = new Deferred();
        this._notify('registerPending', [self._pendingPromise, {
            showLoadingIndicator: false,
            validate(): boolean {
                return self._record && self._record.isChanged();
            },
            onPendingFail(forceFinishValue: boolean, deferred: Promise<boolean>): void {
                self._showConfirmDialog(deferred, forceFinishValue);
            }
        }], {bubbling: true});
    }

    protected _confirmDialogResult(answer: boolean, def: Promise<boolean>): void {
        if (answer === true) {
            this.update().addCallbacks((res) => {
                if (!res.validationErrors) {
                    // если нет ошибок в валидации, просто завершаем пендинг с результатом
                    if (!def.isReady()) {
                        this._pendingPromise = null;
                        def.callback(res);
                    }
                } else {
                    // если валидация не прошла, нам нужно оставить пендинг, но отменить ожидание завершения пендинга,
                    // чтобы оно не сработало, когда пендинг завершится.
                    // иначе попробуем закрыть панель, не получится, потом сохраним рекорд и панель закроется сама собой
                    this._notify('cancelFinishingPending', [], {bubbling: true});
                }
                return res;
            }, (err: Error) => {
                this._notify('cancelFinishingPending', [], {bubbling: true});
            });
        } else if (answer === false) {
            if (!def.isReady()) {
                this._pendingPromise = null;
                def.callback(false);
            }
        } else {
            // if user press 'cancel' button, then cancel finish pendings
            this._notify('cancelFinishingPending', [], {bubbling: true});
        }
    }

    protected _showConfirmDialog(def: Promise<boolean>, forceFinishValue: boolean): void {
        if (forceFinishValue !== undefined) {
            this._confirmDialogResult(forceFinishValue, def);
        } else {
            this._showConfirmPopup('yesnocancel', rk('Чтобы продолжить редактирование, нажмите \'Отмена\'')).then((answer) => {
                this._confirmDialogResult(answer, def);
                return answer;
            });
        }
    }

    protected _showConfirmPopup(type: string, details?: string): Promise<boolean | undefined> {
        return this._children.popupOpener.open({
            message: rk('Сохранить изменения?'),
            details,
            type
        });
    }

    create(createMetaData: object): Promise<undefined | Model> {
        createMetaData = createMetaData || this._options.initValues || this._options.createMetaData;
        return this._children.crud.create(createMetaData).addCallbacks(
            this._createHandler.bind(this),
            this._crudErrback.bind(this)
        );
    }

    protected _createHandler(record: Model): Model {
        this._updateIsNewRecord(true);
        this._wasCreated = true;
        this._forceUpdate();
        return record;
    }

    read(key: string, readMetaData: object): Promise<Model> {
        readMetaData = readMetaData || this._options.readMetaData;
        return this._children.crud.read(key, readMetaData).addCallbacks(
            this._readHandler.bind(this),
            this._crudErrback.bind(this)
        );
    }

    protected _readHandler(record: Model): Model {
        this._wasRead = true;
        this._updateIsNewRecord(false);
        this._forceUpdate();
        this._hideError();
        return record;
    }

    update(): Promise<undefined | Model> {
        let updateResult = new Deferred(),
            self = this;

        function updateCallback(result): void {
            // if result is true, custom update called and we dont need to call original update.
            if (result !== true) {
                self._notifyToOpener('updateStarted', [self._record, self._getRecordId()]);
                let res = self._update().addCallback(getData);
                updateResult.dependOn(res);
            } else {
                updateResult.callback(true);
                self._updateIsNewRecord(false);
            }
        }

        // maybe anybody want to do custom update. check it.
        let result = this._notify('requestCustomUpdate', [], {bubbling: true});

        // pending waiting while update process finished
        let def = new Deferred();
        self._notify('registerPending', [def, {showLoadingIndicator: false}], {bubbling: true});
        def.dependOn(updateResult);

        if (result && result.then) {
            result.then((defResult) => {
                updateCallback(defResult);
                return defResult;
            }, (err) => {
                updateResult.errback(err);
                return err;
            });
        } else {
            updateCallback(result);
        }
        return updateResult;
    }

    protected _update(): Promise<IDataValid> {
        let self = this,
            record = this._record,
            updateDef = new Deferred();

        // запускаем валидацию
        let validationDef = this._children.validation.submit();
        validationDef.addCallback(function (results) {
            if (!results.hasErrors) {
                // при успешной валидации пытаемся сохранить рекорд
                self._notify('validationSuccessed', [], {bubbling: true});
                let res = self._children.crud.update(record, self._isNewRecord);

                // fake deferred used for code refactoring
                if (!(res && res.addCallback)) {
                    res = new Deferred();
                    res.callback();
                }
                res.addCallback(function (arg) {
                    self._updateIsNewRecord(false);

                    updateDef.callback({data: true});
                    return arg;
                });
                res.addErrback((error: Error) => {
                    updateDef.errback(error);
                    return self._processError(error, dataSourceError.Mode.dialog);
                });
            } else {
                // если были ошибки валидации, уведомим о них
                let validationErrors = self._children.validation.isValid();
                self._notify('validationFailed', [validationErrors], {bubbling: true});
                updateDef.callback({
                    data: {
                        validationErrors: validationErrors
                    }
                });
            }
        });
        validationDef.addErrback((e) => {
            updateDef.errback(e);
            return e;
        });
        return updateDef;
    }

    delete(destroyMetaData: object): Promise<Model | undefined> {
        destroyMetaData = destroyMetaData || this._options.destroyMeta || this._options.destroyMetaData;
        let self = this;
        let resultDef = this._children.crud.delete(this._record, destroyMetaData);

        resultDef.addCallbacks((record) => {
            self._setRecord(null);
            self._wasDestroyed = true;
            self._updateIsNewRecord(false);
            self._forceUpdate();
            return record;
        },  (error) => {
            return self._crudErrback(error, dataSourceError.Mode.dialog);
        });
        return resultDef;
    }

    validate(): Promise<IValidateResult | Error> {
        return this._children.validation.submit();
    }

    /**
     *
     * @param {Error} error
     * @param {Controls/_dataSource/_error/Mode} [mode]
     * @return {Promise<*>}
     * @private
     */
    protected _crudErrback(error: Error, mode: dataSourceError.Mode): Promise<undefined | Model> {
        return this._processError(error, mode).then(getData);
    }

    protected _updateIsNewRecord(value: boolean): void {
        if (this._isNewRecord !== value) {
            this._isNewRecord = value;
            this._notify('isNewRecordChanged', [value]);
        }
    }

    /**
     * @param {Error} error
     * @param {Controls/_dataSource/_error/Mode} [mode]
     * @return {Promise.<CrudResult>}
     * @private
     */
    protected _processError(error: Error, mode: dataSourceError.Mode): Promise<ICrudResult> {
        let self = this;
        return self.__errorController.process({
            error: error,
            mode: mode || dataSourceError.Mode.include
        }).then((errorConfig) => {
            self._showError(errorConfig);
            return {
                error: error,
                errorConfig: errorConfig
            };
        });
    }

    /**
     * @private
     */
    protected _showError(errorConfig: dataSourceError.ViewConfig): void {
        this.__error = errorConfig;
    }

    protected _hideError(): void {
        if (this.__error) {
            this.__error = null;
        }
    }

    protected _onCloseErrorDialog(): void {
        if (!this._record) {
            this._notify('close', [], {bubbling: true});
        }
    }

    protected _crudHandler(event: SyntheticEvent<Event>): void {
        const eventName: string = event.type;
        const args = Array.prototype.slice.call(arguments, 1);
        event.stopPropagation(); // FC the notification event by itself
        this._notifyHandler(eventName, args);
    }

    protected _notifyHandler(eventName: string, args): void {
        this._notifyToOpener(eventName, args);
        this._notify(eventName, args, {bubbling: true});
    }

    protected _notifyToOpener(eventName: string, args: [Model, string | number]): void {
        const handlers = {
            'updatestarted': '_getUpdateStartedData',
            'updatesuccessed': '_getUpdateSuccessedData',
            'createsuccessed': '_getCreateSuccessedData',
            'readsuccessed': '_getReadSuccessedData',
            'deletesuccessed': '_getDeleteSuccessedData',
            'updatefailed': '_getUpdateFailedData'
        };
        const resultDataHandlerName = handlers[eventName.toLowerCase()];
        if (this[resultDataHandlerName]) {
            let resultData = this[resultDataHandlerName].apply(this, args);
            this._notify('sendResult', [resultData], {bubbling: true});
        }
    }

    protected _getUpdateStartedData(record: Model, key: string): IResultData {
        let config = this._getUpdateSuccessedData(record, key);
        config.formControllerEvent = 'updateStarted';
        return config;
    }

    protected _getUpdateSuccessedData(record: Model, key: string): IResultData {
        let additionalData: IAdditionalData = {
            key: key,
            isNewRecord: this._isNewRecord
        };
        return this._getResultData('update', record, additionalData);
    }

    protected _getDeleteSuccessedData(record: Model): IResultData {
        return this._getResultData('delete', record);
    }

    protected _getCreateSuccessedData(record: Model): IResultData {
        return this._getResultData('create', record);
    }

    protected _getReadSuccessedData(record: Model): IResultData {
        return this._getResultData('read', record);
    }

    protected _getUpdateFailedData(error: Error, record: Model): IResultData {
        let additionalData: IAdditionalData = {
            record: record,
            error: error,
            isNewRecord: this._isNewRecord
        };
        return this._getResultData('updateFailed', record, additionalData);
    }

    protected _getResultData(eventName: string, record: Model, additionalData?: IAdditionalData): IResultData {
        return {
            formControllerEvent: eventName,
            record: record,
            additionalData: additionalData || {}
        };
    }

    //private
    private _checkRecordType(record: Model): boolean {
        return cInstance.instanceOfModule(record, 'Types/entity:Record');
    }

    private _readRecordBeforeMount(instance, cfg: IFormController): Promise<ICrudResult> {
        // если в опции не пришел рекорд, смотрим на ключ key, который попробуем прочитать
        // в beforeMount еще нет потомков, в частности _children.crud, поэтому будем читать рекорд напрямую
        return instance._source.read(cfg.key, cfg.readMetaData).then((record) => {
            instance._setRecord(record);
            instance._readInMounting = {isError: false, result: record};

            if (instance._isMount) {
                this._readRecordBeforeMountNotify(instance);
            }

            return {
                data: record
            };
        }, (e: Error) => {
            instance._readInMounting = {isError: true, result: e};
            return instance._processError(e).then(getState);
        });
    }

    private _readRecordBeforeMountNotify(instance: any): void {
        if (!instance._readInMounting.isError) {
            instance._notifyHandler('readSuccessed', [instance._readInMounting.result]);

            // перерисуемся
            instance._readHandler(instance._record);
        } else {
            instance._notifyHandler('readFailed', [instance._readInMounting.result]);
        }
        instance._readInMounting = null;
    }

    private _createRecordBeforeMount(instance, cfg: IFormController): Promise<ICrudResult> {
        // если ни рекорда, ни ключа, создаем новый рекорд и используем его
        // в beforeMount еще нет потомков, в частности _children.crud, поэтому будем создавать рекорд напрямую
        return instance._source.create(cfg.initValues || cfg.createMetaData).then(function (record) {
            instance._setRecord(record);
            instance._createdInMounting = {isError: false, result: record};

            if (instance._isMount) {
                this._createRecordBeforeMountNotify(instance);
            }
            return {
                data: record
            };
        }, (e) => {
            instance._createdInMounting = {isError: true, result: e};
            return instance._processError(e).then(getState);
        });
    }

    private _createRecordBeforeMountNotify(instance: any): void {
        if (!instance._createdInMounting.isError) {
            instance._notifyHandler('createSuccessed', [instance._createdInMounting.result]);

            // зарегистрируем пендинг, перерисуемся
            instance._createHandler(instance._record);
        } else {
            instance._notifyHandler('createFailed', [instance._createdInMounting.result]);
        }
        instance._createdInMounting = null;
    }
}

export default FormController;
