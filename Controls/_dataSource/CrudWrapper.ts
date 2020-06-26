import {Query, ICrud, DataSet} from 'Types/source';
import {Record, Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import * as cInstance from 'Core/core-instance';

import {Controller as ErrorController, Mode as ErrorMode, ViewConfig as ErrorViewConfig} from 'Controls/_dataSource/error';
import {Logger} from 'UI/Utils';
import {IAdditionalQueryParams} from 'Controls/_interface/IAdditionalQueryParams';

export interface ICrudWrapperOptions {
    source: ICrud;
    errorController?: ErrorController;
    errorViewMode?: ErrorMode;
}

/**
 * @name Controls/dataSource/CrudWrapper#source
 * @cfg {Types/source:ICrud} Ресурс для запроса данных
 * @example
 * const source = new Memory({
 *     keyProperty: 'id',
 *     data: data
 * });
 */
/*
 * @name Controls/dataSource/CrudWrapper#source
 * @cfg {Types/source:ICrud} Data source
 */

/**
 * @name Controls/dataSource/CrudWrapper#errorController
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
 * @name Controls/dataSource/CrudWrapper#errorController
 * @cfg {Controls/dataSource:error.Controller} Error controller instance with previously configured handlers
 */

/**
 * Прослойка между контролом и source: Types/_source/ICrud, которая позволяет перехватывать ошибку загрузки и возвращать в catch Controls/_dataSource/_error/ViewConfig конфиг для отображения ошибки
 * @remark
 * @class Controls/dataSource/CrudWrapper
 * @example
 * <pre>
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
 * const crudWrapper = new CrudWrapper(source, errorConfig, errorController);
 * crudWrapper.create(...)
 *     .then((record: Record) => {
 *         // ...
 *     })
 *     .catch((error: error.ViewConfig) => {
 *         this._showError(error);
 *     })
 * </pre>
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
     * @param [queryParams] Параметры для формирования запроса Query {@link Types/source/Query}
     * @param [keyProperty] Поле, которое будет использоваться в качестве ключа возвращаемого рекордсета
     * @return Асинхронный результат выполнения: в случае успеха вернет {@link Types/_source/DataSet} - прочитаннные данные, в случае ошибки - Error.
     */
    /*
     * Runs query to get a party of records
     * @param [queryParams] Params to build Query {@link Types/source/Query}
     * @return Promise resolving created Record {@link Types/_entity/Record} and rejecting an Error.
     */
    query(queryParams: IAdditionalQueryParams, keyProperty?: string): Promise<RecordSet> {
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
            // TODO разобраться с типами. Похоже что PrefetchProxy отдает не DataSet
            if (keyProperty && dataSet.getKeyProperty && keyProperty !== dataSet.getKeyProperty()) {
                dataSet.setKeyProperty(keyProperty);
            }
            return dataSet.getAll ? dataSet.getAll() : dataSet as RecordSet;
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
    private _promiseCatchCallback(error: Error): Promise<error> {
        // TODO добавить обработку ошибок
        return Promise.resolve(error);
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
