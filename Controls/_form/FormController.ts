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
import {ControllerClass, Container as ValidateContainer, IValidateResult} from 'Controls/validate';
import {IFormOperation} from 'Controls/interface';
import {Confirmation} from 'Controls/popup';
import CrudController from 'Controls/_form/CrudController';

interface IFormController extends IControlOptions {
    readMetaData?: object;
    createMetaData?: object;
    destroyMetaData?: object;
    errorContainer?: IContainerConstructor;
    isNewRecord?: boolean;
    key?: string;
    keyProperty?: string;
    record?: Model;
    errorController?: dataSourceError.Controller;
    source?: Memory;
    confirmationShowingCallback?: Function;
    initializingWay?: string;

    //удалить при переходе на новые опции
    dataSource?: Memory;
    initValues?: unknown;
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

interface IConfigInMounting {
    isError: boolean;
    result: Model;
}

interface IUpdateConfig {
    additionalData: IAdditionalData;
}

export const enum INITIALIZING_WAY {
    LOCAL = 'local',
    READ = 'read',
    CREATE = 'create',
    DELAYED_READ = 'delayedRead',
    DELAYED_CREATE = 'delayedCreate'
}

/**
 * Контроллер, в котором определена логика CRUD-методов, выполняемых над редактируемой записью.
 * В частном случае контрол применяется для создания <a href="https://wi.sbis.ru/doc/platform/developmentapl/interface-development/forms-and-validation/editing-dialog/">диалогов редактирования записи</a>. Может выполнять запросы CRUD-методов на БЛ.
 * @remark
 * Для того, чтобы дочерние контролы могли отреагировать на начало сохранения, либо уничтожения контрола, им необходимо зарегистрировать соответствующие обработчики.
 * Обработчики регистрируются через событие registerFormOperation, в аргументах которого ожидается объект с полями
 * <ol>
 *     <li>save:Function - вызов происходит перед началом сохранения</li>
 *     <li>cancel:Function - вызов происходит перед показом вопроса о сохранении</li>
 *     <li>isDestroyed:Function - функция, которая сообщает о том, не разрушился ли контрол, зарегистрировавший операцию.
 *     В случае, если он будет разрушен - операция автоматически удалится из списка зарегистрированных</li>
 * </ol>
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
    private _record: Model = null;
    private _isNewRecord: boolean = false;
    private _createMetaDataOnUpdate: unknown = null;
    private _errorContainer: IContainerConstructor = dataSourceError.Container;
    private __errorController: dataSourceError.Controller;
    private _source: Memory;
    private _createdInMounting: IConfigInMounting;
    private _isMount: boolean;
    private _readInMounting: IConfigInMounting;
    private _wasCreated: boolean;
    private _wasRead: boolean;
    private _formOperationsStorage: IFormOperation[] = [];
    private _wasDestroyed: boolean;
    private _pendingPromise: Promise<any>;
    private __error: dataSourceError.ViewConfig;
    private _crudController: CrudController = null;
    private _validateController: ControllerClass = new ControllerClass();
    private _isConfirmShowed: boolean;

    protected _beforeMount(options?: IFormController, context?: object, receivedState: IReceivedState = {}): Promise<ICrudResult> | void {
        this.__errorController = options.errorController || new dataSourceError.Controller({});
        this._source = options.source || options.dataSource;
        this._crudController = new CrudController(this._source, this._notifyHandler.bind(this),
            this.registerPendingNotifier.bind(this), this.indicatorNotifier.bind(this));
        if (options.dataSource) {
            Logger.error('FormController: Use option "source" instead of "dataSource"', this);
        }
        if (options.initValues) {
            Logger.error('FormController: Use option "createMetaData" instead of "initValues"', this);
        }
        const receivedError = receivedState.errorConfig;
        const receivedData = receivedState.data;

        if (receivedError) {
            return this._showError(receivedError);
        }
        const record = receivedData || options.record || null;

        this._isNewRecord = !!options.isNewRecord;
        this._setRecord(record);

        const initializingWay = this._calcInitializingWay(options);

        if (initializingWay !== INITIALIZING_WAY.LOCAL) {
            let recordPromise;
            if (initializingWay === INITIALIZING_WAY.READ || initializingWay === INITIALIZING_WAY.DELAYED_READ) {
                const hasKey: boolean = options.key !== undefined && options.key !== null;
                if (!hasKey) {
                    this._throwInitializingWayException(initializingWay, 'key');
                }
                recordPromise = this._readRecordBeforeMount(options);
            } else {
                recordPromise = this._createRecordBeforeMount(options);
            }
            if (initializingWay === INITIALIZING_WAY.READ || initializingWay === INITIALIZING_WAY.CREATE) {
                return recordPromise;
            }
        } else if (!record) {
            this._throwInitializingWayException(initializingWay, 'record');
        }
    }

    protected _afterMount(): void {
        this._isMount = true;
        // если рекорд был создан во время beforeMount, уведомим об этом
        if (this._createdInMounting) {
            this._createRecordBeforeMountNotify();
        }

        // если рекорд был прочитан через ключ во время beforeMount, уведомим об этом
        if (this._readInMounting) {
            this._readRecordBeforeMountNotify();
        }
        this._createChangeRecordPending();
    }

    protected _beforeUpdate(newOptions: IFormController): void {
        this._crudController.setDataSource(newOptions.dataSource || newOptions.source);
        if (newOptions.dataSource || newOptions.source) {
            this._source = newOptions.source || newOptions.dataSource;
            // Сбрасываем состояние, только если данные поменялись, иначе будет зацикливаться
            // создание записи -> ошибка -> beforeUpdate
            if (this._source !== this._options.source && this._source !== this._options.dataSource) {
                this._createMetaDataOnUpdate = null;
            }
        }
        const createMetaData = newOptions.initValues || newOptions.createMetaData;
        const needRead: boolean = newOptions.key !== undefined && this._options.key !== newOptions.key;
        const needCreate: boolean = newOptions.key === undefined &&
            !newOptions.record && this._createMetaDataOnUpdate !== createMetaData;

        if (newOptions.record && this._record !== newOptions.record) {
            if (!needCreate && !needRead) {
                this._confirmRecordChangeHandler(() => {
                    this._setRecord(newOptions.record);
                });
            } else {
                this._setRecord(newOptions.record);
            }
        }
        if (needRead) {
            // Если текущий рекорд изменен, то покажем вопрос
            this._confirmRecordChangeHandler(() => {
                this.read(newOptions.key, newOptions.readMetaData);
            }, () => {
                this._tryDeleteNewRecord().then(() => {
                    this.read(newOptions.key, newOptions.readMetaData);
                });
            });
        } else if (needCreate) {
            // Если нет ключа и записи - то вызовем метод создать.
            // Состояние isNewRecord обновим после того, как запись вычитается,
            // иначе можем удалить рекорд, к которому новое значение опции isNewRecord не относится.
            // Добавил защиту от циклических вызовов: У контрола стреляет _beforeUpdate, нет рекорда и ключа =>
            // вызывается создание записи. Метод падает с ошибкой. У контрола стреляет _beforeUpdate,
            // вызов метода создать повторяется бесконечно. Нельзя чтобы контрол ддосил БЛ.
            this._confirmRecordChangeHandler(() => {
                this._createMetaDataOnUpdate = createMetaData;
                this.create(newOptions.initValues || newOptions.createMetaData).then(() => {
                    if (newOptions.hasOwnProperty('isNewRecord')) {
                        this._isNewRecord = newOptions.isNewRecord;
                    }
                    this._createMetaDataOnUpdate = null;
                });
            });
        } else {
            if (newOptions.hasOwnProperty('isNewRecord')) {
                this._isNewRecord = newOptions.isNewRecord;
            }
        }
    }

    private _throwInitializingWayException(initializingWay: INITIALIZING_WAY, requiredOptionName: string): void {
        throw new Error(`${this._moduleName}: Опция initializingWay установлена в значение ${initializingWay}.
        Для корректной работы требуется передать опцию ${requiredOptionName}, либо изменить значение initializingWay`);
    }

    private _calcInitializingWay(options: IFormController): string {
        if (options.initializingWay) {
            return options.initializingWay;
        }
        const hasKey: boolean = options.key !== undefined && options.key !== null;
        if (options.record) {
            if (hasKey) {
                return INITIALIZING_WAY.DELAYED_READ;
            }
            return INITIALIZING_WAY.LOCAL;
        }
        if (hasKey) {
            return INITIALIZING_WAY.READ;
        }
        return INITIALIZING_WAY.CREATE;
    }

    private _confirmRecordChangeHandler(defaultAnswerCallback: Function, negativeAnswerCallback?: Function): void {
        if (this._isConfirmShowed) { // Защита от множ. вызова окна
            return;
        }
        if (this._needShowConfirmation()) {
            this._isConfirmShowed = true;
            this._showConfirmPopup('yesno').then((answer) => {
                if (answer === true) {
                    this.update().then(() => {
                        this._isConfirmShowed = false;
                        defaultAnswerCallback();
                    });
                } else {
                    this._isConfirmShowed = false;
                    if (negativeAnswerCallback) {
                        negativeAnswerCallback();
                    } else {
                        defaultAnswerCallback();
                    }
                }
            });
        } else {
            return defaultAnswerCallback();
        }
    }

    protected _afterUpdate(): void {
        if (this._wasCreated || this._wasRead || this._wasDestroyed) {
            // сбрасываем результат валидации, если только произошло создание, чтение или удаление рекорда
            this._validateController.setValidationResult(null);
            this._wasCreated = false;
            this._wasRead = false;
            this._wasDestroyed = false;
        }
        this._validateController.resolveSubmit();
    }

    protected _beforeUnmount(): void {
        if (this._pendingPromise) {
            this._pendingPromise.callback();
            this._pendingPromise = null;
        }
        this._validateController.destroy();
        this._validateController = null;
        // when FormController destroying, its need to check new record was saved or not. If its not saved, new record trying to delete.
        // Текущая реализация не подходит, завершать пендинги могут как сверху(при закрытии окна), так и
        // снизу (редактирование закрывает пендинг).
        // надо делать так, чтобы редактирование только на свой пендинг влияло
        // https://online.sbis.ru/opendoc.html?guid=78c34d53-8705-4e25-bbb5-0033e81d6152
        if (this._needDestroyRecord()) {
            const removePromise = this._tryDeleteNewRecord();
            this._notifyToOpener('deletestarted', [this._record, this._getRecordId(), {removePromise}]);
        }
        this._crudController.hideIndicator();
        this._crudController = null;
    }

    protected _onValidateCreated(e: Event, control: ValidateContainer): void {
        this._validateController.addValidator(control);
    }

    protected _onValidateDestroyed(e: Event, control: ValidateContainer): void {
        this._validateController.removeValidator(control);
    }

    private _checkRecordType(record: Model): boolean {
        return cInstance.instanceOfModule(record, 'Types/entity:Record');
    }

    private _createRecordBeforeMount(cfg: IFormController): Promise<ICrudResult> {
        // если ни рекорда, ни ключа, создаем новый рекорд и используем его.
        // до монитрования в DOM не можем сделать notify событий (которые генерируются в CrudController,
        // а стреляются с помощью FormController'а, в данном случае), поэтому будем создавать рекорд напрямую.
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

    private _readRecordBeforeMount(cfg: IFormController): Promise<ICrudResult> {
        // если в опции не пришел рекорд, смотрим на ключ key, который попробуем прочитать.
        // до монитрования в DOM не можем сделать notify событий (которые генерируются в CrudController,
        // а стреляются с помощью FormController'а, в данном случае), поэтому будем создавать рекорд напрямую.
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
        if (!this._record.getId && !this._options.keyProperty) {
            Logger.error('FormController: Рекорд не является моделью и не задана опция keyProperty, указывающая на ключевое поле рекорда', this);
            return null;
        }
        return this._options.keyProperty ? this._record.get(this._options.keyProperty) : this._record.getId();
    }

    private _tryDeleteNewRecord(): Promise<undefined> {
        if (this._needDestroyRecord()) {
            return this._source.destroy(this._getRecordId(), this._options.destroyMetaData);
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
            validate(): boolean {
                return self._needShowConfirmation();
            },
            onPendingFail(forceFinishValue: boolean, deferred: Promise<boolean>): void {
                self._startFormOperations('cancel').then(() => {
                    self._showConfirmDialog(deferred, forceFinishValue);
                });
            }
        }], {bubbling: true});
    }

    private _needShowConfirmation(): boolean {
        if (this._options.confirmationShowingCallback) {
            return this._options.confirmationShowingCallback();
        } else {
            return this._record && this._record.isChanged();
        }
    }

    private _registerFormOperationHandler(event: Event, operation: IFormOperation): void {
        this._formOperationsStorage.push(operation);
    }

    private _startFormOperations(command: string): Promise<void> {
        const resultPromises: Promise<void>[] = [];
        this._formOperationsStorage = this._formOperationsStorage.filter((operation: IFormOperation) => {
            if (operation.isDestroyed()) {
                return false;
            }
            const result = operation[command]();
            if (result instanceof Promise || result instanceof Deferred) {
                resultPromises.push(result);
            }
            return true;
        });

        return Promise.all(resultPromises);
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
            this._showConfirmPopup('yesnocancel', rk('Чтобы продолжить редактирование, нажмите «Отмена»')).then((answer) => {
                this._confirmDialogResult(answer, def);
                return answer;
            });
        }
    }

    private _showConfirmPopup(type: string, details?: string): Promise<string | boolean> {
        return Confirmation.openPopup({
            message: rk('Сохранить изменения?'),
            details,
            type
        });
    }

    create(createMetaData: unknown): Promise<undefined | Model> {
        createMetaData = createMetaData || this._options.initValues || this._options.createMetaData;
        return this._crudController.create(createMetaData).then(
            this._createHandler.bind(this),
            this._crudErrback.bind(this)
        );
    }

    private _createHandler(record: Model): Model {
        this._updateIsNewRecord(true);
        this._setRecord(record);
        this._wasCreated = true;
        this._forceUpdate();
        return record;
    }

    read(key: string, readMetaData: unknown): Promise<Model> {
        readMetaData = readMetaData || this._options.readMetaData;
        return this._crudController.read(key, readMetaData).then(
            this._readHandler.bind(this),
            this._crudErrback.bind(this)
        );
    }

    registerPendingNotifier(params: [any]): void {
        this._notify('registerPending', params, {bubbling: true});
    }

    indicatorNotifier(eventType: string, params: []): string {
        return this._notify(eventType, params, {bubbling: true});
    }

    private _readHandler(record: Model): Model {
        this._wasRead = true;
        this._setRecord(record);
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
                this._startFormOperations('save').then(() => {
                    const res = this._update(config).then(this._getData);
                    updateResult.dependOn(res);
                });
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
        const validationDef = this.validate();
        validationDef.then((results) => {
            if (!results.hasErrors) {
                // при успешной валидации пытаемся сохранить рекорд
                this._notify('validationSuccessed', [], {bubbling: true});
                let res = this._crudController.update(record, this._isNewRecord, config);
                // fake deferred used for code refactoring
                if (!(res && res.then)) {
                    res = new Deferred();
                    res.callback();
                }
                res.then((arg) => {
                    this._updateIsNewRecord(false);

                    updateDef.callback({data: true});
                    return arg;
                }).catch((error: Error) => {
                    updateDef.errback(error);
                    return this._processError(error, dataSourceError.Mode.dialog);
                });
            } else {
                // если были ошибки валидации, уведомим о них
                const validationErrors = this._validateController.getValidationResult();
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
        const resultProm = this._crudController.delete(this._record, destroyMetaData || this._options.destroyMetaData);

        return resultProm.then((record) => {
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
        // Для чего нужен _forceUpdate см внутри метода deferSubmit
        this._forceUpdate();
        return this._validateController.deferSubmit();
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
