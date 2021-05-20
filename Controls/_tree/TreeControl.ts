import cClone = require('Core/core-clone');

import { SyntheticEvent } from 'UI/Vdom';
import { TemplateFunction } from "UI/Base";
import { EventUtils } from 'UI/Events';

import { constants } from 'Env/Env';

import { CrudEntityKey } from 'Types/source';
import { isEqual } from 'Types/object';
import { RecordSet } from 'Types/collection';
import { Model } from 'Types/entity';

import {Direction, IHierarchyOptions, TKey} from 'Controls/interface';
import { BaseControl, IBaseControlOptions } from 'Controls/list';
import {Collection, Tree, TreeItem} from 'Controls/display';
import { selectionToRecord } from 'Controls/operations';
import { NewSourceController } from 'Controls/dataSource';
import { MouseButtons, MouseUp } from 'Controls/popup';
import 'css!Controls/list';
import 'css!Controls/itemActions';
import 'css!Controls/CommonClasses';
import 'css!Controls/treeGrid';

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
}

const _private = {
    toggleExpandedOnNewModel(self: TreeControl, options: any, model: Tree<Model>, item: TreeItem<Model>): void {
        const newExpandedState = !item.isExpanded();
        const itemKey = item.getContents().getKey();

        // при работе с SourceController expandedItems всегда приходят из SourceController.
        // Единственный достоверный способ получить их актуальное состояние - запросить их оттуда.
        // Это покрывает кейс, когда в одном цикле синхронизации подряд вызывают toggleExpanded(),
        // результат первого doExpand не запишется в модель и второй его перетрёт.
        const sourceExpandedItems = self.getSourceController().getExpandedItems();
        let newExpandedItems: CrudEntityKey[];
        if (sourceExpandedItems && sourceExpandedItems instanceof Array) {
            newExpandedItems = [...sourceExpandedItems];

        } else if (options.expandedItems instanceof Array) {
            newExpandedItems = [...options.expandedItems];

        } else {
            newExpandedItems = [...model.getExpandedItems()];
        }

        const newCollapsedItems = options.collapsedItems instanceof Array ? [...options.collapsedItems] : [...model.getCollapsedItems()];

        if (newExpandedState) {
            // развернули узел

            if (options.singleExpand) {
                for (let i = 0; i < newExpandedItems.length; i++) {
                    const it = model.getItemBySourceKey(newExpandedItems[i]);
                    if (it && it.getLevel() === item.getLevel()) {
                        newCollapsedItems.push(newExpandedItems.shift());
                    }
                }
            }

            if (newCollapsedItems.includes(itemKey)) {
                newCollapsedItems.splice(newCollapsedItems.indexOf(itemKey), 1);
            } else if (!newExpandedItems.includes(itemKey)) {
                newExpandedItems.push(itemKey);
            }
        } else {
            // свернули узел

            if (newExpandedItems.includes(itemKey)) {
                newExpandedItems.splice(newExpandedItems.indexOf(itemKey), 1);
            } else if (!newCollapsedItems.includes(itemKey)) {
                newCollapsedItems.push(itemKey);
            }

            const collapseChilds = (parent) => {
                if (!parent) {
                    return;
                }
                const childsOfCollapsedItem = model.getChildren(parent);
                childsOfCollapsedItem.forEach((it) => {
                    if (!it['[Controls/_display/TreeItem]'] || it.isNode() === null || !it.isExpanded()) {
                        return;
                    }

                    const key = it.getContents().getKey();
                    if (newExpandedItems.includes(key)) {
                        newExpandedItems.splice(newExpandedItems.indexOf(key), 1);
                    } else if (!newCollapsedItems.includes(key)) {
                        newCollapsedItems.push(key);
                    }
                    collapseChilds(it);
                });
            };

            // удаляем из expandedItems ключи детей свернутого узла
            const collapsedNode = model.getItemBySourceKey(itemKey);
            collapseChilds(collapsedNode);
        }

        if (options.singleExpand) {
            model.each((it) => {
                if (it !== item && it.getLevel() === item.getLevel()) {
                    it.setExpanded(false, true);
                }
            });
        }

        // проставляем hasMoreStorage до простановки expandedItems, чтобы футеры узлов правильно посчитать за один раз
        model.setHasMoreStorage(
            _private.prepareHasMoreStorage(self.getSourceController(), newExpandedItems)
        );

        if (!options.expandedItems || options.markerMoveMode === 'leaves') {
            model.setExpandedItems(newExpandedItems);
            self.getSourceController().setExpandedItems(newExpandedItems);
        }

        if (!options.collapsedItems) {
            model.setCollapsedItems(newCollapsedItems);
        }

        self._notify('expandedItemsChanged', [newExpandedItems]);
        self._notify('collapsedItemsChanged', [newCollapsedItems]);
    },

    toggleExpandedOnModel(self: TreeControl, listViewModel, dispItem, expanded) {
        if (self._options.useNewModel) {
            // TODO нужно зарефакторить логику работы с expanded/collapsed, написав единию логику в контроллере
            //  https://online.sbis.ru/opendoc.html?guid=5d8d38d0-3ade-4393-bced-5d7fbd1ca40b
            _private.toggleExpandedOnNewModel(self, self._options, listViewModel, dispItem);
        } else {
            listViewModel.toggleExpanded(dispItem, expanded);
            listViewModel.setHasMoreStorage(
                _private.prepareHasMoreStorage(self.getSourceController(), listViewModel.getExpandedItems())
            );
        }

        self._notify(expanded ? 'afterItemExpand' : 'afterItemCollapse', [dispItem.getContents()]);
        // todo: удалить события itemExpanded и itemCollapsed в 20.2000.
        self._notify(expanded ? 'itemExpanded' : 'itemCollapsed', [dispItem.getContents()]);
    },

    expandMarkedItem(self: TreeControl): void {
        const markerController = self._markerController;
        if (markerController && markerController.getMarkedKey() !== null) {
            const markedItem = self._listViewModel.getItemBySourceKey(markerController.getMarkedKey());
            if (markedItem && markedItem.isNode() !== null && !markedItem.isExpanded()) {
                self.toggleExpanded(markerController.getMarkedKey());
            }
        }
    },

    collapseMarkedItem(self: TreeControl): void {
        const markerController = self._markerController;
        if (markerController && markerController.getMarkedKey() !== null) {
            const markedItem = self._listViewModel.getItemBySourceKey(markerController.getMarkedKey());
            if (markedItem && markedItem.isNode() !== null && markedItem.isExpanded()) {
                self.toggleExpanded(markerController.getMarkedKey());
            }
        }
    },

    toggleExpanded(self: TreeControl, dispItem, model?): Promise<any>|any {
        const listViewModel = model || self._listViewModel;
        const item = dispItem.getContents();
        const nodeKey = item.getId();
        const baseSourceController = self.getSourceController();
        const expanded = self._options.useNewModel ? !dispItem.isExpanded() : !listViewModel.isExpanded(dispItem);
        const options = self._options;

        // Если вызвали разворот узла, то сбрасывать развернутые узлы уже точно не нужно
        self._needResetExpandedItems = false;

        const eventResult = self._notify(expanded ? 'beforeItemExpand' : 'beforeItemCollapse', [dispItem.getContents()]);

        const expandToFirstLeafIfNeed = () => {
            // Если узел сворачивается - автоматически высчитывать следующий разворачиваемый элемент не требуется.
            // Ошибка: https://online.sbis.ru/opendoc.html?guid=98762b51-6b69-4612-9468-1c38adaa2606
            if (options.markerMoveMode === 'leaves' && expanded !== false && self._goToNextAfterExpand) {
                self._tempItem = nodeKey;
                return self.goToNext();
            }
        };

        function doExpand() {

            // todo: удалить события itemExpand и itemCollapse в 20.2000.
            self._notify(expanded ? 'itemExpand' : 'itemCollapse', [item]);
            if (
                !_private.isExpandAll(self._options.expandedItems) &&
                !baseSourceController?.hasLoaded(nodeKey) &&
                !dispItem.isRoot() &&
                _private.shouldLoadChildren(self, nodeKey)
            ) {
                self.showIndicator();
                return baseSourceController
                    .load(undefined, nodeKey)
                    .then((list) => {
                        _private.toggleExpandedOnModel(self, listViewModel, dispItem, expanded);
                        if (options.nodeLoadCallback) {
                            options.nodeLoadCallback(list, nodeKey);
                        }
                        self.hideIndicator();
                    })
                    .catch((error: Error) => {
                        if (error.isCanceled) {
                            return;
                        }
                        self._onDataError({ error });
                        // Вернуть элемент модели в предыдущее состояние, т.к. раскрытие не состоялось.
                        _private.toggleExpandedOnModel(self, listViewModel, dispItem, !expanded);
                        self.hideIndicator();
                        return error;
                    });
            } else {

                // Если сворачивается узел, внутри которого запущено редактирование, то его следует закрыть
                let shouldCancelEditing = false;
                if (self._editingItem) {
                    shouldCancelEditing = _private.hasInParents(
                        self._options.useNewModel ? listViewModel : listViewModel.getDisplay(),
                        self._editingItem.getContents().getKey(),
                        dispItem.contents.getKey()
                    );
                }

                // TODO: Переписать
                //  https://online.sbis.ru/opendoc.html?guid=974ac162-4ee4-48b5-a2b7-4ff75dccb49c
                if (shouldCancelEditing) {
                    return self.cancelEdit().then((result) => {
                        if (!(result && result.canceled)) {
                            _private.toggleExpandedOnModel(self, listViewModel, dispItem, expanded);
                        }
                        return result;
                    });
                } else {
                    _private.toggleExpandedOnModel(self, listViewModel, dispItem, expanded);

                    return Promise.resolve();
                }
            }
        }

        if (eventResult instanceof Promise) {
            self.showIndicator('all');
            return eventResult.then(() => {
                self.hideIndicator();
                return doExpand().then(expandToFirstLeafIfNeed);
            }, () => {
                self.hideIndicator();
            });
        } else {
            return doExpand().then(expandToFirstLeafIfNeed);
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
        // не нужно загружать узел, если уже все записи есть в рекордсете
        const isAlreadyLoaded = (sourceController ? sourceController.hasLoaded(nodeKey) : !!self._options.items)
            || !!viewModel.getChildrenByRecordSet(nodeKey).length;

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
                const expandedItems = _private.getExpandedItems(
                    self, self._options, self._listViewModel.getCollection(), self._listViewModel.getExpandedItems()
                );

                // В этом случае нужно обязательно пересчитать футеры узлов, т.к. expandedItems не изменился
                // и никто не вызовет пересчет, но футеры могут измениться
                self._listViewModel.setHasMoreStorage(_private.prepareHasMoreStorage(sourceController, expandedItems), true);
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

    isExpandAll(expandedItems) {
        return expandedItems instanceof Array && expandedItems[0] === null;
    },



    resetExpandedItems(self: TreeControl): void {
        const viewModel = self._listViewModel;
        if (!viewModel) {
            return;
        }

        let shouldCancelEditing = false;
        if (self._editingItem) {
            const editingKey = self._editingItem.getContents().getKey();
            viewModel.getExpandedItems().forEach((itemKey) => {
                shouldCancelEditing = shouldCancelEditing || _private.hasInParents(
                    self._options.useNewModel ? viewModel : viewModel.getDisplay(),
                    editingKey,
                    itemKey
                );
            });
        }

        const reset = () => {
            const isAllExpanded = self._options.expandedItems instanceof Array && self._options.expandedItems[0] === null;
            viewModel.setHasMoreStorage({});
            if (!isAllExpanded) {
                if (self._options.useNewModel) {
                    viewModel.setExpandedItems([]);
                    self._notify('expandedItemsChanged', [[]]);

                    viewModel.setCollapsedItems([]);
                    self._notify('collapsedItemsChanged', [[]]);
                } else {
                    viewModel.resetExpandedItems();
                }
            }
        };

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
        var items = self._options.useNewModel ? viewModel.getCollection() : viewModel.getItems();
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

    getExpandedItems(self: TreeControl, options: ITreeControlOptions, items: RecordSet, expandedItems: CrudEntityKey[]): TKey[] {
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

    constructor(options: TOptions) {
        super(options);
        this._expandNodeOnDrag = this._expandNodeOnDrag.bind(this);
        if (typeof options.root !== 'undefined') {
            this._root = options.root;
        }
        if (options.expandedItems && options.expandedItems.length > 0) {
            this._deepReload = true;
        }
    }

    protected _beforeMount(...args: [TOptions, object]): void {
        const superResult = super._beforeMount(...args);
        const doBeforeMount = () => {
            const options = args[0];
            this._plainItemsContainer = options.plainItemsContainer;
            if (options.sourceController) {
                // FIXME для совместимости, т.к. сейчас люди задают опции, которые требуетюся для запроса
                //  и на списке и на Browser'e
                const sourceControllerState = options.sourceController.getState();

                if (options.parentProperty && sourceControllerState.parentProperty !== options.parentProperty ||
                    options.root !== undefined && options.root !== sourceControllerState.root) {
                    options.sourceController.updateOptions({...options, keyProperty: this._keyProperty});
                }
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

        if (newOptions.collapsedItems && !isEqual(newOptions.collapsedItems, viewModel.getCollapsedItems())) {
            viewModel.setCollapsedItems(newOptions.collapsedItems);
        }

        if (this._options.markedKey !== newOptions.markedKey) {
            if (newOptions.markerMoveMode === 'leaves') {
                this._applyMarkedLeaf(newOptions.markedKey, viewModel, this.getMarkerController());
            }
        }

        if (newOptions.nodeFooterTemplate !== this._options.nodeFooterTemplate) {
            viewModel.setNodeFooterTemplate(newOptions.nodeFooterTemplate);
        }

        if (newOptions.nodeFooterVisibilityCallback !== this._options.nodeFooterVisibilityCallback) {
            viewModel.setNodeFooterVisibilityCallback(newOptions.nodeFooterVisibilityCallback);
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

        // todo [useNewModel] viewModel.getExpandedItems() нужен, т.к. для старой модели установка expandedItems
        // сделана некорректно. Как откажемся от неё, то можно использовать стандартное сравнение опций.
        const currentExpandedItems = viewModel ? viewModel.getExpandedItems() : this._options.expandedItems;
        const expandedItemsFromSourceCtrl = sourceController && sourceController.getExpandedItems();
        const wasResetExpandedItems = expandedItemsFromSourceCtrl && !expandedItemsFromSourceCtrl.length
            && currentExpandedItems && currentExpandedItems.length;
        if (wasResetExpandedItems) {
            _private.resetExpandedItems(this);
        } else if (newOptions.expandedItems && !isEqual(newOptions.expandedItems, currentExpandedItems)) {
            if ((newOptions.source === this._options.source || newOptions.sourceController) && !isSourceControllerLoading ||
                (searchValueChanged && newOptions.sourceController)) {
                if (viewModel) {
                    const expandedItems = _private.getExpandedItems(this, newOptions, viewModel.getCollection(), newOptions.expandedItems);
                    viewModel.setHasMoreStorage(_private.prepareHasMoreStorage(sourceController, expandedItems));
                    viewModel.setExpandedItems(newOptions.expandedItems);
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
            const sourceControllerState = sourceController.getState();
            if (newOptions.parentProperty && sourceControllerState.parentProperty !== newOptions.parentProperty) {
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

    public resetExpandedItems(): void {
        _private.resetExpandedItems(this);
    }

    public toggleExpanded(key, model?) {
        const listModel = model || this._listViewModel;
        const item = listModel.getItemBySourceKey(key);
        return _private.toggleExpanded(this, item, model);
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

    protected _notifyDraggingItemMouseMove(itemData, nativeEvent): void {
        const dispItem = this._options.useNewModel ? itemData : itemData.dispItem;
        const dndListController = this.getDndListController();
        const targetIsNotDraggableItem = dndListController.getDraggableItem()?.getContents() !== dispItem.getContents();
        if (dispItem['[Controls/_display/TreeItem]'] && dispItem.isNode() !== null && targetIsNotDraggableItem) {
            const targetElement = _private.getTargetRow(this, nativeEvent);
            const mouseOffsetInTargetItem = this._calculateOffset(nativeEvent, targetElement);
            const dragTargetPosition = dndListController.calculateDragPosition({
                targetItem: dispItem,
                mouseOffsetInTargetItem
            });

            if (dragTargetPosition) {
                const result = this._notify('changeDragTarget', [dndListController.getDragEntity(), dragTargetPosition.dispItem.getContents(), dragTargetPosition.position]);
                if (result !== false) {
                    const changedPosition = dndListController.setDragPosition(dragTargetPosition);
                    if (changedPosition) {
                        this._clearTimeoutForExpandOnDrag();
                        if (!dispItem['[Controls/_tile/mixins/TileItem]'] && !dispItem.isExpanded() && targetIsNotDraggableItem && dragTargetPosition.position === 'on') {
                            this._startCountDownForExpandNode(dispItem, this._expandNodeOnDrag);
                        }
                    }
                }
            }
        }
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
            const display = this._options.useNewModel ? this._listViewModel : this._listViewModel.getDisplay();
            const dispItem = display.getItemBySourceItem(item);

            // Если в проекции нет такого элемента, по которому произошел клик, то это хлебная крошка, а не запись.
            // После исправления ошибки событие itemClick не будет стрелять при клике на крошку.
            // https://online.sbis.ru/opendoc.html?guid=4017725f-9e22-41b9-adab-0d79ad13fdc9
            if (dispItem && (
                (eventResult !== false && this._options.expandByItemClick && dispItem.isNode() !== null) ||
                dispItem.isGroupNode())) {
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

    private _onExpanderMouseDown(nativeEvent, key) {
        if (this.isLoading()) {
            return;
        }
        if (MouseUp.isButton(nativeEvent, MouseButtons.Left)) {
            this._mouseDownExpanderKey = key;
        }
    }

    private _onExpanderMouseUp(nativeEvent, key, itemData) {
        if (this.isLoading()) {
            return;
        }
        if (this._mouseDownExpanderKey === key && MouseUp.isButton(nativeEvent, MouseButtons.Left)) {
            const dispItem = this._options.useNewModel ? itemData : itemData.dispItem;
            _private.toggleExpanded(this, dispItem);
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
            const expandedItems = _private.getExpandedItems(this, options, loadedList, this._listViewModel.getExpandedItems());
            if (sourceController) {
                this._listViewModel.setHasMoreStorage(_private.prepareHasMoreStorage(sourceController, expandedItems));
            }

            if (this._updateExpandedItemsAfterReload) {
                this._listViewModel.setExpandedItems(options.expandedItems);
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
            this.setMarkerOnFirstLeaf(options);
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
                    this.getViewModel().setExpandedItems(newExpandedItems);
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
                    this.getViewModel().setCollapsedItems(newCollapsedItems);

                    this._notify('collapsedItemsChanged', [newCollapsedItems]);
                }
            }
        }
    }

    private setMarkerOnFirstLeaf(options) {
        const markerController = this.getMarkerController();
        const model = this._listViewModel;
        const list = model.getCollection();
        const current = list.getRecordById(this._options.markedKey) || list.at(0);
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
        const hasNextLeaf = !model.isLastItem(model.getItemBySourceKey(key)) || model.getHasMoreData();
        let hasPrevLeaf = false;
        for (let i = index - 1; i >= 0; i--) {
            if (model.at(i).isNode() === null || !this._isExpanded(model.at(i).getContents(), model)) {
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
                        if (this._isExpanded(item, model)) {
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
                    if (this._isExpanded(item, model)) {
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
        const nextItem = listModel.getNextInRecordSetProjection(key, listModel.getExpandedItems());
        return nextItem || null;
    }

    getPrevItem(key: CrudEntityKey, model?): Model {
        const listModel = model || this._listViewModel;
        const prevItem = listModel.getPrevInRecordSetProjection(key, listModel.getExpandedItems());
        return prevItem || null;
    }

    private _isExpanded(item, model): boolean {
        return model.getExpandedItems().indexOf(item.get(this._keyProperty)) > -1;
    }

    protected _getFooterClasses(options): string {
        let result = super._getFooterClasses(options);

        if (this._listViewModel && this._listViewModel['[Controls/_display/Tree]']) {
            const expanderVisibility = this._listViewModel.getExpanderVisibility();
            const hasExpander = this._listViewModel.getExpanderIcon() !== 'none'
                && (expanderVisibility === 'hasChildren' && this._listViewModel.hasNodeWithChildren()
                || expanderVisibility !== 'hasChildren' && this._listViewModel.hasNode());
            if (hasExpander) {
                result += ` controls-TreeGridView__footer__expanderPadding-${options.expanderSize || 'default'}`;
            }
        } else if (!this._options.useNewModel) {
            // в старой модели всегда добавляем отступ, удалить когда избавимся от старой модели
            result += ` controls-TreeGridView__footer__expanderPadding-${options.expanderSize || 'default'}`;
        }

        return result;
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
