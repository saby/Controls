import cClone = require('Core/core-clone');

import { SyntheticEvent } from 'UI/Vdom';
import { TemplateFunction } from "UI/Base";
import { EventUtils } from 'UI/Events';

import { constants } from 'Env/Env';

import { CrudEntityKey } from 'Types/source';
import { isEqual } from 'Types/object';
import { RecordSet } from 'Types/collection';
import { Model } from 'Types/entity';

import { Direction, TKey } from 'Controls/interface';
import { BaseControl, IBaseControlOptions } from 'Controls/list';
import { Collection, Tree, TreeItem } from 'Controls/display';
import { selectionToRecord } from 'Controls/operations';
import { NewSourceController as SourceController, NewSourceController } from 'Controls/dataSource';
import { MouseButtons, MouseUp } from 'Controls/popup';


const HOT_KEYS = {
    expandMarkedItem: constants.key.right,
    collapseMarkedItem: constants.key.left
};

const DRAG_MAX_OFFSET = 0.3;
const EXPAND_ON_DRAG_DELAY = 1000;
const DEFAULT_COLUMNS_VALUE = [];

type TNodeFooterVisibilityCallback = (item: Model) => boolean;
type TNodeLoadCallback = (list: RecordSet, nodeKey: number | string) => void;

export interface ITreeControlOptions extends IBaseControlOptions {
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

        const newExpandedItems = options.expandedItems instanceof Array ? [...options.expandedItems] : [];
        const newCollapsedItems = options.collapsedItems instanceof Array ? [...options.collapsedItems] : [];

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

            if (!newExpandedItems.includes(itemKey)) {
                newExpandedItems.push(itemKey);
            }
            if (newCollapsedItems.includes(itemKey)) {
                newCollapsedItems.splice(newCollapsedItems.indexOf(itemKey), 1);
            }
        } else {
            // свернули узел

            if (newExpandedItems.includes(itemKey)) {
                newExpandedItems.splice(newExpandedItems.indexOf(itemKey), 1);
            }

            if (!newCollapsedItems.includes(itemKey)) {
                newCollapsedItems.push(itemKey);
            }
        }

        if (options.singleExpand) {
            model.each((it) => {
                if (it !== item && it.getLevel() === item.getLevel()) {
                    it.setExpanded(false, true);
                }
            });
        }

        if (!options.hasOwnProperty('expandedItems')) {
            model.toggleExpanded(item);
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

    toggleExpanded(self: TreeControl, dispItem, model?) {
        const listViewModel = model || self._listViewModel;
        const item = dispItem.getContents();
        const nodeKey = item.getId();
        const baseSourceController = self.getSourceController();
        const expanded = self._options.useNewModel ? !dispItem.isExpanded() : !listViewModel.isExpanded(dispItem);
        const options = self._options;

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
                !baseSourceController.hasLoaded(nodeKey) &&
                !dispItem.isRoot() &&
                _private.shouldLoadChildren(self, nodeKey)
            ) {
                self.showIndicator();
                return baseSourceController
                    .load(undefined, nodeKey)
                    .then((list) => {
                        _private.toggleExpandedOnModel(self, listViewModel, dispItem, expanded);
                        listViewModel.setHasMoreStorage(
                            _private.prepareHasMoreStorage(baseSourceController, listViewModel.getExpandedItems())
                        );
                        if (options.nodeLoadCallback) {
                            options.nodeLoadCallback(list, nodeKey);
                        }
                        self.hideIndicator();
                    }).catch((error: Error) => {
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
                        self._editingItem.getKey(),
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
        const isAlreadyLoaded = self.getSourceController().hasLoaded(nodeKey) ||
                                viewModel.getHasMoreStorage().hasOwnProperty(nodeKey);

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

    loadMore(self: TreeControl, dispItem) {
        const sourceController = self.getSourceController();
        const nodeKey = dispItem.getContents().getId();

        self.showIndicator();
        return sourceController.load('down', nodeKey).then((list) => {
                const expandedItems = _private.getExpandedItems(self, self._options, self._listViewModel.getCollection());
                self._listViewModel.setHasMoreStorage(_private.prepareHasMoreStorage(sourceController, expandedItems));
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

    isDeepReload({deepReload}, deepReloadState: boolean): boolean {
        return  deepReload || deepReloadState;
    },

    resetExpandedItems(self: TreeControl): void {
        const viewModel = self._listViewModel;
        let shouldCancelEditing = false;

        if (self._editingItem) {
            const editingKey = self._editingItem.getKey();
            viewModel.getExpandedItems().forEach((itemKey) => {
                shouldCancelEditing = shouldCancelEditing || _private.hasInParents(
                    self._options.useNewModel ? viewModel : viewModel.getDisplay(),
                    editingKey,
                    itemKey
                );
            });
        }

        const reset = () => {
            viewModel.resetExpandedItems();
            viewModel.setHasMoreStorage({});
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
            viewModel.getChildren(key).forEach(function(elem) {
                if (elem.get(nodeProp) !== null) {
                    if (nodeCallback) {
                        nodeCallback(elem);
                    }
                    findChildNodesRecursive(elem.get(nodeProp));
                } else if (leafCallback) {
                    leafCallback(elem);
                }
            });
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

    getExpandedItems(self: TreeControl, options, items): TKey[] {
        const modelExpandedItems = self._listViewModel.getExpandedItems();
        let expandedItems;

        if (_private.isExpandAll(modelExpandedItems) && options.nodeProperty) {
            expandedItems = [];
            items.each((item) => {
                if (item.get(options.nodeProperty)) {
                    expandedItems.push(item.get(self._keyProperty));
                }
            });
        } else {
            expandedItems = modelExpandedItems.slice();
        }

        return expandedItems;
    }
};

/**
 * Hierarchical list control with custom item template. Can load data from data source.
 *
 * @class Controls/_tree/TreeControl
 * @mixes Controls/interface/IEditableList
 * @mixes Controls/_list/interface/IMovableList
 * @extends Controls/_list/BaseControl
 *
 * @private
 */

export class TreeControl<TOptions extends ITreeControlOptions = ITreeControlOptions> extends BaseControl<ITreeControlOptions> {
    private _root = null;
    private _needResetExpandedItems = false;
    private _updateExpandedItemsAfterReload = false;
    private _currentItem = null;
    private _tempItem = null;
    private _markedLeaf = '';
    private _doAfterItemExpanded = null;
    private _goToNextAfterExpand: true;
    private _scrollToLeaf = null;
    private _scrollToLeafOnDrawItems = false;

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
        let updateSourceController = false;

        if (typeof newOptions.root !== 'undefined' && this._root !== newOptions.root) {
            const sourceControllerRoot = sourceController.getState().root;

            this._root = newOptions.root;
            this._listViewModel.setRoot(this._root);

            if (this._options.itemsSetCallback) {
                this._options.itemsSetCallback(sourceController.getItems(), newOptions);
            }

            // При смене корне, не надо запрашивать все открытые папки,
            // т.к. их может не быть и мы загрузим много лишних данных.
            // Так же учитываем, что вместе со сменой root могут поменять и expandedItems - тогда не надо их сбрасывать.
            if (isEqual(newOptions.expandedItems, this._options.expandedItems)) {
                this._needResetExpandedItems = true;
            }

            if (sourceControllerRoot === undefined || sourceControllerRoot !== newOptions.root) {
                updateSourceController = true;
            }

            if (this.isEditing()) {
                this.cancelEdit();
            }
        }

        if (searchValueChanged && newOptions.searchValue && !_private.isDeepReload(this, newOptions)) {
            _private.resetExpandedItems(this);
        }

        // todo [useNewModel] viewModel.getExpandedItems() нужен, т.к. для старой модели установка expandedItems
        // сделана некорректно. Как откажемся от неё, то можно использовать стандартное сравнение опций.
        const currentExpandedItems = viewModel ? viewModel.getExpandedItems() : this._options.expandedItems;
        if (newOptions.expandedItems && !isEqual(newOptions.expandedItems, currentExpandedItems) && newOptions.source) {
            if ((newOptions.source === this._options.source || newOptions.sourceController) && isEqual(newOptions.filter, this._options.filter) ||
                (searchValueChanged && newOptions.sourceController)) {
                if (viewModel) {
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

    protected _componentDidUpdate() {
        super._componentDidUpdate(...arguments);
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

    protected _loadMore(e, dispItem?): void {
        if (dispItem) {
            _private.loadMore(this, dispItem);
        } else {
            super._loadMore(e);
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
            result = super.reloadItem(key, readMeta, direction);
        }

        return result;
    }

    protected _notifyDraggingItemMouseMove(itemData, nativeEvent): void {
        const dispItem = this._options.useNewModel ? itemData : itemData.dispItem;
        const dndListController = this.getDndListController();
        const targetIsNotDraggableItem = dndListController.getDraggableItem()?.getContents() !== dispItem.getContents();
        if (dispItem.isNode() && targetIsNotDraggableItem) {
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
                        if (!dispItem.isExpanded() && targetIsNotDraggableItem && dragTargetPosition.position === 'on') {
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
            return;
        }
        const superResult = super._notifyItemClick(...arguments);
        if (e.isStopped()) {
            return;
        }
        e.stopPropagation();
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
        this._onTreeViewKeyDown(event);
        if (!event.stopped && event._bubbling !== false) {
            super._onViewKeyDown(event);
        }
    }

    _onTreeViewKeyDown(event) {
        EventUtils.keysHandler(event, HOT_KEYS, _private, this);
    }

    protected protected _reload(cfg, sourceConfig?: IBasePositionSourceConfig | IBasePageSourceConfig): Promise<any> {
        const filter: IHashMap<unknown> = cClone(cfg.filter);
        const sorting = cClone(cfg.sorting);
        const navigation = cClone(cfg.navigation);

        this._prepareModelBeforeReload(filter, sorting, navigation, cfg);
        return super._reload(cfg, sourceConfig);
    }

    protected _prepareModelBeforeReload(filter, sorting, navigation, cfg): void {
        if (this._options.parentProperty === undefined) {
            return;
        }
        let expandedItemsKeys: Array<number | string | null> = [];
        let isExpandAll: boolean;

        if (this._listViewModel && !this._updateExpandedItemsAfterReload) {
            isExpandAll = this._listViewModel.isExpandAll();
            if (!isExpandAll) {
                this._listViewModel.getExpandedItems().forEach((key) => {
                    expandedItemsKeys.push(key);
                });
            }
        } else {
            expandedItemsKeys = cfg.expandedItems || [];
            isExpandAll = _private.isExpandAll(expandedItemsKeys);
        }

        const needResetExpandedItems = !(_private.isDeepReload(cfg, this._deepReload) &&
            expandedItemsKeys.length &&
            !isExpandAll);
        // состояние _needResetExpandedItems устанавливается при смене корня
        // переменная needResetExpandedItems вычисляется по опциям и состояниям
        if (needResetExpandedItems || this._needResetExpandedItems) {
            this.getSourceController().setExpandedItems([]);
        } else if (!this._needResetExpandedItems && expandedItemsKeys.length) {
            this.getSourceController().setExpandedItems(expandedItemsKeys);
        }
    }

    protected _afterReloadCallback(options: TOptions, loadedList?: RecordSet) {
        if (this._listViewModel) {
            const modelRoot = this._listViewModel.getRoot();
            const root = this._options.root !== undefined ? this._options.root : this._root;
            const viewModelRoot = modelRoot ? modelRoot.getContents() : root;
            if (this._updateExpandedItemsAfterReload) {
                this._listViewModel.setExpandedItems(options.expandedItems);
                this._updateExpandedItemsAfterReload = false;
            }
            const modelExpandedItems = this._listViewModel.getExpandedItems();
            const isDeepReload = _private.isDeepReload(options, this._deepReload);

            if (!isDeepReload || this._needResetExpandedItems) {
                _private.resetExpandedItems(this);
                this._needResetExpandedItems = false;
            }

            if (viewModelRoot !== root) {
                this._listViewModel.setRoot(root);
            }
            if (isDeepReload && modelExpandedItems.length && loadedList) {
                const sourceController = this.getSourceController();
                const hasMore = {};
                const expandedItems = _private.getExpandedItems(this, options, loadedList);
                let hasMoreData: unknown;

                expandedItems.forEach((key) => {
                    hasMoreData = sourceController.hasMoreData('down', key);

                    if (hasMoreData !== undefined) {
                        hasMore[key] = hasMoreData;
                    }
                });

                // if method does not support multi navigation hasMore object will be empty
                if (!isEqual({}, hasMore)) {
                    this._listViewModel.setHasMoreStorage(hasMore);
                }
            }
            if (loadedList) {
                const modelHasMoreStorage = this._listViewModel.getHasMoreStorage();
                const sourceController = this.getSourceController();

                loadedList.each((item) => {
                    if (item.get(options.nodeProperty) !== null) {
                        const itemKey = item.getId();
                        const dispItem = this._listViewModel.getItemBySourceKey(itemKey);
                        if (dispItem && this._listViewModel.getChildren(dispItem, loadedList).length) {
                            modelHasMoreStorage[itemKey] = sourceController.hasMoreData('down', itemKey);
                        }
                    }
                });
            }

        // После релоад разворачиваем узлы до первого leaf и ставим на него маркер
        if (options.markerMoveMode === 'leaves') {
            if (options.markerMoveMode === 'leaves') {
                const markerController = this.getMarkerController();
                const model = this._listViewModel;
                const current = loadedList.getRecordById(options.markedKey) || loadedList.at(0);
                if (current) {
                    if (current.get(options.nodeProperty) !== null) {
                        this._tempItem = current.getKey();
                        this._currentItem = this._tempItem;
                        this._doAfterItemExpanded = (itemKey) => {
                            this._doAfterItemExpanded = null;
                            this._applyMarkedLeaf(itemKey, model, markerController);
                        };
                        this._expandedItemsToNotify = this._expandToFirstLeaf(this._tempItem, loadedList, options);
                        if (this._expandedItemsToNotify) {
                            model.setExpandedItems(this._expandedItemsToNotify);
                        }
                    } else {
                        this._applyMarkedLeaf(current.getKey(), model, markerController);
                    }
                }
            }
        }
    }
        // reset deepReload after loading data (see reload method or constructor)
        this._deepReload = false;
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

    protected _hasMoreData(sourceController: SourceController, direction: Direction): boolean {
        if (sourceController) {
            return this._getHasMoreData(sourceController, direction)
        }
        return false;
    }

    private _getHasMoreData(sourceController, direction): boolean {
        const rootResult = sourceController.hasMoreData(direction, this._root);

        // support for not multi root navigation
        if (rootResult !== undefined) {
            return rootResult;
        } else {
            return sourceController.hasMoreData(direction);
        }
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
            let curItem = model.getChildren(key, items)[0];
            while (curItem && curItem.get(options.nodeProperty) !== null) {
                expanded.push(curItem.get(this._keyProperty));
                curItem = model.getChildren(curItem, items)[0];
            }
            if (curItem && this._doAfterItemExpanded) {
                this._doAfterItemExpanded(curItem.get(this._keyProperty));
            }
            return expanded;
        }
    }

    private _getMarkedLeaf(key: CrudEntityKey, model): 'first' | 'last' | 'middle' {
        const index = model.getIndexByKey(key);
        if (index === model.getCount() - 1) {
            return 'last';
        }
        let hasPrevLeaf = false;
        for (let i = index - 1; i >= 0; i--) {
            if (model.at(i).isNode() === null || !this._isExpanded(model.at(i), model)) {
                hasPrevLeaf = true;
                break;
            }
        }
        return hasPrevLeaf ? 'middle' : 'first';
    }

    goToNext(listModel?, mController?): Promise {
        return new Promise((resolve) => {
            // Это исправляет ошибку плана 0 || null
            const key = this._tempItem === undefined || this._tempItem === null ? this._currentItem : this._tempItem;
            const item = this.getNextItem(key, listModel);
            const model = listModel || this._listViewModel;
            const markerController = mController || this.getMarkerController();
            if (item) {
                this._tempItem = item.getKey();
                const dispItem = model.getItemBySourceKey(this._tempItem);
                if (item.get(this._options.nodeProperty) !== null) {
                    this._doAfterItemExpanded = () => {
                        this._doAfterItemExpanded = null;
                        this.goToNext(model, markerController);
                    };
                    if (this._isExpanded(dispItem, model)) {
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
                    if (this._isExpanded(dispItem, model)) {
                        this._tempItem = itemKey;
                        this._doAfterItemExpanded();
                        resolve();
                    } else {
                        this._goToNextAfterExpand = false;
                        this._scrollToLeafOnDrawItems = true;
                        const expandResult = this.toggleExpanded(itemKey);
                        if (expandResult instanceof Promise) {
                            expandResult.then(() => {
                                this._expandToFirstLeaf(itemKey, model.getItems(), this._options);
                                resolve();
                            });
                        } else {
                            this._expandToFirstLeaf(itemKey, model.getItems(), this._options);
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
        const nextItem = listModel.getNextByKey(key);
        return nextItem ? nextItem.getContents() : null;
    }

    getPrevItem(key: CrudEntityKey, model?): Model {
        const listModel = model || this._listViewModel;
        const prevItem = listModel.getPrevByKey(key);
        return prevItem ? prevItem.getContents() : null;
    }

    private _isExpanded(item, model): boolean {
        return model.getExpandedItems().indexOf(item.getContents().get(this._keyProperty)) > -1;
    }

    static _theme = [...BaseControl._theme, 'Controls/treeGrid'];

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
