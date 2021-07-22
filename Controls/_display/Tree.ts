import Collection, {
    IOptions as ICollectionOptions,
    ISerializableState as IDefaultSerializableState,
    ISessionItems,
    ISessionItemState,
    ISplicedArray,
    ItemsFactory,
    StrategyConstructor
} from './Collection';
import CollectionEnumerator from './CollectionEnumerator';
import CollectionItem from './CollectionItem';
import TreeItem from './TreeItem';
import TreeChildren from './TreeChildren';
import ItemsStrategyComposer from './itemsStrategy/Composer';
import DirectItemsStrategy from './itemsStrategy/Direct';
import AdjacencyListStrategy from './itemsStrategy/AdjacencyList';
import MaterializedPathStrategy from './itemsStrategy/MaterializedPath';
import IItemsStrategy from './IItemsStrategy';
import RootStrategy from './itemsStrategy/Root';
import {object} from 'Types/util';
import {Object as EventObject} from 'Env/Event';
import {TemplateFunction} from 'UI/Base';
import {CrudEntityKey} from 'Types/source';
import NodeFooter from 'Controls/_display/itemsStrategy/NodeFooter';
import {Model, relation} from 'Types/entity';
import {IDragPosition} from './interface/IDragPosition';
import TreeDrag from './itemsStrategy/TreeDrag';
import {isEqual} from 'Types/object';
import {IObservable, RecordSet} from 'Types/collection';
import ArraySimpleValuesUtil = require('Controls/Utils/ArraySimpleValuesUtil');
import { ISourceCollection } from './interface/ICollection';

export type TNodeFooterVisibilityCallback<S extends Model = Model> = (contents: S) => boolean;

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
    hasChildrenProperty?: string;
    hasChildrenByRecordSet?: boolean;
    node?: boolean;
    expanderTemplate?: TemplateFunction;
    displayExpanderPadding?: boolean;
    expanded?: boolean;
    hasMore?: boolean;
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
    hasMoreStorage?: Record<string, boolean>;
    expandedItems?: CrudEntityKey[];
    collapsedItems?: CrudEntityKey[];
    nodeFooterVisibilityCallback?: TNodeFooterVisibilityCallback;
    expanderSize?: string;
}

/**
 * Обрабатывает событие об изменении коллекции
 * @param event Дескриптор события.
 * @param action Действие, приведшее к изменению.
 * @param newItems Новые элементы коллекции.
 * @param newItemsIndex Индекс, в котором появились новые элементы.
 * @param oldItems Удаленные элементы коллекции.
 * @param oldItemsIndex Индекс, в котором удалены элементы.
 * @param reason
 */
function onCollectionChange<T>(
    event: EventObject,
    action: string,
    newItems: T[],
    newItemsIndex: number,
    oldItems: T[],
    oldItemsIndex: number,
    reason: string
): void {
    // Fix state of all nodes
    const nodes = this.instance._getItems().filter((item) => item.isNode && item.isNode());
    const state = this.instance._getItemsState(nodes);
    const session = this.instance._startUpdateSession();

    this.instance._reIndex();
    this.prev(event, action, newItems, newItemsIndex, oldItems, oldItemsIndex, reason);

    // Check state of all nodes. They can change children count (include hidden by filter).
    this.instance._finishUpdateSession(session, false);
    this.instance._checkItemsDiff(session, nodes, state);

    if (action === IObservable.ACTION_RESET || action === IObservable.ACTION_ADD || action === IObservable.ACTION_REMOVE) {
        if (this.instance.getExpanderVisibility() === 'hasChildren') {
            this.instance._recountHasNodeWithChildren();
            if (!this.instance.getHasChildrenProperty()) {
                this.instance._recountHasChildrenByRecordSet();
            }
        }
        this.instance.resetHasNode();
    }

    if (action == IObservable.ACTION_CHANGE) {
        if (this.instance._isChangedValueInParentProperty(oldItems, newItems)) {
            this.instance._reCountHierarchy();
        }
    }

    if (action === IObservable.ACTION_RESET) {
        this.instance.setExpandedItems(this.instance.getExpandedItems());
    }
}

/**
 * Обрабатывает событие об изменении элемента коллекции
 * @param event Дескриптор события.
 * @param item Измененный элемент коллекции.
 * @param index Индекс измененного элемента.
 * @param properties Объект содержащий измененные свойства элемента
 */
function onCollectionItemChange<T extends Model>(event: EventObject, item: T, index: number, properties: Object): void {
    this.instance._reIndex();
    if (this.instance.getExpanderVisibility() === 'hasChildren') {
        if (!this.instance.getHasChildrenProperty() && properties.hasOwnProperty(this.instance.getParentProperty())) {
            this.instance._recountHasChildrenByRecordSet();

            // нужно пересчитать, т.к. hasNodeWithChildren может считаться по рекордсету, если нет hasChildrenProperty
            this.instance._recountHasNodeWithChildren();
        } else if (properties.hasOwnProperty(this.instance.getHasChildrenProperty())) {
            this.instance._recountHasNodeWithChildren();
        }
    }
    this.prev(event, item, index, properties);

    if (properties.hasOwnProperty(this.instance.getNodeProperty())) {
        // TODO лучше в TreeItem всегда брать значение из рекорда, но чтобы так сделать, надо переписать много юнитов
        const displayItem = this.instance.getItemBySourceItem(item);
        displayItem.setNode(item.get(this.instance.getNodeProperty()));

        this.instance.resetHasNode();
    }

    if (this.instance._isChangedValueInParentProperty(null, null, properties)) {
        this.instance._reCountHierarchy();
    }
}

/**
 * Возвращает имя совйства с инвертированным смыслом
 */
function invertPropertyLogic(name: string): string {
    return name[0] === '!' ? name.slice(1) : '!' + name;
}

function validateOptions<S, T>(options: IOptions<S, T>): IOptions<S, T> {
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
export default class Tree<S extends Model = Model, T extends TreeItem<S> = TreeItem<S>> extends Collection<S, T> {
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
    protected _$root: T | S;

    /**
     * Шаблон экспандера
     */
    protected _$expanderTemplate: TemplateFunction;

    /**
     * Позиция экспандера
     */
    protected _$expanderPosition: string;

    /**
     * Видимость экспандера
     */
    protected _$expanderVisibility: string;

    /**
     * Иконка экспандера
     */
    protected _$expanderIcon: string;

    /**
     * Размер экспандера
     */
    protected _$expanderSize: string;

    protected _$nodeFooterTemplateMoreButton: TemplateFunction;

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
    /**
     * Объект, в котором хранится навигация для узлов
     * @protected
     */
    protected _$hasMoreStorage: Record<string, boolean>;

    /**
     * Темплейт подвала узла
     * @protected
     */
    protected _$nodeFooterTemplate: TemplateFunction;

    /**
     * Колбэк, определяющий для каких узлов нужен подвал
     * @protected
     */
    protected _$nodeFooterVisibilityCallback: TNodeFooterVisibilityCallback;

    protected _$moreFontColorStyle: string;

    /**
     * Стратегия перетаскивания записей
     * @protected
     */
    protected _dragStrategy: StrategyConstructor<TreeDrag> = TreeDrag;
    private _expandedItems: CrudEntityKey[] = [];
    private _collapsedItems: CrudEntityKey[] = [];

    private _hierarchyRelation: relation.Hierarchy;

    /**
     * Признак, означающий что есть узел с детьми
     * @protected
     */
    protected _hasNodeWithChildren: boolean;

    /**
     * Признак, означающий что в списке есть узел
     * @protected
     */
    protected _hasNode: boolean = null;

    /**
     * Признак, означающий что отступ вместо экспандеров нужно рисовать
     * @protected
     */
    protected _displayExpanderPadding: boolean;

    constructor(options?: IOptions<S, T>) {
        super(validateOptions<S, T>(options));

        // super классы уже могут вызвать методы, которые создатут _hierarchyRelation.
        // Например, стратегии которые создают элементы(AdjacencyList)
        if (!this._hierarchyRelation) {
            this._createHierarchyRelation();
        }

        if (this._$parentProperty) {
            this._setImportantProperty(this._$parentProperty);
        }
        if (this._$childrenProperty) {
            this._setImportantProperty(this._$childrenProperty);
        }
        this._$hasMoreStorage = options.hasMoreStorage || {};

        if (options.expandedItems instanceof Array) {
            this.setExpandedItems(options.expandedItems);
        }

        if (options.collapsedItems instanceof Array) {
            this.setCollapsedItems(options.collapsedItems);
        }

        if (options.expandedItems instanceof Array) {
            this._reBuildNodeFooters(true);
        }

        if (this.getExpanderVisibility() === 'hasChildren') {
            this._recountHasNodeWithChildren();
        } else {
            this._recountHasNode();
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

    // region Expander

    getExpanderTemplate(expanderTemplate?: TemplateFunction): TemplateFunction {
        return expanderTemplate || this._$expanderTemplate;
    }

    getExpanderPosition(): string {
        return this._$expanderPosition;
    }

    getExpanderVisibility(): string {
        return this._$expanderVisibility;
    }

    setExpanderVisibility(expanderVisibility: string): void {
        if (this._$expanderVisibility !== expanderVisibility) {
            this._$expanderVisibility = expanderVisibility;
            this._nextVersion();

            if (expanderVisibility === 'hasChildren') {
                this._recountHasNodeWithChildren();
            }
        }
    }

    getExpanderIcon(): string {
        return this._$expanderIcon;
    }

    getExpanderSize(): string {
        return this._$expanderSize;
    }

    protected _recountDisplayExpanderPadding(): void {
        const newValue = this.getExpanderIcon() !== 'none' && this.getExpanderPosition() === 'default'
            && (this.getExpanderVisibility() === 'hasChildren' ? this.hasNodeWithChildren() : this.hasNode())
        this._setDisplayExpanderPadding(newValue);
    }

    protected _setDisplayExpanderPadding(newValue: boolean): void {
        if (this._displayExpanderPadding !== newValue) {
            this._displayExpanderPadding = newValue;
            this._updateItemsProperty('setDisplayExpanderPadding', newValue, 'setDisplayExpanderPadding')
            this._nextVersion();
        }
    }

    // endregion Expander

    // region Drag-n-drop

    setDragPosition(position: IDragPosition<T>): void {
        const dragStrategy = this.getStrategyInstance(this._dragStrategy) as TreeDrag;

        if (dragStrategy) {
            // Выполняем поиск, т.к. позиция может смениться сразу на несколько элементов
            // и не факт, что в предыдущей позиции был targetNode
            const targetNode = this.find((item) => item.DraggableItem && item.isDragTargetNode());
            if (targetNode) {
                targetNode.setDragTargetNode(false);
                this._nextVersion();
            }

            if (position.position === 'on') {
                if (dragStrategy.avatarItem !== position.dispItem && !position.dispItem.isDragTargetNode()) {
                    position.dispItem.setDragTargetNode(true);
                    this._nextVersion();
                }
                return;
            }

            super.setDragPosition(position);
        }
    }

    resetDraggedItems(): void {
        const dragStrategy = this.getStrategyInstance(this._dragStrategy) as TreeDrag;

        if (dragStrategy) {
            const targetNode = this.find((item) => item.DraggableItem && item.isDragTargetNode());
            if (targetNode) {
                targetNode.setDragTargetNode(false);
            }
            super.resetDraggedItems();
        }
    }

    // endregion Drag-n-drop

    // region NodeFooter

    getNodeFooterTemplateMoreButton(): TemplateFunction {
        return this._$nodeFooterTemplateMoreButton;
    }

    getNodeFooterTemplate(): TemplateFunction {
        return this._$nodeFooterTemplate;
    }

    setNodeFooterTemplate(nodeFooterTemplate: TemplateFunction): void {
        if (this._$nodeFooterTemplate !== nodeFooterTemplate) {
            this._$nodeFooterTemplate = nodeFooterTemplate;
            this._reBuildNodeFooters();
            this._nextVersion();
        }
    }

    setNodeFooterVisibilityCallback(callback: TNodeFooterVisibilityCallback): void {
        if (this._$nodeFooterVisibilityCallback !== callback) {
            this._$nodeFooterVisibilityCallback = callback;

            // Нужно пересоздавать стратегию, чтобы Composer правильно запомнил опции для нее
            this.reCreateStrategy(NodeFooter, { nodeFooterVisibilityCallback: callback });

            this._nextVersion();
        }
    }

    setHasMoreStorage(storage: Record<string, boolean>, reBuildNodeFooters: boolean = false): void {
        if (!isEqual(this._$hasMoreStorage, storage)) {
            this._$hasMoreStorage = storage;
            this._updateItemsHasMore(storage);
            if (reBuildNodeFooters) {
                this._reBuildNodeFooters(true);
            }
            this._nextVersion();
        }
    }

    getHasMoreStorage(): Record<string, boolean> {
        return this._$hasMoreStorage;
    }

    getMoreFontColorStyle(): string {
        return this._$moreFontColorStyle;
    }

    setMoreFontColorStyle(moreFontColorStyle: string): void {
        if (this._$moreFontColorStyle !== moreFontColorStyle) {
            this._$moreFontColorStyle = moreFontColorStyle;
            this._updateItemsProperty('setMoreFontColorStyle', moreFontColorStyle, '[Controls/tree:TreeNodeFooterItem]')
            this._nextVersion();
        }
    }

    private _updateItemsHasMore(storage: Record<string, boolean>): void {
        Object.keys(storage).forEach((key) => {
            const item = this.getItemBySourceKey(key);
            if (item && item['[Controls/_display/TreeItem]']) {
                item.setHasMoreStorage(storage[key]);
            }
        });
    }

    // endregion NodeFooter

    setCollection(newCollection: ISourceCollection<S>): void {
        super.setCollection(newCollection);
        if (this.getExpanderVisibility() === 'hasChildren') {
            this._recountHasNodeWithChildren();
            if (!this.getHasChildrenProperty()) {
                this._recountHasChildrenByRecordSet();
            }
        }
    }

    getIndexBySourceItem(item: any): number {
        if (this._$rootEnumerable && this.getRoot().getContents() === item) {
            return 0;
        }
        return super.getIndexBySourceItem(item);
    }

    setKeyProperty(keyProperty: string): void {
        super.setKeyProperty(keyProperty);
        const adjacencyList = this._composer.getInstance<AdjacencyListStrategy<S,T>>(AdjacencyListStrategy);
        if (adjacencyList) {
            adjacencyList.keyProperty = keyProperty;
        }
        this._hierarchyRelation.setKeyProperty(keyProperty);
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

    // region ParentProperty

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
        this._hierarchyRelation.setParentProperty(name);

        this._resetItemsStrategy();
        this._setImportantProperty(name);
        this._reBuild(true);
    }

    /**
     * @param oldItems
     * @param newItems
     * @param changedProperties Объект содержащий измененные свойства элемента
     * @private
     */
    protected _isChangedValueInParentProperty(oldItems?: S[], newItems?: S[], changedProperties?: Object): boolean {
        if (changedProperties) {
            return changedProperties.hasOwnProperty(this.getParentProperty());
        } else {
            let changed = false;

            for (let i = 0; i < oldItems.length; i++) {
                // oldItem и newItem в событии приходят как один и тот же рекорд, поэтому мы не можем узнать
                // так старое значение, но у нас есть CollectionItem, в котором хрантся старое значение
                const oldCollectionItem = this.getItemBySourceItem(oldItems[i]);
                const oldValue = oldCollectionItem.getParent().key;
                const newValue = newItems[i].get(this.getParentProperty());
                if (oldValue !== newValue) {
                    changed = true;
                    break;
                }
            }

            return changed;
        }
    }

    protected _reCountHierarchy(): void {
        const session = this._startUpdateSession();

        const strategy = this.getStrategyInstance(AdjacencyListStrategy);
        strategy.invalidate();
        this._childrenMap = {};

        this._finishUpdateSession(session, true);
    }

    // endregion ParentProperty

    /**
     * Возвращает название свойства, содержащего признак узла
     */
    getNodeProperty(): string {
        return this._$nodeProperty;
    }

    setNodeProperty(nodeProperty: string): void {
        if (this._$nodeProperty !== nodeProperty) {
            const session = this._startUpdateSession();
            this._$nodeProperty = nodeProperty;
            this._hierarchyRelation.setNodeProperty(nodeProperty);
            this._reBuild(true);
            this._nextVersion();
            this._finishUpdateSession(session, true);
        }
    }

    /**
     * Возвращает название свойства, содержащего дочерние элементы узла
     */
    getChildrenProperty(): string {
        return this._$childrenProperty;
    }

    setChildrenProperty(childrenProperty: string): void {
        if (this._$childrenProperty !== childrenProperty) {
            this._$childrenProperty = childrenProperty;
            this._nextVersion();
        }
    }

    /**
     * Возвращает название свойства, содержащего признак наличия детей у узла
     */
    getHasChildrenProperty(): string {
        return this._$hasChildrenProperty;
    }

    setHasChildrenProperty(hasChildrenProperty: string): void {
        if (this._$hasChildrenProperty !== hasChildrenProperty) {
            this._$hasChildrenProperty = hasChildrenProperty;
            this._hierarchyRelation.setDeclaredChildrenProperty(hasChildrenProperty);
            this._updateItemsProperty('setHasChildrenProperty', hasChildrenProperty, '[Controls/_display/TreeItem]');
            this._nextVersion();
        }
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

        this._reBuildNodeFooters(true);
        this._reIndex();
        this._reAnalize();
        this._updateEdgeItemsSeparators();
        this.resetHasNode();
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

    // region Expanded/Collapsed

    isExpandAll(): boolean {
        return this._expandedItems[0] === null;
    }

    getExpandedItems(): CrudEntityKey[] {
        return this._expandedItems;
    }

    getCollapsedItems(): CrudEntityKey[] {
        return this._collapsedItems;
    }

    setExpandedItems(expandedKeys: CrudEntityKey[]): void {
        if (isEqual(this._expandedItems, expandedKeys)) {
            return;
        }

        const diff = ArraySimpleValuesUtil.getArrayDifference(this._expandedItems, expandedKeys);

        //region Добавленные ключи нужно развернуть
        if (diff.added[0] === null) {
            this._getItems().forEach((item) => {
                if (!item['[Controls/_display/TreeItem]'] || item.isNode() === null) {
                    return;
                }

                // TODO нужно передать silent=true и занотифицировать все измененные элементы разом
                item.setExpanded(true);
            });

            // Если diff.added[0] === null, значит все записи развернуты,
            // последующая обработка не требуется
            this._expandedItems = [...expandedKeys];
            return;
        } else {
            diff.added.forEach((id) => {
                const item = this.getItemBySourceKey(id, false);
                if (item && item['[Controls/_display/TreeItem]']) {
                    // TODO нужно передать silent=true и занотифицировать все измененные элементы разом
                    item.setExpanded(true);
                }
            });
        }
        //endregion

        //region Удаленные ключи нужно свернуть
        if (diff.removed[0] === null) {
            this._getItems().forEach((item) => {
                // TODO: не должен общий модуль знать про конкретную реализацию TreeGridNodeFooterRow
                //  getContents() у TreeGridNodeFooterRow должен придерживаться контракта и возвращать
                //  Model а не строку
                if (!item['[Controls/_display/TreeItem]'] || item['[Controls/treeGrid:TreeGridNodeFooterRow]']) {
                    return;
                }

                const id = item.getContents().getKey();
                if (id && diff.added.includes(id)) {
                    return;
                }

                // TODO нужно передать silent=true и занотифицировать все измененные элементы разом
                item.setExpanded(false);
            });
        } else {
            diff.removed.forEach((id) => {
                const item = this.getItemBySourceKey(id, false);
                if (item && item['[Controls/_display/TreeItem]']) {
                    // TODO нужно передать silent=true и занотифицировать все измененные элементы разом
                    item.setExpanded(false);
                }
            });
        }
        //endregion

        this._expandedItems = [...expandedKeys];
        this._updateEdgeItemsSeparators();
    }

    setCollapsedItems(collapsedKeys: CrudEntityKey[]): void {
        if (isEqual(this._collapsedItems, collapsedKeys)) {
            return;
        }

        // TODO зарефакторить по задаче https://online.sbis.ru/opendoc.html?guid=5d8d38d0-3ade-4393-bced-5d7fbd1ca40b
        const diff = ArraySimpleValuesUtil.getArrayDifference(this._collapsedItems, collapsedKeys);
        diff.removed.forEach((it) => {
            const item = this.getItemBySourceKey(it);
            if (item && item['[Controls/_display/TreeItem]']) {
                item.setExpanded(true);
            }
        });

        this._collapsedItems = [...collapsedKeys];

        collapsedKeys.forEach((key) => {
            const item = this.getItemBySourceKey(key);
            if (item && item['[Controls/_display/TreeItem]']) {
                // TODO нужно передать silent=true и занотифицировать все измененные элементы разом
                this._collapseChilds(item);
                item.setExpanded(false);
            }
        });
        this._updateEdgeItemsSeparators();
    }

    toggleExpanded(item: T): void {
        // TODO зарефакторить по задаче https://online.sbis.ru/opendoc.html?guid=5d8d38d0-3ade-4393-bced-5d7fbd1ca40b
        const newExpandedState = !item.isExpanded();
        const itemKey = item.getContents().getKey();
        item.setExpanded(newExpandedState);

        if (newExpandedState) {
            if (!this._expandedItems.includes(itemKey)) {
                this._expandedItems.push(itemKey);
            }
            if (this._collapsedItems.includes(itemKey)) {
                this._collapsedItems.splice(this._collapsedItems.indexOf(itemKey), 1);
            }
        } else {
            if (this._expandedItems.includes(itemKey)) {
                this._expandedItems.splice(this._expandedItems.indexOf(itemKey), 1);
            }

            if (!this._collapsedItems.includes(itemKey)) {
                this._collapsedItems.push(itemKey);
            }
        }
    }

    private _collapseChilds(item: T): void {
        const childs = this.getChildren(item);
        childs.forEach((it) => {
            it.setExpanded(false);
        });
    }

    // endregion Expanded/Collapsed

    // endregion

    // region Protected methods

    protected _getItemsStrategy: () => IItemsStrategy<S, T>;

    protected _getItemsFactory(): ItemsFactory<T> {
        const parent = super._getItemsFactory();

        return function TreeItemsFactory(options: IItemsFactoryOptions<S>): T {
            options.hasChildrenProperty = this.getHasChildrenProperty();
            options.hasChildrenByRecordSet = !!this.getChildrenByRecordSet(options.contents).length;
            options.expanderTemplate = this._$expanderTemplate;
            options.displayExpanderPadding = this._displayExpanderPadding;

            const key = object.getPropertyValue<CrudEntityKey>(options.contents, this._$keyProperty);
            options.expanded = this._expandedItems?.includes(key) || this._expandedItems?.includes(null) && !this._collapsedItems?.includes(key);
            if (!('node' in options)) {
                options.node = object.getPropertyValue<boolean>(options.contents, this._$nodeProperty);
            }

            if (this.getHasMoreStorage() && this.getHasMoreStorage()[key]) {
                options.hasMore = true;
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

    protected _reBuildNodeFooters(reset: boolean = false): void {
        if (reset) {
            const session = this._startUpdateSession();
            this.getStrategyInstance(NodeFooter)?.reset();
            this._reSort();
            this._reFilter();
            this._finishUpdateSession(session, true);
        } else {
            this.getStrategyInstance(NodeFooter)?.invalidate();
        }
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
                    if (
                        item['[Controls/treeGrid:TreeGridNodeFooterRow]'] ||
                        !(item instanceof TreeItem) && !(item['[Controls/_display/BreadcrumbsItem]'])
                    ) {
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

    getChildrenByRecordSet(parent: S | CrudEntityKey | null): S[] {
        // метод может быть позван, до того как полностью отработает конструктор
        if (!this._hierarchyRelation) {
            this._createHierarchyRelation();
        }
        return this._hierarchyRelation.getChildren(parent, this.getCollection() as any as RecordSet) as any[] as S[];
    }

    private _recountHasChildrenByRecordSet(): void {
        const nodes = this._getItems().filter((it) => it['[Controls/_display/TreeItem]'] && it.isNode() !== null);
        let changed = false;

        nodes.forEach((it) => {
            const hasChildrenByRecordSet = !!this.getChildrenByRecordSet(it.getContents()).length;
            changed = it.setHasChildrenByRecordSet(hasChildrenByRecordSet) || changed;
        });

        if (changed) {
            this._nextVersion();
        }
    }

    getNextInRecordSetProjection(key: CrudEntityKey, expandedItems: CrudEntityKey[]): S {
        const projection = this.getRecordSetProjection(null, expandedItems);
        const nextItemIndex = projection.findIndex((record) => record.getKey() === key) + 1;
        return projection[nextItemIndex];
    }
    getPrevInRecordSetProjection(key: CrudEntityKey, expandedItems: CrudEntityKey[]): S {
        const projection = this.getRecordSetProjection(null, expandedItems);
        const prevItemIndex = projection.findIndex((record) => record.getKey() === key) - 1;
        return projection[prevItemIndex];
    }

    getRecordSetProjection(root: CrudEntityKey | null = null, expandedItems: CrudEntityKey[] = []): S[] {
        const collection = this.getCollection() as unknown as RecordSet;
        if (!collection || !collection.getCount()) {
            return [];
        }
        const projection = [];
        const isExpandAll = expandedItems.indexOf(null) !== -1;
        const children = this.getChildrenByRecordSet(root);
        for (let i = 0; i < children.length; i++) {
            projection.push(children[i]);
            if (isExpandAll || expandedItems.indexOf(children[i].getKey()) !== -1) {
                projection.push(...this.getRecordSetProjection(children[i].getKey(), expandedItems));
            }
        }
        return projection;
    }

    protected _getNearbyItem(
        enumerator: CollectionEnumerator<T>,
        item: T,
        isNext: boolean,
        conditionProperty?: string
    ): T {
        const method = isNext ? 'moveNext' : 'movePrevious';
        const parent = item && item.getParent && item.getParent() || this.getRoot();
        let hasItem = true;
        const initial = enumerator.getCurrent();
        let sameParent = false;
        let current;
        let nearbyItem;
        let isTreeItem;

        enumerator.setCurrent(item);

        // TODO: отлеживать по level, что вышли "выше"
        while (hasItem && !sameParent) {
            hasItem = enumerator[method]();
            nearbyItem = enumerator.getCurrent();

            // если мы пришли сюда, когда в enumerator ещё ничего нет, то nearbyItem будет undefined
            if (!!nearbyItem && conditionProperty && !nearbyItem[conditionProperty]) {
                nearbyItem = undefined;
                continue;
            }
            // Когда _getNearbyItem используется для обычных групп, у них нет getParent
            isTreeItem = nearbyItem && nearbyItem['[Controls/_display/TreeItem]'] || nearbyItem['[Controls/_display/BreadcrumbsItem]'];
            sameParent = nearbyItem && isTreeItem ? nearbyItem.getParent() === parent : false;
            current = (hasItem && (!isTreeItem || sameParent)) ? nearbyItem : undefined;
        }

        enumerator.setCurrent(initial);

        return current;
    }

    // endregion

    // region HasNodeWithChildren

    protected _recountHasNodeWithChildren(): void {
        // hasNodeWithChildren нужно считать по рекордсету,
        // т.к. ,когда срабатывает событие reset, элементы проекции еще не созданы
        if (!this.getCollection().getCount()) {
            return;
        }

        let hasNodeWithChildren = false;

        const collection = this.getCollection();
        for (let i = 0; i < collection.getCount(); i++) {
            const item = collection.at(i);
            const isNode = item.get(this.getNodeProperty()) !== null;
            // TODO убрать кривую проверку, после переноса nodeTypeProperty в Tree
            //  https://online.sbis.ru/opendoc.html?guid=ccebc1db-8f2c-48bd-a8f3-b5910668b598
            const isGroupNode = item.get(this.getNodeTypeProperty && this.getNodeTypeProperty());
            const hasChildren = this.getHasChildrenProperty()
                ? item.get(this.getHasChildrenProperty())
                : !!this.getChildrenByRecordSet(item).length;
            if (isNode && hasChildren && !isGroupNode) {
                hasNodeWithChildren = true;
                break;
            }
        }

        this._setHasNodeWithChildren(hasNodeWithChildren);
    }

    protected _setHasNodeWithChildren(hasNodeWithChildren: boolean): void {
        if (this._hasNodeWithChildren !== hasNodeWithChildren) {
            this._hasNodeWithChildren = hasNodeWithChildren;
            this._recountDisplayExpanderPadding();
            this._nextVersion();
        }
    }

    hasNodeWithChildren(): boolean {
        return this._hasNodeWithChildren;
    }

    // endregion HasNodeWithChildren

    // region HasNode

    protected _recountHasNode(): void {
        const itemsInRoot = this.getChildren(this.getRoot());

        let hasNode = false;
        for (let i = 0; i < itemsInRoot.getCount(); i++) {
            const item = itemsInRoot.at(i);
            if (item['[Controls/_display/TreeItem]'] && item.isNode() !== null) {
                hasNode = true;
                break;
            }
        }

        this._setHasNode(hasNode);
    }

    protected _setHasNode(hasNode: boolean): void {
        if (this._hasNode !== hasNode) {
            this._hasNode = hasNode;
            this._recountDisplayExpanderPadding();
            this._nextVersion();
        }
    }

    hasNode(): boolean {
        if (this._hasNode === null) {
            this._recountHasNode();
        }
        return this._hasNode;
    }

    resetHasNode(): void {
        this._hasNode = null;
    }

    // endregion HasNode

    private _createHierarchyRelation(): void {
        this._hierarchyRelation = new relation.Hierarchy({
            keyProperty: this.getKeyProperty(),
            parentProperty: this.getParentProperty(),
            nodeProperty: this.getNodeProperty(),
            declaredChildrenProperty: this.getHasChildrenProperty()
        });
    }

    // region ItemsChanges

    protected _handleCollectionChangeAdd(): void {
        super._handleCollectionChangeAdd();

        this._reBuildNodeFooters();
    }

    protected _handleCollectionChangeRemove(): void {
        super._handleCollectionChangeRemove();

        this._reBuildNodeFooters();
    }

    protected _handleCollectionChangeReplace(): void {
        super._handleCollectionChangeReplace();

        this._reBuildNodeFooters();
    }

    protected _handleNotifyItemChangeRebuild(item: T, properties?: object|string): boolean {
        let result = super._handleNotifyItemChangeRebuild(item, properties);

        if (properties === 'expanded' || properties.hasOwnProperty('expanded')) {
            this._reBuildNodeFooters();
            result = true;
        }

        return result;
    }

    // endregion ItemsChanges
}

Object.assign(Tree.prototype, {
    '[Controls/_display/Tree]': true,
    _moduleName: 'Controls/display:Tree',
    _itemModule: 'Controls/display:TreeItem',
    _$parentProperty: '',
    _$nodeProperty: '',
    _$childrenProperty: '',
    _$hasChildrenProperty: '',
    _$expanderTemplate: null,
    _$expanderPosition: 'default',
    _$expanderVisibility: 'visible',
    _$expanderSize: undefined,
    _$expanderIcon: undefined,
    _$root: undefined,
    _$rootEnumerable: false,
    _$nodeFooterTemplate: null,
    _$nodeFooterVisibilityCallback: null,
    _$nodeFooterTemplateMoreButton: null,
    _$moreFontColorStyle: null,
    _root: null
});
