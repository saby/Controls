import {SerializableMixin, OptionsToPropertyMixin, Model} from 'Types/entity';
import {mixin} from 'Types/util';
import {ICrud, DataSet, Query} from 'Types/source';
import {RecordSet, factory as RSFactory} from 'Types/collection';
import {object} from 'Types/util';
import {factory} from 'Types/chain';
import cInstance = require('Core/core-instance');
import ParallelDeferred = require('Core/ParallelDeferred');
import rk = require('i18n!Controls');
import * as Constants from './Constants';
import {default as Service} from './Service';

export interface IHistorySourceOptions {
    originSource: ICrud;
    historySource: Service;
    parentProperty: string;
    pinned: Array<string | number>;
    displayProperty: string;
    nodeProperty: string;
}

interface IHistoryData {
    frequent: RecordSet;
    recent: RecordSet;
    pinned: RecordSet;
}

const HISTORY_META_FIELDS: string[] = ['$_favorite', '$_pinned', '$_history', '$_addFromData'];

/**
 * Источник, который возвращает из исходного источника отсортированные данные с учётом истории.
 * @class Controls/_history/Source
 * @extends Core/core-extend
 * @mixes Types/_entity/OptionsToPropertyMixin
 * @control
 * @public
 * @author Герасимов А.М.
 * @category Menu
 * @example
 * <pre>
 *    var source = new history.Source({
 *        originSource: new source.Memory({
 *           keyProperty: 'id',
 *           data: items
 *        }),
 *        historySource: new history.Service({
 *           historyId: 'TEST_HISTORY_ID'
 *        }),
 *        parentProperty: 'parent'
 *    });
 * </pre>
 */

/*
 * Source
 * Proxy source adding history data to the original source
 * @class Controls/_history/Source
 * @extends Core/core-extend
 * @mixes Types/_entity/OptionsToPropertyMixin
 * @control
 * @public
 * @author Герасимов А.М.
 * @category Menu
 * @example
 * <pre>
 *    var source = new history.Source({
 *        originSource: new source.Memory({
 *           keyProperty: 'id',
 *           data: items
 *        }),
 *        historySource: new history.Service({
 *           historyId: 'TEST_HISTORY_ID'
 *        }),
 *        parentProperty: 'parent'
 *    });
 * </pre>
 */

/**
 * @name Controls/_history/Source#originSource
 * @cfg {Source} Источник данных.
 */
/**
 * @name Controls/_history/Source#historySource
 * @cfg {Source} Источник, который работает с историей.
 * @see {Controls/_history/Service} Источник работает с сервисом истории ввода.
 */
/*
 * @name Controls/_history/Source#historySource
 * @cfg {Source} A source which work with history
 * @see {Controls/_history/Service} Source working with the service of InputHistory
 */
export default class HistorySource extends mixin<SerializableMixin, OptionsToPropertyMixin>(
    SerializableMixin,
    OptionsToPropertyMixin
) implements ICrud {
    readonly '[Types/_source/ICrud]': boolean = true;
    protected _$history: IHistoryData = null;
    protected _$oldItems: any = null;
    protected _$parentProperty: string = null;
    protected _$nodeProperty: string = null;
    protected _$displayProperty: string = null;
    protected _$parents: any = null;
    protected _$originSource: ICrud = null;
    protected _$historySource: Service = null;
    protected _$historyItems: RecordSet = null;
    protected _$pinned: Array<string | number> = null;
    protected _$recentCount: number = null;

    constructor(options: IHistorySourceOptions) {
        super(options);
        OptionsToPropertyMixin.call(this, options);
        SerializableMixin.call(this);
    }

// region private
    private _getSourceByMeta(meta: Record<string, string>, historySource: Service, originSource: ICrud): Service | ICrud {
        const hasHistoryFields = Object.keys(meta).some((field: string): boolean => {
            return HISTORY_META_FIELDS.includes(field);
        });

        return hasHistoryFields ? historySource : originSource;
    }

    private _initHistory(data: DataSet | IHistoryData, sourceItems: RecordSet): void {
        if (data instanceof DataSet) {
            const row = data.getRow();
            const pinned = this._prepareHistoryItems(row.get('pinned'), sourceItems);
            const recent = this._prepareHistoryItems(row.get('recent'), sourceItems);
            const frequent = this._prepareHistoryItems(row.get('frequent'), sourceItems);
            this._$historyItems = null;
            this._$history = {
                pinned,
                recent,
                frequent
            };
            if (this._$pinned instanceof Array) {
                this._$pinned.forEach((pinId: string): void => {
                    if (sourceItems.getRecordById(pinId) && !this._$history.pinned.getRecordById(pinId)) {
                        this._$history.pinned.add(this._getRawHistoryItem(pinId, this._$historySource.getHistoryId()));
                    }
                });
            }
            this._$recentCount = recent.getCount();
        } else {
            this._$history = data;
        }
    }

    /* После изменения оригинального рекордсета, в истории могут остаться записи,
       которых уже нет в рекордсете, поэтому их надо удалить из истории */
    private _prepareHistoryItems(historyItems: RecordSet, sourceItems: RecordSet): RecordSet {
        const hItems = historyItems.clone();
        if (cInstance.instanceOfModule(this._$originSource, 'Types/source:Memory')) {
            const toDelete = [];

            factory(hItems).each((rec) => {
                if (!sourceItems.getRecordById(rec.getKey())) {
                    toDelete.push(rec);
                }
            });

            toDelete.forEach((rec) => {
                hItems.remove(rec);
            });
        }
        return hItems;
    }

    private _getFilterHistory(rawHistoryData: any): any {
        const pinnedIds = this._getPinnedIds(rawHistoryData.pinned);
        const frequentIds = this._getFrequentIds(rawHistoryData.frequent, pinnedIds);
        const recentIds = this._getRecentIds(rawHistoryData.recent, pinnedIds, frequentIds);

        return {
            pinned: pinnedIds,
            frequent: frequentIds,
            recent: recentIds
        };
    }

    private _getPinnedIds(pinned: Model[]): string[] {
        return pinned.map((item: Model): string => {
            return item.getKey();
        });
    }

    private _getFrequentIds(frequent: Model[], filteredPinned: string[]): string[] {
        const frequentIds = [];

        // рассчитываем количество популярных пунктов
        const maxCountFrequent = (Constants.MAX_HISTORY - filteredPinned.length - Constants.MIN_RECENT);
        let countFrequent = 0;
        let item;

        frequent.forEach((element: Model): void => {
            const id = element.getKey();
            item = this._$oldItems.getRecordById(id);
            if (countFrequent < maxCountFrequent && !filteredPinned.includes(id) && !item?.get(this._$nodeProperty)) {
                frequentIds.push(id);
                countFrequent++;
            }
        });
        return frequentIds;
    }

    private _getRecentIds(recent: Model[], filteredPinned: string[], filteredFrequent: string[]): string[] {
        const recentIds = [];
        let countRecent = 0;
        const maxCountRecent = Constants.MAX_HISTORY - (filteredPinned.length + filteredFrequent.length);
        let item;
        let id;

        recent.forEach((element: Model): void => {
            id = element.getKey();
            item = this._$oldItems.getRecordById(id);
            if (countRecent < maxCountRecent &&
                !filteredPinned.includes(id) &&
                !filteredFrequent.includes(id) &&
                !item?.get(this._$nodeProperty)
            ) {
                recentIds.push(id);
                countRecent++;
            }
        });
        return recentIds;
    }

    private _setHistoryFields(item: Model, idProperty: string, id: string): void {
        item.set(idProperty, id + '_history');
        item.set('originalId', id);
    }

    private _resetHistoryFields(item: Model, keyProperty: string): Model {
        const origItem = item.clone();
        if (item.get && item.get('originalId')) {
            origItem.set(keyProperty, item.get('originalId'));
            origItem.removeField('originalId');
        }
        return origItem;
    }

    _prepareHistoryItem(item: Model, historyType: string): void {
        item.set(historyType, true);
        return item.has('group') && item.set('group', null);
    }

    private _itemNotExist(id: string, historyType: string): void {
        if (historyType === 'pinned') {
            // удаляем элемент из pinned, если его нет в оригинальных данных,
            // иначе он будет занимаеть место в запиненных, хотя на самом деле такой записи нет
            this._unpinItemById(id);
        }
    }

    private _getItemsWithHistory(history: Record<string, any>, oldItems: RecordSet): RecordSet {
        if (!this._$historyItems) {
            this._$historyItems = this._prepareOriginItems(history, oldItems);
        }

        return this._$historyItems;
    }

    private _prepareOriginItems(history: Record<string, any>, oldItems: any): RecordSet {
        const items = oldItems.clone();
        let filteredHistory;
        let historyIds;
        filteredHistory = this._getFilterHistory(this._$history);
        historyIds = filteredHistory.pinned.concat(filteredHistory.frequent.concat(filteredHistory.recent));

        items.clear();

        // Clear может стереть исходный формат. Поэтому восстанавливаем его из исходного рекордсета.
        // https://online.sbis.ru/opendoc.html?guid=21e24eb1-8beb-46c8-acc0-43ec7286b2d4
        if (!oldItems.hasDecalredFormat()) {
            const format = oldItems.getFormat();
            factory(format).each((field: any): void => {
                this._addProperty(items, field.getName(), field.getType(), field.getDefaultValue());
            });
        }

        this._addProperty(items, 'pinned', 'boolean', false);
        this._addProperty(items, 'recent', 'boolean', false);
        this._addProperty(items, 'frequent', 'boolean', false);
        this._addProperty(items, 'HistoryId', 'string', this._$historySource.getHistoryId() || '');
        this._addProperty(items, 'originalId', 'string', '');
        this._fillItems(filteredHistory, 'pinned', oldItems, items);
        this._fillFrequentItems(filteredHistory, oldItems, items);
        this._fillItems(filteredHistory, 'recent', oldItems, items);
        oldItems.forEach((item: Model): void => {
            // id is always string at history. To check whether an item belongs to history, convert id to string.
            const id = String(item.getKey());
            const historyItem = historyIds.indexOf(id);
            let newItem;
            if (historyItem === -1 || item.get(this._$parentProperty)) {
                newItem = new Model({
                    rawData: item.getRawData(),
                    adapter: items.getAdapter(),
                    format: items.getFormat()
                });
                if (filteredHistory.pinned.indexOf(id) !== -1) {
                    newItem.set('pinned', true);
                }
                if (filteredHistory.pinned.indexOf(id) !== -1 ||
                    filteredHistory.recent.indexOf(id) !== -1 ||
                    filteredHistory.frequent.indexOf(id) !== -1
                ) {
                    this._setHistoryFields(newItem, item.getKeyProperty(), id);
                }
                items.add(newItem);
            }
        });

        return items;
    }

    private _fillItems(history: any, historyType: string, oldItems: RecordSet, items: RecordSet): void {
        let item;
        let oldItem;
        let historyId;
        let historyItem;

        history[historyType].forEach((id: string) => {
            oldItem = oldItems.getRecordById(id);
            if (oldItem) {
                historyItem = this._$history[historyType].getRecordById(id);
                historyId = historyItem.get('HistoryId');

                item = new Model({
                    rawData: oldItem.getRawData(),
                    adapter: items.getAdapter(),
                    format: items.getFormat()
                });
                if (this._$parentProperty) {
                    item.set(this._$parentProperty, null);
                }

                //removing group allows items to be shown in history items
                this._prepareHistoryItem(item, historyType);
                item.set('HistoryId', historyId);
                items.add(item);
            } else {
                this._itemNotExist(id, historyType);
            }
        });
    }

    private _unpinItemById(id: string): void {
        const meta = {$_pinned: false};
        const keyProperty = this._getKeyProperty();
        const rawData: Record<string, any> = {};

        rawData.pinned = true;
        rawData[keyProperty] = id;

        const item = new Model({
            rawData,
            keyProperty
        });

        this._updatePinned(item, meta);
    }

    private _fillFrequentItems(history: IHistoryData, oldItems: RecordSet, items: RecordSet): void {
        const config = {
            adapter: items.getAdapter(),
            keyProperty: items.getKeyProperty(),
            format: items.getFormat()
        };
        let frequentItems = new RecordSet(config);
        const displayProperty = this._$displayProperty || 'title';
        let firstName;
        let secondName;

        this._fillItems(history, 'frequent', oldItems, frequentItems);

        // alphabet sorting
        frequentItems = factory(frequentItems).sort((first, second): number => {
            firstName = first.get(displayProperty);
            secondName = second.get(displayProperty);

            return (firstName < secondName) ? -1 : (firstName > secondName) ? 1 : 0;
        }).value(RSFactory.recordSet, config);

        items.append(frequentItems);
    }

    private _addProperty(record: Model, name: string, type: string, defaultValue: any): void {
        if (record.getFormat().getFieldIndex(name) === -1) {
            record.addField({name, type, defaultValue});
        }
    }

    private _updatePinned(item: Model, meta: Record<string, any>): any {
        const pinned = this._$history.pinned;
        let id;
        if (item.get('pinned')) {
            item.set('pinned', false);
            pinned.remove(pinned.getRecordById(item.getKey()));
            this._$historyItems = null;
        } else {
            if (this._checkPinnedAmount(pinned)) {
                id = item.getKey();
                item.set('pinned', true);
                pinned.add(this._getRawHistoryItem(id, item.get('HistoryId') || id));
                this._$historyItems = null;
            } else {
                this._showNotification();
                return false;
            }
        }
        this._$historySource.saveHistory(this._$historySource.getHistoryId(), this._$history);
        return this._getSourceByMeta(meta, this._$historySource, this._$originSource).update(item, meta);
    }

    private _showNotification(): void {
        import('Controls/popup').then((popup) => {
            popup.Notification.openPopup({
                template: 'Controls/popupTemplate:NotificationSimple',
                templateOptions: {
                    style: 'danger',
                    text: rk('Невозможно закрепить более 10 пунктов'),
                    icon: 'Alert'
                }
            });
        });
    }

    private _getKeyProperty(): string {
        let source;
        if (cInstance.instanceOfModule(this._$originSource, 'Types/_source/IDecorator')) {
            source = this._$originSource.getOriginal();
        } else {
            source = this._$originSource;
        }
        return source.getKeyProperty();
    }

    private _resolveRecent(data: any): void {
        const recent = this._$history?.recent;
        if (recent) {
            const items = [];
            factory(data).each((item: Model): void => {
                if (!(this._$nodeProperty && item.get(this._$nodeProperty))) {
                    const id = item.get(this._getKeyProperty());
                    const hItem = recent.getRecordById(id);
                    if (hItem) {
                        recent.remove(hItem);
                    }
                    const historyId = this._getRawHistoryItem(id, item.get('HistoryId') ||
                        this._$historySource.getHistoryId());
                    items.push(historyId);
                }
            });
            recent.prepend(items);
        }
    }

    private _updateRecent(data: any, meta: any): Promise<any> {
        let historyData;
        let recentData;

        if (data instanceof Array) {
            historyData = {
                ids: []
            };
            factory(data).each((item: Model): void => {
                const itemId = item.get(this._getKeyProperty());
                historyData.ids.push(itemId);
            });
            recentData = data;
        } else {
            historyData = data;
            recentData = [data];
        }

        this._resolveRecent(recentData);
        if (this._$historyItems && !this._updateRecentInItems(recentData)) {
            this._$historyItems = null;
        }

        this._$historySource.saveHistory(this._$historySource.getHistoryId(), this._$history);
        return this._getSourceByMeta(meta, this._$historySource, this._$originSource).update(historyData, meta);
    }

    private _updateRecentInItems(recent: Model[]): boolean {
        let updateResult = false;

        const getFirstRecentItemIndex = () => {
            let recentItemIndex = -1;
            this._$historyItems.each((item, index) => {
                if (recentItemIndex === -1 && item.get('recent') && !item.get('pinned')) {
                    recentItemIndex = index;
                }
            });
            return recentItemIndex;
        };

        const moveRecentItemToTop = (item) => {
            const firstRecentItemIndex = getFirstRecentItemIndex();
            const itemIndex = this._$historyItems.getIndex(item);

            if (firstRecentItemIndex !== itemIndex) {
                this._$historyItems.move(
                    this._$historyItems.getIndex(item),
                    firstRecentItemIndex + 1
                );
            }
        };

        if (recent.length === 1) {
            const itemId = recent[0].get(this._getKeyProperty());
            const item = this._$historyItems.getRecordById(itemId);

            if (item) {
                const isRecent = item.get('recent');
                const isPinned = item.get('pinned');
                const isFrequent = item.get('frequent');

                if (isFrequent || isRecent && !isPinned) {
                    updateResult = true;

                    if (isRecent) {
                        moveRecentItemToTop(item);
                    }
                }
            }
        }

        return updateResult;
    }

    private _getRawHistoryItem(id: string, hId: string): Model {
        return new Model({
            rawData: {
                d: [String(id), hId], // id is always string at history.
                s: [{
                    n: 'ObjectId',
                    t: 'Строка'
                },
                    {
                        n: 'HistoryId',
                        t: 'Строка'
                    }
                ]
            },
            adapter: this._$history.recent.getAdapter()
        });
    }

    private _checkPinnedAmount(pinned: RecordSet): boolean {
        return pinned.getCount() !== Constants.MAX_HISTORY;
    }

    private _isError(data: unknown): boolean {
        return data instanceof Error;
    }

// endregion
    create(meta: Record<string, any>): Promise<any> {
        return this._getSourceByMeta(meta, this._$historySource, this._$originSource).create(meta);
    }

    read(key: string, meta: any): Promise<any> {
        return this._getSourceByMeta(meta, this._$historySource, this._$originSource).read(key, meta);
    }

    update(data: any, meta: any): Promise<any> {
        if (meta.hasOwnProperty('$_pinned')) {
            return Promise.resolve(this._updatePinned(data, meta));
        }
        if (meta.hasOwnProperty('$_history')) {
            return Promise.resolve(this._updateRecent(data, meta));
        }
        return this._getSourceByMeta(meta, this._$historySource, this._$originSource).update(data, meta);
    }

    destroy(keys: string[], meta: any): any {
        return this._getSourceByMeta(meta, this._$historySource, this._$originSource).destroy(keys, meta);
    }

    query(query: Query): Promise<DataSet> {
        const pd = new ParallelDeferred({ stopOnFirstError: false });
        let where = query.getWhere() as Record<string, any>;
        let newItems;

        let originSourceQuery;
        let historySourceQuery;

        // For Selector/Suggest load data from history, if there is a historyKeys
        if (where && (where.$_history === true || where.historyKeys)) {
            //@ts-ignore
            delete query._where.$_history;

            historySourceQuery = this._$historySource.query();
            pd.push(historySourceQuery);

            if (where.historyKeys) {
                where = object.clone(where);
                delete where.historyKeys;
                query.where(where);
            }

            originSourceQuery = this._$originSource.query(query);
            pd.push(originSourceQuery);

            return pd.done().getResult().addBoth((data) => {
                const isCancelled = this._isError(data) && data.canceled;
                let result;

                // method returns error
                if (!isCancelled && data[1] && !this._isError(data[1])) {
                    this._$oldItems = data[1].getAll();

                    // history service returns error
                    if (data[0] && !this._isError(data[0])) {
                        this._initHistory(data[0], this._$oldItems);
                        newItems = this._getItemsWithHistory(this._$history, this._$oldItems);
                        this._$historySource.saveHistory(this._$historySource.getHistoryId(), this._$history);
                    } else {
                        newItems = this._$oldItems;
                    }
                    result = new DataSet({
                        rawData: newItems.getRawData(true),
                        keyProperty: newItems.getKeyProperty(),
                        adapter: newItems.getAdapter(),
                        model: newItems.getModel()
                    });
                } else if (isCancelled) {
                    // Необходимо вернуть ошибку из deferred'a, чтобы вся цепочка завершилась ошибкой
                    result = data;
                    historySourceQuery.cancel();
                    originSourceQuery.cancel();
                } else {
                    result = data[1];
                }

                return result;
            });
        }
        return this._$originSource.query(query);
    }

    getItems(withHistory: boolean = true): RecordSet {
        if (this._$history && withHistory) {
            return this._getItemsWithHistory(this._$history, this._$oldItems);
        } else {
            return this._$oldItems;
        }
    }

    prepareItems(items: RecordSet): RecordSet {
        this._$historyItems = null;
        this._$oldItems = items.clone();
        return this.getItems();
    }

    resetHistoryFields(item: Model, keyProperty: string): Model {
        return this._resetHistoryFields(item, keyProperty);
    }

    getHistory(): IHistoryData {
        return this._$history;
    }

    setHistory(history: IHistoryData): void {
        this._$history = history;
    }
}

Object.assign(HistorySource.prototype, {
    _moduleName: 'Controls/history:Source'
});
