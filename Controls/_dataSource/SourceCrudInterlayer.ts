import {Query, ICrud, DataSet} from 'Types/source';
import {Record, Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import * as cInstance from 'Core/core-instance';

import {IErrorController} from 'Controls/interface';
import * as ErrorModule from 'Controls/_dataSource/error';
import {Logger} from 'UI/Utils';
import {Controller as ErrorController} from 'Controls/_dataSource/error';

/**
 * Конфигурация для ошибки, которую можно получить в catch
 */
export interface ISourceErrorData {
    data: any;
    errorConfig?: ErrorModule.ViewConfig;
}

/**
 * Конфигурация для отображения ошибки
 */
export interface ISourceErrorConfig {
    /**
     * @name Controls/dataSource/ISourceErrorConfig#mode
     * @cfg {Controls/dataSource:error.Mode} Перечисляемое множество возможных способов отображения парковочного шаблона ошибки
     * @see Controls/_dataSource/_error/Mode
     */
    mode?: ErrorModule.Mode;

    /**
     * @name Controls/dataSource/ISourceErrorConfig#onBeforeProcessError
     * @cfg {Controls/dataSource:error.Mode} Коллбек для выполнения до обработчика ошибки
     */
    onBeforeProcessError?: (error: Error) => any;
}

export interface ISourceCrudInterlayerOptions {
    /**
     * @name Controls/_source/NavigationController#source
     * @cfg {Types/source:ICrud} Ресурс для запроса данных
     */
    /*
     * @name Controls/_source/NavigationController#source
     * @cfg {Types/source:ICrud} Source to request data
     */
    source: ICrud;

    /**
     * @name Controls/_listRender/SourceControl#errorConfig
     * @cfg {Controls/_dataSource/SourceCrudInterlayer:ISourceErrorConfig} настройки для отображения ошибки
     */
    /*
     * @name Controls/_listRender/SourceControl#errorConfig
     * @cfg {Controls/_dataSource/SourceCrudInterlayer:ISourceErrorConfig} error display configuration
     */
    errorConfig?: ISourceErrorConfig;

    /**
     * @name Controls/_listRender/SourceControl#errorController
     * @cfg {Controls/_dataSource/error:ErrorController} Экземпляр контроллера ошибки, инициализированный с собственными хандлерами
     */
    /*
     * @name Controls/_listRender/SourceControl#errorController
     * @cfg {Controls/_dataSource/error:ErrorController} Error controller instance, initialized with Custom handlers
     */
    errorController?: ErrorController;
}

/**
 * @name Controls/dataSource/SourceCrudInterlayer#source
 * @cfg {Types/source:ICrud} Ресурс для запроса данных
 * @example
 * const source = new Memory({
 *     keyProperty: 'id',
 *     data: data
 * });
 */
/*
 * @name Controls/dataSource/SourceCrudInterlayer#source
 * @cfg {Types/source:ICrud} Data source
 * @example
 * const source = new Memory({
 *     keyProperty: 'id',
 *     data: data
 * });
 */

/**
 * @name Controls/dataSource/SourceCrudInterlayer#errorConfig
 * @cfg {Controls/dataSource/ISourceErrorConfig} Настройка отображения ошибки и коллбек
 * @example
 *  const errorConfig: ISourceErrorConfig = {
 *     mode: error.Mode.include,
 *     onBeforeProcessError: (error: Error) => {
 *         console.log(error);
 *     }
 * }
 */
/*
 * @name Controls/dataSource/SourceCrudInterlayer#errorConfig
 * @cfg {Controls/dataSource/ISourceErrorConfig} Error displaying settings with callback
 * @example
 *  const errorConfig: ISourceErrorConfig = {
 *     mode: error.Mode.include,
 *     onBeforeProcessError: (error: Error) => {
 *         console.log(error);
 *     }
 * }
 */

/**
 * @name Controls/dataSource/SourceCrudInterlayer#errorController
 * @cfg {Controls/dataSource:error.Controller} Контроллер ошибки c предварительно настроенными Handlers
 * @example
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
 * const errorController = new error.Controller(handlers);
 */
/*
 * @name Controls/dataSource/SourceCrudInterlayer#errorController
 * @cfg {Controls/dataSource:error.Controller} Error controller instance with previously configured handlers
 * @example
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
 * const errorController = new error.Controller(handlers);
 */

/**
 * Обёртка для source: ICrud, которая позволяет перехватывать ошибку загрузки и возвращать в catch
 * ISourceErrorData конфиг для отображения ошибки
 * @remark
 * Этота обёртка должен вставляться везде где есть работа с сорсом, т.е. в
 *  • Списках ({@link Controls/_list/List.ts} and {@link Controls/_list/ListView.ts})
 *  • formController ({@link Controls/_form/FormController.ts})
 *  • dataSource/error/DataLoader ({@link Controls/_dataSource/_error/DataLoader.ts} and {@link Controls/_dataSource/requestDataUtil.ts})
 * @class Controls/dataSource/SourceCrudInterlayer
 * @implements Types/source/ICrud
 * @example
 * const source = new Memory({
 *     keyProperty: 'id',
 *     data: data
 * });
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
 * const errorController = new error.Controller(handlers);
 * const errorConfig: ISourceErrorConfig = {
 *     mode: error.Mode.include,
 *     onBeforeProcessError: (error: Error) => {
 *         console.log(error);
 *     }
 * }
 * const SourceCrudInterlayer = new SourceCrudInterlayer(source, errorConfig, errorController)
 * SourceCrudInterlayer.create(...)
 *     .then((record: Record) => {
 *         // ...
 *     })
 *     .catch((record: ISourceErrorData) => {
 *         this._showError(record.errorConfig);
 *     })
 * @public
 * @author Аверкиев П.А.
 */
/*
 * source: ICrud wrapper that intercepts API error and returns error.ViewConfig while Promise rejection
 * @remark
 * This wrapper should be used anywhere to work with API source, e.g.
 *  • in Lists ({@link Controls/_list/List.ts} and {@link Controls/_list/ListView.ts})
 *  • in particular record view/edit Control ({@link Controls/_form/FormController.ts})
 *  • in data multi-source loader ({@link Controls/_dataSource/_error/DataLoader.ts} and {@link Controls/_dataSource/requestDataUtil.ts})
 * @class Controls/dataSource/SourceCrudInterlayer
 * @implements Types/source/ICrud
 * @example
 * const source = new Memory({
 *     keyProperty: 'id',
 *     data: data
 * });
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
 * const errorConfig: ISourceErrorConfig = {
 *     mode: error.Mode.include,
 *     onBeforeProcessError: (error: Error) => {
 *         console.log(error);
 *     }
 * }
 * const sourceCrudInterlayer = new SourceCrudInterlayer(source, errorConfig, errorController);
 * sourceCrudInterlayer.create(...)
 *     .then((record: Record) => {
 *         // ...
 *     })
 *     .catch((record: ISourceErrorData) => {
 *         this._showError(record.errorConfig);
 *     })
 * @public
 * @author Аверкиев П.А.
 */
export class SourceCrudInterlayer implements ICrud, IErrorController {
    readonly '[Types/_source/ICrud]': boolean = true;
    readonly '[Controls/_interface/IErrorController]': boolean = true;

    private readonly _source: ICrud;
    private readonly _errorController: ErrorModule.Controller;
    private readonly _errorConfig: ISourceErrorConfig;

    private readonly _boundPromiseCatchCallback: (error: Error) => Promise<null>;

    constructor(options: ISourceCrudInterlayerOptions) {
        if (SourceCrudInterlayer._isValidCrudSource(options.source)) {
            this._source = options.source;
        }
        this._errorController = options.errorController || new ErrorModule.Controller({});
        this._errorConfig = options.errorConfig || {mode: ErrorModule.Mode.include};
        this._boundPromiseCatchCallback = this._promiseCatchCallback.bind(this);
    }

    /**
     * Создает пустую запись через источник данных (при этом она не сохраняется в хранилище)
     * @param [meta] Дополнительные мета данные, которые могут понадобиться для создания записи
     * @return Асинхронный результат выполнения: в случае успеха вернет {@link Types/_entity/Record} - созданную запись, в случае ошибки - Error.
     * @see Types/_source/ICrud
     */
    /*
     * Creates empty Record using current storage (without saving to the storage)
     * @param [meta] Additional meta data to create a Record
     * @return Promise resolving created Record {@link Types/_entity/Record} and rejecting an Error.
     * @see Types/_source/ICrud
     */
    create(meta?: object): Promise<Record> {
        return this._source.create(meta).catch(this._boundPromiseCatchCallback);
    }

    /**
     * Читает запись из источника данных
     * @param key Первичный ключ записи
     * @param [meta] Дополнительные мета данные
     * @return Асинхронный результат выполнения: в случае успеха вернет {@link Types/_entity/Record} - прочитанную запись, в случае ошибки - Error.
     * @see Types/_source/ICrud
     */
    /*
     * Reads a Record from current storage
     * @param key Primary key for Record
     * @param [meta] Additional meta data
     * @return Promise resolving created Record {@link Types/_entity/Record} and rejecting an Error.
     * @see Types/_source/ICrud
     */
    read(key: number | string, meta?: object): Promise<Record> {
        return this._source.read(key, meta).catch(this._boundPromiseCatchCallback);
    }

    /**
     * Обновляет запись в источнике данных
     * @param data Обновляемая запись или рекордсет
     * @param [meta] Дополнительные мета данные
     * @return Асинхронный результат выполнения: в случае успеха ничего не вернет, в случае ошибки - Error.
     * @see Types/_source/ICrud
     */
    /*
     * Updates existing Record or RecordSet in current storage
     * @param data Updating Record or RecordSet
     * @param [meta] Additional meta data
     * @return Promise resolving nothing and rejecting an Error.
     * @see Types/_source/ICrud
     */
    update(data: Record | RecordSet<Model>, meta?: object): Promise<null> {
        return this._source.update(data, meta).catch(this._boundPromiseCatchCallback);
    }

    /**
     * Выполняет запрос на выборку
     * @param [query] Запрос
     * @return Асинхронный результат выполнения: в случае успеха вернет {@link Types/_source/DataSet} - прочитаннные данные, в случае ошибки - Error.
     * @see Types/source/ICrud#query
     */
    /*
     * Runs query to get a party of records
     * @param [query] A Query {@link Types/source/Query} to run
     * @return Promise resolving created Record {@link Types/_entity/Record} and rejecting an Error.
     * @see Types/_source/ICrud
     */
    query(query?: Query): Promise<DataSet> {
        return this._source.query(query).catch(this._boundPromiseCatchCallback);
    }

    /**
     * Удаляет запись из источника данных
     * @param keys Первичный ключ, или массив первичных ключей записи
     * @param [meta] Дополнительные мета данные
     * @return Асинхронный результат выполнения: в случае успеха ничего не вернет, в случае ошибки - Error.
     * @see Types/source/ICrud#destroy
     */
    /*
     * Removes record(s) from current storage
     * @param key Primary key(s) for Record(s)
     * @param [meta] Additional meta data
     * @return Promise resolving nothing and rejecting an Error.
     * @see Types/_source/ICrud
     */
    destroy(keys: number | string | number[] | string[], meta?: object): Promise<null> {
        return this._source.destroy(keys, meta).catch(this._boundPromiseCatchCallback);
    }

    /**
     * Реджектит в Promise результат с конфигурацией для показа ошибки. Этот результат можно будет отловить в catch
     * Перед обработкой ошибки вызывает внешний коллбек onError
     * @param error
     * @private
     */
    private _promiseCatchCallback(error: Error): Promise<null> {
        if (this._errorConfig.onBeforeProcessError instanceof Function) {
            this._errorConfig.onBeforeProcessError(error);
        }
        return this._processError(error, this._errorConfig.mode).then((errorConf: ISourceErrorData) => {
            return Promise.reject(errorConf);
        });
    }

    /**
     * Обрабатывает ошибку и возвращает Promise с её конфигурацией
     * @param error
     * @param mode
     * @private
     */
    private _processError(error: Error, mode?: ErrorModule.Mode): Promise<ISourceErrorData> {
        return this._errorController.process({
            error,
            mode: mode || ErrorModule.Mode.include
        }).then((errorViewConfig: ErrorModule.ViewConfig) => {
            return {
                errorConfig: errorViewConfig,
                data: error
            };
        });
    }

    /**
     * Валидатор, позволяющий убедиться, что для source был точно передан Types/_source/ICrud
     * @param {Types/source:ICrud} source
     * @private
     */
    private static _isValidCrudSource(source: ICrud): boolean {
        if (!cInstance.instanceOfModule(source, 'Types/_source/ICrud') && !cInstance.instanceOfMixin(source, 'Types/_source/ICrud')) {
            Logger.error('NavigationController: Source option has incorrect type');
            return false;
        }
        return true;
    }
}
