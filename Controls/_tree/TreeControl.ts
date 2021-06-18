import cClone = require('Core/core-clone');

import {SyntheticEvent} from 'UI/Vdom';
import {TemplateFunction} from 'UI/Base';
import {EventUtils} from 'UI/Events';

import {constants} from 'Env/Env';

import {CrudEntityKey} from 'Types/source';
import {isEqual} from 'Types/object';
import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';

import {Direction, IHierarchyOptions, TKey} from 'Controls/interface';
import {BaseControl, IBaseControlOptions, ISiblingStrategy} from 'Controls/list';
import {Collection, CollectionItem, Tree, TreeItem} from 'Controls/display';
import { selectionToRecord } from 'Controls/operations';
import { NewSourceController } from 'Controls/dataSource';
import { MouseButtons, MouseUp } from 'Controls/popup';
import 'css!Controls/list';
import 'css!Controls/itemActions';
import 'css!Controls/CommonClasses';
import 'css!Controls/treeGrid';
import {TreeSiblingStrategy} from './Strategies/TreeSiblingStrategy';
import {ExpandController} from 'Controls/expandCollapse';
import {Logger} from 'UI/Utils';

const HOT_KEYS = {
    expandMarkedItem: constants.key.right,
    collapseMarkedItem: constants.key.left
};

const DRAG_MAX_OFFSET = 0.3;
const EXPAND_ON_DRAG_DELAY = 1000;
const DEFAULT_COLUMNS_VALUE = [];

type TNodeFooterVisibilityCallback = (item: Model) => boolean;
type TNodeLoadCallback = (list: RecordSet, nodeKey: number | string) => void;

export interface ITreeControlOptions extends IBaseControlOptions, IHierarchyOptions {
    parentProperty: string;
    markerMoveMode?;
    root?;
    expandByItemClick?: boolean;
    expandedItems?: Array<number | string>;
    collapsedItems?: Array<number | string>;
    nodeFooterTemplate?: TemplateFunction;
    nodeFooterVisibilityCallback?: TNodeFooterVisibilityCallback;
    hasChildrenProperty?: string;
    searchBreadCrumbsItemTemplate?: TemplateFunction;
    expanderVisibility?: 'visible'|'hasChildren'|'hasChildrenOrHover';
    nodeLoadCallback?: TNodeLoadCallback;
    deepReload?: boolean;
    selectAncestors?: boolean;
    selectDescendants?: boolean;
    markItemByExpanderClick?: boolean;
    expanderSize?: 's'|'m'|'l'|'xl';
    markedLeafChangeCallback: Function;
    singleExpand?: boolean;
}

const _private = {
    isExpandAll(expandedItems: TKey[]): boolean {
        return expandedItems instanceof Array && expandedItems[0] === null;
    },

    expandMarkedItem(self: TreeControl): void {
        const markerController = self._markerController;
        const markedKey = markerController?.getMarkedKey() || null;

        if (markedKey === null) {
            return;
        }

        const markedItem = self.getViewModel().getItemBySourceKey(markedKey);
        if (markedItem && markedItem.isNode() !== null && self._expandController.isItemCollapsed(markedKey)) {
            self.toggleExpanded(markedKey);
        }
    },

    collapseMarkedItem(self: TreeControl): void {
        const markerController = self._markerController;
        const markedKey = markerController?.getMarkedKey() || null;

        if (markedKey === null) {
            return;
        }

        const markedItem = self.getViewModel().getItemBySourceKey(markedKey);
        if (markedItem && markedItem.isNode() !== null && self._expandController.isItemExpanded(markedKey)) {
            self.toggleExpanded(markedKey);
        }
    },

    toggleExpanded(self: TreeControl, dispItem: TreeItem): Promise<unknown> {
        if (self.getViewModel().SupportExpand === false) {
            return Promise.resolve();
        }

        const item = dispItem.getContents();
        const nodeKey = item.getKey();
        const expanded = !self._expandController.isItemExpanded(nodeKey);

        // Если вызвали разворот узла, то сбрасывать развернутые узлы уже точно не нужно
        self._needResetExpandedItems = false;

        const expandToFirstLeafIfNeed = () => {
            // Если узел сворачивается - автоматически высчитывать следующий разворачиваемый элемент не требуется.
            // Ошибка: https://online.sbis.ru/opendoc.html?guid=98762b51-6b69-4612-9468-1c38adaa2606
            if (self._options.markerMoveMode === 'leaves' && expanded !== false && self._goToNextAfterExpand) {
                self._tempItem = nodeKey;
                return self.goToNext();
            }
        };

        const eventResult = self._notify(expanded ? 'beforeItemExpand' : 'beforeItemCollapse', [item]);
        if (eventResult instanceof Promise) {
            self.showIndicator('all');
            return eventResult.then(
                () => {
                    self.hideIndicator();
                    return _private.doExpand(self, dispItem).then(expandToFirstLeafIfNeed).catch((e) => e);
                },
                () => {
                    self.hideIndicator();
                }
            );
        } else {
            return _private.doExpand(self, dispItem).then(expandToFirstLeafIfNeed).catch((e) => e);
        }
    },

    doExpand(self: TreeControl, dispItem: TreeItem): Promise<unknown> {
        const item = dispItem.getContents();
        const nodeKey = item.getKey();
        const expandController = self._expandController;
        const expanded = !expandController.isItemExpanded(nodeKey);

        function doExpand(): Promise<unknown> {
            return Promise
                .resolve(expandController.toggleItem(nodeKey) as Promise<RecordSet[]>)
                .then((results?: RecordSet[]) => {
                    //region Применим новое состояние развернутости к моделе
                    // Проставляем hasMoreStorage до простановки expandedItems,
                    // чтобы футеры узлов правильно посчитать за один раз
                    self.getViewModel().setHasMoreStorage(
                        _private.prepareHasMoreStorage(
                            self.getSourceController(),
                            expandController.getExpandedItems()
                        )
                    );
                    expandController.applyStateToModel();
                    //endregion

                    // Если задан callback на загрузку данных узла и загрузка была, то вызовем его
                    if (self._options.nodeLoadCallback && results?.length) {
                        self._options.nodeLoadCallback(results[0], nodeKey);
                    }

                    //region Уведомим об изменении expandedItems
                    const expandedItems = expandController.getExpandedItems();
                    // Актуализируем информацию по раскрытым узлам в sourceController, иначе на beforeUpdate
                    // применится старое состояние из sourceController
                    self.getSourceController()?.setExpandedItems(expandedItems);
                    self._notify('expandedItemsChanged', [expandedItems]);
                    self._notify('collapsedItemsChanged', [expandController.getCollapsedItems()]);
                    self._notify(expanded ? 'afterItemExpand' : 'afterItemCollapse', [item]);
                    //endregion
                });
        }

        // todo: удалить события itemExpand и itemCollapse в 20.2000.
        self._notify(expanded ? 'itemExpand' : 'itemCollapse', [item]);

        // Если сворачивается узел, внутри которого запущено редактирование, то его следует закрыть
        let shouldCancelEditing = false;
        if (self._editingItem) {
            const listViewModel = self.getViewModel();
            shouldCancelEditing = _private.hasInParents(
                listViewModel,
                self._editingItem.getContents().getKey(),
                dispItem.contents.getKey()
            );
        }

        // TODO: Переписать
        //  https://online.sbis.ru/opendoc.html?guid=974ac162-4ee4-48b5-a2b7-4ff75dccb49c
        if (shouldCancelEditing) {
            return self.cancelEdit().then((result) => {
                if (!(result && result.canceled)) {
                    return doExpand();
                }
                return result;
            });
        } else {
            return doExpand();
        }
    },

    hasInParents(collection: Collection, childKey, stepParentKey): boolean {
        const child = collection.getItemBySourceKey(childKey);
        const targetParent = collection.getItemBySourceKey(stepParentKey);

        let current = child;
        do {
            current = current.getParent();
            if (!current.isRoot() && current === targetParent) {
                return true;
            }
        } while (!current.isRoot());
        return false;
    },

    shouldLoadChildren(self: TreeControl, nodeKey): boolean {
        // загружаем узел только если:
        // 1. он не был загружен ранее (проверяем через sourceController, была ли выполнена загрузка)
        // 2. у него вообще есть дочерние элементы (по значению поля hasChildrenProperty)
        const viewModel = self.getViewModel();
        const items = viewModel.getCollection();

        const sourceController = self.getSourceController();
        const isAlreadyLoaded = (sourceController ? sourceController.hasLoaded(nodeKey) : !!self._options.items);

        if (isAlreadyLoaded) {
            return false;
        }

        if (self._options.hasChildrenProperty) {
            const node = items.getRecordById(nodeKey);
            return node.get(self._options.hasChildrenProperty) !== false;
        }
        return true;
    },

    prepareHasMoreStorage(sourceController: NewSourceController, expandedItems: TKey[]): Record<string, boolean> {
        const hasMore = {};

        expandedItems.forEach((nodeKey) => {
            hasMore[nodeKey] = sourceController.hasMoreData('down', nodeKey);
        });

        return hasMore;
    },

    getEntries(selectedKeys: string|number[], excludedKeys: string|number[], source) {
        let entriesRecord;

        if (selectedKeys && selectedKeys.length) {
            entriesRecord = selectionToRecord({
                selected: selectedKeys || [],
                excluded: excludedKeys || []
            }, _private.getOriginalSource(source).getAdapter());
        }

        return entriesRecord;
    },

    loadNodeChildren(self: TreeControl, nodeKey: CrudEntityKey): Promise<object> {
        const sourceController = self.getSourceController();

        self.showIndicator();
        return sourceController.load('down', nodeKey).then((list) => {
                self.stopBatchAdding();
                return list;
            })
            .catch((error) => {
                self._onDataError({ error });
                return error;
            })
            .finally(() => {
                self.hideIndicator();
            });
    },

    resetExpandedItems(self: TreeControl): void {
        const viewModel = self.getViewModel();
        const reset = () => {
            viewModel.setHasMoreStorage({});
            self._expandController.resetExpandedItems();

            if (self._isMounted) {
                self._notify('expandedItemsChanged', [self._expandController.getExpandedItems()]);
                self._notify('collapsedItemsChanged', [self._expandController.getCollapsedItems()]);
            }
        };

        if (!viewModel) {
            return;
        }

        let shouldCancelEditing = false;
        if (self._editingItem) {
            const editingKey = self._editingItem.getContents().getKey();
            self._expandController.getExpandedItems().forEach((itemKey) => {
                shouldCancelEditing = shouldCancelEditing || _private.hasInParents(
                    viewModel,
                    editingKey,
                    itemKey
                );
            });
        }

        if (shouldCancelEditing) {
            self.cancelEdit().then((result) => {
                if (!(result && result.canceled)) {
                    reset();
                }
                return result;
            });
        } else {
            reset();
        }

        self._expandController.applyStateToModel();
    },

    reloadItem(self: TreeControl, key: TKey) {
        const baseSourceController = self.getSourceController();
        const viewModel = self._listViewModel;
        const filter = cClone(self._options.filter);
        const nodes = [key !== undefined ? key : null];
        const nodeProperty = self._options.nodeProperty;

        filter[self._options.parentProperty] =
            nodes.concat(_private.getReloadableNodes(viewModel, key, self._keyProperty, nodeProperty));

        return baseSourceController.load(undefined, key, filter).addCallback((result) => {
            _private.applyReloadedNodes(self, viewModel, key, self._keyProperty, nodeProperty, result);
            viewModel.setHasMoreStorage(
                _private.prepareHasMoreStorage(baseSourceController, viewModel.getExpandedItems())
            );
            return result;
        });
    },

    getReloadableNodes(viewModel, nodeKey, keyProp, nodeProp) {
        var nodes = [];
        _private.nodeChildsIterator(viewModel, nodeKey, nodeProp, function(elem) {
            nodes.push(elem.get(keyProp));
        });
        return nodes;
    },

    applyReloadedNodes(self: TreeControl, viewModel, nodeKey, keyProp, nodeProp, newItems) {
        var itemsToRemove = [];
        var items = viewModel.getCollection();
        var checkItemForRemove = function(item) {
            if (newItems.getIndexByValue(keyProp, item.get(keyProp)) === -1) {
                itemsToRemove.push(item);
            }
        };

        _private.nodeChildsIterator(viewModel, nodeKey, nodeProp, checkItemForRemove, checkItemForRemove);

        items.setEventRaising(false, true);

        itemsToRemove.forEach((item) => {
            items.remove(item);
        });

        items.setEventRaising(true, true);
    },

    initListViewModelHandler(self: TreeControl, listModel): void {
        if (listModel) {
            listModel.subscribe('expandedItemsChanged', self._onExpandedItemsChanged.bind(self));
            listModel.subscribe('collapsedItemsChanged', self._onCollapsedItemsChanged.bind(self));
        }
    },

    nodeChildsIterator(viewModel, nodeKey, nodeProp, nodeCallback, leafCallback) {
        var findChildNodesRecursive = function(key) {
            const item = viewModel.getItemBySourceKey(key);
            if (item) {
                viewModel.getChildren(item).forEach(function(elem) {
                    if (elem.isNode() !== null) {
                        if (nodeCallback) {
                            nodeCallback(elem.getContents());
                        }
                        findChildNodesRecursive(elem.getContents().get(nodeProp));
                    } else if (leafCallback) {
                        leafCallback(elem.getContents());
                    }
                });
            }
        };

        findChildNodesRecursive(nodeKey);
    },

    getOriginalSource(source) {
        while(source.getOriginal) {
            source = source.getOriginal();
        }

        return source;
    },

    /**
     * Получаем по event.target строку списка
     * @param event
     * @private
     * @remark это нужно для того, чтобы когда event.target это содержимое строки, которое по высоте меньше 20 px,
     *  то проверка на 10px сверху и снизу сработает неправильно и нельзя будет навести на узел(position='on')
     */
    getTargetRow(self: TreeControl, event: SyntheticEvent): Element {
        if (!event.target || !event.target.classList || !event.target.parentNode || !event.target.parentNode.classList) {
            return event.target;
        }

        const startTarget = event.target;
        let target = startTarget;

        const condition = () => {
            // В плитках элемент с классом controls-ListView__itemV имеет нормальные размеры,
            // а в обычном списке данный элемент будет иметь размер 0x0
            if (self._listViewModel['[Controls/_tile/Tile]']) {
                return !target.classList.contains('controls-ListView__itemV');
            } else {
                return !target.parentNode.classList.contains('controls-ListView__itemV');
            }
        };

        while (condition()) {
            target = target.parentNode;

            // Условие выхода из цикла, когда controls-ListView__itemV не нашелся в родительских блоках
            if (!target.classList || !target.parentNode || !target.parentNode.classList
               || target.classList.contains('controls-BaseControl')) {
                target = startTarget;
                break;
            }
        }

        return target;
    },

    /**
     * Возвращает идентификаторы раскрытых узлов. В случае если переданные expandedItems не равны
     * [null], то вернутся копия переданного массива. В противном случае вернутся идентификаторы
     * всех узлов, присутствующих в указанных items
     */
    getExpandedItems(
        self: TreeControl,
        options: ITreeControlOptions,
        items: RecordSet,
        expandedItems: CrudEntityKey[]
    ): CrudEntityKey[] {

        if (!items) {
            return [];
        }
        let realExpandedItems;

        if (_private.isExpandAll(expandedItems) && options.nodeProperty) {
            realExpandedItems = [];
            items.each((item) => {
                if (item.get(options.nodeProperty) !== null) {
                    realExpandedItems.push(item.get(self._keyProperty));
                }
            });
        } else {
            realExpandedItems = expandedItems.slice();
        }

        return realExpandedItems;
    }
};

/**
 * Hierarchical list control with custom item template. Can load data from data source.
 *
 * @class Controls/_tree/TreeControl
 * @mixes Controls/interface/IEditableList
 * @mixes Controls/list:IMovableList
 * @extends Controls/_list/BaseControl
 *
 * @private
 */

export class TreeControl<TOptions extends ITreeControlOptions = ITreeControlOptions> extends BaseControl<ITreeControlOptions> {
    private _root = null;
    private _needResetExpandedItems: boolean = false;
    private _updateExpandedItemsAfterReload: boolean = false;
    private _currentItem = null;
    private _tempItem = null;
    private _markedLeaf = '';
    private _doAfterItemExpanded = null;
    private _goToNextAfterExpand: true;
    private _scrollToLeaf: boolean = null;
    private _scrollToLeafOnDrawItems: boolean = false;
    protected _plainItemsContainer: boolean = true;

    private _itemOnWhichStartCountDown = null;
    private _timeoutForExpandOnDrag = null;
    private _deepReload;

    _expandController: ExpandController;
    private _mouseDownExpanderKey: TKey;
    private _expandedItemsToNotify: TKey[];

    constructor(options: TOptions) {
        super(options);
        this._expandNodeOnDrag = this._expandNodeOnDrag.bind(this);
        this._nodeDataMoreLoadCallback = this._nodeDataMoreLoadCallback.bind(this);
        if (typeof options.root !== 'undefined') {
            this._root = options.root;
        }
        if (options.expandedItems && options.expandedItems.length > 0) {
            this._deepReload = true;
        }
    }

    protected _beforeMount(...args: [TOptions, object]): void {
        const options = args[0];

        // Создаем _expandController до вызова super._beforeMount, т.к. во время
        // отработки super._beforeMount уже будет нужен
        this._expandController = new ExpandController({
            singleExpand: options.singleExpand,
            expandedItems: options.expandedItems,
            collapsedItems: options.collapsedItems,
            loader: this._expandLoader.bind(this)
        });

        const superResult = super._beforeMount(...args);
        const doBeforeMount = () => {
            // После отработки super._beforeMount создастся модель, обновим её в контроллере
            this._expandController.updateOptions({model: this.getViewModel()});
            this._plainItemsContainer = options.plainItemsContainer;
            if (options.sourceController) {
                // FIXME для совместимости, т.к. сейчас люди задают опции, которые требуетюся для запроса
                //  и на списке и на Browser'e
                const sourceControllerState = options.sourceController.getState();

                if (options.parentProperty && sourceControllerState.parentProperty !== options.parentProperty ||
                    options.root !== undefined && options.root !== sourceControllerState.root) {
                    options.sourceController.updateOptions({...options, keyProperty: this._keyProperty});
                }

                options.sourceController.setNodeDataMoreLoadCallback(this._nodeDataMoreLoadCallback);
            }
        };
        return !superResult ? doBeforeMount() : superResult.then(doBeforeMount);
    }

    protected _afterMount() {
        super._afterMount(...arguments);

        _private.initListViewModelHandler(this, this._listViewModel);
        if (this._expandedItemsToNotify) {
            this._notify('expandedItemsChanged', [this._expandedItemsToNotify]);
            this._expandedItemsToNotify = null;
        }
    }

    /**
     * Ищет последний элемент в дереве
     * @private
     * @TODO Необходимо убрать условие с проверкой rootItems.at когда окончательно избавимся от старых моделей.
     */
    private _getLastItem(item: TreeItem): TreeItem {
        const rootItems = this._listViewModel.getChildren(item);
        return rootItems.at ? rootItems.at(rootItems.getCount() - 1) : rootItems[rootItems.length - 1];
    }

    /**
     * Проверяет, нужно ли подгружать данные при скролле для последнего раскрытого узла.
     * Проверяем, что в руте больше нет данных, что шаблон футера узла не задан,
     * последняя запись в списке - узел, и он раскрыт
     * @param direction
     * @param item
     * @param parentKey
     * @private
     */
    private _shouldLoadLastExpandedNodeData(direction: Direction, item: TreeItem, parentKey: CrudEntityKey): boolean {
        // Иногда item это breadcrumbsItemRow, он не TreeItem
        if (!item || !item['[Controls/_display/TreeItem]'] || direction !== 'down') {
            return false;
        }
        const hasMoreParentData = this._sourceController.hasMoreData('down', parentKey);
        const hasNodeFooterTemplate: boolean = !!this._options.nodeFooterTemplate;
        return !hasMoreParentData && !hasNodeFooterTemplate && item.isNode() && item.isExpanded();
    }

    /**
     * Загружает рекурсивно данные последнего раскрытого узла
     * @param item
     * @private
     */
    private _loadNodeChildrenRecursive(item: TreeItem): Promise {
        const nodeKey = item.getContents().getKey();
        const hasMoreData = this._sourceController.hasMoreData('down', nodeKey);
        if (hasMoreData) {
            // Вызов метода, который подгружает дочерние записи узла
            return _private.loadNodeChildren(this, nodeKey);
        } else {
            const lastItem = this._getLastItem(item);
            if (this._shouldLoadLastExpandedNodeData('down', lastItem, nodeKey)) {
                return this._loadNodeChildrenRecursive(lastItem);
            }
            return Promise.resolve();
        }
    }

    /**
     * Метод, вызываемый после срабатывания триггера подгрузки данных
     * TODO Необходимо провести рефакторинг механизма подгрузки данных по задаче
     *  https://online.sbis.ru/opendoc.html?guid=8a5f7598-c7c2-4f3e-905f-9b2430c0b996
     * @param direction
     * @private
     */
    protected _loadMore(direction: Direction): Promise {
        const lastRootItem = this._getLastItem(this._listViewModel.getRoot());
        if (this._shouldLoadLastExpandedNodeData(direction, lastRootItem, this._options.root)) {
            return this._loadNodeChildrenRecursive(lastRootItem);

        } else {
            // Вызов метода подгрузки данных по умолчанию (по сути - loadToDirectionIfNeed).
            return super._loadMore(direction);
        }
    }

    private _updateTreeControlModel(newOptions): void {
        const viewModel = this.getViewModel();

        if (!viewModel) {
            return;
        }

        if (this._options.markedKey !== newOptions.markedKey) {
            if (newOptions.markerMoveMode === 'leaves') {
                this._applyMarkedLeaf(newOptions.markedKey, viewModel, this.getMarkerController());
            }
        }

        // nodeFooterVisibilityCallback нужно проставлять раньше nodeFooterTemplate, т.к.
        // изменение темплейта вызовет пересчет футеров, а в колбэке уже может быть изменено условие,
        // поэтому нужно сперва пересчитаться по актуальному колбэку
        if (newOptions.nodeFooterVisibilityCallback !== this._options.nodeFooterVisibilityCallback) {
            viewModel.setNodeFooterVisibilityCallback(newOptions.nodeFooterVisibilityCallback);
        }

        if (newOptions.nodeFooterTemplate !== this._options.nodeFooterTemplate) {
            viewModel.setNodeFooterTemplate(newOptions.nodeFooterTemplate);
        }

        // TODO: Удалить #rea_1179794968
        if (newOptions.expanderDisplayMode !== this._options.expanderDisplayMode) {
            viewModel.setExpanderDisplayMode(newOptions.expanderDisplayMode);
        }

        if (newOptions.expanderVisibility !== this._options.expanderVisibility) {
            viewModel.setExpanderVisibility(newOptions.expanderVisibility);
        }

        if (newOptions.nodeProperty !== this._options.nodeProperty) {
            viewModel.setNodeProperty(newOptions.nodeProperty);
        }

        if (newOptions.parentProperty !== this._options.parentProperty) {
            viewModel.setParentProperty(newOptions.parentProperty);
        }

        if (newOptions.hasChildrenProperty !== this._options.hasChildrenProperty) {
            viewModel.setHasChildrenProperty(newOptions.hasChildrenProperty);
        }
    }

    protected _beforeUpdate(newOptions: TOptions) {
        super._beforeUpdate(...arguments);

        const viewModel = this.getViewModel();
        const sourceController = this.getSourceController();
        const searchValueChanged = this._options.searchValue !== newOptions.searchValue;
        const isSourceControllerLoading = sourceController && sourceController.isLoading();
        let updateSourceController = false;
        this._plainItemsContainer = newOptions.plainItemsContainer;

        if (typeof newOptions.root !== 'undefined' && this._root !== newOptions.root) {
            this._root = newOptions.root;
            if (this._listViewModel) {
                this._listViewModel.setRoot(this._root);
            }

            if (this._options.itemsSetCallback) {
                const items = sourceController?.getItems() || newOptions.items;
                this._options.itemsSetCallback(items, newOptions);
            }

            // При смене корне, не надо запрашивать все открытые папки,
            // т.к. их может не быть и мы загрузим много лишних данных.
            // Так же учитываем, что вместе со сменой root могут поменять и expandedItems - тогда не надо их сбрасывать.
            if (isEqual(newOptions.expandedItems, this._options.expandedItems)) {
                this._needResetExpandedItems = true;
            }

            const sourceControllerRoot = sourceController?.getState().root;
            if (sourceControllerRoot === undefined || sourceControllerRoot !== newOptions.root) {
                updateSourceController = true;
            }

            if (this.isEditing()) {
                this.cancelEdit();
            }
        }

        this._expandController.updateOptions({
            model: viewModel,
            singleExpand: newOptions.singleExpand,
            collapsedItems: newOptions.collapsedItems
        });

        const currentExpandedItems = this._expandController.getExpandedItems();
        const expandedItemsFromSourceCtrl = sourceController && sourceController.getExpandedItems();
        // expandedItems в sourceController приоритетнее чем наши. Поэтому Если в sourceController
        // нет expandedItems, а у нас есть, значит нужно сбросить раскрытые узлы
        const wasResetExpandedItems = !isSourceControllerLoading &&
            expandedItemsFromSourceCtrl && !expandedItemsFromSourceCtrl.length &&
            currentExpandedItems && currentExpandedItems.length;

        if (wasResetExpandedItems) {
            _private.resetExpandedItems(this);
        } else if (newOptions.expandedItems && !isEqual(newOptions.expandedItems, currentExpandedItems)) {

            if (
                (newOptions.source === this._options.source || newOptions.sourceController) && !isSourceControllerLoading ||
                (searchValueChanged && newOptions.sourceController)
            ) {
                if (viewModel) {
                    // Отключаем загрузку данных контроллером, т.к. все данные уже загружены
                    // нужно только проставить новое состояние в контроллер
                    this._expandController.disableLoader();
                    this._expandController.setExpandedItems(newOptions.expandedItems);
                    this._expandController.enableLoader();

                    const expandedItems = _private.getExpandedItems(
                        this,
                        newOptions,
                        viewModel.getCollection(),
                        newOptions.expandedItems
                    );

                    // Проставляем hasMoreStorage до простановки expandedItems,
                    // чтобы футеры узлов правильно посчитать за один раз
                    viewModel.setHasMoreStorage(_private.prepareHasMoreStorage(sourceController, expandedItems));
                    this._expandController.applyStateToModel();
                }
            } else {
                this._updateExpandedItemsAfterReload = true;
            }

            if (sourceController && !isEqual(newOptions.expandedItems, sourceController.getExpandedItems())) {
                sourceController.setExpandedItems(newOptions.expandedItems);
            }
        }

        if (newOptions.parentProperty !== this._options.parentProperty) {
            updateSourceController = true;
        }

        this._updateTreeControlModel(newOptions);

        if (sourceController) {
            sourceController.setNodeDataMoreLoadCallback(this._nodeDataMoreLoadCallback);

            const sourceControllerState = sourceController.getState();
            if (newOptions.parentProperty && sourceControllerState.parentProperty !== newOptions.parentProperty) {
                Logger.error('TreeControl: для корректной работы опцию parentProperty необходимо задавать на Controls/list:DataContainer (Layout/browsers:Browser)', this);
                updateSourceController = true;
            }
        }
        if (sourceController && updateSourceController) {
            sourceController.updateOptions({...newOptions, keyProperty: this._keyProperty});
        }
    }

    protected _afterRender() {
        super._afterRender(...arguments);
        if (this._scrollToLeaf && !this._scrollToLeafOnDrawItems) {
            this._scrollToLeaf();
            this._scrollToLeaf = null;
        }
    }
    protected _afterUpdate(oldOptions: TOptions) {
        super._afterUpdate(...arguments);

        if (this._expandedItemsToNotify) {
            this._notify('expandedItemsChanged', [this._expandedItemsToNotify]);
            this._expandedItemsToNotify = null;
        }
        if (oldOptions.viewModelConstructor !== this._options.viewModelConstructor) {
            _private.initListViewModelHandler(this, this._listViewModel);
        }
    }

    protected _beforeUnmount(): void {
        this._scrollToLeaf = null;
        this._clearTimeoutForExpandOnDrag();
        if (this.getSourceController()) {
            this.getSourceController().setNodeDataMoreLoadCallback(null);
        }
        super._beforeUnmount(...arguments);
    }

    protected _onDrawItems(): void {
        super._onDrawItems();
        if (this._scrollToLeaf && this._scrollToLeafOnDrawItems) {
            this._scrollToLeaf();
            this._scrollToLeaf = null;
            this._scrollToLeafOnDrawItems = false;
        }
    }

    resetExpandedItems(): void {
        _private.resetExpandedItems(this);
    }

    toggleExpanded(key: TKey): unknown | Promise<unknown> {
        const item = this.getViewModel().getItemBySourceKey(key);
        return _private.toggleExpanded(this, item);
    }

    /**
     * Возвращает признак, была ли выполнена загрузка узла по переданному идентификатору
     * @param {Types/source:CrudEntityKey} nodeKey Идентификатор узла
     */
    isLoadedNode(nodeKey: CrudEntityKey): boolean {
        const sourceController = this.getSourceController();
        return sourceController?.hasLoaded(nodeKey);
    }

    protected _onClickMoreButton(e, dispItem?): void {
        if (dispItem) {
            const nodeKey = dispItem.getContents().getKey();
            _private.loadNodeChildren(this, nodeKey);
        } else {
            super._onClickMoreButton(e);
        }
    }

    private _onExpandedItemsChanged(e, expandedItems): void {
        this._notify('expandedItemsChanged', [expandedItems]);
        this.getSourceController().setExpandedItems(expandedItems);
        // вызываем обновление, так как, если нет биндинга опции, то контрол не обновится.
        // А обновление нужно, чтобы отдать в модель нужные expandedItems
        this._forceUpdate();
    }

    private _onCollapsedItemsChanged(e, collapsedItems) {
        this._notify('collapsedItemsChanged', [collapsedItems]);
        //вызываем обновление, так как, если нет биндинга опции, то контрол не обновится. А обновление нужно, чтобы отдать в модель нужные collapsedItems
        this._forceUpdate();
    }

    protected reload(keepScroll, sourceConfig) {
        //deep reload is needed only if reload was called from public API.
        //otherwise, option changing will work incorrect.
        //option changing may be caused by search or filtering
        this._deepReload = true;
        return super.reload(keepScroll, sourceConfig);
    }

    protected reloadItem(key, readMeta, direction): Promise<unknown> {
        let result;

        if (direction === 'depth') {
            result = _private.reloadItem(this, key);
        } else {
            result = super.reloadItem.apply(this, arguments);
        }

        return result;
    }

    protected _draggingItemMouseMove(itemData: TreeItem, event: SyntheticEvent<MouseEvent>): void {
        super._draggingItemMouseMove(itemData, event);

        const dispItem = itemData;
        const dndListController = this.getDndListController();
        const targetIsNotDraggableItem = dndListController.getDraggableItem()?.getContents() !== dispItem.getContents();
        if (dispItem['[Controls/_display/TreeItem]'] && dispItem.isNode() !== null && targetIsNotDraggableItem) {
            const targetElement = _private.getTargetRow(this, event);
            const mouseOffsetInTargetItem = this._calculateOffset(event, targetElement);
            const dragTargetPosition = dndListController.calculateDragPosition({
                targetItem: dispItem,
                mouseOffsetInTargetItem
            });

            if (dragTargetPosition) {
                const result = this._notify('changeDragTarget', [
                    dndListController.getDragEntity(),
                    dragTargetPosition.dispItem.getContents(),
                    dragTargetPosition.position
                ]);

                if (result !== false) {
                    const changedPosition = dndListController.setDragPosition(dragTargetPosition);
                    if (changedPosition) {
                        this._clearTimeoutForExpandOnDrag();
                        if (
                            !dispItem['[Controls/_tile/mixins/TileItem]'] &&
                            !dispItem.isExpanded() &&
                            targetIsNotDraggableItem && dragTargetPosition.position === 'on'
                        ) {
                            this._startCountDownForExpandNode(dispItem, this._expandNodeOnDrag);
                        }
                    }
                }
            }
        }
    }

    protected _dragLeave(): void {
        super._dragLeave();
        this._clearTimeoutForExpandOnDrag();
    }

    protected _notifyDragEnd(dragObject, targetPosition) {
        this._clearTimeoutForExpandOnDrag();
        return super._notifyDragEnd(dragObject, targetPosition);
    }

    private _expandNodeOnDrag(dispItem: TreeItem<Model>): void {
        _private.toggleExpanded(this, dispItem);
    }

    protected _notifyItemClick([e, item, originalEvent, columnIndex]: [SyntheticEvent, Model, SyntheticEvent, number?], returnExpandResult: boolean /* for tests */) {
        if (originalEvent.target.closest('.js-controls-Tree__row-expander')) {
            e?.stopImmediatePropagation();
            return false;
        }
        const superResult = super._notifyItemClick(...arguments);
        if (e.isStopped()) {
            return;
        }
        if (this.isLoading()) {
            return;
        }
        const eventResult = superResult;

        if (eventResult !== false && this._options.expandByItemClick && item.get(this._options.nodeProperty) !== null) {
            const display = this._listViewModel;
            const dispItem = display.getItemBySourceItem(item);

            // Если в проекции нет такого элемента, по которому произошел клик, то это хлебная крошка, а не запись.
            // После исправления ошибки событие itemClick не будет стрелять при клике на крошку.
            // https://online.sbis.ru/opendoc.html?guid=4017725f-9e22-41b9-adab-0d79ad13fdc9
            if (dispItem && (
                (eventResult !== false && this._options.expandByItemClick && dispItem.isNode() !== null) ||
                dispItem.GroupNodeItem)) {
                const expandResult = _private.toggleExpanded(this, dispItem);

                if (returnExpandResult) {
                    return expandResult;
                }
            }
        }
        return eventResult;
    }

    protected _itemMouseDown(event, itemData, domEvent) {
        if (domEvent.target.closest('.js-controls-Tree__row-expander')) {
            event.stopImmediatePropagation();
            this._onExpanderMouseDown(domEvent.nativeEvent, itemData.key);
        } else {
            super._itemMouseDown(event, itemData, domEvent);
        }
    }

    protected _itemMouseUp(e, itemData, domEvent): void {
        if (domEvent.target.closest('.js-controls-Tree__row-expander')) {
            e.stopImmediatePropagation();
            this._onExpanderMouseUp(domEvent.nativeEvent, itemData.key, itemData);
        } else {
            super._itemMouseUp(e, itemData, domEvent);
        }
    }

    private _onExpanderMouseDown(nativeEvent: MouseEvent, key: TKey): void {
        if (this.isLoading()) {
            return;
        }

        if (MouseUp.isButton(nativeEvent, MouseButtons.Left)) {
            this._mouseDownExpanderKey = key;
        }
    }

    private _onExpanderMouseUp(nativeEvent: MouseEvent, key: TKey, itemData: { dispItem: CollectionItem }): void {
        if (this.isLoading()) {
            return;
        }

        if (this._mouseDownExpanderKey === key && MouseUp.isButton(nativeEvent, MouseButtons.Left)) {
            _private.toggleExpanded(this, itemData);

            if (this._options.markItemByExpanderClick) {
                this.setMarkedKey(key);
            }
        }

        this._mouseDownExpanderKey = undefined;
    }

    _onViewKeyDown(event): void {
        if (this._listViewModel.SupportExpand !== false) {
            this._onTreeViewKeyDown(event);
        }
        if (!event.stopped && event._bubbling !== false) {
            super._onViewKeyDown(event);
        }
    }

    _onTreeViewKeyDown(event) {
        EventUtils.keysHandler(event, HOT_KEYS, _private, this);
    }

    protected _afterReloadCallback(options: TOptions, loadedList?: RecordSet) {
        if (this._listViewModel) {
            const modelRoot = this._listViewModel.getRoot();
            const root = this._options.root !== undefined ? this._options.root : this._root;
            const viewModelRoot = modelRoot ? modelRoot.getContents() : root;

            // Всегда нужно пересчитывать hasMoreStorage, т.к. даже если нет загруженных элементов или не deepReload,
            // то мы должны сбросить hasMoreStorage
            const sourceController = this.getSourceController();
            const expandedItems = _private.getExpandedItems(
                this, options, loadedList,
                this._updateExpandedItemsAfterReload
                    ? options.expandedItems
                    : this._expandController.getExpandedItems()
            );
            if (sourceController) {
                // Вызываем метод с флагом reBuildNodeFooters, т.к. после перезагрузки не будет события с добавлением
                // элементов и футеры без флага не посчитаются
                this._listViewModel.setHasMoreStorage(_private.prepareHasMoreStorage(sourceController, expandedItems), true);
            }

            if (this._updateExpandedItemsAfterReload) {
                this._expandController.disableLoader();
                this._expandController.setExpandedItems(options.expandedItems);
                this._expandController.applyStateToModel();
                this._expandController.enableLoader();

                this._updateExpandedItemsAfterReload = false;
            }

            if (this._needResetExpandedItems) {
                _private.resetExpandedItems(this);
                this._needResetExpandedItems = false;
            }

            if (viewModelRoot !== root) {
                this._listViewModel.setRoot(root);
            }
        }
        // reset deepReload after loading data (see reload method or constructor)
        this._deepReload = false;
    }

    protected _afterItemsSet(options): void {
        super._afterItemsSet.apply(this, arguments);
        if (options.markerMoveMode === 'leaves') {
            this.setMarkerOnFirstLeaf(options, options.markedKey);
        }
    }
    protected _afterCollectionReset(): void {
        super._afterCollectionReset.apply(this, arguments);
        if (this._options.markerMoveMode === 'leaves') {
            this.setMarkerOnFirstLeaf(this._options);
        }
    }
    protected _afterCollectionRemove(removedItems: Array<CollectionItem<Model>>, removedItemsIndex: number): void {
        super._afterCollectionRemove(removedItems, removedItemsIndex);
        if (this._options.expandedItems?.length || this._options.collapsedItems?.length) {
            // обрабатываем только узлы
            const items = removedItems.filter((it) => it['[Controls/_display/TreeItem]'] && it.isNode() !== null);
            let removedKeys = items.map((it) => it.getContents().getKey());
            // отфильтровываем скрытые записи
            removedKeys = removedKeys.filter((it) => !this._items.getRecordById(it));

            if (this._options.expandedItems?.length) {
                const newExpandedItems = this._options.expandedItems.slice();
                removedKeys.forEach((it) => {
                    const expandedItemsIndex = newExpandedItems.indexOf(it);
                    if (expandedItemsIndex !== -1) {
                        newExpandedItems.splice(expandedItemsIndex, 1);
                    }
                });

                if (!isEqual(newExpandedItems, this._options.expandedItems)) {
                    this._expandController.setExpandedItems(newExpandedItems);
                    this.getSourceController().setExpandedItems(newExpandedItems);

                    this._notify('expandedItemsChanged', [newExpandedItems]);
                }
            }
            if (this._options.collapsedItems?.length) {
                const newCollapsedItems = this._options.collapsedItems.slice();
                removedKeys.forEach((it) => {
                    const collapsedItemsIndex = newCollapsedItems.indexOf(it);
                    if (collapsedItemsIndex !== -1) {
                        newCollapsedItems.splice(collapsedItemsIndex, 1);
                    }
                });

                if (!isEqual(newCollapsedItems, this._options.collapsedItems)) {
                    this._expandController.setCollapsedItems(newCollapsedItems);

                    this._notify('collapsedItemsChanged', [newCollapsedItems]);
                }
            }
        }
    }

    private setMarkerOnFirstLeaf(options, startKey) {
        const markerController = this.getMarkerController();
        const model = this._listViewModel;
        const list = model.getCollection();
        const current = list.getRecordById(startKey) || list.at(0);
        if (current) {
            if (current.get(this._options.nodeProperty) !== null) {
                this._tempItem = current.getKey();
                this._currentItem = this._tempItem;
                this._doAfterItemExpanded = (itemKey) => {
                    this._doAfterItemExpanded = null;
                    this._applyMarkedLeaf(itemKey, model, markerController);
                };
                const eventResult = this._notify('beforeItemExpand', [current]);
                if (eventResult instanceof Promise) {
                        eventResult.then(() => {
                            this._expandedItemsToNotify = this._expandToFirstLeaf(this._tempItem, list, options);
                        });
                } else {
                    this._expandedItemsToNotify = this._expandToFirstLeaf(this._tempItem, list, options);
                }
            } else {
                this._applyMarkedLeaf(current.getKey(), model, markerController);
            }
        }
    }
    private _startCountDownForExpandNode(item: TreeItem<Model>, expandNode: Function): void {
        if (!this._itemOnWhichStartCountDown && item.isNode()) {
            this._itemOnWhichStartCountDown = item;
            this._setTimeoutForExpandOnDrag(item, expandNode);
        }
    }

    private _clearTimeoutForExpandOnDrag(): void {
        if (this._timeoutForExpandOnDrag) {
            clearTimeout(this._timeoutForExpandOnDrag);
            this._timeoutForExpandOnDrag = null;
            this._itemOnWhichStartCountDown = null;
        }
    }

    private _setTimeoutForExpandOnDrag(item: TreeItem<Model>, expandNode: Function): void {
        this._timeoutForExpandOnDrag = setTimeout(() => {
            expandNode(item);
        }, EXPAND_ON_DRAG_DELAY);
    }

    private _calculateOffset(event: SyntheticEvent<MouseEvent>, targetElement: Element): {top: number, bottom: number} {
        let result = null;

        if (targetElement) {
            const dragTargetRect = targetElement.getBoundingClientRect();

            result = { top: null, bottom: null };

            // В плитке порядок записей слева направо, а не сверху вниз, поэтому считаем отступы слева и справа
            if (this._listViewModel['[Controls/_tile/Tile]']) {
                result.top = (event.nativeEvent.pageX - dragTargetRect.left) / dragTargetRect.width;
                result.bottom = (dragTargetRect.right - event.nativeEvent.pageX) / dragTargetRect.width;
            } else {
                result.top = (event.nativeEvent.pageY - dragTargetRect.top) / dragTargetRect.height;
                result.bottom = (dragTargetRect.top + dragTargetRect.height - event.nativeEvent.pageY) / dragTargetRect.height;
            }
        }

        return result;
    }

    // раскрытие узлов будет отрефакторено по задаче https://online.sbis.ru/opendoc.html?guid=2a2d9bc6-86e0-43fa-9bea-b636c45c0767
    _keyDownHandler(event): boolean {
        if (this._options.markerMoveMode === 'leaves') {
            switch (event.nativeEvent.keyCode) {
                case constants.key.up:
                    this.goToPrev();
                    return false;
                case constants.key.down:
                    this.goToNext();
                    return false;
            }
        }
    }

    private _expandToFirstLeaf(key: CrudEntityKey, items, options): CrudEntityKey[] {
        if (items.getCount()) {
            const model = this._listViewModel;
            const expanded = [key];
            const item = model.getItemBySourceKey(key);
            // TODO после полного перехода на новую модель в getChildren передавать только элемент списка
            //  https://online.sbis.ru/opendoc.html?guid=624e1380-3b9b-45dd-9825-a7188dd7c52e
            let curItem = model.getChildrenByRecordSet(item.getContents())[0];
            while (curItem && curItem.get(options.nodeProperty) !== null) {
                expanded.push(curItem.getKey());
                curItem = model.getChildrenByRecordSet(curItem)[0];
            }
            if (curItem && this._doAfterItemExpanded) {
                this._doAfterItemExpanded(curItem.getKey());
            }
            return expanded;
        }
    }

    private _getMarkedLeaf(key: CrudEntityKey, model): 'first' | 'last' | 'middle' | 'single' {
        const index = model.getIndexByKey(key);
        const hasNextLeaf = !model.isLastItem(model.getItemBySourceKey(key)) || model.hasMoreData();
        let hasPrevLeaf = false;
        for (let i = index - 1; i >= 0; i--) {
            if (model.at(i).isNode() === null || !this._isExpanded(model.at(i).getContents())) {
                hasPrevLeaf = true;
                break;
            }
        }
        if (hasNextLeaf && hasPrevLeaf) {
            return 'middle';
        }
        if (!hasNextLeaf && !hasPrevLeaf) {
            return 'single';
        }
        if (!hasNextLeaf && hasPrevLeaf) {
            return 'last';
        }
        if (hasNextLeaf && !hasPrevLeaf) {
            return 'first';
        }
    }
    goToNext(listModel?, mController?): Promise {
        return new Promise((resolve) => {
            // Это исправляет ошибку плана 0 || null
            const key = this._tempItem === undefined || this._tempItem === null ? this._currentItem : this._tempItem;
            const model = listModel || this._listViewModel;
            const goToNextItem = () => {
                const item = this.getNextItem(key, model);
                const markerController = mController || this.getMarkerController();
                if (item) {
                    this._tempItem = item.getKey();
                    const dispItem = model.getItemBySourceKey(this._tempItem);
                    if (item.get(this._options.nodeProperty) !== null) {
                        this._doAfterItemExpanded = () => {
                            this._doAfterItemExpanded = null;
                            this.goToNext(model, markerController);
                        };
                        if (this._isExpanded(item)) {
                            this._doAfterItemExpanded();
                            resolve();
                        } else {
                            this._scrollToLeafOnDrawItems = true;
                            const expandResult = this.toggleExpanded(this._tempItem, model);
                            if (expandResult instanceof Promise) {
                                expandResult.then(() => {
                                    resolve();
                                });
                            } else {
                                resolve();
                            }
                        }
                    } else {
                        const itemKey = this._tempItem;
                        this._applyMarkedLeaf(this._tempItem, model, markerController);
                        this._scrollToLeaf = () => {
                            this.scrollToItem(itemKey, true);
                        };
                        resolve();
                    }
                } else {
                    this._tempItem = null;
                    resolve();
                }
            };

            if (model.isLastItem(model.getItemBySourceKey(key))) {
                this._shiftToDirection('down').then(goToNextItem);
            } else {
                goToNextItem();
            }
        });
    }

    goToPrev(listModel?, mController?): Promise {
        return new Promise((resolve) => {
            const item = this.getPrevItem(this._tempItem || this._currentItem, listModel);
            const model = listModel || this._listViewModel;
            const markerController = mController || this.getMarkerController();
            if (item) {
                const itemKey = item.getKey();
                const dispItem = model.getItemBySourceKey(item.getKey());
                if (item.get(this._options.nodeProperty) !== null) {
                    this._doAfterItemExpanded = () => {
                        this._doAfterItemExpanded = null;
                        this.goToPrev(model, markerController);
                    };
                    if (this._isExpanded(item)) {
                        this._tempItem = itemKey;
                        this._doAfterItemExpanded();
                        resolve();
                    } else {
                        this._goToNextAfterExpand = false;
                        this._scrollToLeafOnDrawItems = true;
                        const expandResult = this.toggleExpanded(itemKey);
                        if (expandResult instanceof Promise) {
                            expandResult.then(() => {
                                this._expandToFirstLeaf(itemKey, model.getCollection(), this._options);
                                resolve();
                            });
                        } else {
                            this._expandToFirstLeaf(itemKey, model.getCollection(), this._options);
                            resolve();
                        }
                    }
                } else {
                    this._tempItem = itemKey;
                    this._applyMarkedLeaf(this._tempItem, model, markerController);
                    this._scrollToLeaf = () => {
                        this.scrollToItem(itemKey, false);
                    };
                    resolve();
                }
            } else {
                this._tempItem = null;
                resolve();
            }
        });
    }

    private _applyMarkedLeaf(key: CrudEntityKey, model, markerController): void {
        this._currentItem = key;
        const newMarkedLeaf = this._getMarkedLeaf(this._currentItem, model);
        if (this._markedLeaf !== newMarkedLeaf) {
            if (this._options.markedLeafChangeCallback) {
                this._options.markedLeafChangeCallback(newMarkedLeaf);
            }
            this._markedLeaf = newMarkedLeaf;
        }

        if (this._isMounted) {
            this._changeMarkedKey(this._currentItem);
        } else {
            markerController.setMarkedKey(this._currentItem);
        }

        this._tempItem = null;
        this._goToNextAfterExpand = true;
    }

    protected _changeMarkedKey(newMarkedKey: CrudEntityKey, shouldFireEvent: boolean = false): Promise<CrudEntityKey> | CrudEntityKey {
        const item = this.getViewModel().getItemBySourceKey(newMarkedKey);
        if (this._options.markerMoveMode === 'leaves' && (item && item.isNode() !== null)) {
            return;
        }

        return super._changeMarkedKey(newMarkedKey, shouldFireEvent);
    }

    getNextItem(key: CrudEntityKey, model?): Model {
        const listModel = model || this._listViewModel;
        const nextItem = listModel.getNextInRecordSetProjection(key, this._expandController.getExpandedItems());
        return nextItem || null;
    }

    getPrevItem(key: CrudEntityKey, model?): Model {
        const listModel = model || this._listViewModel;
        const prevItem = listModel.getPrevInRecordSetProjection(key, this._expandController.getExpandedItems());
        return prevItem || null;
    }

    private _isExpanded(item: Model): boolean {
        return this._expandController.isItemExpanded(item.getKey());
    }

    protected _getFooterClasses(options): string {
        let result = super._getFooterClasses(options);

        if (this._listViewModel && this._listViewModel['[Controls/_display/Tree]']) {
            const expanderVisibility = this._listViewModel.getExpanderVisibility();
            const expanderPosition = options.expanderPosition || 'default';
            const hasExpander = expanderPosition === 'default'
                && this._listViewModel.getExpanderIcon() !== 'none'
                && (expanderVisibility === 'hasChildren' && this._listViewModel.hasNodeWithChildren()
                || expanderVisibility !== 'hasChildren' && this._listViewModel.hasNode());
            if (hasExpander) {
                result += ` controls-TreeGridView__footer__expanderPadding-${options.expanderSize || 'default'}`;
            }
        }

        return result;
    }

    protected _getSiblingsStrategy(): ISiblingStrategy {
        return new TreeSiblingStrategy({
            collection: this._listViewModel
        });
    }

    /**
     * Ф-ия, которая дёргается expandController'ом при раскрытии узла
     */
    private _expandLoader(nodeKey: TKey): void | Promise<RecordSet | void> {
        const listViewModel = this.getViewModel();
        const baseSourceController = this.getSourceController();
        const dispItem = listViewModel.getItemBySourceKey(nodeKey);

        if (
            dispItem?.isRoot() ||
            baseSourceController?.hasLoaded(nodeKey) ||
            !_private.shouldLoadChildren(this, nodeKey) ||
            _private.isExpandAll(this._expandController.getExpandedItems())
        ) {
            return;
        }

        this.showIndicator();
        return baseSourceController
            .load(undefined, nodeKey)
            .then((list) => {
                this.hideIndicator();
                return list as RecordSet;
            })
            .catch((error: Error) => {
                if (error.isCanceled) {
                    return;
                }

                this._onDataError({ error });
                this.hideIndicator();

                throw error;
            });
    }

    protected _nodeDataMoreLoadCallback(): void {
        // пересчитываем hasMoreStorage до того, как элементы засетятся в модель,
        // чтобы в модели был только один пересчет элементов
        const expandedItems = _private.getExpandedItems(
            this, this._options, this._listViewModel.getCollection(), this._listViewModel.getExpandedItems()
        );
        this._listViewModel.setHasMoreStorage(_private.prepareHasMoreStorage(this.getSourceController(), expandedItems));
    }

    static getDefaultOptions() {
        return {
            ...BaseControl.getDefaultOptions(),
            filter: {},
            markItemByExpanderClick: true,
            expandByItemClick: false,
            root: null,
            columns: DEFAULT_COLUMNS_VALUE,
            selectDescendants: true,
            selectAncestors: true,
            expanderPosition: 'default',
            selectionType: 'all',
            markerMoveMode: 'all'
        };
    }
}

Object.defineProperty(TreeControl, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return TreeControl.getDefaultOptions();
   }
});

TreeControl._private = _private;

export default TreeControl;

/**
 * @event Событие контрола.
 * @name Controls/_tree/TreeControl#expandedItemsChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Array.<Number|String>} expandedItems Массив с идентификаторами развернутых элементов.
 */
