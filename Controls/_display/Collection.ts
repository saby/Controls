import Abstract, {IEnumerable, IOptions as IAbstractOptions} from './Abstract';
import CollectionEnumerator from './CollectionEnumerator';
import CollectionItem, {IOptions as ICollectionItemOptions, ICollectionItemCounters} from './CollectionItem';
import GroupItem from './GroupItem';
import IItemsStrategy from './IItemsStrategy';
import ItemsStrategyComposer from './itemsStrategy/Composer';
import DirectItemsStrategy from './itemsStrategy/Direct';
import UserItemsStrategy from './itemsStrategy/User';
import GroupItemsStrategy from './itemsStrategy/Group';
import {
    DestroyableMixin,
    ObservableMixin,
    SerializableMixin,
    VersionableMixin,
    ISerializableState as IDefaultSerializableState,
    functor
} from 'Types/entity';
import {
    EnumeratorCallback,
    IList,
    IObservable,
    EventRaisingMixin,
    IEnumerableComparatorSession,
    RecordSet
} from 'Types/collection';
import {create, register} from 'Types/di';
import {mixin, object} from 'Types/util';
import {Set, Map} from 'Types/shim';
import {Object as EventObject} from 'Env/Event';

import MarkerManager from './utils/MarkerManager';
import EditInPlaceManager from './utils/EditInPlaceManager';
import ItemActionsManager from './utils/ItemActionsManager';
import VirtualScrollManager from './utils/VirtualScrollManager';
import HoverManager from './utils/HoverManager';
import SwipeManager from './utils/SwipeManager';
import ExtendedVirtualScrollManager from './utils/ExtendedVirtualScrollManager';
import {IVirtualScrollConfig} from 'Controls/list';
import { ISelectionMap, default as SelectionManager } from './utils/SelectionManager';

// tslint:disable-next-line:ban-comma-operator
const GLOBAL = (0, eval)('this');
const LOGGER = GLOBAL.console;
const MESSAGE_READ_ONLY = 'The Display is read only. You should modify the source collection instead.';
const VIRTUAL_SCROLL_MODE = {
    HIDE: 'hide',
    REMOVE: 'remove'
};

export interface ISourceCollection<T> extends IEnumerable<T>, DestroyableMixin, ObservableMixin {
}

export type SourceCollection<T> = T[] | ISourceCollection<T>;

export interface ISplicedArray<T> extends Array<T> {
    start?: number;
}

type FilterFunction<S> = (
    item: S,
    index: number,
    collectionItem: CollectionItem<S>,
    collectionIndex: number,
    hasMembers?: boolean
) => boolean;

type GroupId = number | string | null;
type GroupFunction<S, T> = (item: S, index: number, collectionItem: T) => GroupId;

interface ISortItem<S, T> {
    item: T;
    index: number;
    collectionItem: S;
    collectionIndex: number;
}

export type SortFunction<S, T> = (a: ISortItem<S, T>, b: ISortItem<S, T>) => number;

export type ItemsFactory<T> = (options: object) => T;

interface ISessionItems<T> extends Array<T> {
    properties?: object;
}

export interface ISessionItemState<T> {
    item: T;
    selected: boolean;
}

export interface ISerializableState<S, T> extends IDefaultSerializableState {
    _composer: ItemsStrategyComposer<S, T>;
}

export interface IOptions<S, T> extends IAbstractOptions<S> {
    filter?: FilterFunction<S> | Array<FilterFunction<S>>;
    group?: GroupFunction<S, T>;
    sort?: SortFunction<S, T> | Array<SortFunction<S, T>>;
    keyProperty?: string;
    displayProperty?: string;
    multiSelectVisibility?: string;
    leftSpacing: string;
    rightSpacing: string;
    rowSpacing: string;
    searchValue: string;
    editingConfig: any;
    unique?: boolean;
    importantItemProperties?: string[];
    virtualScrollConfig?: IVirtualScrollConfig;
    itemActionsProperty?: string;
}

export interface ICollectionCounters {
    key: string|number;
    counters: ICollectionItemCounters;
}

/**
 * Преобразует проекцию в массив из ее элементов
 */
function toArray<S, T>(display: Collection<S>): T[] {
    const result = [];
    display.each((item) => {
        result.push(item);
    });
    return result;
}

/**
 * Нормализует массив обработчиков
 */
function normalizeHandlers<T>(handlers: T | T[]): T[] {
    if (typeof handlers === 'function') {
        handlers = [handlers];
    }
    return handlers instanceof Array ? handlers.filter((item) => typeof item === 'function') : [];
}

/**
 * Обрабатывает событие об изменении коллекции
 * @param event Дескриптор события.
 * @param action Действие, приведшее к изменению.
 * @param newItems Новые элементы коллекции.
 * @param newItemsIndex Индекс, в котором появились новые элементы.
 * @param oldItems Удаленные элементы коллекции.
 * @param oldItemsIndex Индекс, в котором удалены элементы.
 */
function onCollectionChange<T>(
    event: EventObject,
    action: string,
    newItems: T[],
    newItemsIndex: number,
    oldItems: T[],
    oldItemsIndex: number
): void {
    let session;

    switch (action) {
        case IObservable.ACTION_RESET:
            const projectionOldItems = toArray(this);
            let projectionNewItems;
            // TODO Здесь был вызов _reBuild(true), который полностью пересоздает все
            // CollectionItem'ы, из-за чего мы теряли их состояние. ACTION_RESET происходит
            // не только при полном пересоздании рекордсета, но и например при наборе
            // "критической массы" изменений при выключенном режиме обработки событий.
            // https://online.sbis.ru/opendoc.html?guid=573aed02-3c97-4432-9d39-19e53bda8bc0
            // По идее, нам это не нужно, потому что в случае реального пересоздания рекордсета,
            // нам передадут его новый инстанс, и мы пересоздадим всю коллекцию сами.
            // Но на случай, если такой кейс все таки имеет право на жизнь, выписал
            // задачу в этом разобраться.
            // https://online.sbis.ru/opendoc.html?guid=bd17a1fb-5d00-4f90-82d3-cb733fe7ab27
            // Как минимум пока мы поддерживаем совместимость с BaseControl, такая возможность нужна,
            // потому что там пересоздание модели вызывает лишние перерисовки, подскроллы, баги
            // виртуального скролла.
            this._reBuild(this._$compatibleReset);
            projectionNewItems = toArray(this);
            this._notifyBeforeCollectionChange();
            this._notifyCollectionChange(
                action,
                projectionNewItems,
                0,
                projectionOldItems,
                0
            );
            this._notifyAfterCollectionChange();
            this._nextVersion();
            return;

        case IObservable.ACTION_CHANGE:
            session = this._startUpdateSession();

            // FIXME: newItems.length - FIXME[OrderMatch]
            this._reGroup(newItemsIndex, newItems.length);
            this._reSort();
            this._reFilter();
            this._finishUpdateSession(session, false);
            this._notifyCollectionItemsChange(newItems, newItemsIndex, session);
            this._nextVersion();
            return;
    }

    session = this._startUpdateSession();

    switch (action) {
        case IObservable.ACTION_ADD:
            this._addItems(newItemsIndex, newItems);

            // FIXME: newItems.length - FIXME[OrderMatch]
            this._reGroup(newItemsIndex, newItems.length);
            this._reSort();
            this._reFilter();
            break;

        case IObservable.ACTION_REMOVE:
            // FIXME: oldItems.length - FIXME[OrderMatch]
            this._removeItems(oldItemsIndex, oldItems.length);
            this._reSort();
            if (this._isFiltered()) {
                this._reFilter();
            }
            break;

        case IObservable.ACTION_REPLACE:
            // FIXME: newItems - FIXME[OrderMatch]
            this._replaceItems(newItemsIndex, newItems);

            // FIXME: newItems.length - FIXME[OrderMatch]
            this._reGroup(newItemsIndex, newItems.length);
            this._reSort();
            this._reFilter();
            break;

        case IObservable.ACTION_MOVE:
            // FIXME: newItems - FIXME[OrderMatch]
            this._moveItems(newItemsIndex, oldItemsIndex, newItems);
            this._reSort();
            this._reFilter();
            break;
    }

    this._finishUpdateSession(session);
    this._nextVersion();
}

/**
 * Обрабатывает событие об изменении элемента коллекции
 * @param event Дескриптор события.
 * @param item Измененный элемент коллекции.
 * @param index Индекс измененного элемента.
 * @param [properties] Изменившиеся свойства
 */
function onCollectionItemChange<T>(
    event: EventObject,
    item: T,
    index: number,
    properties?: object
): void {
    if (!this.isEventRaising()) {
        return;
    }

    if (this._sourceCollectionSynchronized) {
        this._notifySourceCollectionItemChange(event, item, index, properties);
    } else {
        this._sourceCollectionDelayedCallbacks = this._sourceCollectionDelayedCallbacks || [];
        this._sourceCollectionDelayedCallbacks.push([this._notifySourceCollectionItemChange, arguments]);
    }

    this._nextVersion();
}

/**
 * Обрабатывает событие об изменении режима генерации событий
 * @param event Дескриптор события.
 * @param enabled Включена или выключена генерация событий
 * @param analyze Включен или выключен анализ изменений
 */
function onEventRaisingChange(event: EventObject, enabled: boolean, analyze: boolean): void {
    // Если без выключили без анализа изменений, то при следующем включении генерации надо актуализировать состояние
    if (!analyze && enabled) {
        this._reBuild(true);
    }

    this._sourceCollectionSynchronized = enabled;

    // Call delayed handlers if get back to synchronize
    const callbacks = this._sourceCollectionDelayedCallbacks;
    if (this._sourceCollectionSynchronized && callbacks) {
        let callback;
        while (callbacks.length > 0) {
            callback = callbacks[0];
            callback[0].apply(this, callback[1]);
            callbacks.shift();
        }
    }
}

/**
 * Adds/removes functor's properties into/out of list of important properties
 * @param func Functior to handle
 * @param add Do add or remove
 */
function functorToImportantProperties(func: Function, add: boolean): void {
    if (functor.Compute.isFunctor(func)) {
        const properties = (func as any).properties;
        for (let i = 0; i < properties.length; i++) {
            if (add) {
                this._setImportantProperty(properties[i]);
            } else {
                this._unsetImportantProperty(properties[i]);
            }
        }
    }
}

/**
 * Проекция коллекции - предоставляет методы навигации, фильтрации и сортировки,
 * не меняя при этом оригинальную коллекцию.
 * @class Controls/_display/Collection
 * @extends Controls/_display/Abstract
 * @implements Types/_collection/IEnumerable
 * @implements Types/_collection/IList
 * @mixes Types/_entity/SerializableMixin
 * @mixes Types/_entity/VersionableMixin
 * @mixes Types/_collection/EventRaisingMixin
 * @ignoreMethods notifyItemChange
 * @public
 * @author Мальцев А.А.
 */
export default class Collection<S, T extends CollectionItem<S> = CollectionItem<S>> extends mixin<
    Abstract<any, any>,
    SerializableMixin,
    VersionableMixin,
    EventRaisingMixin
>(
    Abstract,
    SerializableMixin,
    VersionableMixin,
    EventRaisingMixin
) implements IEnumerable<T>, IList<T> {
    /**
     * Возвращать локализованные значения
     */
    get localize(): boolean {
        return this._localize;
    }

    // endregion

    // region IEnumerable

    readonly '[Types/_collection/IEnumerable]': boolean = true;

    // endregion

    // region IList

    readonly '[Types/_collection/IList]': boolean = true;
    /**
     * @typedef {Object} UserSortItem
     * @property {Controls/_display/CollectionItem} item Элемент проекции
     * @property {*} collectionItem Элемент коллекции
     * @property {Number} index Индекс элемента проекции
     * @property {Number} collectionIndex Индекс элемента коллекции
     */

    /**
     * @event Перед началом изменений коллекции
     * @name Controls/_display/Collection#onBeforeCollectionChange
     */

    /**
     * @event После окончания изменений коллекции
     * @name Controls/_display/Collection#onAfterCollectionChange
     */

    /**
     * @cfg {Types/_collection/IEnumerable} Оригинальная коллекция
     * @name Controls/_display/Collection#collection
     * @see getCollection
     */
    protected _$collection: ISourceCollection<S>;

    /**
     * @cfg {
     * Array.<Function(*, Number, Controls/_display/CollectionItem, Number): Boolean>|
     * Function(*, Number, Controls/_display/CollectionItem, Number): Boolean
     * } Пользовательские методы фильтрации элементов проекциию. Аргументы: элемент коллекции, позиция в коллекции,
     * элемент проекции, позиция в проекции. Должен вернуть Boolean - признак, что элемент удовлетворяет условиям
     * фильтрации.
     * @name Controls/_display/Collection#filter
     * @example
     * Отберем персонажей женского пола:
     * <pre>
     *     require([
     *         'Types/_collection/List'
     *         'Controls/_display/Collection'
     *     ], function(List, CollectionDisplay) {
     *         var list = new List({
     *                 items: [
     *                     {name: 'Philip J. Fry', gender: 'M'},
     *                     {name: 'Turanga Leela', gender: 'F'},
     *                     {name: 'Professor Farnsworth', gender: 'M'},
     *                     {name: 'Amy Wong', gender: 'F'},
     *                     {name: 'Bender Bending Rodriguez', gender: 'R'}
     *                 ]
     *             }),
     *             display = new CollectionDisplay({
     *                 collection: list,
     *                 filter: function(collectionItem) {
     *                     return collectionItem.gender === 'F';
     *                 }
     *             });
     *
     *         display.each(function(item) {
     *             console.log(item.getContents().name);
     *         });
     *         //output: 'Turanga Leela', 'Amy Wong'
     *     });
     * </pre>
     * @see getFilter
     * @see setFilter
     * @see addFilter
     * @see removeFilter
     */
    protected _$filter: Array<FilterFunction<S>>;

    /**
     * @cfg {
     * Function(*, Number, Controls/_display/CollectionItem): String|null
     * } Метод группировки элементов проекции. Аргументы: элемент коллекции, позиция в коллекции, элемент проекции.
     * Должен вернуть идентификатор группы.
     * @name Controls/_display/Collection#group
     * @example
     * Сгруппируем персонажей по полу:
     * <pre>
     *     require([
     *         'Types/collection',
     *         'Controls/display'
     *     ], function(collection, display) {
     *         var list = new collection.List({
     *             items: [
     *                 {name: 'Philip J. Fry', gender: 'M'},
     *                 {name: 'Turanga Leela', gender: 'F'},
     *                 {name: 'Professor Farnsworth', gender: 'M'},
     *                 {name: 'Amy Wong', gender: 'F'},
     *                 {name: 'Bender Bending Rodriguez', gender: 'R'}
     *             ]
     *         });
     *         var display = new display.Collection({
     *             collection: list
     *             group: function(collectionItem, index, item) {
     *                 return collectionItem.gender;
     *             }
     *         });
     *
     *         display.each(function(item, index) {
     *             if (item instanceof display.GroupItem) {
     *                 console.log('[' + item.getContents() + ']';
     *             } else {
     *                 console.log(item.getContents().name);
     *             }
     *         });
     *         //output:
     *         // '[M]', 'Philip J. Fry', 'Professor Farnsworth',
     *         // '[F]', 'Turanga Leela', 'Amy Wong',
     *         // '[R]', 'Bender Bending Rodriguez'
     *     });
     * </pre>
     * @see getGroup
     * @see setGroup
     */
    protected _$group: GroupFunction<S, T>;

    /**
     * @cfg {
     * Array.<Function(UserSortItem, UserSortItem): Number>|
     * Function(UserSortItem, UserSortItem): Number
     * } Пользовательские методы сортировки элементов. Аргументы: 2 объекта типа {@link UserSortItem},
     * должен вернуть -1|0|1 (см. Array.prototype.sort())
     * @name Controls/_display/Collection#sort
     * @example
     * Отсортируем коллекцию по возрастанию значения поля title:
     * <pre>
     *     require([
     *         'Types/collection',
     *         'Controls/display'
     *     ], function(collection, display) {
     *         var display = new display.Collection({
     *             collection: new collection.List({
     *                 items: [
     *                     {id: 1, title: 'foo'},
     *                     {id: 2, title: 'bar'}
     *                 ]
     *             }),
     *             sort: function(a, b) {
     *                 return a.collectionItem.title - b.collectionItem.title;
     *             }
     *         });
     *
     *         display.each(function(item) {
     *             console.log(item.getContents().title;
     *         });
     *         //output: 'bar', 'foo'
     *     });
     * </pre>
     * @see getSort
     * @see setSort
     * @see addSort
     * @see removeSort
     */
    protected _$sort: Array<SortFunction<S, T>>;

    /**
     * @cfg {String} Название свойства элемента коллекции, содержащего его уникальный идентификатор.
     * @name Controls/_display/Collection#keyProperty
     */
    protected _$keyProperty: string;

    protected _$displayProperty: string;

    protected _$multiSelectVisibility: string;

    protected _$leftSpacing: string;

    protected _$rightSpacing: string;

    protected _$rowSpacing: string;

    protected _$searchValue: string;

    protected _$editingConfig: any;

    protected _$virtualScrolling: boolean;

    protected _$hasMoreData: boolean;

    protected _$compatibleReset: boolean;

    protected _$itemActionsProperty: string;

    /**
     * @cfg {Boolean} Обеспечивать уникальность элементов (элементы с повторяющимися идентфикаторами будут
     * игнорироваться). Работает только если задано {@link keyProperty}.
     * @name Controls/_display/Collection#unique
     */
    protected _$unique: boolean;

    /**
     * @cfg {Array.<String>} Названия свойств элемента коллекции, от которых зависят фильтрация, сортировка, группировка.
     * @name Controls/_display/Collection#importantItemProperties
     * @remark
     * Изменение любого из указанных свойств элемента коллекции приведет к перерасчету фильтрации, сортировки и
     * группировки.
     */
    protected _$importantItemProperties: string[];

    /**
     * Возвращать локализованные значения для типов, поддерживающих локализацию
     */
    protected _localize: boolean;

    /**
     * Тип элемента проекции
     */
    protected _itemModule: string | Function;

    /**
     * Фабрика элементов проекции
     */
    protected _itemsFactory: ItemsFactory<T>;

    /**
     * Элемент -> уникальный идентификатор
     */
    protected _itemToUid: Map<T, string> = new Map();

    /**
     * Уникальные идентификаторы элементов
     */
    protected _itemsUid: Set<string> = new Set();

    /**
     * Компоновщик стратегий
     */
    protected _composer: ItemsStrategyComposer<S, T>;

    /**
     * Коллекция синхронизирована с проекцией (все события, приходящие от нее, соответсвуют ее состоянию)
     */
    protected _sourceCollectionSynchronized: boolean;

    /**
     * Обработчики событий коллекции, отложенные до момента синхронизации
     */
    protected _sourceCollectionDelayedCallbacks: Function[];

    /**
     * Результат применения фильтра: индекс элемента проекции -> прошел фильтр
     */
    protected _filterMap: boolean[] = [];

    /**
     * Результат применения сортировки: индекс после сортировки -> индекс элемента проекции
     */
    protected _sortMap: number[] = [];

    /**
     * Служебный энумератор для организации курсора
     */
    protected _cursorEnumerator: CollectionEnumerator<T>;

    /**
     * Служебный энумератор для поиска по свойствам и поиска следующего или предыдущего элемента относительно заданного
     */
    protected _utilityEnumerator: CollectionEnumerator<T>;

    /**
     * Обработчик события об изменении коллекции
     */
    protected _onCollectionChange: Function;

    /**
     * Обработчик события об изменении элемента коллекции
     */
    protected _onCollectionItemChange: Function;

    /**
     * Обработчик события об изменении генерации событий коллекции
     */
    protected _oEventRaisingChange: Function;

    protected _startIndex: number;
    protected _stopIndex: number;

    protected _markerManager: MarkerManager;
    protected _editInPlaceManager: EditInPlaceManager;
    protected _itemActionsManager: ItemActionsManager;
    protected _virtualScrollManager: VirtualScrollManager | ExtendedVirtualScrollManager;
    protected _$virtualScrollMode: IVirtualScrollMode;
    protected _hoverManager: HoverManager;
    protected _swipeManager: SwipeManager;
    protected _selectionManager: SelectionManager;

    constructor(options: IOptions<S, T>) {
        super(options);
        SerializableMixin.call(this);
        EventRaisingMixin.call(this, options);
        this._$filter = this._$filter || [];
        this._$sort = this._$sort || [];
        this._$importantItemProperties = this._$importantItemProperties || [];

        // Support of deprecated 'idProperty' option
        if (!this._$keyProperty && (options as any).idProperty) {
             this._$keyProperty = (options as any).idProperty;
        }

        if (!this._$collection) {
            throw new Error(`${this._moduleName}: source collection is empty`);
        }
        if (this._$collection instanceof Array) {
            this._$collection = create('Types/collection:List', {items: this._$collection});
        }
        if (!this._$collection['[Types/_collection/IEnumerable]']) {
            throw new TypeError(`${this._moduleName}: source collection should implement Types/collection:IEnumerable`);
        }

        this._$sort = normalizeHandlers(this._$sort);
        this._$filter = normalizeHandlers(this._$filter);

        if (this._$keyProperty) {
            this._setImportantProperty(this._$keyProperty);
        }

        this._publish('onCurrentChange', 'onCollectionChange', 'onBeforeCollectionChange', 'onAfterCollectionChange');

        this._switchImportantPropertiesByUserSort(true);
        this._switchImportantPropertiesByGroup(true);

        this._reBuild();
        this._bindHandlers();
        if (this._$collection['[Types/_collection/IObservable]']) {
            (this._$collection as ObservableMixin).subscribe('onCollectionChange', this._onCollectionChange);
            (this._$collection as ObservableMixin).subscribe('onCollectionItemChange', this._onCollectionItemChange);
        }
        if (this._$collection['[Types/_entity/EventRaisingMixin]']) {
            (this._$collection as ObservableMixin).subscribe('onEventRaisingChange', this._oEventRaisingChange);
        }

        if (options.itemPadding) {
            this.setItemsSpacings(options.itemPadding);
        }

        const virtualScrollConfig = options.virtualScrollConfig || {mode: options.virtualScrollMode};
        this._$virtualScrollMode = virtualScrollConfig.mode;

        this._markerManager = new MarkerManager(this);
        this._editInPlaceManager = new EditInPlaceManager(this);
        this._itemActionsManager = new ItemActionsManager(this);
        this._hoverManager = new HoverManager(this);
        this._swipeManager = new SwipeManager(this);
        this._selectionManager = new SelectionManager(this);

        this._virtualScrollManager = options.virtualScrollMode === VIRTUAL_SCROLL_MODE.REMOVE ?
            new VirtualScrollManager(this) : new ExtendedVirtualScrollManager(this);
        this.setViewIndices(0, this.getCount());
    }

    destroy(): void {
        if (!(this._$collection as DestroyableMixin).destroyed) {
            if (this._$collection['[Types/_collection/IObservable]']) {
                (this._$collection as ObservableMixin).unsubscribe(
                    'onCollectionChange', this._onCollectionChange
                );
                (this._$collection as ObservableMixin).unsubscribe(
                    'onCollectionItemChange', this._onCollectionItemChange
                );
            }
            if (this._$collection['[Types/_entity/EventRaisingMixin]']) {
                (this._$collection as ObservableMixin).unsubscribe('onEventRaisingChange', this._oEventRaisingChange);
            }
        }

        this._unbindHandlers();
        this._composer = null;
        this._filterMap = [];
        this._sortMap = [];
        this._itemToUid = null;
        this._itemsUid = null;
        this._cursorEnumerator = null;
        this._utilityEnumerator = null;

        super.destroy();
    }

    // region mutable

    /**
     * Возвращает элемент проекции с указанным идентификатором экземпляра.
     * @param {String} instanceId Идентификатор экземпляра.
     * @return {Controls/_display/CollectionItem}
     * @state mutable
     */
    getByInstanceId(instanceId: string): T {
        return this.at(
            this._getUtilityEnumerator().getIndexByValue('instanceId', instanceId)
        );
    }

    /**
     * Возвращает индекс элемента проекции с указанным идентификатором экземпляра.
     * @param {String} instanceId Идентификатор экземпляра.
     * @return {Number}
     * @state mutable
     */
    getIndexByInstanceId(instanceId: string): number {
        return this._getUtilityEnumerator().getIndexByValue('instanceId', instanceId);
    }

    /**
     * Возвращает энумератор для перебора элементов проекции
     * @return {Controls/_display/CollectionEnumerator}
     */
    getEnumerator(localize?: boolean): CollectionEnumerator<T> {
        return this._getEnumerator() as any;
    }

    /**
     * Перебирает все элементы проекции, начиная с первого.
     * @param {Function(Controls/_display/CollectionItem, Number)} callback Ф-я обратного вызова для каждого элемента
     * коллекции (аргументами придут элемент коллекции и его порядковый номер)
     * @param {Object} [context] Контекст вызова callback
     * @example
     * Сгруппируем персонажей по полу:
     * <pre>
     *     require([
     *         'Types/collection',
     *         'Controls/display'
     *     ], function(collection, display) {
     *         var list = new collection.List({
     *             items: [
     *                 {name: 'Philip J. Fry', gender: 'M'},
     *                 {name: 'Turanga Leela', gender: 'F'},
     *                 {name: 'Professor Farnsworth', gender: 'M'},
     *                 {name: 'Amy Wong', gender: 'F'},
     *                 {name: 'Bender Bending Rodriguez', gender: 'R'}
     *             ]
     *         });
     *         var display = new display.Collection({
     *             collection: list
     *         });
     *
     *         display.setGroup(function(collectionItem, index, item) {
     *             return collectionItem.gender;
     *         });
     *
     *         display.each(function(item, index) {
     *             if (item instanceof GroupItem) {
     *                 console.log('[' + item.getContents() + ']');
     *             } else {
     *                 console.log(item.getContents().name);
     *             }
     *         });
     *         //output:
     *         // '[M]', 'Philip J. Fry', 'Professor Farnsworth',
     *         // '[F]', 'Turanga Leela', 'Amy Wong',
     *         // '[R]', 'Bender Bending Rodriguez'
     *     });
     * </pre>
     */
    each(callback: EnumeratorCallback<T>, context?: object): void {
        const enumerator = this.getEnumerator();
        let index;
        while (enumerator.moveNext()) {
            index = enumerator.getCurrentIndex();
            callback.call(
                context,
                enumerator.getCurrent(),
                index
            );
        }
    }

    assign(): void {
        throw new Error(MESSAGE_READ_ONLY);
    }

    append(): void {
        throw new Error(MESSAGE_READ_ONLY);
    }

    prepend(): void {
        throw new Error(MESSAGE_READ_ONLY);
    }

    clear(): void {
        throw new Error(MESSAGE_READ_ONLY);
    }

    add(): void {
        throw new Error(MESSAGE_READ_ONLY);
    }

    at(index: number): T {
        return this._getUtilityEnumerator().at(index) as any;
    }

    remove(): boolean {
        throw new Error(MESSAGE_READ_ONLY);
    }

    removeAt(): T {
        throw new Error(MESSAGE_READ_ONLY);
    }

    replace(): T {
        throw new Error(MESSAGE_READ_ONLY);
    }

    move(): void {
        throw new Error(MESSAGE_READ_ONLY);
    }

    getIndex(item: T): number {
        if (!(item instanceof CollectionItem)) {
            return -1;
        }
        return this.getIndexByInstanceId(item.getInstanceId());
    }

    /**
     * Возвращает количество элементов проекции.
     * @param {Boolean} [skipGroups=false] Не считать группы
     * @return {Number}
     */
    getCount(skipGroups?: boolean): number {
        let count = 0;
        if (skipGroups && this._isGrouped()) {
            this.each((item) => {
                if (!(item instanceof GroupItem)) {
                    count++;
                }
            });
        } else {
            count = this._getUtilityEnumerator().getCount();
        }
        return count;
    }

    // endregion

    // region Public

    // region Access

    /**
     * Возвращает оригинальную коллекцию
     * @return {Types/_collection/IEnumerable}
     * @see collection
     */
    getCollection(): ISourceCollection<S> {
        return this._$collection;
    }

    /**
     * Возвращает число элементов оригинальной коллекции
     * @return {Number}
     * @see collection
     */
    getCollectionCount(): number {
        const collection = this.getCollection();
        if (collection['[Types/_collection/IList]']) {
            return (collection as any as IList<S>).getCount();
        }

        const enumerator = (collection as IEnumerable<S>).getEnumerator();
        let count = 0;
        enumerator.reset();
        while (enumerator.moveNext()) {
            count++;
        }
        return count;
    }

    /**
     * Возвращает элементы проекции (без учета сортировки, фильтрации и группировки).
     * @return {Array.<Controls/_display/CollectionItem>}
     */
    getItems(): T[] {
        return this._getItems().slice();
    }

    /**
     * Создает элемент проекции
     * @param {Object} options Значения опций
     * @return {Controls/_display/CollectionItem}
     */
    createItem(options: object): T {
        if (!this._itemsFactory) {
            this._itemsFactory = this._getItemsFactory().bind(this);
        }

        return this._itemsFactory(options);
    }

    /**
     * Возвращает псевдоуникальный идентификатор элемента коллекции, основанный на значении опции
     * {@link Controls/_display/CollectionItem#contents}.
     * @param {Controls/_display/CollectionItem} item Элемент коллекции
     * @return {String|undefined}
     */
    getItemUid(item: T): string {
        const itemToUid = this._itemToUid;
        if (itemToUid.has(item)) {
            return itemToUid.get(item);
        }

        let uid = this._extractItemId(item);
        uid = this._searchItemUid(item, uid);

        itemToUid.set(item, uid);

        return uid;
    }

    // endregion Access

    // region Navigation

    /**
     * Возвращает текущий элемент
     * @return {Controls/_display/CollectionItem}
     */
    getCurrent(): T {
        return this._getCursorEnumerator().getCurrent();
    }

    /**
     * Устанавливает текущий элемент
     * @param {Controls/_display/CollectionItem} item Новый текущий элемент
     * @param {Boolean} [silent=false] Не генерировать событие onCurrentChange
     */
    setCurrent(item: T, silent?: boolean): void {
        const oldCurrent = this.getCurrent();
        if (oldCurrent !== item) {
            const enumerator = this._getCursorEnumerator();
            const oldPosition = this.getCurrentPosition();
            enumerator.setCurrent(item);

            if (!silent) {
                this._notifyCurrentChange(
                    this.getCurrent(),
                    oldCurrent,
                    enumerator.getPosition(),
                    oldPosition
                );
            }
        }
    }

    /**
     * Возвращает позицию текущего элемента
     * @return {Number}
     */
    getCurrentPosition(): number {
        return this._getCursorEnumerator().getPosition();
    }

    /**
     * Устанавливает позицию текущего элемента
     * @param {Number} position Позиция текущего элемента. Значение -1 указывает, что текущий элемент не выбран.
     * @param {Boolean} [silent=false] Не генерировать событие onCurrentChange
     */
    setCurrentPosition(position: number, silent?: boolean): void {
        const oldPosition = this.getCurrentPosition();
        if (position !== oldPosition) {
            const oldCurrent = this.getCurrent();
            this._getCursorEnumerator().setPosition(position);
            if (!silent) {
                this._notifyCurrentChange(
                    this.getCurrent(),
                    oldCurrent,
                    position,
                    oldPosition
                );
            }
        }
    }

    /**
     * Возвращает первый элемент
     * @return {Controls/_display/CollectionItem}
     */
    getFirst(): T {
        const enumerator = this._getUtilityEnumerator();
        enumerator.setPosition(0);

        const item = enumerator.getCurrent();

        if (item instanceof GroupItem) {
            return this._getNearbyItem(
                enumerator,
                item,
                true,
                true
            );
        }

        return item;
    }

    /**
     * Возвращает последний элемент
     * @return {Controls/_display/CollectionItem}
     */
    getLast(): T {
        const enumerator = this._getUtilityEnumerator();
        const lastIndex = enumerator.getCount() - 1;

        enumerator.setPosition(lastIndex);
        const item = enumerator.getCurrent();

        if (item instanceof GroupItem) {
            return this._getNearbyItem(
                enumerator,
                undefined,
                false,
                true
            );
        }

        return item;
    }

    /**
     * Возвращает следующий элемент относительно item
     * @param {Controls/_display/CollectionItem} item элемент проекции
     * @return {Controls/_display/CollectionItem}
     */
    getNext(item: T): T {
        return this._getNearbyItem(
            this._getUtilityEnumerator(),
            item,
            true,
            true
        );
    }

    /**
     * Возвращает предыдущий элемент относительно item
     * @param {Controls/_display/CollectionItem} index элемент проекции
     * @return {Controls/_display/CollectionItem}
     */
    getPrevious(item: T): T {
        return this._getNearbyItem(
            this._getUtilityEnumerator(),
            item,
            false,
            true
        );
    }

    /**
     * Устанавливает текущим следующий элемент
     * @return {Boolean} Есть ли следующий элемент
     */
    moveToNext(): boolean {
        const oldCurrent = this.getCurrent();
        const oldCurrentPosition = this.getCurrentPosition();
        const hasNext = this._getCursorEnumerator().moveNext();
        if (hasNext) {
            this._notifyCurrentChange(
                this.getCurrent(),
                oldCurrent,
                this.getCurrentPosition(),
                oldCurrentPosition
            );
        }
        return hasNext;
    }

    /**
     * Устанавливает текущим предыдущий элемент
     * @return {Boolean} Есть ли предыдущий элемент
     */
    moveToPrevious(): boolean {
        const oldCurrent = this.getCurrent();
        const oldCurrentPosition = this.getCurrentPosition();
        const hasPrevious = this._getCursorEnumerator().movePrevious();
        if (hasPrevious) {
            this._notifyCurrentChange(
                this.getCurrent(),
                oldCurrent,
                this.getCurrentPosition(),
                oldCurrentPosition
            );
        }
        return hasPrevious;
    }

    /**
     * Устанавливает текущим первый элемент
     * @return {Boolean} Есть ли первый элемент
     */
    moveToFirst(): boolean {
        if (this.getCurrentPosition() === 0) {
            return false;
        }
        this.setCurrentPosition(0);
        return this._getCursorEnumerator().getPosition() === 0;
    }

    /**
     * Устанавливает текущим последний элемент
     * @return {Boolean} Есть ли последний элемент
     */
    moveToLast(): boolean {
        const position = this.getCount() - 1;
        if (this.getCurrentPosition() === position) {
            return false;
        }
        this.setCurrentPosition(position);
        return this.getCurrentPosition() === position;
    }

    /**
     * Возвращает индекс элемента в коллекции по его индексу в проекции
     * @param {Number} index Индекс элемента в проекции
     * @return {Number} Индекс элемента в коллекции
     */
    getSourceIndexByIndex(index: number): number {
        let sourceIndex = this._getUtilityEnumerator().getSourceByInternal(index);
        sourceIndex = sourceIndex === undefined || sourceIndex === null ? -1 : sourceIndex;
        return this._getSourceIndex(sourceIndex);
    }

    /**
     * Возвращает индекс элемента проекции в коллекции
     * @param {Controls/_display/CollectionItem} item Элемент проекции
     * @return {Number} Индекс элемента проекции в коллекции
     */
    getSourceIndexByItem(item: T): number {
        const index = this.getIndex(item as any);
        return index === -1 ? -1 : this.getSourceIndexByIndex(index);
    }

    /**
     * Возвращает индекс элемента в проекции по индексу в коллекции
     * @param {Number} index Индекс элемента в коллекции
     * @return {Number} Индекс элемента в проекции
     */
    getIndexBySourceIndex(index: number): number {
        index = this._getItemIndex(index);
        const itemIndex = this._getUtilityEnumerator().getInternalBySource(index);

        return itemIndex === undefined || itemIndex === null ? -1 : itemIndex;
    }

    /**
     * Возвращает позицию элемента коллекции в проекции.
     * @param {*} item Элемент коллекции
     * @return {Number} Позиция элемента в проекции или -1, если не входит в проекцию
     */
    getIndexBySourceItem(item: S): number {
        const collection = this.getCollection();
        let sourceIndex = -1;

        if (collection && collection['[Types/_collection/IList]']) {
            sourceIndex = (collection as any as IList<S>).getIndex(item);
        } else {
            let index = 0;
            (collection as IEnumerable<S>).each((value) => {
                if (sourceIndex === -1 && value === item) {
                    sourceIndex = index;
                }
                index++;
            }, this, this._localize);
        }
        return sourceIndex === -1 ? -1 : this.getIndexBySourceIndex(sourceIndex);
    }

    /**
     * Возвращает элемент проекции по индексу коллекции.
     * @param {Number} index Индекс элемента в коллекции
     * @return {Controls/_display/CollectionItem} Элемент проекции или undefined, если index не входит в проекцию
     */
    getItemBySourceIndex(index: number): T {
        index = this.getIndexBySourceIndex(index);
        return index === -1 ? undefined : this.at(index);
    }

    /**
     * Возвращает элемент проекции для элемента коллекции.
     * @param {*} item Элемент коллекции
     * @return {Controls/_display/CollectionItem} Элемент проекции или undefined, если item не входит в проекцию
     */
    getItemBySourceItem(item: S): T {
        const index = this.getIndexBySourceItem(item);
        return index === -1 ? undefined : this.at(index);
    }

    // endregion Navigation

    // region Changing

    /**
     * Возвращает пользовательские методы фильтрации элементов проекции
     * @return {Array.<Function(*, Number, Controls/_display/CollectionItem, Number): Boolean>}
     * @see filter
     * @see setFilter
     * @see addFilter
     * @see removeFilter
     */
    getFilter(): Array<FilterFunction<S>> {
        return this._$filter.slice();
    }

    /**
     * Устанавливает пользовательские методы фильтрации элементов проекции. Вызов метода без аргументов приведет к
     * удалению всех пользовательских фильтров.
     * @param {...Function(*, Number, Controls/_display/CollectionItem, Number): Boolean} [filter] Методы фильтрации
     * элементов: аргументами приходят элемент коллекции, позиция в коллекции, элемент проекции, позиция в проекции.
     * Должен вернуть Boolean - признак, что элемент удовлетворяет условиям фильтрации.
     * @see filter
     * @see getFilter
     * @see addFilter
     * @see removeFilter
     * @example
     * Отберем персонажей женского пола:
     * <pre>
     *     require([
     *         'Types/collection'
     *         'Controls/display'
     *     ], function(collection, display) {
     *         var list = new collection.List({
     *                 items: [
     *                     {name: 'Philip J. Fry', gender: 'M'},
     *                     {name: 'Turanga Leela', gender: 'F'},
     *                     {name: 'Professor Farnsworth', gender: 'M'},
     *                     {name: 'Amy Wong', gender: 'F'},
     *                     {name: 'Bender Bending Rodriguez', gender: 'R'}
     *                 ]
     *             }),
     *             display = new display.Collection({
     *                 collection: list
     *             });
     *
     *         display.setFilter(function(collectionItem, index, item) {
     *             return collectionItem.gender === 'F';
     *         });
     *
     *         display.each(function(item) {
     *             console.log(item.getContents().name);
     *         });
     *         //output: 'Turanga Leela', 'Amy Wong'
     *     });
     * </pre>
     */
    setFilter(...args: Array<FilterFunction<S>>): void {
        let filters;
        if (args[0] instanceof Array) {
            filters = args[0];
        } else {
            filters = args;
        }

        if (this._$filter.length === filters.length) {
            let changed = false;
            for (let i = 0; i < filters.length; i++) {
                if (this._$filter[i] !== filters[i]) {
                    changed = true;
                    break;
                }
            }

            if (!changed) {
                return;
            }
        }

        this._$filter = filters.filter((item) => typeof item === 'function');

        const session = this._startUpdateSession();
        this._reFilter();
        this._finishUpdateSession(session);
        this._nextVersion();
    }

    /**
     * Добавляет пользовательский метод фильтрации элементов проекции, если такой еще не был задан.
     * @param {Function(*, Number, Controls/_display/CollectionItem, Number): Boolean} filter Метод фильтрации элементов:
     * аргументами приходят элемент коллекции, позиция в коллекции, элемент проекции, позиция в проекции. Должен вернуть
     * Boolean - признак, что элемент удовлетворяет условиям фильтрации.
     * @param {Number} [at] Порядковый номер метода (если не передан, добавляется в конец)
     * @see filter
     * @see getFilter
     * @see setFilter
     * @see removeFilter
     * @example
     * Отберем персонажей женского пола:
     * <pre>
     *     require([
     *         'Types/collection',
     *         'Controls/display'
     *     ], function(collection, display) {
     *         var list = new collection.List({
     *                 items: [
     *                     {name: 'Philip J. Fry', gender: 'M'},
     *                     {name: 'Turanga Leela', gender: 'F'},
     *                     {name: 'Professor Farnsworth', gender: 'M'},
     *                     {name: 'Amy Wong', gender: 'F'},
     *                     {name: 'Bender Bending Rodriguez', gender: 'R'}
     *                 ]
     *             }),
     *             display = new display.Collection({
     *                 collection: list
     *             });
     *
     *         display.addFilter(function(collectionItem, index, item) {
     *             return collectionItem.gender === 'F';
     *         });
     *
     *         display.each(function(item) {
     *             console.log(item.getContents().name);
     *         });
     *         //output: 'Turanga Leela', 'Amy Wong'
     *     });
     * </pre>
     */
    addFilter(filter: FilterFunction<S>, at?: number): void {
        if (this._$filter.indexOf(filter) > -1) {
            return;
        }
        if (at === undefined) {
            this._$filter.push(filter);
        } else {
            this._$filter.splice(at, 0, filter);
        }

        const session = this._startUpdateSession();
        this._reFilter();
        this._finishUpdateSession(session);
        this._nextVersion();
    }

    /**
     * Удаляет пользовательский метод фильтрации элементов проекции.
     * @param {Function(*, Number, Controls/_display/CollectionItem, Number): Boolean} filter Метод фильтрации элементов:
     * аргументами приходят элемент коллекции, позиция в коллекции, элемент проекции, позиция в проекции. Должен вернуть
     * Boolean - признак, что элемент удовлетворяет условиям фильтрации.
     * @return {Boolean} Был ли установлен такой метод фильтрации
     * @see filter
     * @see getFilter
     * @see setFilter
     * @see addFilter
     * @example
     * Уберем фильтрацию персонажей по полу:
     * <pre>
     *     require([
     *         'Types/collection'
     *         'Controls/display'
     *     ], function(collection, display) {
     *         var filter = function(collectionItem, index, item) {
     *                 return collectionItem.gender === 'F';
     *             }),
     *             list = new collection.List({
     *                 items: [
     *                     {name: 'Philip J. Fry', gender: 'M'},
     *                     {name: 'Turanga Leela', gender: 'F'},
     *                     {name: 'Professor Farnsworth', gender: 'M'},
     *                     {name: 'Amy Wong', gender: 'F'},
     *                     {name: 'Bender Bending Rodriguez', gender: 'R'}
     *                 ]
     *             }),
     *             display = new display.Collection({
     *                 collection: list,
     *                 filter: filter
     *             });
     *
     *         display.each(function(item) {
     *             console.log(item.getContents().name);
     *         });
     *         //output: 'Turanga Leela', 'Amy Wong'
     *
     *         display.removeFilter(filter);
     *
     *         display.each(function(item) {
     *             console.log(item.getContents().name);
     *         });
     *         //output: 'Philip J. Fry', 'Turanga Leela', 'Professor Farnsworth', 'Amy Wong', 'Bender Bending Rodriguez'
     *     });
     * </pre>
     */
    removeFilter(filter: FilterFunction<S>): boolean {
        const at = this._$filter.indexOf(filter);
        if (at === -1) {
            return false;
        }

        this._$filter.splice(at, 1);

        const session = this._startUpdateSession();
        this._reFilter();
        this._finishUpdateSession(session);
        this._nextVersion();

        return true;
    }

    /**
     * Возвращает метод группировки элементов проекции
     * @return {Function}
     * @see group
     * @see setGroup
     */
    getGroup(): GroupFunction<S, T> {
        return this._$group;
    }

    /**
     * Устанавливает метод группировки элементов проекции. Для сброса ранее установленной группировки следует вызвать
     * этот метод без параметров.
     * @param {Function(*, Number, Controls/_display/CollectionItem): String|null} group Метод группировки элементов:
     * аргументами приходят элемент коллекции, его позиция, элемент проекции. Должен вернуть String|Number - группу,
     * в которую входит элемент.
     * @see group
     * @see getGroup
     */
    setGroup(group?: GroupFunction<S, T>): void {
        if (this._$group === group) {
            return;
        }

        this._switchImportantPropertiesByGroup(false);
        if (!this._composer) {
            this._$group = group;
            this._switchImportantPropertiesByGroup(true);
            return;
        }

        const session = this._startUpdateSession();
        const groupStrategy = this._composer.getInstance<GroupItemsStrategy<S, T>>(GroupItemsStrategy);

        this._$group = groupStrategy.handler = group;
        this._switchImportantPropertiesByGroup(true);
        this._getItemsStrategy().invalidate();
        this._reSort();
        this._reFilter();

        this._finishUpdateSession(session);
    }

    /**
     * Возвращает элементы группы. Учитывается сортировка и фильтрация.
     * @param {String} groupId Идентификатор группы, элементы которой требуется получить
     * @return {Array.<Controls/_display/CollectionItem>}
     * @example
     * Получим персонажей мужского пола:
     * <pre>
     *     require([
     *         'Types/collection',
     *         'Controls/display'
     *     ], function(collection, display) {
     *         var list = new collection.List({
     *                 items: [
     *                     {name: 'Philip J. Fry', gender: 'M'},
     *                     {name: 'Turanga Leela', gender: 'F'},
     *                     {name: 'Professor Farnsworth', gender: 'M'},
     *                     {name: 'Amy Wong', gender: 'F'},
     *                     {name: 'Bender Bending Rodriguez', gender: 'R'}
     *                 ]
     *             }),
     *             display = new display.Collection({
     *                 collection: list
     *             });
     *
     *         display.setGroup(function(collectionItem, index, item) {
     *             return collectionItem.gender;
     *         });
     *
     *         var males = display.getGroupItems('M'),
     *             male,
     *             i;
     *         for (i = 0; i < males.length; i++) {
     *             male = males[i].getContents();
     *             console.log(male.name);
     *         }
     *         //output: 'Philip J. Fry', 'Professor Farnsworth'
     *     });
     * </pre>
     */
    getGroupItems(groupId: GroupId): T[] {
        const items = [];
        let currentGroupId;
        this.each((item) => {
            if (item instanceof GroupItem) {
                currentGroupId = item.getContents();
                return;
            }
            if (currentGroupId === groupId) {
                items.push(item);
            }
        });
        return items;
    }

    /**
     * Возвращает идентификтор группы по индексу элемента в проекции
     * @param {Number} index Индекс элемента в проекции
     * @return {String|Number}
     * @example
     * Сгруппируем персонажей по полу:
     * <pre>
     *     require([
     *         'Types/collection'
     *         'Controls/display'
     *     ], function(collection, display) {
     *         var list = new collection.List({
     *                 items: [
     *                     {name: 'Philip J. Fry', gender: 'M'},
     *                     {name: 'Turanga Leela', gender: 'F'},
     *                     {name: 'Professor Farnsworth', gender: 'M'},
     *                     {name: 'Amy Wong', gender: 'F'},
     *                     {name: 'Bender Bending Rodriguez', gender: 'R'}
     *                 ]
     *             }),
     *             display = new display.Collection({
     *                 collection: list
     *             });
     *
     *         display.setGroup(function(collectionItem, index, item) {
     *             return collectionItem.gender;
     *         });
     *
     *         var enumerator = display.getEnumerator(),
     *             index = 0,
     *             item,
     *             group,
     *             contents;
     *         while (enumerator.moveNext()) {
     *             item = enumerator.getCurrent();
     *             group = display.getGroupByIndex(index);
     *             contents = item.getContents();
     *             console.log(group + ': ' + contents.name);
     *             index++;
     *         }
     *         // output:
     *         // 'M: Philip J. Fry',
     *         // 'M: Professor Farnsworth',
     *         // 'F: Turanga Leela',
     *         // 'F: Amy Wong',
     *         // 'R: Bender Bending Rodriguez'
     *     });
     * </pre>
     */
    getGroupByIndex(index: number): string | number {
        let currentGroupId;
        const enumerator = this.getEnumerator();
        let item;
        let itemIndex = 0;
        while (enumerator.moveNext()) {
            item = enumerator.getCurrent();
            if (item instanceof GroupItem) {
                currentGroupId = item.getContents();
            }
            if (itemIndex === index) {
                break;
            }
            itemIndex++;
        }

        return currentGroupId;
    }

    /**
     * Возвращает пользовательские методы сортировки элементов проекции
     * @return {Array.<Function>}
     * @see sort
     * @see setSort
     * @see addSort
     */
    getSort(): Array<SortFunction<S, T>> {
        return this._$sort.slice();
    }

    /**
     * Устанавливает пользовательские методы сортировки элементов проекции. Вызов метода без аргументов приведет к
     * удалению всех пользовательских сортировок.
     * @param {...Function(UserSortItem, UserSortItem): Number} [sort] Методы сортировки элементов: аргументами
     * приходят 2 объекта типа {@link UserSortItem}, должен вернуть -1|0|1 (см. Array.prototype.sort())
     * @see sort
     * @see getSort
     * @see addSort
     * @see removeSort
     * @example
     * Отсортируем коллекцию по возрастанию значения поля title:
     * <pre>
     *     require([
     *         'Types/collection',
     *         'Controls/display'
     *     ], function(collection, display) {
     *         var display = new display.Collection({
     *             collection: new collection.List({
     *                 items: [
     *                     {id: 1, title: 'foo'},
     *                     {id: 2, title: 'bar'}
     *                 ]
     *             })
     *         });
     *
     *         display.setSort(function(a, b) {
     *             return a.collectionItem.title > b.collectionItem.title;
     *         });
     *
     *         display.each(function(item) {
     *             console.log(item.getContents().title;
     *         });
     *         //output: 'bar', 'foo'
     *     });
     * </pre>
     * Отсортируем коллекцию сначала по title, а потом - по id:
     * <pre>
     *     require([
     *         'Types/collection',
     *         'Controls/display'
     *     ], function(collection, display) {
     *         var display = new display.Collection({
     *             collection: new collection.List({
     *                 items: [
     *                     {id: 4, title: 'foo'},
     *                     {id: 3, title: 'bar'},
     *                     {id: 2, title: 'foo'}
     *                 ]
     *             })
     *         });
     *
     *         display.setSort(function(a, b) {
     *             return a.collectionItem.title -> b.collectionItem.title;
     *         }, function(a, b) {
     *             return a.collectionItem.id - b.collectionItem.id;
     *         });
     *
     *         display.each(function(item) {
     *             console.log(item.getContents().id;
     *         });
     *         //output: 3, 2, 4
     *     });
     * </pre>
     */
    setSort(...args: Array<SortFunction<S, T>>): void {
        const session = this._startUpdateSession();
        const sorts = args[0] instanceof Array ? args[0] : args;

        if (this._$sort.length === sorts.length) {
            let changed = false;
            for (let i = 0; i < sorts.length; i++) {
                if (this._$sort[i] !== sorts[i]) {
                    changed = true;
                    break;
                }
            }

            if (!changed) {
                return;
            }
        }

        this._switchImportantPropertiesByUserSort(false);
        this._$sort.length = 0;
        this._$sort.push.apply(this._$sort, normalizeHandlers(sorts));
        this._switchImportantPropertiesByUserSort(true);

        this._getItemsStrategy().invalidate();

        this._reSort();
        if (this._isFiltered()) {
            this._reFilter();
        }

        this._finishUpdateSession(session);
    }

    /**
     * Добавляет пользовательский метод сортировки элементов проекции, если такой еще не был задан.
     * @param {Function(UserSortItem, UserSortItem): Number} [sort] Метод сортировки элементов:
     * аргументами приходят 2 объекта типа {@link UserSortItem}, должен вернуть -1|0|1 (см. Array.prototype.sort())
     * @param {Number} [at] Порядковый номер метода (если не передан, добавляется в конец)
     * @see sort
     * @see getSort
     * @see setSort
     * @see removeSort
     * @example
     * Отсортируем коллекцию по возрастанию значения поля id
     * <pre>
     *     require([
     *         'Types/collection',
     *         'Controls/display'
     *     ], function(collection, display) {
     *         var display = new display.Collection({
     *             collection: new collection.List({
     *                 items: [
     *                     {id: 1, title: 'foo'},
     *                     {id: 2, title: 'bar'}
     *                 ]
     *             })
     *         });
     *
     *         display.addSort(function(a, b) {
     *             return a.collectionItem.id - b.collectionItem.id
     *         });
     *     });
     * </pre>
     */
    addSort(sort: SortFunction<S, T>, at?: number): void {
        if (this._$sort.indexOf(sort) > -1) {
            return;
        }

        const session = this._startUpdateSession();

        this._switchImportantPropertiesByUserSort(false);
        if (at === undefined) {
            this._$sort.push(sort);
        } else {
            this._$sort.splice(at, 0, sort);
        }
        this._switchImportantPropertiesByUserSort(true);

        this._getItemsStrategy().invalidate();

        this._reSort();
        if (this._isFiltered()) {
            this._reFilter();
        }

        this._finishUpdateSession(session);
    }

    /**
     * Удаляет пользовательский метод сортировки элементов проекции.
     * @param {Function(UserSortItem, UserSortItem): Number} [sort] Метод сортировки элементов:
     * аргументами приходят 2 объекта типа {@link UserSortItem}, должен вернуть -1|0|1 (см. Array.prototype.sort())
     * @return {Boolean} Был ли установлен такой метод сортировки
     * @see sort
     * @see getSort
     * @see setSort
     * @see addSort
     * @example
     * Отсортируем коллекцию по возрастанию значения поля id
     * <pre>
     *     require([
     *         'Types/collection',
     *         'Controls/display'
     *     ], function(collection, display) {
     *         var handler = function(a, b) {
     *             return a.item.id - b.item.id
     *         };
     *         var display = new display.Collection({
     *             collection: new collection.List({
     *                 items: [
     *                     {id: 1, title: 'foo'},
     *                     {id: 2, title: 'bar'}
     *                 ]
     *             }),
     *             sort: handler
     *         });
     *
     *         //...
     *         display.removeSort(handler);
     *     });
     * </pre>
     */
    removeSort(sort: SortFunction<S, T>): boolean {
        const at = this._$sort.indexOf(sort);
        if (at === -1) {
            return false;
        }

        const session = this._startUpdateSession();

        this._switchImportantPropertiesByUserSort(false);
        this._$sort.splice(at, 1);
        this._switchImportantPropertiesByUserSort(true);

        this._getItemsStrategy().invalidate();
        this._reSort();
        if (this._isFiltered()) {
            this._reFilter();
        }

        this._finishUpdateSession(session);

        return true;
    }

    /**
     * Возвращает Название свойства элемента коллекции, содержащего его уникальный идентификатор.
     * @return {String}
     */
    getKeyProperty(): string {
        return this._$keyProperty;
    }

    /**
     * Возвращает признак обеспечивания уникальности элементов
     * @return {Boolean}
     */
    isUnique(): boolean {
        return this._$unique;
    }

    /**
     * Возвращает признак обеспечивания уникальности элементов
     * @param {Boolean} unique Обеспечивать уникальность элементов
     */
    setUnique(unique: boolean): void {
        if (this._$unique === unique) {
            return;
        }

        const session = this._startUpdateSession();

        this._$unique = unique;
        this._composer.getInstance<DirectItemsStrategy<S, T>>(DirectItemsStrategy).unique = unique;
        this._getItemsStrategy().invalidate();
        this._reSort();

        this._finishUpdateSession(session);
    }

    /**
     * Уведомляет подписчиков об изменении элемента коллекции
     * @param {Controls/_display/CollectionItem} item Элемент проекции
     * @param {Object} [properties] Изменившиеся свойства
     */
    notifyItemChange(item: T, properties?: object): void {
        const isFiltered = this._isFiltered();
        const isGrouped = this._isGrouped();

        if (isFiltered || isGrouped) {
            const session = this._startUpdateSession();
            if (isGrouped) {
                this._reGroup();
                this._reSort();
            }
            if (isFiltered) {
                this._reFilter();
            }
            this._finishUpdateSession(session);
        }

        if (!this.isEventRaising()) {
            return;
        }

        const index = this.getIndex(item as any);
        const items: ISessionItems<T> = [item];
        items.properties = properties;

        this._notifyBeforeCollectionChange();
        this._notifyCollectionChange(
            IObservable.ACTION_CHANGE,
            items,
            index,
            items,
            index
        );
        this._notifyAfterCollectionChange();

        // FIXME Make a list of properties that lead to version update
        if (properties as String === 'editingContents' || properties as String === 'animated' || properties as String === 'canShowActions') {
            this._nextVersion();
        }
    }

    // endregion

    // region Multiselectable

    /**
     * Возвращает массив выбранных элементов (без учета сортировки, фильтрации и группировки).
     * @return {Array.<Controls/_display/CollectionItem>}
     */
    getSelectedItems(): T[] {
        const items = this._getItems();
        const result = [];
        for (let i = items.length - 1; i >= 0; i--) {
            if (items[i].isSelected()) {
                result.push(items[i]);
            }
        }
        return result;
    }

    /**
     * Устанавливает признак, что элемент выбран, переданным элементам.
     * @remark Метод зависит от фильтра проекции.
     * @param {Array} items Массив элементов коллекции
     * @param {Boolean} selected Элемент выбран.
     * @example
     * <pre>
     *      var list = new List({...}),
     *          display = new CollectionDisplay({
     *              collection: list
     *          });
     *     display.setSelectedItems([list.at(0), list.at(1)], true) //установит признак двум элементам;
     * </pre>
     */
    setSelectedItems(items: any[], selected: boolean): void {
        const sourceItems = [];
        for (let i = 0, count = items.length; i < count; i++) {
            sourceItems.push(
                this.getItemBySourceItem(items[i])
            );
        }
        this._setSelectedItems(sourceItems, selected);
    }

    /**
     * Устанавливает признак, что элемент выбран, всем элементам проекции (без учета сортировки, фильтрации и
     * группировки).
     * @param {Boolean} selected Элемент выбран.
     * @return {Array}
     */
    setSelectedItemsAll(selected: boolean): void {
        this._setSelectedItems(this._getItems(), selected);
    }

    setSelection(selection: ISelectionMap): void {
        this._selectionManager.setSelection(selection);
    }

    setSelectedItem(item: CollectionItem<S>, selected: boolean): void {
        this._selectionManager.setSelectedItem(item, selected);
        this._nextVersion();
    }

    /**
     * Инвертирует признак, что элемент выбран, у всех элементов проекции (без учета сортировки, фильтрации и
     * группировки).
     */
    invertSelectedItemsAll(): void {
        const items = this._getItems();
        for (let i = items.length - 1; i >= 0; i--) {
            items[i].setSelected(!items[i].isSelected(), true);
        }
        this._notifyBeforeCollectionChange();
        this._notifyCollectionChange(
            IObservable.ACTION_RESET,
            items,
            0,
            items,
            0
        );
        this._notifyAfterCollectionChange();
    }

    // endregion

    // FIXME Will be removed, managers will be created from the outside of
    // the model in Stage 2. For now we have to create them here and access
    // them from the model to stay compatible with BaseControl.
    getItemActionsManager(): ItemActionsManager {
        return this._itemActionsManager;
    }

    getDisplayProperty(): string {
        return this._$displayProperty;
    }

    setMarkedItem(item: CollectionItem<S>): void {
        this._markerManager.markItem(item);
        this._nextVersion();
    }

    getMarkedItem(): CollectionItem<S> {
        return this._markerManager.getMarkedItem() as CollectionItem<S>;
    }

    getItemCounters(): ICollectionCounters[] {
        const result: ICollectionCounters[] = [];
        this.each((item: unknown) => {
            const i = item as CollectionItem<S>;
            result.push({
                key: i.getUid(),
                counters: i.getCounters()
            });
        });
        return result;
    }

    getMultiSelectVisibility(): string {
        return this._$multiSelectVisibility;
    }

    setMultiSelectVisibility(visibility: string): void {
        if (this._$multiSelectVisibility === visibility) {
            return;
        }
        this._$multiSelectVisibility = visibility;
        this._nextVersion();
    }

    setItemsSpacings(itemPadding: {top: string, left: string, right: string}): void {
        this._$rowSpacing = itemPadding.top;
        this._$leftSpacing = itemPadding.left;
        this._$rightSpacing = itemPadding.right;
    }

    getRowSpacing(): string {
        return this._$rowSpacing;
    }

    getLeftSpacing(): string {
        return this._$leftSpacing;
    }

    getRightSpacing(): string {
        return this._$rightSpacing;
    }

    setEditingConfig(config: any): void {
        if (this._$editingConfig === config) {
            return;
        }
        this._$editingConfig = config;
        this._nextVersion();
    }

    setEditingItem(item: CollectionItem<S>, editingContents?: S): void {
        this._editInPlaceManager.beginEdit(item, editingContents);
        this._nextVersion();
    }

    isEditing(): boolean {
        return this._editInPlaceManager.isEditing();
    }

    setHoveredItem(item: CollectionItem<S>): void {
        this._hoverManager.setHoveredItem(item);
        this._nextVersion();
    }

    getHoveredItem(): CollectionItem<S> {
        return this._hoverManager.getHoveredItem() as CollectionItem<S>;
    }

    setItemActions(item: CollectionItem<S>, actions: any): void {
        this._itemActionsManager.setItemActions(item, actions);
        this._nextVersion();
    }

    setActiveItem(item: CollectionItem<S>): void {
        this._itemActionsManager.setActiveItem(item);
        this._nextVersion();
    }

    setSwipeItem(item: CollectionItem<S>): void {
        this._swipeManager.setSwipeItem(item);
        this._nextVersion();
    }

    getSwipeItem(): CollectionItem<S> {
        return this._swipeManager.getSwipeItem() as CollectionItem<S>;
    }

    getActiveItem(): CollectionItem<S> {
        return this._itemActionsManager.getActiveItem() as CollectionItem<S>;
    }

    getSearchValue(): string {
        return this._$searchValue;
    }

    getStartIndex(): number {
        return this._startIndex;
    }

    getStopIndex(): number {
        return this._stopIndex;
    }

    setViewIndices(startIndex: number, stopIndex: number): boolean {
        const newStart = Math.max(startIndex, 0);
        const newStop = Math.min(stopIndex, this.getCount());
        if (newStart !== this._startIndex || newStop !== this._stopIndex) {
            this._startIndex = newStart;
            this._stopIndex = newStop;

            if (this._$virtualScrollMode === VIRTUAL_SCROLL_MODE.HIDE) {
                this._virtualScrollManager.applyRenderedItems(this._startIndex, this._stopIndex);
            }

            this._nextVersion();
            return true;
        }
        return false;
    }

    getItemBySourceId(id: string|number): CollectionItem<S> {
        if (this._$collection['[Types/_collection/RecordSet]']) {
            const record = (this._$collection as unknown as RecordSet).getRecordById(id);
            return this.getItemBySourceItem(record as unknown as S);
        }
        throw new Error('Collection#getItemBySourceId is implemented for RecordSet only');
    }

    getIndexByKey(key: string|number): number {
        return this.getIndex(this.getItemBySourceId(key) as T);
    }

    getFirstItem(): S {
        if (this.getCount() > 0) {
            return this.getFirst().getContents();
        }
    }

    getLastItem(): S {
        if (this.getCount() > 0) {
            return this.getLast().getContents();
        }
    }

    getViewIterator(): {
        each: (callback: EnumeratorCallback<unknown>, context?: object) => void;
        isItemVisible: (index: number) => boolean;
    } {
        if (this._$virtualScrolling) {
            return this._virtualScrollManager;
        } else {
            return this;
        }
    }

    getHasMoreData(): boolean {
        return this._$hasMoreData;
    }

    setHasMoreData(hasMoreData: boolean): void {
        this._$hasMoreData = hasMoreData;
    }

    setCompatibleReset(compatible: boolean): void {
        this._$compatibleReset = compatible;
    }

    isItemVisible = (index: number) => true;

    isItemHidden(index: number): boolean {
        return !this.getViewIterator().isItemVisible(index);
    }

    getItemActionsProperty(): string {
        return this._$itemActionsProperty;
    }

    // region SerializableMixin

    _getSerializableState(state: IDefaultSerializableState): ISerializableState<S, T> {
        const resultState = SerializableMixin.prototype._getSerializableState.call(
            this, state
        ) as ISerializableState<S, T>;

        resultState._composer = this._composer;

        return resultState;
    }

    _setSerializableState(state: ISerializableState<S, T>): Function {
        const fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
        return function(): void {
            fromSerializableMixin.call(this);

            this._composer = state._composer;

            if (this._composer) {
                // Restore link to _$sort in UserItemsStrategy instance
                const userStrategy = this._composer.getInstance(UserItemsStrategy);
                if (userStrategy) {
                    userStrategy.handlers = this._$sort;
                }

                // Restore link to _$group in GroupItemsStrategy instance
                const groupStrategy = this._composer.getInstance(GroupItemsStrategy);
                if (groupStrategy) {
                    groupStrategy.handler = this._$group;
                }

                // Restore items contents before the _$collection will be affected
                if (this._composer) {
                    const restoreItemsContents = (items, owner) => {
                        items.forEach((item) => {
                            if (item._contentsIndex !== undefined) {
                                item._$owner = owner; // Link to _$owner is not restored yet, force it
                                item.getContents(); // Force resolving item contents
                            }
                        });
                    };

                    try {
                        let itemsHolder = this._composer.getResult();
                        do {
                            if (itemsHolder._items) {
                                restoreItemsContents(itemsHolder._items, this);
                            }
                            itemsHolder = itemsHolder.source;
                        } while (itemsHolder);
                    } catch (err) {
                        if (typeof LOGGER !== undefined) {
                            LOGGER.error(err); // eslint-disable-line no-console
                        }
                    }
                }
            }
        };
    }

    /**
     * Рассчитывает идентификатор элемента коллекции.
     */
    protected _extractItemId(item: T): string {
        const contents = item.getContents();
        let uid;
        if (contents['[Types/_entity/Model]']) {
            uid = (contents as any).getId();
        } else if (this._$keyProperty) {
            uid = object.getPropertyValue(contents, this._$keyProperty);
        } else {
            throw new Error('Option "keyProperty" must be defined to extract item unique id.');
        }

        return String(uid);
    }

    /**
     * Рассчитывает уникальный идентификатор элемента коллекции.
     * @param item Элемент коллекции
     * @param baseId Базовое значение
     */
    protected _searchItemUid(item: T, baseId: string): string {
        let uid = baseId;
        const itemsUid = this._itemsUid;
        let count = 0;
        while (itemsUid.has(uid)) {
            uid = baseId.concat('-', String(++count));
        }
        itemsUid.add(uid);

        return uid;
    }

    // endregion

    // endregion

    // region EventRaisingMixin

    protected _analizeUpdateSession(session: IEnumerableComparatorSession): void {
        if (session) {
            this._notifyBeforeCollectionChange();
        }

        super._analizeUpdateSession.call(this, session);

        if (session) {
            this._notifyAfterCollectionChange();
        }
    }

    protected _notifyCollectionChange(
        action: string,
        newItems: T[],
        newItemsIndex: number,
        oldItems: T[],
        oldItemsIndex: number,
        session?: IEnumerableComparatorSession
    ): void {
        if (!this._isNeedNotifyCollectionChange()) {
            return;
        }
        if (
            !session ||
            action === IObservable.ACTION_RESET ||
            !this._isGrouped()
        ) {
            this._notifyLater(
                'onCollectionChange',
                action,
                newItems,
                newItemsIndex,
                oldItems,
                oldItemsIndex
            );
            return;
        }

        // Split by groups and notify
        const notify = (start, finish) => {
            if (start < finish) {
                this._notifyLater(
                    'onCollectionChange',
                    action,
                    newItems.slice(start, finish),
                    newItems.length ? newItemsIndex + start : 0,
                    oldItems.slice(start, finish),
                    oldItems.length ? oldItemsIndex + start : 0
                );
            }
        };
        const isRemove = action === IObservable.ACTION_REMOVE;
        const max = isRemove ? oldItems.length : newItems.length;
        let notifyIndex = 0;
        let item;

        for (let i = 0; i < max; i++) {
            item = isRemove ? oldItems[i] : newItems[i];
            if (item instanceof GroupItem) {
                notify(notifyIndex, i);
                notifyIndex = i;
            }
            if (i === max - 1) {
                notify(notifyIndex, i + 1);
            }
        }
    }

    /**
     * Устанавливает признак, переданным, элементам проекции.
     * @param selecItems массив элементов проекции
     * @param selected Элемент выбран.
     */
    protected _setSelectedItems(selecItems: T[], selected: boolean): void {
        const items = [];
        selected = !!selected;
        for (let i = selecItems.length - 1; i >= 0; i--) {
            if (selecItems[i].isSelected() !== selected) {
                selecItems[i].setSelected(selected, true);
                items.push(selecItems[i]);
            }
        }
        if (items.length > 0) {
            const index = this.getIndex(items[0]);
            this._notifyBeforeCollectionChange();
            this._notifyCollectionChange(
                IObservable.ACTION_REPLACE,
                items,
                index,
                items,
                index
            );
            this._notifyAfterCollectionChange();
        }
    }

    // endregion

    // region Protected methods

    // region Access

    /**
     * Добавляет свойство в importantItemProperties, если его еще там нет
     * @param name Название свойства
     * @protected
     */
    protected _setImportantProperty(name: string): void {
        const index = this._$importantItemProperties.indexOf(name);
        if (index === -1) {
            this._$importantItemProperties.push(name);
        }
    }

    /**
     * Удаляет свойство из importantItemProperties, если оно там есть
     * @param name Название свойства
     * @protected
     */
    protected _unsetImportantProperty(name: string): void {
        const index = this._$importantItemProperties.indexOf(name);
        if (index !== -1) {
            this._$importantItemProperties.splice(index, 1);
        }
    }

    /**
     * Модифицирует список важных свойств по наличию функторов среди пользовательских сортировок
     * @param add Добавить или удалить свойства
     * @protected
     */
    protected _switchImportantPropertiesByUserSort(add: boolean): void {
        for (let i = 0; i < this._$sort.length; i++) {
            functorToImportantProperties.call(this, this._$sort[i], add);
        }
    }

    /**
     * Модифицирует список важных свойств по функтору группировки
     * @param add Добавить или удалить свойства
     * @protected
     */
    protected _switchImportantPropertiesByGroup(add: boolean): void {
        functorToImportantProperties.call(this, this._$group, add);
    }

    /**
     * Настраивает контекст обработчиков
     * @protected
     */
    protected _bindHandlers(): void {
        this._onCollectionChange = onCollectionChange.bind(this);
        this._onCollectionItemChange = onCollectionItemChange.bind(this);
        this._oEventRaisingChange = onEventRaisingChange.bind(this);
    }

    protected _unbindHandlers(): void {
        this._onCollectionChange = null;
        this._onCollectionItemChange = null;
        this._oEventRaisingChange = null;
    }

    // endregion

    // region Navigation

    /**
     * Возвращает элементы проекции (без учета сортировки, фильтрации и группировки)
     * @protected
     */
    protected _getItems(): T[] {
        return this._getItemsStrategy().items;
    }

    /**
     * Возвращает функцию, создающую элементы проекции
     * @protected
     */
    protected _getItemsFactory(): ItemsFactory<T> {
        return function CollectionItemsFactory(options?: ICollectionItemOptions<S>): T {
            options.owner = this;
            return create(this._itemModule, options);
        };
    }

    /**
     * Возвращает cтратегию получения элементов проекции
     * @protected
     */
    protected _getItemsStrategy(): IItemsStrategy<S, T> {
        if (!this._composer) {
            this._composer = this._createComposer();
        }

        return this._composer.getResult();
    }

    /**
     * Сбрасывает построенную cтратегию получения элементов проекции
     * @protected
     */
    protected _resetItemsStrategy(): void {
        this._composer = null;
    }

    /**
     * Создает компоновщик стратегий
     * @protected
     */
    protected _createComposer(): ItemsStrategyComposer<S, T> {
        const composer = new ItemsStrategyComposer<S, T>();

        composer.append(DirectItemsStrategy, {
            display: this,
            localize: this._localize,
            keyProperty: this._$keyProperty,
            unique: this._$unique
        }).append(UserItemsStrategy, {
            handlers: this._$sort
        }).append(GroupItemsStrategy, {
            handler: this._$group
        });

        return composer;
    }

    /**
     * Возвращает энумератор
     * @param unlink Отвязать от состояния проекции
     * @protected
     */
    protected _getEnumerator(unlink?: boolean): CollectionEnumerator<T> {
        return this._buildEnumerator(
            unlink ? this._getItems().slice() : this._getItems.bind(this),
            unlink ? this._filterMap.slice() : this._filterMap,
            unlink ? this._sortMap.slice() : this._sortMap
        );
    }

    /**
     * Конструирует энумератор по входным данным
     * @param items Элементы проекции
     * @param filterMap Фильтр: индекс в коллекции -> прошел фильтр
     * @param sortMap Сортировка: индекс в проекции -> индекс в коллекции
     * @protected
     */
    protected _buildEnumerator(
        items: T[],
        filterMap: boolean[],
        sortMap: number[]
    ): CollectionEnumerator<T> {
        return new CollectionEnumerator<T>({
            items,
            filterMap,
            sortMap
        });
    }

    /**
     * Возвращает служебный энумератор для организации курсора
     * @protected
     */
    protected _getCursorEnumerator(): CollectionEnumerator<T> {
        return this._cursorEnumerator || (this._cursorEnumerator = this._getEnumerator());
    }

    /**
     * Возвращает служебный энумератор для для поиска по свойствам и поиска следующего или предыдущего элемента
     * относительно заданного
     * @protected
     */
    protected _getUtilityEnumerator(): CollectionEnumerator<T> {
        return this._utilityEnumerator || (this._utilityEnumerator = this._getEnumerator());
    }

    /**
     * Возвращает соседний элемент проекции
     * @param enumerator Энумератор элементов
     * @param item Элемент проекции относительно которого искать
     * @param isNext Следующий или предыдущий элемент
     * @param [skipGroups=false] Пропускать группы
     * @protected
     */
    protected _getNearbyItem(
        enumerator: CollectionEnumerator<T>,
        item: T,
        isNext: boolean,
        skipGroups?: boolean
    ): T {
        const method = isNext ? 'moveNext' : 'movePrevious';
        let nearbyItem;

        enumerator.setCurrent(item);
        while (enumerator[method]()) {
            nearbyItem = enumerator.getCurrent();
            if (skipGroups && nearbyItem instanceof GroupItem) {
                nearbyItem = undefined;
                continue;
            }
            break;
        }

        return nearbyItem;
    }

    /**
     * Возвращает индекс элемента проекции по индексу в коллекции
     * @param index Индекс в коллекции
     * @protected
     */
    protected _getItemIndex(index: number): number {
        return this._getItemsStrategy().getDisplayIndex(index);
    }

    /**
     * Возвращает индекс в коллекци по индексу в проекции
     * @param index Индекс в проекции
     * @protected
     */
    protected _getSourceIndex(index: number): number {
        return this._getItemsStrategy().getCollectionIndex(index);
    }

    // endregion

    // region Calculation

    /**
     * Перерасчитывает все данные заново
     * @param [reset=false] Сбросить все созданные элементы
     * @protected
     */
    protected _reBuild(reset?: boolean): void {
        const itemsStrategy = this._getItemsStrategy();
        this._reIndex();

        if (reset) {
            this._itemsUid.clear();
            this._itemToUid.clear();
            itemsStrategy.reset();
        }

        this._reGroup();
        this._reSort();

        this._resetFilter(itemsStrategy.count);
        if (this._isFiltered()) {
            this._reFilter();
        }
    }

    /**
     * Производит фильтрацию и сортировку и анализ изменений для набора элементов проекции
     * @param [start=0] Начальный индекс (в коллекции)
     * @param [count] Кол-во элементов (по умолчанию - все)
     * @protected
     */
    protected _reAnalize(start?: number, count?: number): void {
        start = start || 0;

        const itemsStrategy = this._getItemsStrategy();
        const session = this._startUpdateSession();

        const indexBefore = itemsStrategy.getDisplayIndex(start);
        itemsStrategy.invalidate();
        const indexAfter = itemsStrategy.getDisplayIndex(start);

        if (count === undefined) {
            count = itemsStrategy.count - indexAfter;
        }

        this._reGroup(start, count);
        this._reSort();

        // If element is moved or user filter uses element indices then re-filter whole collection
        if (indexBefore !== indexAfter || this._isFilteredByIndex()) {
            this._reFilter();
        } else {
            this._reFilter(indexAfter, count);
        }

        this._finishUpdateSession(session);
    }

    /**
     * Вызывает переиндексацию
     * @protected
     */
    protected _reIndex(): void {
        this._getCursorEnumerator().reIndex();
        this._getUtilityEnumerator().reIndex();
    }

    // endregion

    // region Changing

    /**
     * Сбрасывает фильтр: помечает все элементы как прошедшие фильтрацию
     * @protected
     */
    protected _resetFilter(count: number): void {
        this._filterMap.length = 0;
        for (let index = 0; index < count; index++) {
            this._filterMap.push(true);
        }
        this._reIndex();
    }

    /**
     * Производит фильтрацию для набора элементов проекции
     * @param [start=0] Начальный индекс
     * @param [count] Кол-во элементов (по умолчанию - все)
     * @protected
     */
    protected _reFilter(start?: number, count?: number): void {
        start = start || 0;
        count = count || this._getItemsStrategy().count - start;

        const filters = this._$filter;
        const filtersLength = filters.length;
        const items = this._getItems();
        const sortMap = this._sortMap;
        const sortMapLength = sortMap.length;
        const filterMap = this._filterMap;
        const processedIndices = new Set();
        const finish = start + count;
        let changed = false;
        let item;
        let position;
        let index;
        let prevGroup;
        let prevGroupIndex = -1;
        let prevGroupPosition = -1;
        let prevGroupHasMembers = false;
        let match;
        const isMatch = (item, index, position, hasMembers?: boolean) => {
            let result = true;
            let filter;
            for (let filterIndex = 0; filterIndex < filtersLength; filterIndex++) {
                filter = filters[filterIndex];
                result = filter(
                    item.getContents(),
                    index,
                    item,
                    position,
                    hasMembers
                );
                if (!result) {
                    break;
                }
            }
            return result;
        };
        const applyMatch = (match, index) => {
            const oldMatch = filterMap[index];
            if (match === oldMatch) {
                return false;
            }
            if (match) {
                filterMap[index] = match;
                return true;
            } else if (oldMatch !== undefined) {
                filterMap[index] = match;
                return true;
            }
            return false;
        };

        // Lookup every item in _sortMap order
        for (position = 0; position < sortMapLength; position++) {
            index = sortMap[position];

            // Check item index in range
            if (index === undefined || index < start || index >= finish) {
                continue;
            }

            processedIndices.add(index);
            item = items[index];
            match = true;
            if (item instanceof GroupItem) {
                // A new group begin, check match for previous
                if (prevGroup) {
                    match = isMatch(prevGroup, prevGroupIndex, prevGroupPosition, prevGroupHasMembers);
                    changed = applyMatch(match, prevGroupIndex) || changed;
                }

                // Remember current group as previous
                prevGroup = item;
                prevGroupIndex = index;
                prevGroupPosition = position;
                prevGroupHasMembers = false;
            } else {
                // Check item match
                match = isMatch(item, index, position);
                changed = applyMatch(match, index) || changed;
                if (match) {
                    prevGroupHasMembers = true;
                }
            }
        }

        for (index = start; index < finish; index++) {
            if (!processedIndices.has(index)) {
                filterMap[index] = undefined;
            }
        }

        // Check last group match
        if (prevGroup) {
            match = isMatch(prevGroup, prevGroupIndex, prevGroupPosition, prevGroupHasMembers);
            changed = applyMatch(match, prevGroupIndex) || changed;
        }

        if (changed) {
            this._reIndex();
        }
    }

    /**
     * Производит сортировку элементов
     * @protected
     */
    protected _reSort(): void {
        this._sortMap.length = 0;
        const items = this._buildSortMap();
        this._sortMap.push(...items);

        this._reIndex();
    }

    /**
     * Производит построение sortMap
     * @protected
     */
    protected _buildSortMap(): number[] {
        return this._getItems().map((item, index) => index);
    }

    /**
     * Производит группировку для набора элементов проекции
     * @param [start=0] Начальный индекс (в коллекции)
     * @param [count] Кол-во элементов (по умолчанию - все)
     * @protected
     */
    protected _reGroup(start?: number, count?: number): void {
        if (!this._composer) {
            return;
        }
        const groupStrategy = this._composer.getInstance<GroupItemsStrategy<S, T>>(GroupItemsStrategy);
        groupStrategy.invalidate();
    }

    /**
     * Проверяет, что используется фильтрация
     * @protected
     */
    protected _isFiltered(): boolean {
        return this._$filter.length > 0;
    }

    /**
     * Проверяет, что хотя бы в один из методов фильтрации использует аргумент index
     * @protected
     */
    protected _isFilteredByIndex(): boolean {
        return this._$filter.some((filter) => this._isFilterUseIndex(filter));
    }

    /**
     * Проверяет, что метод фильтрации использует аргумент index
     * @protected
     */
    protected _isFilterUseIndex(filter: FilterFunction<S>): boolean {
        return filter.length > 3;
    }

    /**
     * Проверяет, что используется группировка
     * @protected
     */
    protected _isGrouped(): boolean {
        return !!this._$group;
    }

    /**
     * Дробавляет набор элементов коллекции в проекцию
     * @param start Начальный индекс (в коллекции)
     * @param items Элементы
     * @return Начальный индекс (в проекциии)
     * @protected
     */
    protected _addItems(start: number, items: S[]): number {
        const isFiltered = this._isFiltered();
        const strategy = this._getItemsStrategy();
        let innerIndex;
        const filterMap = [];
        const sortMap = [];
        const groupMap = [];

        strategy.splice(start, 0, items);
        innerIndex = strategy.getDisplayIndex(start);

        items.forEach((item, index) => {
            filterMap.push(!isFiltered);
            sortMap.push(innerIndex + index);
            groupMap.push(undefined);
        });

        this._filterMap.splice(innerIndex, 0, ...filterMap);
        this._sortMap.splice(innerIndex, 0, ...sortMap);

        return innerIndex;
    }

    /**
     * Удаляет набор элементов проекции
     * @param start Начальный индекс (в коллекции)
     * @param [count] Кол-во элементов (по умолчанию - все)
     * @return Удаленные элементы
     * @protected
     */
    protected _removeItems(start: number, count?: number): T[] {
        start = start || 0;

        const strategy = this._getItemsStrategy();
        let innerIndex;
        let result;

        count = count === undefined ? strategy.count - start : count;

        result = strategy.splice(start, count);
        innerIndex = result.start = strategy.getDisplayIndex(start);

        this._filterMap.splice(innerIndex, count);
        this._removeFromSortMap(innerIndex, count);

        return result;
    }

    /**
     * Заменяет набор элементов проекции
     * @param start Начальный индекс (в коллекции)
     * @param newItems Замененные элементы
     * @return Замененные элементы
     * @protected
     */
    protected _replaceItems(start: number, newItems: S[]): ISplicedArray<T> {
        const strategy = this._getItemsStrategy();
        const result = strategy.splice(start, newItems.length, newItems) as ISplicedArray<T>;
        result.start = strategy.getDisplayIndex(start);

        return result;
    }

    /**
     * Перемещает набор элементов проекции
     * @param newIndex Старый индекс (в коллекции)
     * @param oldIndex Новый индекс (в коллекции)
     * @param items Перемещаемые элементы
     * @return Перемещенные элементы
     * @protected
     */
    protected _moveItems(newIndex: number, oldIndex: number, items: any[]): T[] {
        const length = items.length;
        const strategy = this._getItemsStrategy();
        let movedItems;

        movedItems = strategy.splice(oldIndex, length);
        strategy.splice(newIndex, 0, movedItems);
        movedItems.oldIndex = strategy.getDisplayIndex(oldIndex);

        return movedItems;
    }

    /**
     * Удаляет из индекса сортировки срез элементов
     * @param start Начальный индекс (в коллекци)
     * @param count Кол-во элементов
     * @protected
     */
    protected _removeFromSortMap(start: number, count: number): object {
        start = start || 0;
        count = count || 0;
        const finish = start + count;
        let index;
        let sortIndex;
        const toRemove = [];
        const removed = {};

        // Collect indices to remove
        for (index = start; index < finish; index++) {
            sortIndex = this._sortMap.indexOf(index);
            if (sortIndex > -1) {
                toRemove.push(sortIndex);
                removed[sortIndex] = this._sortMap[sortIndex];
            }
        }

        // Remove collected indices from _sortMap
        toRemove.sort((a, b) => a - b);
        for (index = toRemove.length - 1; index >= 0; index--) {
            this._sortMap.splice(toRemove[index], 1);
        }

        // Shift _sortMap values by count from start index
        for (index = 0; index < this._sortMap.length; index++) {
            if (this._sortMap[index] >= start) {
                this._sortMap[index] -= count;
            }
        }

        this._reIndex();

        return removed;
    }

    /**
     * Возвращает набор контрольных свойств элемента проекции для анализа его состояния
     * @param item Элемент проекции
     * @protected
     */
    protected _getItemState(item: T): ISessionItemState<T> {
        return {
            item,
            selected: item.isSelected()
        };
    }

    /**
     * Возвращает состояния элементов
     * @param items Элементы проекции
     * @protected
     */
    protected _getItemsState(items: T[]): Array<ISessionItemState<T>> {
        return items.map(this._getItemState);
    }

    /**
     * Возвращает разницу между двумя состояниями элементов (результатами работы метода _getItemsState)
     * @param before Состояния до изменений
     * @param after Состояния после изменений
     * @return Отличающиеся состояния
     * @protected
     */
    protected _getItemsDiff(
        before: Array<ISessionItemState<T>>,
        after: Array<ISessionItemState<T>>
    ): T[] {
        return after.filter((itemNow, index) => {
            const itemThen = before[index];
            return Object.keys(itemNow).some((prop) => itemNow[prop] !== itemThen[prop]);
        }).map((element) => {
            return element.item;
        });
    }

    /**
     * Генерирует события об изменении элементов проекции при изменении их состояния
     * @param session Сессия изменений
     * @param items Измененные элементы
     * @param state Состояние элементов до изменений
     * @param beforeCheck Функция обратного вызова перед проверкой изменений состояния
     * @protected
     */
    protected _checkItemsDiff(
        session: IEnumerableComparatorSession,
        items: T[],
        state: any[],
        beforeCheck: Function
    ): void {
        const diff = state ? this._getItemsDiff(
            state,
            this._getItemsState(items)
        ) : [];

        if (beforeCheck) {
            beforeCheck(diff, items);
        }

        // Notify changes by the diff
        if (diff.length) {
            this._notifyBeforeCollectionChange();
            this._extractPacksByList(this, diff, (items, index) => {
                this._notifyCollectionChange(
                    IObservable.ACTION_CHANGE,
                    items,
                    index,
                    items,
                    index,
                    session
                );
            });
            this._notifyAfterCollectionChange();
        }
    }

    /**
     * Генерирует событие об изменении текущего элемента проекции коллекции
     * @param newCurrent Новый текущий элемент
     * @param oldCurrent Старый текущий элемент
     * @param newPosition Новая позиция
     * @param oldPosition Старая позиция
     * @protected
     */
    protected _notifyCurrentChange(
        newCurrent: T,
        oldCurrent: T,
        newPosition: number,
        oldPosition: number
    ): void {
        if (!this.isEventRaising()) {
            return;
        }

        this._removeFromQueue('onCurrentChange');
        this._notify(
            'onCurrentChange',
            newCurrent,
            oldCurrent,
            newPosition,
            oldPosition
        );
    }

    /**
     * Нотифицирует событие change для измененных элементов
     * @param changed Измененные элементы исходной коллекции.
     * @param index Индекс исходной коллекции, в котором находятся элементы.
     * @protected
     */
    protected _notifyCollectionItemsChange(changed: any[], index: number, session: IEnumerableComparatorSession): void {
        const items = this._getItems();
        const last = index + changed.length;
        const changedItems = [];

        // Extract display items contains changed
        for (let i = index; i < last; i++) {
            changedItems.push(items[this._getItemIndex(i)]);
        }

        this._notifyBeforeCollectionChange();
        this._extractPacksByList(
            this,
            changedItems,
            (pack, index) => {
                this._notifyCollectionChange(
                    IObservable.ACTION_CHANGE,
                    pack,
                    index,
                    pack,
                    index,
                    session
                );
            }
        );
        this._notifyAfterCollectionChange();
    }

    /**
     * Генерирует событие об изменении элемента проекции
     * @param event Дескриптор события.
     * @param item Измененный элемент коллекции.
     * @param index Индекс измененного элемента.
     * @param [properties] Изменившиеся свойства
     * @protected
     */
    protected _notifySourceCollectionItemChange(
        event: EventObject,
        item: any,
        index: number,
        properties?: object
    ): void {
        const enumerator = this._getUtilityEnumerator();
        const internalItems = this._getItems();
        const internalIndexBefore = this._getItemIndex(index);
        let internalIndexAfter;
        const internalItem = internalItems[internalIndexBefore];
        const indexBefore = enumerator.getInternalBySource(internalIndexBefore);
        let indexAfter;
        const isEventRaising = this.isEventRaising();
        const session = this._startUpdateSession();
        let isMoved;
        let state;

        // Only changes of important properties can run analysis
        for (const key in properties) {
            if (properties.hasOwnProperty(key)) {
                if (this._$importantItemProperties.indexOf(key) > -1) {
                    if (isEventRaising) {
                        // Fix the state before analysis
                        state = this._getItemsState(internalItems);
                    }
                    this._reAnalize(
                        index,
                        1
                    );
                    break;
                }
            }
        }

        // Return here if events are disabled
        if (!isEventRaising) {
            return;
        }

        this._finishUpdateSession(session, false);

        // Check changes by state
        internalIndexAfter = this._getItemIndex(index);
        indexAfter = enumerator.getInternalBySource(internalIndexAfter);
        isMoved = indexBefore !== indexAfter;
        this._checkItemsDiff(session, internalItems, state, (diff) => {
            // Some hard logic related with the character of item change.
            const internalItemIndex = diff.indexOf(internalItem);
            if (isMoved) {
                // Item change the position
                if (internalItemIndex > -1 && indexBefore > indexAfter) {
                    // Changed item is presented in the diff and moved up.
                    // It will be presented as a move event with that item in _finishUpdateSession.
                    // We should not notify about item change with the diff.
                    diff.splice(internalItemIndex, 1);
                } else if (internalItemIndex === -1 && indexBefore < indexAfter) {
                    // Changed item isn't presented in the diff and moved down.
                    // It won't be presented as a move event with that item in _finishUpdateSession (items after will
                    // move up). We should notify about item change with the diff.
                    diff.push(internalItem);
                }
            } else if (!isMoved && internalItemIndex === -1) {
                // Changed item don't change the position and not presented in the diff.
                // We should notify about item change with the diff.
                diff.push(internalItem);
            }
        });
    }

    /**
     * Генерирует событие о начале изменений коллекции
     * @protected
     */
    protected _notifyBeforeCollectionChange(): void {
        if (!this.isEventRaising()) {
            return;
        }
        this._notifyLater('onBeforeCollectionChange');
    }

    /**
     * Генерирует событие об окончании изменений коллекции
     * @protected
     */
    protected _notifyAfterCollectionChange(): void {
        if (!this.isEventRaising()) {
            return;
        }
        this._notify('onAfterCollectionChange');
    }

    // endregion

    // endregion
}

Object.assign(Collection.prototype, {
    '[Controls/_display/Collection]': true,
    _moduleName: 'Controls/display:Collection',
    _$collection: null,
    _$filter: null,
    _$group: null,
    _$sort: null,
    _$keyProperty: '',
    _$displayProperty: '',
    _$multiSelectVisibility: 'hidden',
    _$leftSpacing: 'default',
    _$rightSpacing: 'default',
    _$rowSpacing: 'default',
    _$searchValue: '',
    _$editingConfig: null,
    _$unique: false,
    _$importantItemProperties: null,
    _$virtualScrollMode: VIRTUAL_SCROLL_MODE.REMOVE,
    _$virtualScrolling: false,
    _$hasMoreData: false,
    _$compatibleReset: false,
    _$itemActionsProperty: '',
    _localize: false,
    _itemModule: 'Controls/display:CollectionItem',
    _itemsFactory: null,
    _composer: null,
    _sourceCollectionSynchronized: true,
    _sourceCollectionDelayedCallbacks: null,
    _cursorEnumerator: null,
    _utilityEnumerator: null,
    _onCollectionChange: null,
    _onCollectionItemChange: null,
    _oEventRaisingChange: null,
    _markerManager: null,
    _editInPlaceManager: null,
    _itemActionsManager: null,
    _virtualScrollManager: null,
    _hoverManager: null,
    _swipeManager: null,
    _startIndex: 0,
    _stopIndex: 0,
    getIdProperty: Collection.prototype.getKeyProperty
});

register('Controls/display:Collection', Collection, {instantiate: false});
