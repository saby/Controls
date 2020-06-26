import Collection, {
    ItemsFactory,
    IOptions as ICollectionOptions,
    ISessionItemState,
    ISerializableState as IDefaultSerializableState,
    ISplicedArray
} from './Collection';
import CollectionEnumerator from './CollectionEnumerator';
import CollectionItem from './CollectionItem';
import GroupItem from './GroupItem';
import TreeItem from './TreeItem';
import TreeChildren from './TreeChildren';
import ItemsStrategyComposer from './itemsStrategy/Composer';
import DirectItemsStrategy from './itemsStrategy/Direct';
import AdjacencyListStrategy from './itemsStrategy/AdjacencyList';
import MaterializedPathStrategy from './itemsStrategy/MaterializedPath';
import IItemsStrategy from './IItemsStrategy';
import RootStrategy from './itemsStrategy/Root';
import {register} from 'Types/di';
import {object} from 'Types/util';
import {Object as EventObject} from 'Env/Event';

export interface ISerializableState<S, T> extends IDefaultSerializableState<S, T> {
    _root: T;
}

export interface ITreeSessionItemState<T> extends ISessionItemState<T> {
    parent: T;
    childrenCount: number;
    level: number;
    node: boolean;
    expanded: boolean;
}

interface IItemsFactoryOptions<S> {
    contents?: S;
    hasChildren?: boolean;
    node?: boolean;
}

export interface IOptions<S, T> extends ICollectionOptions<S, T> {
    keyProperty?: string;
    parentProperty?: string;
    nodeProperty?: string;
    childrenProperty?: string;
    hasChildrenProperty?: string;
    loadedProperty?: string;
    root?: T | any;
    rootEnumerable?: boolean;
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
    // Fix state of all nodes
    const nodes = this.instance._getItems().filter((item) => item.isNode && item.isNode());
    const state = this.instance._getItemsState(nodes);
    const session = this.instance._startUpdateSession();

    this.instance._reIndex();
    this.prev(event, action, newItems, newItemsIndex, oldItems, oldItemsIndex);

    // Check state of all nodes. They can change children count (include hidden by filter).
    this.instance._finishUpdateSession(session, false);
    this.instance._checkItemsDiff(session, nodes, state);
}

/**
 * Обрабатывает событие об изменении элемента коллекции
 * @param event Дескриптор события.
 * @param item Измененный элемент коллекции.
 * @param index Индекс измененного элемента.
 * @param properties Объект содержащий измененные свойства элемента
 */
function onCollectionItemChange<T>(event: EventObject, item: T, index: number, properties: object): void {
    this.instance._reIndex();
    this.prev(event, item, index, properties);
}

/**
 * Возвращает имя совйства с инвертированным смыслом
 */
function invertPropertyLogic(name: string): string {
    return name[0] === '!' ? name.slice(1) : '!' + name;
}

function validateOptions<S, T>(options: IOptions<S, T>): IOptions<S, T> {
    // FIXME: must process options before superclass constructor because it's immediately used in _composer
    if (options && !options.hasChildrenProperty && options.loadedProperty) {
        options.hasChildrenProperty = invertPropertyLogic(options.loadedProperty);
    }
    return options;
}

/**
 * Проекция в виде дерева - предоставляет методы навигации, фильтрации и сортировки, не меняя при этом оригинальную
 * коллекцию.
 * @remark
 * Дерево может строиться по алгоритму
 * {@link https://en.wikipedia.org/wiki/Adjacency_list Adjacency List} или
 * {@link https://docs.mongodb.com/v3.2/tutorial/model-tree-structures-with-materialized-paths/ Materialized Path}.
 * Выбор алгоритма выполняется в зависимости от настроек.
 * @class Controls/_display/Tree
 * @extends Controls/_display/Collection
 * @public
 * @author Мальцев А.А.
 */
export default class Tree<S, T extends TreeItem<S> = TreeItem<S>> extends Collection<S, T> {
    /**
     * @cfg {String} Название свойства, содержащего идентификатор родительского узла. Дерево в этом случае строится
     * по алгоритму Adjacency List (список смежных вершин). Также требуется задать {@link keyProperty}
     * @name Controls/_display/Tree#parentProperty
     */
    protected _$parentProperty: string;

    /**
     * @cfg {String} Название свойства, содержащего признак узла. Требуется для различения узлов и листьев.
     * @name Controls/_display/Tree#nodeProperty
     */
    protected _$nodeProperty: string;

    /**
     * @cfg {String} Название свойства, содержащего дочерние элементы узла. Дерево в этом случае строится по алгоритму
     * Materialized Path (материализованный путь).
     * @remark Если задано, то опция {@link parentProperty} не используется.
     * @name Controls/_display/Tree#childrenProperty
     */
    protected _$childrenProperty: string;

    /**
     * @cfg {String} Название свойства, содержащего признак наличия детей у узла
     * @name Controls/_display/Tree#hasChildrenProperty
     * @example
     * Зададим поле "Раздел$" отвечающим за признак загруженности:
     * <pre>
     *     new Tree({
     *         parentProperty: 'Раздел',
     *         hasChildrenProperty: 'Раздел$'
     *     })
     * </pre>
     *
     */
    protected _$hasChildrenProperty: string;

    /**
     * @cfg {Controls/_display/TreeItem|*} Корневой узел или его содержимое
     * @name Controls/_display/Tree#root
     */
    protected _$root: T | any;

    /**
     * @cfg {Boolean} Включать корневой узел в список элементов
     * @name Controls/_display/Tree#rootEnumerable
     * @example
     * Получим корень как первый элемент проекции:
     * <pre>
     *     var tree = new Tree({
     *         root: {id: null, title: 'Root'},
     *         rootEnumerable: true
     *     });
     *     tree.at(0).getContents().title;//'Root'
     * </pre>
     *
     */
    protected _$rootEnumerable: boolean;

    /**
     * Корневой элемент дерева
     */
    protected _root: T;

    /**
     * Соответствие узлов и их потомков
     */
    protected _childrenMap: object = {};

    constructor(options?: IOptions<S, T>) {
        super(validateOptions<S, T>(options));

        if (this._$parentProperty) {
            this._setImportantProperty(this._$parentProperty);
        }
        if (this._$childrenProperty) {
            this._setImportantProperty(this._$childrenProperty);
        }
    }

    destroy(): void {
        this._childrenMap = {};

        super.destroy();
    }

    getCurrent: () => T;

    // region SerializableMixin

    _getSerializableState(state: IDefaultSerializableState<S, T>): ISerializableState<S, T> {
        const resultState = super._getSerializableState(state) as ISerializableState<S, T>;

        resultState._root = this._root;

        return resultState;
    }

    _setSerializableState(state: ISerializableState<S, T>): Function {
        const fromSuper = super._setSerializableState(state);
        return function(): void {
            this._root = state._root;
            fromSuper.call(this);
        };
    }

    // region Collection

    getIndexBySourceItem(item: any): number {
        if (this._$rootEnumerable && this.getRoot().getContents() === item) {
            return 0;
        }
        return super.getIndexBySourceItem(item);
    }

    /**
     * Устанавливает текущим следующий элемент родительского узла.
     * @return Есть ли следующий элемент в родительском узле
     */
    moveToNext(): boolean {
        return this._moveTo(true);
    }

    /**
     * Устанавливает текущим предыдущий элемент родительского узла
     * @return Есть ли предыдущий элемент в родительском узле
     */
    moveToPrevious(): boolean {
        return this._moveTo(false);
    }

    protected _extractItemId(item: T): string {
        const path = [super._extractItemId(item)];

        let parent: T;
        while (
            item instanceof TreeItem &&
            (parent = item.getParent() as T) &&
            parent instanceof TreeItem &&
            !parent.isRoot()
            ) {
            path.push(super._extractItemId(parent));
            item = parent;
        }

        return path.join(':');
    }

    // endregion

    // region Public methods

    /**
     * Возвращает название свойства, содержащего идентификатор родительского узла
     */
    getParentProperty(): string {
        return this._$parentProperty;
    }

    /**
     * Устанавливает название свойства, содержащего идентификатор родительского узла
     */
    setParentProperty(name: string): void {
        this._unsetImportantProperty(this._$parentProperty);
        this._$parentProperty = name;

        this._resetItemsStrategy();
        this._setImportantProperty(name);
        this._reBuild(true);
    }

    /**
     * Возвращает название свойства, содержащего признак узла
     */
    getNodeProperty(): string {
        return this._$nodeProperty;
    }

    /**
     * Возвращает название свойства, содержащего дочерние элементы узла
     */
    getChildrenProperty(): string {
        return this._$childrenProperty;
    }

    /**
     * Возвращает название свойства, содержащего признак наличия детей у узла
     */
    getHasChildrenProperty(): string {
        return this._$hasChildrenProperty;
    }

    protected getLoadedProperty(): string {
        return invertPropertyLogic(this._$hasChildrenProperty);
    }

    /**
     * Возвращает корневой узел дерева
     */
    getRoot(): T {
        if (this._root === null) {
            this._root = this._$root;
            if (!(this._root instanceof TreeItem)) {
                this._root = new TreeItem<S>({
                    contents: this._root,
                    owner: this as any,
                    node: true,
                    expanded: true,
                    hasChildren: false
                }) as T;
            }
        }

        return this._root;
    }

    /**
     * Устанавливает корневой узел дерева
     * @param root Корневой узел или его содержимое
     */
    setRoot(root: T | any): void {
        if (this._$root === root) {
            return;
        }

        this._$root = root;
        this._root = null;

        this._reIndex();
        this._reAnalize();
    }

    /**
     * Возвращает признак, что корневой узел включен в список элементов
     */
    isRootEnumerable(): boolean {
        return this._$rootEnumerable;
    }

    /**
     * Устанавливает признак, что корневой узел включен в список элементов
     * @param enumerable Корневой узел включен в список элементов
     */
    setRootEnumerable(enumerable: boolean): void {
        if (this._$rootEnumerable === enumerable) {
            return;
        }

        const session = this._startUpdateSession();

        this._$rootEnumerable = enumerable;
        if (enumerable) {
            this._wrapRootStrategy(this._composer);
        } else {
            this._unwrapRootStrategy(this._composer);
        }

        this._reSort();
        this._reFilter();
        this._finishUpdateSession(session);
    }

    /**
     * Возвращает уровень вложенности корня дерева
     */
    getRootLevel(): number {
        return this.isRootEnumerable() ? 1 : 0;
    }

    /**
     * Возвращает коллекцию потомков элемента коллекции
     * @param parent Родительский узел
     * @param [withFilter=true] Учитывать {@link setFilter фильтр}
     */
    getChildren(parent: T, withFilter?: boolean): TreeChildren<S> {
        return new TreeChildren<S>({
            owner: parent,
            items: this._getChildrenArray(parent, withFilter)
        });
    }

    /**
     * Устанавливает текущим родителя текущего элемента
     * @return Есть ли родитель
     */
    moveToAbove(): boolean {
        const current = this.getCurrent();
        if (!current) {
            return false;
        }

        const parent = current.getParent() as T;
        if (!parent || parent.isRoot()) {
            return false;
        }

        this.setCurrent(parent);
        return true;
    }

    /**
     * Устанавливает текущим первого непосредственного потомка текущего элемента
     * @return Есть ли первый потомок
     */
    moveToBelow(): boolean {
        const current = this.getCurrent();
        if (!current || !current.isNode()) {
            return false;
        }

        const children = this._getChildrenArray(current);
        if (children.length === 0) {
            return false;
        }

        this.setCurrent(children[0]);
        return true;
    }

    // endregion

    // region Protected methods

    protected _getItemsStrategy: () => IItemsStrategy<S, T>;

    protected _getItemsFactory(): ItemsFactory<T> {
        const parent = super._getItemsFactory();

        return function TreeItemsFactory(options: IItemsFactoryOptions<S>): T {
            let hasChildrenProperty = this._$hasChildrenProperty;
            let invertLogic = false;

            if (typeof hasChildrenProperty === 'string' && hasChildrenProperty[0] === '!') {
                hasChildrenProperty = hasChildrenProperty.substr(1);
                invertLogic = !invertLogic;
            }

            const hasChildren = object.getPropertyValue<boolean>(options.contents, hasChildrenProperty);
            options.hasChildren = invertLogic ? !hasChildren : hasChildren;

            if (!('node' in options)) {
                options.node = object.getPropertyValue<boolean>(options.contents, this._$nodeProperty);
            }

            return parent.call(this, options);
        };
    }

    protected _createComposer(): ItemsStrategyComposer<S, T> {
        const composer = super._createComposer();

        if (this._$childrenProperty) {
            composer.remove(DirectItemsStrategy);
            composer.prepend(MaterializedPathStrategy, {
                display: this,
                childrenProperty: this._$childrenProperty,
                nodeProperty: this._$nodeProperty,
                hasChildrenProperty: this._$hasChildrenProperty,
                root: this.getRoot.bind(this)
            });
        } else {
            composer.append(AdjacencyListStrategy, {
                keyProperty: this._$keyProperty,
                parentProperty: this._$parentProperty,
                nodeProperty: this._$nodeProperty,
                hasChildrenProperty: this._$hasChildrenProperty
            });
        }

        this._wrapRootStrategy(composer);

        return composer;
    }

    protected _wrapRootStrategy(composer: ItemsStrategyComposer<S, CollectionItem<S>>): void {
        if (this._$rootEnumerable && !composer.getInstance(RootStrategy)) {
            composer.append(RootStrategy, {
                root: this.getRoot.bind(this)
            });
        }
    }

    protected _unwrapRootStrategy(composer: ItemsStrategyComposer<S, CollectionItem<S>>): void {
        if (!this._$rootEnumerable) {
            composer.remove(RootStrategy);
        }
    }

    protected _reIndex(): void {
        super._reIndex();
        this._childrenMap = {};
    }

    protected _bindHandlers(): void {
        super._bindHandlers();

        this._onCollectionChange = onCollectionChange.bind({
            instance: this,
            prev: this._onCollectionChange
        });

        this._onCollectionItemChange = onCollectionItemChange.bind({
            instance: this,
            prev: this._onCollectionItemChange
        });
    }

    protected _replaceItems(start: number, newItems: S[]): ISplicedArray<T> {
        const replaced = super._replaceItems(start, newItems) as ISplicedArray<T>;
        const strategy = this._getItemsStrategy();
        const count = strategy.count;

        replaced.forEach((item, index) => {
            const strategyIndex = replaced.start + index;
            if (strategyIndex < count) {
                strategy.at(strategyIndex).setExpanded(item.isExpanded(), true);
            }
        });

        return replaced;
    }

    protected _getItemState(item: T): ITreeSessionItemState<T> {
        const state = super._getItemState(item) as ITreeSessionItemState<T>;

        if (item instanceof TreeItem) {
            state.parent = item.getParent() as T;
            state.childrenCount = item.getOwner()._getChildrenArray(item, false).length;
            state.level = item.getLevel();
            state.node = item.isNode();
            state.expanded = item.isExpanded();
        }

        return state;
    }

    /**
     * Проверяет валидность элемента проекции
     * @protected
     */
    protected _checkItem(item: CollectionItem<S>): void {
        if (!item || !(item instanceof CollectionItem)) {
            throw new Error(
                `${this._moduleName}::_checkItem(): item should be in instance of Controls/_display/CollectionItem`
            );
        }
    }

    /**
     * Возвращает массив детей для указанного родителя
     * @param parent Родительский узел
     * @param [withFilter=true] Учитывать фильтр
     * @protected
     */
    protected _getChildrenArray(parent: T, withFilter?: boolean): T[] {
        this._checkItem(parent);

        withFilter = withFilter === undefined ? true : !!withFilter;
        const iid = parent.getInstanceId();
        const key = iid + '|' + withFilter;

        if (!(key in this._childrenMap)) {
            const children = [];
            let enumerator;

            if (withFilter) {
                enumerator = this.getEnumerator();
            } else {
                enumerator = this._buildEnumerator(
                    this._getItems.bind(this),
                    this._filterMap.map(() => true),
                    this._sortMap
                );
            }

            enumerator.setCurrent(parent);
            if (enumerator.getCurrent() === parent || parent.isRoot()) {
                let item;
                while (enumerator.moveNext()) {
                    item = enumerator.getCurrent();
                    if (!(item instanceof TreeItem)) {
                        continue;
                    }
                    if (item.getParent() === parent) {
                        children.push(item);
                    } else if (item.getLevel() === parent.getLevel()) {
                        break;
                    }
                }
            }

            this._childrenMap[key] = children;
        }

        return this._childrenMap[key];
    }

    protected _getNearbyItem(
        enumerator: CollectionEnumerator<T>,
        item: T,
        isNext: boolean,
        skipGroups?: boolean
    ): T {
        const method = isNext ? 'moveNext' : 'movePrevious';
        const parent = item && item.getParent && item.getParent() || this.getRoot();
        let hasItem = true;
        const initial = enumerator.getCurrent();
        let sameParent = false;
        let current;
        let nearbyItem;

        enumerator.setCurrent(item);

        // TODO: отлеживать по level, что вышли "выше"
        while (hasItem && !sameParent) {
            hasItem = enumerator[method]();
            nearbyItem = enumerator.getCurrent();

            if (skipGroups && nearbyItem instanceof GroupItem) {
                nearbyItem = undefined;
                continue;
            }

            sameParent = nearbyItem ? nearbyItem.getParent() === parent : false;
            current = (hasItem && sameParent) ? nearbyItem : undefined;
        }

        enumerator.setCurrent(initial);

        return current;
    }

    protected _moveTo(isNext: boolean): boolean {
        const enumerator = this._getCursorEnumerator();
        const initial = this.getCurrent();
        const item = this._getNearbyItem(enumerator, initial, isNext, true);
        const hasMove = !!item;

        if (hasMove) {
            this.setCurrent(item);
        } else {
            enumerator.setCurrent(initial);
        }

        return hasMove;
    }

    protected _notifyItemsParent(treeItem: T, oldParent: T, properties: object): void {
        if (properties.hasOwnProperty(this.getParentProperty())) {
            this._notifyItemsParentByItem(treeItem.getParent() as T);
            this._notifyItemsParentByItem(oldParent);
        }
    }

    protected _notifyItemsParentByItem(treeItem: T): void {
        while (treeItem !== this.getRoot()) {
            this.notifyItemChange(treeItem, {children: []});
            treeItem = treeItem.getParent() as T;
        }
    }

    // endregion
}

Object.assign(Tree.prototype, {
    '[Controls/_display/Tree]': true,
    _moduleName: 'Controls/display:Tree',
    _itemModule: 'Controls/display:TreeItem',
    _$parentProperty: '',
    _$nodeProperty: '',
    _$childrenProperty: '',
    _$hasChildrenProperty: '',
    _$root: undefined,
    _$rootEnumerable: false,
    _root: null
});

register('Controls/display:Tree', Tree, {instantiate: false});
