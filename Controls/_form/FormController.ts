import rk = require('i18n!Controls');
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as cInstance from 'Core/core-instance';
import tmpl = require('wml!Controls/_form/FormController/FormController');
import {readWithAdditionalFields} from './crudProgression';
import * as Deferred from 'Core/Deferred';
import {Logger} from 'UI/Utils';
import {error as dataSourceError} from 'Controls/dataSource';
import {IContainerConstructor} from 'Controls/_dataSource/error';
import {Model} from 'Types/entity';
import {Memory} from 'Types/source';
import {SyntheticEvent} from 'Vdom/Vdom';

interface IFormController extends IControlOptions {
    createMetaData?: unknown;
    destroyMetaData?: unknown;
    errorContainer?: IContainerConstructor;
    isNewRecord?: boolean;
    key?: string;
    keyProperty?: string;
    readMetaData?: unknown;
    record?: Model;
    errorController?: dataSourceError.Controller;
    source?: Memory;

    //удалить при переходе на новые опции
    dataSource?: Memory;
    initValues?: unknown;
    destroyMeta?: unknown;
    idProperty?: string;
}

interface IReceivedState {
    data?: Model;
    errorConfig?: dataSourceError.ViewConfig;
}

interface ICrudResult extends IReceivedState {
    error?: Error;
}

interface IAdditionalData {
    key?: string;
    record?: Model;
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
        validationErrors: undefined | Array<string>
    };
}

interface IValidateResult {
    [key: number]: boolean;
    hasErrors?: boolean;
}

interface IConfigInMounting {
    isError: boolean;
    result: Model;
}

interface IUpdateConfig {
    additionalData: IAdditionalData;
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

class FormController extends Control<IFormController, IReceivedState> {
    protected _template: TemplateFunction = tmpl;
    protected _record: Model = null;
    protected _isNewRecord: boolean = false;
    protected _createMetaDataOnUpdate: unknown = null;
    protected _errorContainer: IContainerConstructor = dataSourceError.Container;
    protected __errorController: dataSourceError.Controller;
    protected _source: Memory;
    protected _createdInMounting: IConfigInMounting;
    protected _isMount: boolean;
    protected _readInMounting: IConfigInMounting;
    protected _wasCreated: boolean;
    protected _wasRead: boolean;
    protected _wasDestroyed: boolean;
    protected _pendingPromise: Promise<any>;
    protected _options: IFormController;
    protected __error: dataSourceError.ViewConfig;

    protected _beforeMount(options?: IFormController, context?: object, receivedState: IReceivedState = {}): Promise<ICrudResult> | void {
        this.__errorController = options.errorController || new dataSourceError.Controller({});
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
        const receivedError = receivedState.errorConfig;
        const receivedData = receivedState.data;

        if (receivedError) {
            return this._showError(receivedError);
        }
        const record = receivedData || options.record;

        // use record
        if (record && this._checkRecordType(record)) {
            this._setRecord(record);
            this._isNewRecord = !!options.isNewRecord;

            // If there is a key - read the record. Not waiting for answer BL
            if (options.key !== undefined && options.key !== null) {
                this._readRecordBeforeMount( options);
            }
        } else if (options.key !== undefined && options.key !== null) {
            return this._readRecordBeforeMount(options);
        } else {
            return this._createRecordBeforeMount(options);
        }
    }

    protected _afterMount(): void {
        // если рекорд был создан во время beforeMount, уведомим об этом
        if (this._createdInMounting) {
            this._createRecordBeforeMountNotify();
        }

        // если рекорд был прочитан через ключ во время beforeMount, уведомим об этом
        if (this._readInMounting) {
            this._readRecordBeforeMountNotify();
        }
        this._createChangeRecordPending();
        this._isMount = true;
    }

    protected _beforeUpdate(newOptions: IFormController): void {
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
            // Если текущий рекорд изменен, то покажем вопрос
            if (this._options.record && this._options.record.isChanged()) {
                this._showConfirmPopup('yesno').then((answer) => {
                    if (answer === true) {
                        this.update().then((res) => {
                            this.read(newOptions.key, newOptions.readMetaData);
                            return res;
                        });
                    } else {
                        this._tryDeleteNewRecord().then(() => {
                            this.read(newOptions.key, newOptions.readMetaData);
                        });
                    }
                });
            } else {
                this.read(newOptions.key, newOptions.readMetaData);
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
            this.create(newOptions.initValues || newOptions.createMetaData).then(() => {
                if (newOptions.hasOwnProperty('isNewRecord')) {
                    this._isNewRecord = newOptions.isNewRecord;
                }
                this._createMetaDataOnUpdate = null;
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
        // Текущая реализация не подходит, завершать пендинги могут как сверху(при закрытии окна), так и
        // снизу (редактирование закрывает пендинг).
        // надо делать так, чтобы редактирование только на свой пендинг влияло
        // https://online.sbis.ru/opendoc.html?guid=78c34d53-8705-4e25-bbb5-0033e81d6152
        if (this._needDestroyRecord()) {
            const removePromise = this._tryDeleteNewRecord();
            this._notifyToOpener('deletestarted', [this._record, this._getRecordId(), {removePromise}]);
        }
    }


    private _createRecordBeforeMount(cfg: IFormController): Promise<ICrudResult> {
        // если ни рекорда, ни ключа, создаем новый рекорд и используем его
        // в beforeMount еще нет потомков, в частности _children.crud, поэтому будем создавать рекорд напрямую
        return this._source.create(cfg.initValues || cfg.createMetaData).then((record: Model) => {
            this._setRecord(record);
            this._createdInMounting = {isError: false, result: record};

            if (this._isMount) {
                this._createRecordBeforeMountNotify();
            }
            return {
                data: record
            };
        },  (e: Error) => {
            this._createdInMounting = {isError: true, result: e};
            return this._processError(e).then(this._getState);
        });
    }

    private _readRecordBeforeMount(cfg: IFormController): Promise<{data: Model}> {
        // если в опции не пришел рекорд, смотрим на ключ key, который попробуем прочитать
        // в beforeMount еще нет потомков, в частности _children.crud, поэтому будем читать рекорд напрямую
        return readWithAdditionalFields(this._source, cfg.key, cfg.readMetaData).then((record: Model) => {
            this._setRecord(record);
            this._readInMounting = {isError: false, result: record};

            if (this._isMount) {
                this._readRecordBeforeMountNotify();
            }

            return {
                data: record
            };
        }, (e: Error) => {
            this._readInMounting = {isError: true, result: e};
            return this._processError(e).then(this._getState);
        }) as Promise<{data: Model}>;
    }

    private _checkRecordType(record: Model): boolean {
        return cInstance.instanceOfModule(record, 'Types/entity:Record');
    }

    private _readRecordBeforeMountNotify(): void {
        if (!this._readInMounting.isError) {
            this._notifyHandler('readSuccessed', [this._readInMounting.result]);

            // перерисуемся
            this._readHandler(this._record);
        } else {
            this._notifyHandler('readFailed', [this._readInMounting.result]);
        }
        this._readInMounting = null;
    }

    private  _createRecordBeforeMountNotify(): void {
        if (!this._createdInMounting.isError) {
            this._notifyHandler('createSuccessed', [this._createdInMounting.result]);

            // зарегистрируем пендинг, перерисуемся
            this._createHandler(this._record);
        } else {
            this._notifyHandler('createFailed', [this._createdInMounting.result]);
        }
        this._createdInMounting = null;
    }

    private _getState = (crudResult: ICrudResult): IReceivedState => {
        delete crudResult.error;
        return crudResult;
    }

    private _getData = (crudResult: ICrudResult): Promise<undefined | Model> => {
        if (!crudResult) {
            return Promise.resolve();
        }
        if (crudResult.data) {
            return Promise.resolve(crudResult.data);
        }
        return Promise.reject(crudResult.error);
    }

    private _setRecord(record: Model): void {
        if (!record || this._checkRecordType(record)) {
            this._record = record;
        }
    }

    private _getRecordId(): number | string {
        if (!this._record.getId && !this._options.idProperty && !this._options.keyProperty) {
            Logger.error('FormController: Рекорд не является моделью и не задана опция idProperty, указывающая на ключевое поле рекорда', this);
            return null;
        }
        const keyProperty = this._options.idProperty || this._options.keyProperty;
        return keyProperty ? this._record.get(keyProperty) : this._record.getId();
    }

    private _tryDeleteNewRecord(): Promise<undefined> {
        if (this._needDestroyRecord()) {
            return this._source.destroy(this._getRecordId(), this._options.destroyMeta || this._options.destroyMetaData);
        }
        return Promise.resolve();
    }

    private _needDestroyRecord(): number | string {
        // Destroy record when:
        // 1. The record obtained by the method "create"
        // 2. The "create" method returned the key
        return this._record && this._isNewRecord && this._getRecordId();
    }

    private _createChangeRecordPending(): void {
        const self = this;
        self._pendingPromise = new Deferred();
        self._notify('registerPending', [self._pendingPromise, {
            showLoadingIndicator: false,
            validate(isInside: boolean): boolean {
                return self._record && self._record.isChanged() && !isInside;
            },
            onPendingFail(forceFinishValue: boolean, deferred: Promise<boolean>, isInside: boolean): void {
                if (!isInside) {
                    self._showConfirmDialog(deferred, forceFinishValue);
                }
            }
        }], {bubbling: true});
    }

    private _confirmDialogResult(answer: boolean, def: Promise<any>): void {
        if (answer === true) {
            this.update().then((res) => {
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
            },(err: Error) => {
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

    private _showConfirmDialog(def: Promise<boolean>, forceFinishValue: boolean): void {
        if (forceFinishValue !== undefined) {
            this._confirmDialogResult(forceFinishValue, def);
        } else {
            this._showConfirmPopup('yesnocancel', rk('Чтобы продолжить редактирование, нажмите \'Отмена\'')).then((answer) => {
                this._confirmDialogResult(answer, def);
                return answer;
            });
        }
    }

    private _showConfirmPopup(type: string, details?: string): Promise<string | boolean> {
        return this._children.popupOpener.open({
            message: rk('Сохранить изменения?'),
            details,
            type
        });
    }

    create(createMetaData: unknown): Promise<undefined | Model> {
        createMetaData = createMetaData || this._options.initValues || this._options.createMetaData;
        return this._children.crud.create(createMetaData).then(
            this._createHandler.bind(this),
            this._crudErrback.bind(this)
        );
    }

    private _createHandler(record: Model): Model {
        this._updateIsNewRecord(true);
        this._wasCreated = true;
        this._forceUpdate();
        return record;
    }

    read(key: string, readMetaData: unknown): Promise<Model> {
        readMetaData = readMetaData || this._options.readMetaData;
        return this._children.crud.read(key, readMetaData).then(
            this._readHandler.bind(this),
            this._crudErrback.bind(this)
        );
    }

    private _readHandler(record: Model): Model {
        this._wasRead = true;
        this._updateIsNewRecord(false);
        this._forceUpdate();
        this._hideError();
        return record;
    }

    update(config?: IUpdateConfig): Promise<undefined | Model> {
        const updateResult = new Deferred();
        const updateCallback = (result) => {
            // if result is true, custom update called and we dont need to call original update.
            if (result !== true) {
                this._notifyToOpener('updateStarted', [this._record, this._getRecordId()]);
                const res = this._update(config).then(this._getData);
                updateResult.dependOn(res);
            } else {
                this._updateIsNewRecord(false);
                updateResult.callback(true);
            }
        }

        // maybe anybody want to do custom update. check it.
        const result = this._notify('requestCustomUpdate', [], {bubbling: true});

         // pending waiting while update process finished
         this._updatePromise = new Deferred();
         this._notify('registerPending', [this._updatePromise, { showLoadingIndicator: false }], { bubbling: true });
         this._updatePromise.dependOn(updateResult);

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

    private _update(config?: IUpdateConfig): Promise<IDataValid> {
        const record = this._record;
        const updateDef = new Deferred();

        // запускаем валидацию
        const validationDef = this._children.validation.submit();
        validationDef.then((results) => {
            if (!results.hasErrors) {
                // при успешной валидации пытаемся сохранить рекорд
                this._notify('validationSuccessed', [], {bubbling: true});
                let res = this._children.crud.update(record, this._isNewRecord, config);

                // fake deferred used for code refactoring
                if (!(res && res.then)) {
                    res = new Deferred();
                    res.callback();
                }
                res.then((arg) => {
                    this._updateIsNewRecord(false);

                    updateDef.callback({data: true});
                    return arg;
                });
                res.addErrback((error: Error) => {
                    updateDef.errback(error);
                    return this._processError(error, dataSourceError.Mode.dialog);
                });
            } else {
                // если были ошибки валидации, уведомим о них
                const validationErrors = this._children.validation.getValidationResult();
                this._notify('validationFailed', [validationErrors], {bubbling: true});
                updateDef.callback({
                    data: {
                        validationErrors
                    }
                });
            }
        }, (e) => {
            updateDef.errback(e);
            return e;
        });
        return updateDef;
    }

    delete(destroyMetaData: unknown): Promise<Model | undefined> {
        destroyMetaData = destroyMetaData || this._options.destroyMeta || this._options.destroyMetaData;
        const resultDef = this._children.crud.delete(this._record, destroyMetaData);

        return resultDef.then((record) => {
            this._setRecord(null);
            this._wasDestroyed = true;
            this._updateIsNewRecord(false);
            this._forceUpdate();
            return record;
        }, (error) => {
            return this._crudErrback(error, dataSourceError.Mode.dialog);
        });
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
    private _crudErrback(error: Error, mode: dataSourceError.Mode): Promise<undefined | Model> {
        return this._processError(error, mode).then(this._getData);
    }

    private _updateIsNewRecord(value: boolean): void {
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
    private _processError(error: Error, mode?: dataSourceError.Mode): Promise<ICrudResult> {
        return this.__errorController.process({
            error,
            theme: this._options.theme,
            mode: mode || dataSourceError.Mode.include
        }).then((errorConfig: dataSourceError.ViewConfig) => {
            this._showError(errorConfig);
            return {
                error,
                errorConfig
            };
        });
    }

    /**
     * @private
     */
    private _showError(errorConfig: dataSourceError.ViewConfig): void {
        this.__error = errorConfig;
    }

    private _hideError(): void {
        if (this.__error) {
            this.__error = null;
        }
    }

    private _onCloseErrorDialog(): void {
        if (!this._record) {
            this._notify('close', [], {bubbling: true});
        }
    }

    private _crudHandler(event: SyntheticEvent<Event>): void {
        const eventName = event.type;
        const args = Array.prototype.slice.call(arguments, 1);
        event.stopPropagation(); // FC the notification event by itself
        this._notifyHandler(eventName, args);
    }

    private _notifyHandler(eventName: string, args): void {
        this._notifyToOpener(eventName, args);
        this._notify(eventName, args, {bubbling: true});
    }

    private _notifyToOpener(eventName: string, args: [Model, string | number, object?]): void {
        const handlers = {
            'updatestarted': '_getUpdateStartedData',
            'updatesuccessed': '_getUpdateSuccessedData',
            'createsuccessed': '_getCreateSuccessedData',
            'readsuccessed': '_getReadSuccessedData',
            'deletestarted': '_getDeleteStartedData',
            'deletesuccessed': '_getDeleteSuccessedData',
            'updatefailed': '_getUpdateFailedData'
        };
        const resultDataHandlerName = handlers[eventName.toLowerCase()];
        if (this[resultDataHandlerName]) {
            const resultData = this[resultDataHandlerName].apply(this, args);
            this._notify('sendResult', [resultData], {bubbling: true});
        }
    }

    private _getUpdateStartedData(record: Model, key: string): IResultData {
        const config = this._getUpdateSuccessedData(record, key);
        config.formControllerEvent = 'updateStarted';
        return config;
    }

    private _getUpdateSuccessedData(record: Model, key: string, config?: object): IResultData {
        const configData = config ? config.additionalData : {};
        const additionalData: IAdditionalData = {
            key,
            isNewRecord: this._isNewRecord,
            ...configData
        };
        return this._getResultData('update', record, additionalData);
    }

    private _getDeleteStartedData(record: Model, key: string, config: object): IResultData {
        return this._getResultData('deletestarted', record, config);
    }

    private _getDeleteSuccessedData(record: Model): IResultData {
        return this._getResultData('delete', record);
    }

    private _getCreateSuccessedData(record: Model): IResultData {
        return this._getResultData('create', record);
    }

    private _getReadSuccessedData(record: Model): IResultData {
        return this._getResultData('read', record);
    }

    private _getUpdateFailedData(error: Error, record: Model): IResultData {
        const additionalData: IAdditionalData = {
            record,
            error,
            isNewRecord: this._isNewRecord
        };
        return this._getResultData('updateFailed', record, additionalData);
    }

    private _getResultData(eventName: string, record: Model, additionalData?: IAdditionalData): IResultData {
        return {
            formControllerEvent: eventName,
            record,
            additionalData: additionalData || {}
        };
    }
}
export default FormController;
