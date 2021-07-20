import {ICrud, ICrudPlus, IData, PrefetchProxy, QueryOrderSelector, QueryWhereExpression, CrudEntityKey} from 'Types/source';
import {CrudWrapper} from './CrudWrapper';
import {default as NavigationController, INavigationControllerOptions} from 'Controls/_dataSource/NavigationController';
import {
    Direction,
    IBaseSourceConfig,
    IFilterOptions,
    IGroupingOptions,
    IHierarchyOptions,
    INavigationOptions,
    INavigationOptionValue,
    INavigationSourceConfig,
    IPromiseSelectableOptions,
    ISortingOptions,
    ISourceOptions,
    TKey,
    TNavigationPagingMode,
    ISelectFieldsOptions
} from 'Controls/interface';
import {RecordSet} from 'Types/collection';
import {
    CancelablePromise,
    EventRaisingMixin,
    Model,
    ObservableMixin,
    Record as EntityRecord,
    relation
} from 'Types/entity';
import {Logger} from 'UI/Utils';
import {IQueryParams} from 'Controls/_interface/IQueryParams';
import {default as groupUtil} from './GroupUtil';
import {nodeHistoryUtil} from './nodeHistoryUtil';
import {isEqual} from 'Types/object';
import {mixin} from 'Types/util';
import * as cInstance from 'Core/core-instance';
import {TArrayGroupId} from 'Controls/list';
import {wrapTimeout} from 'Core/PromiseLib/PromiseLib';
import {fetch, HTTPStatus} from 'Browser/Transport';
import {default as calculatePath, Path} from 'Controls/_dataSource/calculatePath';
import * as randomId from 'Core/helpers/Number/randomId';

export interface IControllerState {
    keyProperty: string;
    source: ICrud | ICrudPlus;

    sorting: QueryOrderSelector;
    filter: QueryWhereExpression<unknown>;
    navigation: INavigationOptionValue<INavigationSourceConfig>;

    parentProperty?: string;
    root?: TKey;

    items: RecordSet;
    breadCrumbsItems: Path;
    backButtonCaption: string;
    breadCrumbsItemsWithoutBackButton: Path;

    sourceController: Controller;
    dataLoadCallback: Function;

    expandedItems: CrudEntityKey[];
}

export interface IControllerOptions extends
    IFilterOptions,
    ISortingOptions,
    IHierarchyOptions,
    IGroupingOptions,
    ISourceOptions,
    IPromiseSelectableOptions,
    INavigationOptions<INavigationSourceConfig>,
    ISelectFieldsOptions{
    dataLoadErrback?: Function;
    dataLoadCallback?: Function;
    root?: TKey;
    expandedItems?: TKey[];
    deepReload?: boolean;
    collapsedGroups?: TArrayGroupId;
    navigationParamsChangedCallback?: Function;
    loadTimeout?: number;
    items?: RecordSet;
    deepScrollLoad?: boolean;
    nodeTypeProperty?: string;
}

interface ILoadConfig {
    filter?: QueryWhereExpression<unknown>;
    sorting?: QueryOrderSelector;
    key?: TKey;
    navigationSourceConfig?: INavigationSourceConfig;
    direction?: Direction;
    isFirstLoad?: boolean;
}

type LoadPromiseResult = RecordSet|Error;
type LoadResult = Promise<LoadPromiseResult>;

enum NAVIGATION_DIRECTION_COMPATIBILITY {
    up = 'backward',
    down = 'forward'
}

function getModelModuleName(model: string|Function): string {
    let name;

    if (typeof model === 'function') {
        name = model.prototype._moduleName;
    } else {
        name = model;
    }

    return name;
}

function isEqualFormat(oldList: RecordSet, newList: RecordSet): boolean {
    const oldListFormat = oldList && oldList['[Types/_entity/FormattableMixin]'] && oldList.getFormat(true);
    const newListFormat = newList && newList['[Types/_entity/FormattableMixin]'] && newList.getFormat(true);
    const isListsEmpty = !newList.getCount() || !oldList.getCount();
    return (oldListFormat && newListFormat && oldListFormat.isEqual(newListFormat) || isListsEmpty) ||
           (!oldListFormat && !newListFormat);
}

export function isEqualItems(oldList: RecordSet, newList: RecordSet): boolean {
    const getProtoOf = Object.getPrototypeOf.bind(Object);
    const items1Model = oldList && oldList['[Types/_collection/RecordSet]'] && oldList.getModel();
    const items2Model = newList && newList['[Types/_collection/RecordSet]'] && newList.getModel();
    let isModelEqual = items1Model === items2Model;

    if (!isModelEqual && (getModelModuleName(items1Model) === getModelModuleName(items2Model))) {
        isModelEqual = true;
    }
    return oldList && cInstance.instanceOfModule(oldList, 'Types/collection:RecordSet') &&
        isModelEqual &&
        (newList.getKeyProperty() === oldList.getKeyProperty()) &&
        // tslint:disable-next-line:triple-equals
        (getProtoOf(newList).constructor == getProtoOf(newList).constructor) &&
        // tslint:disable-next-line:triple-equals
        (getProtoOf(newList.getAdapter()).constructor == getProtoOf(oldList.getAdapter()).constructor) &&
        isEqualFormat(oldList, newList);
}

const OPTIONS_FOR_UPDATE_AFTER_LOAD = [
    'groupProperty',
    'sorting',
    'navigation',
    'nodeProperty',
    'nodeTypeProperty',
    'dataLoadCallback'
];

/**
 * @typedef {Object} SourceConfig
 * @description Конфигурация навигации ({@link /doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#cursor по курсору} или {@link /doc/platform/developmentapl/interface-development/controls/list/navigation/data-source/#page постраничная}).
 * Также, в конфигурации можно передать опцию multiNavigation, если метод БЛ поддерживает работу с {@link /doc/platform/developmentapl/interface-development/controls/list/tree-column/node/managing-node-expand/#multi-navigation множественной навигацией}.
 */


/**
 * Класс-загрузчик данных
 * Поддерживает работу с навигацией и фильтрацией
 * Подготавливает параметры для запроса
 * @class Controls/_dataSource/Controller
 * @mixes Controls/interface:INavigation
 * @mixes Controls/interface:IHierarchy
 * @mixes Controls/interface:ISource
 * @mixes Controls/interface:ISelectFields
 * @example
 * <pre class="brush: js>
 *      import {NewSourceController} from 'Controls/dataSource';
 *      import {Memory} from 'Types/source';
 *
 *     _beforeMount() {
 *         const source = new Memory({
 *             rawData: [
 *                 {
 *                     id: 0,
 *                     cityName: 'Yaroslavl'
 *                 },
 *                 {
 *                     id: 1,
 *                     cityName: 'Moscow'
 *                 },
 *                 {
 *                     id: 2,
 *                     cityName: 'St. Petersburg'
 *                 }
 *             ],
 *             keyProperty: 'id'
 *         });
 *         const sourceController = new NewSourceController({
 *             source: source,
 *             filter: {
 *                 cityName: 'Yaroslavl'
 *             },
 *             keyProperty: 'id';
 *         })
 *
 *         sourceController.reload().then((items) => {
 *             ...
 *         });
 *     }
 * </pre>
 * @public
 * @author Герасимов А.М.
 */

export default class Controller extends mixin<ObservableMixin>(ObservableMixin) {
    private _options: IControllerOptions;
    private _filter: QueryWhereExpression<unknown>;
    private _items: RecordSet;
    /**
     * Данные хлебных крошек, которые спускаем дочерним контролам
     */
    private _breadCrumbsItems: Path;
    /**
     * Заголовок кнопки назад, вычисленный на основании текущих хлебных крошек.
     * Спускаем дочерним контролам.
     */
    private _backButtonCaption: string;
    /**
     * Данные хлебных крошек, которые спускаем дочерним контролам,
     * без итема, который используется для вывода кнопки назад
     */
    private _breadCrumbsItemsWithoutBackButton: Path;
    /**
     * RecordSet в котором хранятся данные хлебных крошек.
     * Нужен только для того, что бы иметь возможность подписаться и отписаться от события
     * onCollectionChange. Т.к. данные хлебных крошек могут меняться из UI, например,
     * при редактировании названия папки в которой находимся.
     */
    private _breadcrumbsRecordSet: RecordSet;
    private _dragRandomId: string;
    private _loadPromise: CancelablePromise<RecordSet|Error>;
    private _prepareFilterPromise: CancelablePromise<QueryWhereExpression<unknown>|Error>;
    private _loadError: Error;
    private _processCollectionChangeEvent: boolean = true;

    private _dataLoadCallback: Function;
    private _nodeDataMoreLoadCallback: Function;
    // Необходимо для совместимости в случае, если dataLoadCallback задают на списке, а где-то сверху есть dataContainer
    private _dataLoadCallbackFromOptions: Function;

    private _crudWrapper: CrudWrapper;
    private _navigationController: NavigationController;
    private _navigationParamsChangedCallback: Function;
    private _navigation: INavigationOptionValue<INavigationSourceConfig>;

    private _parentProperty: string;
    private _root: TKey = null;
    private _hierarchyRelation: relation.Hierarchy;

    private _expandedItems: TKey[];
    private _deepReload: boolean;
    private _collapsedGroups: TArrayGroupId;

    constructor(cfg: IControllerOptions) {
        super();
        EventRaisingMixin.call(this, cfg);
        this._resolveNavigationParamsChangedCallback(cfg);
        this._collectionChange = this._collectionChange.bind(this);
        this._onBreadcrumbsCollectionChanged = this._onBreadcrumbsCollectionChanged.bind(this);
        this._dragRandomId = randomId();
        this._options = cfg;
        this.setFilter(cfg.filter || {});
        this.setNavigation(cfg.navigation);

        if (cfg.root !== undefined) {
            this._setRoot(cfg.root);
        }
        if (cfg.dataLoadCallback !== undefined) {
            this._setDataLoadCallbackFromOptions(cfg.dataLoadCallback);
        }
        if (cfg.expandedItems !== undefined) {
            this.setExpandedItems(cfg.expandedItems);
        }
        if (cfg.groupHistoryId) {
            this._restoreCollapsedGroups(cfg.groupHistoryId, cfg.collapsedGroups);
        }
        this.setParentProperty(cfg.parentProperty);

        if (cfg.items) {
            this.setItems(cfg.items);
        }
    }

    /**
     * Выполняет загрузку из источника данных
     * @param {string} direction Направление загрузки данных, поддерживаются значения: up, down
     * @param {string|number|null} key Корень, для которого необходимо выполнить загрузку данных
     * @param {object} filter Фильтр, с которым будет выполнена загрузка данных
     * @return {Types/collection:RecordSet}
     */
    load(direction?: Direction,
         key: TKey = this._root,
         filter?: QueryWhereExpression<unknown>
    ): LoadResult {
        return this._load({
            direction,
            key,
            filter
        });
    }

    /**
     * Перезагружает данные из источника данных
     * @param {SourceConfig} sourceConfig Конфигурация навигации источника данных (например, размер и номер страницы для постраничной навигации), которую можно передать при вызове reload, чтобы перезагрузка произошла с этими параметрами. По умолчанию перезагрузка происходит с параметрами, переданными в опции {@link Controls/interface:INavigation#navigation navigation}.
     * @param {Boolean} isFirstLoad Флаг первичной загрузки.
     * @return {Types/collection:RecordSet}
     */
    reload(sourceConfig?: INavigationSourceConfig, isFirstLoad?: boolean): LoadResult {
        return this._load({
            key: this._root,
            navigationSourceConfig: sourceConfig,
            isFirstLoad
        });
    }

    /**
     * Читает запись из источника данных
     * @param {string|number} key Первичный ключ записи
     * @param {object} meta Дополнительные мета данные
     */
    read(key: TKey, meta?: object): Promise<EntityRecord> {
        return (this._options.source as ICrud).read(key, meta);
    }

    /**
     * Обновляет запись в источнике данных
     * @param {Types/entity:Record} item Обновляемая запись или рекордсет
     */
    update(item: Model): Promise<void> {
        return (this._options.source as ICrud).update(item);
    }

    /**
     * Создает пустую запись через источник данных (при этом она не сохраняется в хранилище)
     * @param {object} meta Дополнительные мета данные, которые могут понадобиться для создания записи
     * @return {Promise<Record>}
     */
    create(meta?: object): Promise<EntityRecord> {
        return (this._options.source as ICrud).create(meta);
    }

    /**
     * Устанавливает новый набор элементов коллекции.
     * @param {Types/collection:RecordSet} items набор элементов коллекции.
     */
    setItems(items: RecordSet): RecordSet {
        if (this._hasNavigationBySource()) {
            this._destroyNavigationController();
            this._getNavigationController(this._navigation).updateQueryProperties(items, this._root);
        }
        this._setItems(items);
        return this._items;
    }

    /**
     * Возвращает элементы коллекции
     * @return {Types/collection:RecordSet} коллекция
     */
    getItems(): RecordSet {
        return this._items;
    }

    getKeyProperty(): string {
        const options = this._options;
        let keyProperty;

        if (options.keyProperty) {
            keyProperty = this._options.keyProperty;
        } else if (options.source && (options.source as IData).getKeyProperty) {
            keyProperty = (options.source as IData).getKeyProperty();
        }

        return keyProperty;
    }

    getParentProperty(): string {
        return this._parentProperty;
    }

    getLoadError(): Error {
        return this._loadError;
    }

    setFilter(filter: QueryWhereExpression<unknown>): QueryWhereExpression<unknown> {
        return this._filter = filter;
    }

    getFilter(): QueryWhereExpression<unknown> {
        return this._filter;
    }

    getSorting(): unknown {
        return this._options.sorting;
    }

    setNavigation(navigation: INavigationOptionValue<INavigationSourceConfig>): void {
        this._navigation = navigation;

        if (navigation && this._hasNavigationBySource(navigation)) {
            if (this._navigationController) {
                this._navigationController.updateOptions(this._getNavigationControllerOptions(navigation));
            }
        } else {
            this._destroyNavigationController();
        }
    }

    /**
     * Устанавливает узел, относительно которого будет производиться выборка данных
     * @param {string|number} key
     */
    setRoot(key: TKey): void {
        this._setRoot(key);
        this._notify('rootChanged', key, this._options.id);
    }

    /**
     * Возвращает узел, относительно которого будет производиться выборка данных списочным методом
     * @return {string|number} Идентификатор корня.
     */
    getRoot(): TKey {
        return this._root;
    }

    // FIXME, если parentProperty задаётся на списке, а не на data(browser)
    setParentProperty(parentProperty: string): void {
        this._parentProperty = parentProperty;
        this._hierarchyRelation?.setParentProperty(parentProperty);
    }

    updateOptions(newOptions: IControllerOptions): boolean {
        const isFilterChanged =
            !isEqual(newOptions.filter, this._options.filter) &&
            !isEqual(newOptions.filter, this._filter);
        const isSourceChanged = newOptions.source !== this._options.source;
        const isNavigationChanged = !isEqual(newOptions.navigation, this._options.navigation);
        const rootChanged =
            newOptions.root !== undefined &&
            newOptions.root !== this._options.root &&
            newOptions.root !== this._root;
        const isExpadedItemsChanged = !isEqual(this._options.expandedItems, newOptions.expandedItems);
        const dataLoadCallbackChanged =
            newOptions.dataLoadCallback !== undefined &&
            newOptions.dataLoadCallback !== this._options.dataLoadCallback;

        if (newOptions.navigationParamsChangedCallback !== this._options.navigationParamsChangedCallback) {
            this._resolveNavigationParamsChangedCallback(newOptions);
            this._navigationController?.updateOptions(this._getNavigationControllerOptions(newOptions.navigation));
        }

        if (isFilterChanged) {
            this.setFilter(newOptions.filter);
        }

        if (newOptions.parentProperty !== undefined && newOptions.parentProperty !== this._options.parentProperty) {
            this.setParentProperty(newOptions.parentProperty);
        }

        if (rootChanged) {
            this.setRoot(newOptions.root);
        }

        if (dataLoadCallbackChanged) {
            this._setDataLoadCallbackFromOptions(newOptions.dataLoadCallback);
        }

        if (newOptions.expandedItems !== undefined && isExpadedItemsChanged) {
            this.setExpandedItems(newOptions.expandedItems);
        }

        if (isSourceChanged) {
            if (newOptions.source) {
                this._crudWrapper?.updateOptions({source: newOptions.source as ICrud});
            } else {
                this._crudWrapper = null;
            }
        }

        if (isNavigationChanged) {
            this.setNavigation(newOptions.navigation);
        }

        if (newOptions.groupHistoryId !== this._options.groupHistoryId) {
            this._restoreCollapsedGroups(newOptions.groupHistoryId, newOptions.collapsedGroups);
        }

        const isChanged =
            isFilterChanged ||
            isNavigationChanged ||
            isSourceChanged ||
            !isEqual(newOptions.sorting, this._options.sorting) ||
            (this._parentProperty && rootChanged);

        const resetExpandedItemsOnDeepReload = newOptions.deepReload && !rootChanged;
        if (isChanged && !(isExpadedItemsChanged || resetExpandedItemsOnDeepReload || this.isExpandAll())) {
            this.setExpandedItems([]);
        }
        this._options = newOptions;
        return isChanged;
    }

    getState(): IControllerState {
        const source = Controller._getSource(this._options.source);
        const state = {
            keyProperty: this.getKeyProperty(),
            source,

            filter: this._filter,

            parentProperty: this._parentProperty,
            root: this._root,

            items: this._items,
            breadCrumbsItems: this._breadCrumbsItems,
            backButtonCaption: this._backButtonCaption,
            breadCrumbsItemsWithoutBackButton: this._breadCrumbsItemsWithoutBackButton,
            dragControlId: this._dragRandomId,

            // FIXME sourceController не должен создаваться, если нет source
            // https://online.sbis.ru/opendoc.html?guid=3971c76f-3b07-49e9-be7e-b9243f3dff53
            sourceController: source ? this : null,
            expandedItems: this._options.hasOwnProperty('expandedItems') ? this._expandedItems : void 0
        };
        OPTIONS_FOR_UPDATE_AFTER_LOAD.forEach((optionName) => {
            state[optionName] = this._options[optionName];
        });
        return state;
    }

    getCollapsedGroups(): TArrayGroupId {
        return this._collapsedGroups;
    }

    // FIXME для работы дерева без bind'a опции expandedItems
    setExpandedItems(expandedItems: TKey[]): void {
        this._expandedItems = expandedItems;
    }

    updateExpandedItemsInUserStorage(): void  {
        let expandedItems: TKey[];
        if (!this._expandedItems || this._expandedItems.length === 0 || !this._options.nodeTypeProperty) {
            expandedItems = this._expandedItems;
        } else {
            // Запрашиваем список последних сохранённых id раскрытых записей
            const lastSavedHistory = nodeHistoryUtil.getCached(this._options.nodeHistoryId);
            expandedItems = this._expandedItems.filter((key) => {
                const record = this._items.getRecordById(key);
                // Если записи нет в текущем списке, но она оказалась в expandedItems, проверяем,
                // есть ли она в списке последних сохранённых id.
                if (!record) {
                    return lastSavedHistory ? lastSavedHistory.indexOf(key) !== -1 : false;
                }
                const nodeTypeProperty = record.get(this._options.nodeTypeProperty);
                if (this._options.nodeHistoryType === 'node') {
                    return nodeTypeProperty !== 'group';

                } else if (this._options.nodeHistoryType === 'all') {
                    return true;
                }
                return nodeTypeProperty === 'group';
            });
        }
        nodeHistoryUtil.store(expandedItems, this._options.nodeHistoryId);
    }

    getExpandedItems(): TKey[] {
        return this._expandedItems;
    }

    /**
     * Возвращает, если ли ещё данные для загрузки
     * @param direction {string} Направление, для которого необходимо проверить, если ли ещё данные для загрузки
     * @param key {string|number} Идентификатор узла
     */
    hasMoreData(direction: Direction, key: TKey = this._root): boolean {
        let hasMoreData = false;

        if (this._hasNavigationBySource()) {
            hasMoreData = this._getNavigationController(this._navigation)
                .hasMoreData(NAVIGATION_DIRECTION_COMPATIBILITY[direction], key);
        }

        return hasMoreData;
    }

    setDataLoadCallback(callback: Function): void {
        this._dataLoadCallback = callback;
    }

    setNodeDataMoreLoadCallback(callback: Function): void {
        this._nodeDataMoreLoadCallback = callback;
    }

    /**
     * Возвращает признак, была ли выполнена загрузка узла по переданному идентификатору
     * @param {string|number} key Идентификатор узла
     */
    hasLoaded(key: TKey): boolean {
        let loadedResult;

        if (this._hasNavigationBySource()) {
            loadedResult = this._getNavigationController(this._navigation).hasLoaded(key);
        } else if (this._options.parentProperty) {
            loadedResult = this.getExpandedItems()?.includes(key) ||
                           !!this._getHierarchyRelation().getChildren(key, this._items).length;
        }

        return loadedResult;
    }

    /**
     * Возвращает, выполняется ли в данный момент загрузка данных
     * @returns {boolean}
     */
    isLoading(): boolean {
        return !!this._loadPromise;
    }

    shiftToEdge(direction: Direction, id: TKey, shiftMode: TNavigationPagingMode): IBaseSourceConfig {
        if (this._hasNavigationBySource()) {
            return this._getNavigationController(this._navigation)
                .shiftToEdge(NAVIGATION_DIRECTION_COMPATIBILITY[direction], id, shiftMode);
        }
    }

    /**
     * Отменяет текущий активный запрос к источнику данных
     */
    cancelLoading(): void {
        if (this._loadPromise) {
            this._loadPromise.cancel();
            this._loadPromise = null;
        }
        if (this._prepareFilterPromise) {
            this._prepareFilterPromise.cancel();
            this._prepareFilterPromise = null;
        }
    }

    getOptions(): IControllerOptions {
        return this._options;
    }

    isExpandAll(): boolean {
        const expandedItems = this.getExpandedItems();
        return expandedItems instanceof Array && expandedItems[0] === null;
    }

    getSource(): ICrudPlus | ICrud & ICrudPlus & IData {
        return this._options.source;
    }

    /**
     * Разрушает экземпляр класса.
     * Выполняет отмену запросов, а так же необходимые отписки от событий.
     */
    destroy(): void {
        this.cancelLoading();
        this._unsubscribeItemsCollectionChangeEvent();
        this._destroyNavigationController();
        this._unsubscribeBreadcrumbsChange();
    }

    private _setRoot(key: TKey): void {
        this._root = key;
    }

    private _getCrudWrapper(sourceOption: ICrud): CrudWrapper {
        if (!this._crudWrapper) {
            this._crudWrapper = new CrudWrapper({source: sourceOption});
        }
        return this._crudWrapper;
    }

    private _getNavigationController(
        navigation: INavigationOptionValue<INavigationSourceConfig>
    ): NavigationController {
        if (!this._navigationController) {
            this._navigationController =
                new NavigationController(this._getNavigationControllerOptions(navigation));
        }

        return this._navigationController;
    }

    private _getNavigationControllerOptions(
        navigation: INavigationOptionValue<INavigationSourceConfig>
    ): INavigationControllerOptions {
        return {
            navigationType: navigation.source,
            navigationConfig: navigation.sourceConfig,
            navigationParamsChangedCallback: this._navigationParamsChangedCallback
        };
    }

    private _updateQueryPropertiesByItems(
        list: RecordSet,
        id?: TKey,
        navigationConfig?: INavigationSourceConfig,
        direction?: Direction
    ): void {
        let hierarchyRelation;

        if (this._hasNavigationBySource()) {
            const isMultiNavigation = this._isMultiNavigation(navigationConfig, list);
            const isRoot = this._root === id;
            const resetNavigation = this._deepReload || !direction && isRoot;
            if (resetNavigation && (!isMultiNavigation || !this.getExpandedItems()?.length)) {
                this._destroyNavigationController();
            }
            if (this._options.parentProperty && isMultiNavigation) {
                hierarchyRelation = this._getHierarchyRelation();
            }
            this._getNavigationController(this._navigation)
                .updateQueryProperties(
                    list,
                    id,
                    navigationConfig,
                    NAVIGATION_DIRECTION_COMPATIBILITY[direction],
                    hierarchyRelation,
                    isRoot
                );
        }
    }

    private _prepareQueryParams(
        {filter, sorting, select}: IQueryParams,
        key: TKey,
        navigationSourceConfig: INavigationSourceConfig,
        direction: Direction
    ): IQueryParams|IQueryParams[] {
        const navigationController = this._getNavigationController(this._navigation);
        const userQueryParams = {
            filter,
            sorting,
            select
        };
        const isMultiNavigation = this._isMultiNavigation(navigationSourceConfig);
        const expandedItems = this.getExpandedItems();
        const isHierarchyQueryParamsNeeded =
            isMultiNavigation &&
            expandedItems?.length &&
            !direction &&
            key === this._root;
        let resultQueryParams;

        if (isHierarchyQueryParamsNeeded) {
            resultQueryParams = navigationController.getQueryParamsForHierarchy(
                userQueryParams,
                navigationSourceConfig,
                !isMultiNavigation,
                filter[this.getParentProperty()]
            );
        }

        if (!isHierarchyQueryParamsNeeded || !resultQueryParams || !resultQueryParams.length) {
            resultQueryParams = navigationController.getQueryParams(
                userQueryParams,
                key,
                navigationSourceConfig,
                NAVIGATION_DIRECTION_COMPATIBILITY[direction],
                (!isMultiNavigation || key !== this._root || !!direction || !!navigationSourceConfig)
            );
        }

        return resultQueryParams;
    }

    private _isMultiNavigation(
        navigationSourceConfig: INavigationSourceConfig,
        list?: RecordSet
    ): boolean {
        return (navigationSourceConfig || this._options.navigation.sourceConfig)?.multiNavigation ||
                list?.getMetaData().more instanceof RecordSet;
    }

    private _addItems(items: RecordSet, key: TKey, direction: Direction): RecordSet {
        if (this._items && key === this._root) {
            this._items.setMetaData(items.getMetaData());
        }

        this._toggleProcessOfCollectionChangeEvent(false);
        if (direction === 'up') {
            this._prependItems(items);
        } else if (direction === 'down' && this._items) {
            this._appendItems(items);
        } else if (!direction && key !== this._root && this._items) {
            this._mergeItems(items);
        } else {
            this._setItems(items);
        }
        this._toggleProcessOfCollectionChangeEvent(true);
        this._notify('itemsChanged', items);
        return items;
    }

    private _setItems(items: RecordSet): void {
        if (this._items && isEqualItems(this._items, items)) {
            this._items.assign(items);
        } else {
            this._subscribeItemsCollectionChangeEvent(items);
            this._items = items;
        }

        this._breadcrumbsRecordSet = this._items instanceof RecordSet ? this._items.getMetaData().path : null;
        this._subscribeBreadcrumbsChange(this._breadcrumbsRecordSet);
        this._updateBreadcrumbsData();
    }

    private _appendItems(items: RecordSet): void {
        if (this._shouldAddItems(items)) {
            this._items.append(items);
        }
    }

    private _prependItems(items: RecordSet): void {
        if (this._shouldAddItems(items)) {
            this._items.prepend(items);
        }
    }

    private _mergeItems(items: RecordSet): void {
        this._items.merge(items, { remove: false, inject: true });
    }

    private _shouldAddItems(items: RecordSet): boolean {
        return items.getCount() > 0 || this._items.getCount() === 0;
    }

    private _resolveNavigationParamsChangedCallback(cfg: IControllerOptions): void {
        if (cfg.navigationParamsChangedCallback) {
            this._navigationParamsChangedCallback = cfg.navigationParamsChangedCallback;
        }
    }

    private _toggleProcessOfCollectionChangeEvent(allowProcess: boolean): void {
        this._processCollectionChangeEvent = allowProcess;
    }

    private _isNeedProcessCollectionChangeEvent(): boolean {
        return this._processCollectionChangeEvent;
    }

    private _load({direction, key, navigationSourceConfig, filter, isFirstLoad}: ILoadConfig): LoadResult {
        if (this._options.source) {
            const filterPromise = filter && !direction ?
                Promise.resolve(filter) :
                this._prepareFilterForQuery(filter || this._filter, key, isFirstLoad, direction);
            this.cancelLoading();
            this._prepareFilterPromise = new CancelablePromise(filterPromise);
            this._loadPromise = new CancelablePromise(
                this._prepareFilterPromise.promise.then((preparedFilter: QueryWhereExpression<unknown>) => {
                    if (this._options.loadTimeout) {
                        return wrapTimeout(
                            this._query(preparedFilter, key, navigationSourceConfig, direction),
                            this._options.loadTimeout
                        ).catch((error) => {
                            return Promise.reject(error instanceof Error ? error : new fetch.Errors.HTTP({
                                httpError: HTTPStatus.GatewayTimeout,
                                message: undefined,
                                url: undefined
                            }));
                        });
                    }
                    return this._query(preparedFilter, key, navigationSourceConfig, direction);
                })
            );

            return this._loadPromise.promise
                .then((result: RecordSet) => this._processQueryResult(result, key, navigationSourceConfig, direction))
                .catch((error) => {
                    if (error && !error.isCanceled && !error.canceled) {
                        this._processQueryError(error);
                    }
                    return Promise.reject(error);
                });
        } else {
            Logger.error('source/Controller: Source option has incorrect type');
            return Promise.reject(new Error('source/Controller: Source option has incorrect type'));
        }
    }

    private _query(
        filter: QueryWhereExpression<unknown>,
        key?: TKey,
        navigationSourceConfig?: INavigationSourceConfig,
        direction?: Direction
    ): Promise<RecordSet> {
        // В source может лежать prefetchProxy
        // При подгрузке вниз/вверх данные необходимо брать не из кэша prefetchProxy
        const source = direction !== undefined ?
            Controller._getSource(this._options.source) :
            this._options.source;
        const crudWrapper = this._getCrudWrapper(source as ICrud);

        let params: IQueryParams | IQueryParams[] = {
            filter,
            sorting: this._options.sorting,
            select: this._options.selectFields
        };

        if (this._hasNavigationBySource()) {
            params = this._prepareQueryParams(params, key, navigationSourceConfig, direction);
        }
        return crudWrapper.query(params, this.getKeyProperty());
    }

    private _getFilterHierarchy(
        initialFilter: QueryWhereExpression<unknown>,
        options: IControllerOptions,
        root: TKey = this._root,
        isFirstLoad: boolean,
        direction: Direction): Promise<QueryWhereExpression<unknown>>{
        const parentProperty = this._parentProperty;
        let resultFilter: QueryWhereExpression<unknown>;

        if (parentProperty) {
            return this._resolveExpandedHierarchyItems(options, isFirstLoad).then((expandedItems) => {
                this.setExpandedItems(expandedItems);
                resultFilter = {...initialFilter};
                const isLoadToDirectionWithExpandedItems = direction && this._options.deepScrollLoad;
                const isDeepReload = (!direction || this._options.deepReload || isLoadToDirectionWithExpandedItems)
                                     && root === this._root;

                // Набираем все раскрытые узлы
                if (expandedItems?.length && expandedItems?.[0] !== null && isDeepReload) {
                    resultFilter[parentProperty] = Array.isArray(resultFilter[parentProperty]) ?
                        resultFilter[parentProperty] :
                        [];
                    // Добавляет root в фильтр expanded узлов
                    if (resultFilter[parentProperty].indexOf(root) === -1) {
                        resultFilter[parentProperty].push(root);
                    }
                    // Добавляет отсутствующие expandedItems в фильтр expanded узлов
                    resultFilter[parentProperty] = resultFilter[parentProperty]
                        .concat(expandedItems.filter((key) => resultFilter[parentProperty].indexOf(key) === -1));
                } else if (root !== undefined) {
                    resultFilter[parentProperty] = root;
                }

                // Учитываем в запросе выбранные в multiSelect элементы
                if (options.selectedKeys && options.selectedKeys.length) {
                    return import('Controls/operations').then((operations) => {
                        resultFilter.entries = operations.selectionToRecord({
                            selected: options.selectedKeys,
                            excluded: options.excludedKeys || []
                        }, Controller._getSource(options.source).getAdapter());
                        return resultFilter;
                    });
                }

                return resultFilter;
            });
        }
        return Promise.resolve(initialFilter);
    }

    private _getHierarchyRelation(): relation.Hierarchy {
        if (!this._hierarchyRelation) {
            this._hierarchyRelation = new relation.Hierarchy({
                parentProperty: this._options.parentProperty,
                nodeProperty: this._options.nodeProperty,
                keyProperty: this.getKeyProperty()
            });
        }
        return this._hierarchyRelation;
    }

    /**
     * Возвращает Promise с идентификаторами раскрытых узлов
     * @param options
     * @param isFirstLoad
     * @private
     */
    private _resolveExpandedHierarchyItems(
        options: IControllerOptions,
        isFirstLoad: boolean
    ): Promise<CrudEntityKey[]> {
        const expandedItems = this._expandedItems || options.expandedItems;
        if (options.nodeHistoryId && isFirstLoad) {
            return nodeHistoryUtil.restore(options.nodeHistoryId)
                .then((restored) => {
                    return restored || expandedItems || [];
                })
                .catch((e) => {
                    Logger.warn(e.message);
                    return expandedItems;
                });
        }
        return Promise.resolve(expandedItems);
    }

    private _prepareFilterForQuery(
        filter: QueryWhereExpression<unknown>,
        key: TKey,
        isFirstLoad: boolean,
        direction: Direction
    ): Promise<QueryWhereExpression<unknown>> {
        return this._getFilterHierarchy(filter, this._options, key, isFirstLoad, direction);
    }

    private _processQueryResult(
        result: RecordSet,
        key: TKey,
        navigationSourceConfig: INavigationSourceConfig,
        direction: Direction): LoadPromiseResult {
        // dataLoadCallback не надо вызывать если загружают узел,
        // определяем это по тому, что переданный ключ в метод load не соответствует текущему корню
        const loadedInCurrentRoot = key === this._root;

        let methodResult;
        let dataLoadCallbackResult;

        this._loadPromise = null;
        this._loadError = null;
        this._updateQueryPropertiesByItems(result, key, navigationSourceConfig, direction);

        if (loadedInCurrentRoot && this._dataLoadCallback) {
            dataLoadCallbackResult = this._dataLoadCallback(result, direction);
        } else if (this._nodeDataMoreLoadCallback) {
            // Вызываем только когда подгружают узел, определяется по loadedInCurrentRoot
            this._nodeDataMoreLoadCallback();
        }

        if (loadedInCurrentRoot || direction) {
            this._notify('dataLoad', result, direction);

            if (this._dataLoadCallbackFromOptions) {
                this._dataLoadCallbackFromOptions(result, direction);
            }
        }

        if (dataLoadCallbackResult instanceof Promise) {
            methodResult = dataLoadCallbackResult.then(() => {
                return this._addItems(result, key, direction);
            });
        } else {
            methodResult = this._addItems(result, key, direction);
        }

        return methodResult;
    }

    private _processQueryError(
        queryError: Error,
        direction?: Direction
    ): Error {
        // Если упала ошибка при загрузке в каком-то направлении,
        // то контроллер навигации сбрасывать нельзя,
        // Т.к. в этом направлении могут продолжить загрузку
        if (!direction) {
            this._navigationController = null;
        }
        this._loadPromise = null;
        if (this._options.dataLoadErrback) {
            this._options.dataLoadErrback(queryError);
        }
        this._loadError = queryError;
        // Выводим ошибку в консоль, иначе из-за того, что она произошла в Promise,
        // у которого есть обработка ошибок через catch, никто о ней не узнает
        if (!queryError.processed && !queryError.hasOwnProperty('httpError')) {
            Logger.error('dataSource/Controller load error', this, queryError);
        }
        return queryError;
    }

    private _subscribeItemsCollectionChangeEvent(items: RecordSet): void {
        this._unsubscribeItemsCollectionChangeEvent();
        if (items) {
            items.subscribe('onCollectionChange', this._collectionChange);
        }
    }

    private _unsubscribeItemsCollectionChangeEvent(): void {
        if (this._items) {
            this._items.unsubscribe('onCollectionChange', this._collectionChange);
        }
    }

    /**
     * Обновляет подписку на изменение данных хлебных крошек
     */
    private _subscribeBreadcrumbsChange(breadcrumbs: RecordSet): void {
        this._unsubscribeBreadcrumbsChange();
        if (breadcrumbs) {
            breadcrumbs.subscribe('onCollectionChange', this._onBreadcrumbsCollectionChanged);
        }
    }

    private _unsubscribeBreadcrumbsChange(): void {
        if (this._breadcrumbsRecordSet) {
            this._breadcrumbsRecordSet.unsubscribe('onCollectionChange', this._onBreadcrumbsCollectionChanged);
        }
    }

    private _collectionChange(): void {
        if (this._hasNavigationBySource() && this._isNeedProcessCollectionChangeEvent()) {
            // Навигация при изменении ReocrdSet'a должно обновляться только по записям из корня,
            // поэтому получение элементов с границ recordSet'a
            // нельзя делать обычным получением первого и последнего элемента,
            // надо так же проверять, находится ли элемент в корне
            const firstItem = this._getFirstItemFromRoot();
            const lastItem = this._getLastItemFromRoot();

            if (this._items.getCount() && firstItem && lastItem) {
                this._getNavigationController(this._navigation)
                    .updateQueryRange(
                        this._items,
                        this._root,
                        this._getFirstItemFromRoot(),
                        this._getLastItemFromRoot()
                    );
            }
        }
    }

    private _updateBreadcrumbsData(): void {
        const pathResult = calculatePath(this._items, this._options.displayProperty);

        this._breadCrumbsItems = pathResult.path;
        this._backButtonCaption = pathResult.backButtonCaption;
        this._breadCrumbsItemsWithoutBackButton = pathResult.pathWithoutItemForBackButton;
    }

    private _onBreadcrumbsCollectionChanged(): void {
        this._updateBreadcrumbsData();
        this._notify('breadcrumbsDataChanged');
    }

    private _getFirstItemFromRoot(): Model|void {
        const itemsCount = this._items.getCount();
        let firstItem;
        for (let i = 0; i < itemsCount; i++) {
            firstItem = this._getItemFromRootByIndex(i);
            if (firstItem) {
                break;
            }
        }
        return firstItem;
    }

    private _getLastItemFromRoot(): Model|void {
        const itemsCount = this._items.getCount();
        let lastItem;
        for (let i = itemsCount - 1; i > 0; i--) {
            lastItem = this._getItemFromRootByIndex(i);
            if (lastItem) {
                break;
            }
        }
        return lastItem;
    }

    private _getItemFromRootByIndex(index: number): Model|void {
        let item;
        if (this._options.parentProperty && this._root !== undefined) {
            if (this._items.at(index).get(this._options.parentProperty) === this._root) {
                item = this._items.at(index);
            }
        } else {
            item = this._items.at(index);
        }
        return item;
    }

    private _destroyNavigationController(): void {
        if (this._navigationController) {
            this._navigationController.destroy();
            this._navigationController = null;
        }
    }

    private _hasNavigationBySource(navigation?: INavigationOptionValue<unknown>): boolean {
        const navigationOption = navigation || this._navigation;
        return Boolean(navigationOption && navigationOption.source);
    }

    private _setDataLoadCallbackFromOptions(dataLoadCallback: Function): void {
        this._dataLoadCallbackFromOptions = dataLoadCallback;
    }

    private _restoreCollapsedGroups(groupHistoryId: string, collapsedGroups: TArrayGroupId): void {
        if (!groupHistoryId) {
            this._collapsedGroups = null;
            return;
        }
        groupUtil.restoreCollapsedGroups(groupHistoryId).then((restoredCollapsedGroups: TArrayGroupId) => {
            this._collapsedGroups = restoredCollapsedGroups || collapsedGroups;
        });
    }

    private static _getSource(source: ICrud | ICrudPlus | PrefetchProxy): IData & ICrud {
        let resultSource;

        if (source instanceof PrefetchProxy) {
            resultSource = source.getOriginal();
        } else {
            resultSource = source;
        }

        return resultSource;
    }

}
