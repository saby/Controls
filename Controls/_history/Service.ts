import {SbisService, DataSet, ICrud, IData} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {OptionsToPropertyMixin, SerializableMixin, Model} from 'Types/entity';
import * as Constants from './Constants';
import Deferred = require('Core/Deferred');
import {object, mixin} from 'Types/util';
import DataStorage from './DataStorage';
import LoadPromisesStorage from './LoadPromisesStorage';
import {Logger} from 'UI/Utils';
import {detection} from 'Env/Env';

export interface IHistoryServiceOptions {
    historyId: string;
    historyIds?: string[];
    pinned?: Array<string | number>;
    frequent?: Array<string | number>;
    recent?: Array<string | number>;
    favorite?: Array<string | number>;
    dataLoaded?: boolean;
}
const STORAGES_USAGE = {};

/**
 * Источник, который работает с <a href="/doc/platform/developmentapl/middleware/input-history-service/">сервисом истории ввода</a>.
 *
 * @class Controls/_history/Service
 * @extends Core/core-extend
 * @implements Types/_source/ICrud
 * @mixes Types/_entity/OptionsToPropertyMixin
 * @public
 * @author Герасимов А.М.
 * @example
 * <pre>
 *    new history.Service({
 *       historyId: 'TEST_HISTORY_ID'
 *    })
 * </pre>
 */

/*
 * Source working with the service of InputHistory
 *
 * @class Controls/_history/Service
 * @extends Core/core-extend
 * @implements Types/_source/ICrud
 * @mixes Types/_entity/OptionsToPropertyMixin
 * @public
 * @author Герасимов А.М.
 * @example
 * <pre>
 *    new historyService({
 *       historyId: 'TEST_HISTORY_ID'
 *    })
 * </pre>
 */

/**
 * @name Controls/_history/Service#historyId
 * @cfg {String} Уникальный идентификатор <a href="/doc/platform/developmentapl/middleware/input-history-service/">сервиса истории</a>.
 */

/*
 * @name Controls/_history/Service#historyId
 * @cfg {String} unique service history identifier
 */

/**
 * @name Controls/_history/Service#historyIds
 * @cfg {Array of String} Уникальные идентификаторы <a href="/doc/platform/developmentapl/middleware/input-history-service/">сервиса истории</a>.
 */

/*
 * @name Controls/_history/Service#historyIds
 * @cfg {Array of String} unique service history identifiers
 */

/**
 * @name Controls/_history/Service#pinned
 * @cfg {Boolean} Загружает закрепленные записи из БЛ.
 * @remark
 * true - Load items
 * false - No load items
 */

/*
 * @name Controls/_history/Service#pinned
 * @cfg {Boolean} Loads pinned items from BL
 * @remark
 * true - Load items
 * false - No load items
 */

/**
 * @name Controls/_history/Service#frequent
 * @cfg {Boolean} Загружает наиболее часто выбираемые записи из БЛ.
 * @remark
 * true - Load items
 * false - No load items
 */

/*
 * @name Controls/_history/Service#frequent
 * @cfg {Boolean} Loads frequent items from BL
 * @remark
 * true - Load items
 * false - No load items
 */

/**
 * @name Controls/_history/Service#recent
 * @cfg {Boolean} Загружает последние записи из БЛ.
 * @remark
 * true - Load items
 * false - No load items
 */

/*
 * @name Controls/_history/Service#recent
 * @cfg {Boolean} Loads recent items from BL
 * @remark
 * true - Load items
 * false - No load items
 */

/**
 * @name Controls/_history/Service#dataLoaded
 * @cfg {Boolean} Записи, загруженные с данными объекта.
 * @remark
 * true - БЛ вернет записи с данными.
 * false - Бл вернет записи без данных.
 */

/*
 * @name Controls/_history/Service#dataLoaded
 * @cfg {Boolean} Items loaded with object data
 * @remark
 * true - BL return items with data
 * false - BL return items without data
 */

export default class HistroryService extends mixin<SerializableMixin, OptionsToPropertyMixin>(
    SerializableMixin,
    OptionsToPropertyMixin
) implements ICrud {
    protected _$historyDataSource: SbisService = null;
    protected _$historyId: string = null;
    protected _$historyIds: string[] = null;
    protected _$pinned: Array<string | number> = null;
    protected _$frequent: Array<string | number> = null;
    protected _$favorite: Array<string | number> = null;
    protected _$recent: number = null;
    protected _$dataLoaded: boolean = null;

    constructor(options: IHistoryServiceOptions) {
        super(options);
        OptionsToPropertyMixin.call(this, options);
        SerializableMixin.call(this);
    }
// region private
    private _getHistoryDataSource(): SbisService {
        if (!this._$historyDataSource) {
            this._$historyDataSource = new SbisService({
                endpoint: {
                    address: '/input-history/service/',
                    contract: 'InputHistory'
                }
            });
        }
        return this._$historyDataSource;
    }

    private _callQuery(method: string, params: Record<string, any>): any {
        return this._getHistoryDataSource().call(method, params);
    }

    private _getMethodNameByIdType(stringMethod: string, intMethod: string, id: number | string): string {
        return typeof id === 'number' ? intMethod : stringMethod;
    }

    private _updateFavoriteData(data: any, meta: any): void {
        this._getHistoryDataSource().call('UpdateData', {
            history_id: this._$historyId || data.get('HistoryId'),
            object_id: data.getId(),
            data: data.get('ObjectData'),
            history_type: Number(meta.isClient)
        });
    }

    private _load(): Promise<any> {
        let resultDef;
        if (this._$favorite) {
            resultDef = this._callQuery('ClientAndUserHistoryList', {
                params: {
                    historyId: this._$historyId,
                    client: { count: Constants.MAX_HISTORY_REPORTS },
                    pinned: { count: Constants.MAX_HISTORY_REPORTS },
                    recent: { count: Constants.MAX_HISTORY_REPORTS },
                    getObjectData: true
                }
            });
        } else {
            if (this._$historyId || this._$historyIds?.length) {
                resultDef = this._callQuery('UnionMultiHistoryIndexesList', {
                    params: {
                        historyIds: this._$historyId ? [this._$historyId] : this._$historyIds,
                        pinned: {count: this._$pinned ? Constants.MAX_HISTORY : 0},
                        frequent: {count: this._$frequent ? (Constants.MAX_HISTORY - Constants.MIN_RECENT) : 0},
                        recent: {count: this._$recent || Constants.MAX_HISTORY},
                        getObjectData: this._$dataLoaded
                    }
                });
            } else {
                Logger.error('Controls/history: Не установлен идентификатор истории (опция historyId)', this);
                resultDef = Promise.reject();
            }
        }
        return resultDef;
    }

    private _deleteItem(data: any, meta: any): Promise<any> {
        return this._callQuery( 'Delete', {
            history_id: this._$historyId,
            object_id: data.getId(),
            history_type: Number(meta.isClient)
        });
    }

    private _updateHistory(data: any, meta: any): any {
        if (meta.parentKey) {
            this._callQuery('AddHierarchyList', {
                history_id: this._$historyId,
                parent1: meta.parentKey,
                ids: data.ids
            });
        } else if (data.ids) {
            this._callQuery(this._getMethodNameByIdType('AddList', 'AddIntList', data.ids[0]), {
                history_id: this._$historyId,
                ids: data.ids,
                history_context: null
            });
        } else {
            const id = data.getKey();
            this._callQuery(this._getMethodNameByIdType('Add', 'AddInt', id), {
                history_id: data.get('HistoryId') || this._$historyId,
                id,
                history_context: null
            });
        }
    }

    private _addFromData(data: any): any {
        return this._getHistoryDataSource().call('AddFromData', {
            history_id: this._$historyId,
            data
        });
    }

    private _updatePinned(data: any, meta: any): any {
        const id = data.getKey();
        const historyId = data.get('HistoryId') || this._$historyId;
        if (meta.isClient) {
            this._callQuery( 'PinForClient', {
                history_id: historyId,
                object_id: id,
                data: data.get('ObjectData')
            });
        } else {
            this._callQuery(this._getMethodNameByIdType('SetPin', 'SetIntPin', id), {
                history_id: historyId,
                id,
                history_context: null,
                pin: !!meta.$_pinned
            });
        }
    }

    private _incrementUsage(): void {
        if (!STORAGES_USAGE[this._$historyId]) {
            STORAGES_USAGE[this._$historyId] = 0;
        }
        STORAGES_USAGE[this._$historyId]++;
    }

    private _decrementUsage(): void {
        STORAGES_USAGE[this._$historyId]--;
        if (STORAGES_USAGE[this._$historyId] === 0) {
            DataStorage.delete(this._$historyId);
        }
    }

    private _createRecordSet(data: object): RecordSet {
        return new RecordSet({
            rawData: data,
            keyProperty: 'ObjectId',
            adapter: 'adapter.sbis'
        });
    }
// endregion

    update(data: any, meta: any): Promise<any> | object {
        if (meta.hasOwnProperty('$_addFromData')) {
            return this._addFromData(data);
        }
        if (meta.hasOwnProperty('$_pinned')) {
            this._updatePinned(data, meta);
        }
        if (meta.hasOwnProperty('$_history')) {
            this._updateHistory(data, meta);
        }
        if (meta.hasOwnProperty('$_favorite')) {
            this._updateFavoriteData(data, meta);
        }

        return {};
    }

    deleteItem(data: any, meta: any): any {
        return this._deleteItem(data, meta);
    }

    query(): Deferred<DataSet> {
        const historyId = this._$historyId;
        const storageDef = LoadPromisesStorage.read(historyId);
        const storageData = DataStorage.read(historyId);
        let resultDef;

        const getHistoryDataSet = (): DataSet => {
            return new DataSet({
                rawData: this.getHistory(historyId)
            });
        };

        if (storageDef) {
            resultDef = new Deferred();
            // create new deferred, so in the first callback function, the result of the query will be changed
            storageDef.addBoth(() => {
                resultDef.callback(getHistoryDataSet());
            });
        } else if (!storageDef && !storageData) {
            /**
             * В retailOffline нет сервиса истории и его там нельзя вызывать, в таком случае работаем без истории вообще.
             * FIXME: https://online.sbis.ru/opendoc.html?guid=f0e4521b-873a-4b1a-97fe-2ecbb12409d1
             */
            if (detection.retailOffline) {
                const emptyData = new DataSet({
                    rawData: {
                        pinned: this._createRecordSet({}),
                        frequent: this._createRecordSet({}),
                        recent: this._createRecordSet({})
                    }
                });
                resultDef = Deferred.success(emptyData);
            } else {
                resultDef = this._load();
            }
            LoadPromisesStorage.write(historyId, resultDef);

            resultDef.addBoth((res) => {
                LoadPromisesStorage.delete(historyId);
                return res;
            });
        } else {
            resultDef = Deferred.success(getHistoryDataSet());
        }
        this._incrementUsage();
        return resultDef;
    }

    destroy(id: number|string): Deferred<null> {
        let  result;

        if (id) {
            result = this._callQuery('Delete', {
                history_id: this._$historyId,
                object_id: id
            });
        } else {
            result = Deferred.success(null);
        }

        this._decrementUsage();
        return result;
    }

    /**
     * Returns a service history identifier
     * @returns {String}
     */
    getHistoryId(): string {
        return this._$historyId;
    }

    /**
     * Save new history
     */
    saveHistory(historyId: string, newHistory: RecordSet): void {
        DataStorage.write(historyId, object.clone(newHistory));
    }

    /**
     * Returns a set of history items
     * @returns {Object}
     */
    getHistory(historyId: string): RecordSet {
        return DataStorage.read(historyId);
    }
}

Object.assign(HistroryService.prototype, {
    _moduleName: 'Controls/history:Service'
});
