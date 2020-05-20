import {Query, ICrud, DataSet} from 'Types/source';
import {Record, Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import * as cInstance from 'Core/core-instance';

import {Controller as ErrorController, Mode as ErrorMode, ViewConfig as ErrorViewConfig} from 'Controls/_dataSource/error';
import {Logger} from 'UI/Utils';
import {IAdditionalQueryParams} from 'Controls/_source/interface/IAdditionalQueryParams';

export interface ICrudWrapperOptions {
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
     * @name Controls/_listRender/SourceControl#errorController
     * @cfg {Controls/_dataSource/error:ErrorController} Экземпляр контроллера ошибки, инициализированный с собственными хандлерами
     */
    /*
     * @name Controls/_listRender/SourceControl#errorController
     * @cfg {Controls/_dataSource/error:ErrorController} Error controller instance, initialized with Custom handlers
     */
    errorController?: ErrorController;

    /**
     * @name Controls/_listRender/SourceControl#errorViewMode
     * @cfg {Controls/_dataSource/error:Mode} Внешний вид отображения ошибки.
     */
    errorViewMode?: ErrorMode;
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
 */

/**
 * Прослойка между контролом и source: Types/_source/ICrud, которая позволяет перехватывать ошибку загрузки и возвращать в catch Controls/_dataSource/_error/ViewConfig конфиг для отображения ошибки
 * @remark
 * Этота обёртка должен вставляться везде где есть работа с сорсом, т.е. в
 *  • Списках ({@link Controls/_list/List.ts} and {@link Controls/_list/ListView.ts})
 *  • formController ({@link Controls/_form/FormController.ts})
 *  • dataSource/error/DataLoader ({@link Controls/_dataSource/_error/DataLoader.ts} and {@link Controls/_dataSource/requestDataUtil.ts})
 * НЕ РЕАЛИЗУЕТ интерфейс Types/_source/ICrud, т.к. метод query должен принимать параметры filter, sorting, offset, limit
 * @class Controls/dataSource/SourceCrudInterlayer
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
 *     .catch((error: error.ViewConfig) => {
 *         this._showError(error);
 *     })
 * @public
 * @author Аверкиев П.А.
 */

export class CrudWrapper {

    private readonly _source: ICrud;
    private readonly _errorController: ErrorController;

    private readonly _boundPromiseCatchCallback: (error: Error) => Promise<null>;

    constructor(options: ICrudWrapperOptions) {
        if (CrudWrapper._isValidCrudSource(options.source)) {
            this._source = options.source;
        }
        this._errorController = options.errorController || new ErrorController({});
        this._boundPromiseCatchCallback = this._promiseCatchCallback.bind(this);
    }

    /**
     * Создает пустую запись через источник данных (при этом она не сохраняется в хранилище)
     * @param [meta] Дополнительные мета данные, которые могут понадобиться для создания записи
     * @return Асинхронный результат выполнения: в случае успеха вернет {@link Types/_entity/Record} - созданную запись, в случае ошибки - Error.
     */
    /*
     * Creates empty Record using current storage (without saving to the storage)
     * @param [meta] Additional meta data to create a Record
     * @return Promise resolving created Record {@link Types/_entity/Record} and rejecting an Error.
     */
    create(meta?: object): Promise<Record> {
        return this._source.create(meta).catch(this._boundPromiseCatchCallback);
    }

    /**
     * Читает запись из источника данных
     * @param key Первичный ключ записи
     * @param [meta] Дополнительные мета данные
     * @return Асинхронный результат выполнения: в случае успеха вернет {@link Types/_entity/Record} - прочитанную запись, в случае ошибки - Error.
     */
    /*
     * Reads a Record from current storage
     * @param key Primary key for Record
     * @param [meta] Additional meta data
     * @return Promise resolving created Record {@link Types/_entity/Record} and rejecting an Error.
     */
    read(key: number | string, meta?: object): Promise<Record> {
        return this._source.read(key, meta).catch(this._boundPromiseCatchCallback);
    }

    /**
     * Обновляет запись в источнике данных
     * @param data Обновляемая запись или рекордсет
     * @param [meta] Дополнительные мета данные
     * @return Асинхронный результат выполнения: в случае успеха ничего не вернет, в случае ошибки - Error.
     */
    /*
     * Updates existing Record or RecordSet in current storage
     * @param data Updating Record or RecordSet
     * @param [meta] Additional meta data
     * @return Promise resolving nothing and rejecting an Error.
     */
    update(data: Record | RecordSet<Model>, meta?: object): Promise<void> {
        return this._source.update(data, meta).catch(this._boundPromiseCatchCallback);
    }

    /**
     * Выполняет запрос на выборку
     * @param [queryParams] Параметры для фыормирования запроса Query {@link Types/source/Query}
     * @return Асинхронный результат выполнения: в случае успеха вернет {@link Types/_source/DataSet} - прочитаннные данные, в случае ошибки - Error.
     */
    /*
     * Runs query to get a party of records
     * @param [queryParams] Params to build Query {@link Types/source/Query}
     * @return Promise resolving created Record {@link Types/_entity/Record} and rejecting an Error.
     */
    query(queryParams: IAdditionalQueryParams): Promise<RecordSet> {
        let query = new Query();
        if (queryParams.filter) {
            query = query.where(queryParams.filter);
        }
        if (queryParams.offset) {
            query = query.offset(queryParams.offset);
        }
        if (queryParams.limit) {
            query = query.limit(queryParams.limit);
        }
        if (queryParams.sorting) {
            query = query.orderBy(queryParams.sorting);
        }
        if (queryParams.meta) {
            query = query.meta(queryParams.meta);
        }
        return this._source.query(query).then((dataSet: DataSet) => {
            return dataSet.getAll();
        }).catch(this._boundPromiseCatchCallback);
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
    destroy(keys: number | string | number[] | string[], meta?: object): Promise<void> {
        return this._source.destroy(keys, meta).catch(this._boundPromiseCatchCallback);
    }

    /**
     * Реджектит в Promise результат с конфигурацией для показа ошибки. Этот результат можно будет отловить в catch
     * Перед обработкой ошибки вызывает внешний коллбек onError
     * @param error
     * @private
     */
    private _promiseCatchCallback(error: Error): Promise<null> {
        return this._processError(error, ErrorMode.include).then((errorConf: ErrorViewConfig) => {
            return Promise.reject(errorConf);
        });
    }

    /**
     * Обрабатывает ошибку и возвращает Promise с её конфигурацией
     * @param error
     * @param mode
     * @private
     */
    private _processError(error: Error, mode?: ErrorMode): Promise<void | ErrorViewConfig> {
        return this._errorController.process({
            error,
            mode: mode || ErrorMode.include
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
