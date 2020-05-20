import Control = require('Core/Control');
import TreeControlTpl = require('wml!Controls/_treeGrid/TreeControl/TreeControl');
import cClone = require('Core/core-clone');
import Env = require('Env/Env');
import Deferred = require('Core/Deferred');
import keysHandler = require('Controls/Utils/keysHandler');
import selectionToRecord = require('Controls/_operations/MultiSelector/selectionToRecord');
import tmplNotify = require('Controls/Utils/tmplNotify');
import {Controller as SourceController} from 'Controls/source';
import {isEqual} from 'Types/object';
import {saveConfig} from 'Controls/Application/SettingsController';
import {Map} from 'Types/shim';
import {error as dataSourceError} from 'Controls/dataSource';
import {MouseButtons, MouseUp} from './../Utils/MouseEventHelper';

var
    HOT_KEYS = {
        expandMarkedItem: Env.constants.key.right,
        collapseMarkedItem: Env.constants.key.left
    };

var DRAG_MAX_OFFSET = 15,
    EXPAND_ON_DRAG_DELAY = 1000,
    DEFAULT_COLUMNS_VALUE = [];

type TNodeSourceControllers = Map<string, SourceController>;

var _private = {
    /**
     * @param {Controls/_treeGrid/TreeControl} self
     * @param {Error} error
     * @returns {Promise.<CrudResult>}
     */
    processError(self, error: Error): Promise<void> {
        return self._errorController.process({
            error,
            theme: self._options.theme,
            mode: dataSourceError.Mode.dialog
        }).then((viewConfig) => {
            self._errorViewConfig = viewConfig;
        });
    },
    clearNodeSourceController(self, node: string|number): void {
        const nodeSourceControllers = _private.getNodesSourceControllers(self);

        // Для ие необходим нормальный полифил, Map из shim не подходит
        // теряются типы ключей, ключ всегда приходит строкой
        // https://online.sbis.ru/opendoc.html?guid=fdebafad-799b-4d49-a9b9-ff718e57011d
        const nodeSourceController = nodeSourceControllers.get(node) || nodeSourceControllers.get(Number(node));
        if (nodeSourceController) {
            nodeSourceController.destroy();
            nodeSourceControllers.delete(node);
        }
    },
    clearNodesSourceControllers(self): void {
        const nodeSourceControllers = _private.getNodesSourceControllers(self);
        nodeSourceControllers.forEach((controller, nodeKey) => {
            _private.clearNodeSourceController(self, nodeKey);
        });
        nodeSourceControllers.clear();
    },
    getNodesSourceControllers(self): TNodeSourceControllers {
       if (!self._nodesSourceControllers) {
           self._nodesSourceControllers = new Map();
       }
       return self._nodesSourceControllers;
    },
    createSourceController(source, navigation): SourceController {
        return new SourceController({
            source,
            navigation
        });
    },
    createSourceControllerForNode(self, node, source, navigation): SourceController {
        const nodeSourceControllers = _private.getNodesSourceControllers(self);
        if (!nodeSourceControllers.has(node)) {
            nodeSourceControllers.set(node, _private.createSourceController(source, navigation));
        }
        return nodeSourceControllers.get(node);
    },
    clearSourceControllersForNotExpandedNodes(self, oldExpanded, newExpanded): void {
        if (oldExpanded) {
            oldExpanded.forEach((oldExpandedKey) => {
                if (!newExpanded.includes(oldExpandedKey)) {
                    _private.clearNodeSourceController(self, oldExpandedKey);
                }
            });
        }
    },
    toggleExpandedOnModel: function(self, listViewModel, dispItem, expanded) {
        listViewModel.toggleExpanded(dispItem, expanded);
        self._notify(expanded ? 'afterItemExpand' : 'afterItemCollapse', [dispItem.getContents()]);

        // todo: удалить события itemExpanded и itemCollapsed в 20.2000.
        self._notify(expanded ? 'itemExpanded' : 'itemCollapsed', [dispItem.getContents()]);
    },
    expandMarkedItem: function(self) {
        var
            model = self._children.baseControl.getViewModel(),
            markedItemKey = model.getMarkedKey(),
            markedItem = model.getMarkedItem();
        if (model.getItemType(markedItem) !== 'leaf' && !model.isExpanded(markedItem)) {
            self.toggleExpanded(markedItemKey);
        }
    },
    collapseMarkedItem: function(self) {
        var
            model = self._children.baseControl.getViewModel(),
            markedItemKey = model.getMarkedKey(),
            markedItem = model.getMarkedItem();
        if (markedItem && model.isExpanded(markedItem)) {
            self.toggleExpanded(markedItemKey);
        }
    },
    toggleExpanded: function(self, dispItem) {
        const filter = cClone(self._options.filter);
        const listViewModel = self._children.baseControl.getViewModel();
        const item = dispItem.getContents();
        const nodeKey = item.getId();
        const baseSourceController = self._children.baseControl.getSourceController();
        const expanded = !listViewModel.isExpanded(dispItem);
        const options = self._options;
        const nodeSourceControllers = _private.getNodesSourceControllers(self);
        self._notify(expanded ? 'beforeItemExpand' : 'beforeItemCollapse', [dispItem.getContents()]);

        // todo: удалить события itemExpand и itemCollapse в 20.2000.
        self._notify(expanded ? 'itemExpand' : 'itemCollapse', [item]);
        if (
            !_private.isExpandAll(self._options.expandedItems) &&
            !nodeSourceControllers.has(nodeKey) &&
            !dispItem.isRoot() &&
            _private.shouldLoadChildren(self, nodeKey)
        ) {
            self._children.baseControl.showIndicator();
            filter[options.parentProperty] = nodeKey;
            _private.createSourceControllerForNode(self, nodeKey, options.source, options.navigation)
                .load(filter, options.sorting)
                .addCallbacks((list) => {
                    listViewModel.setHasMoreStorage(_private.prepareHasMoreStorage(nodeSourceControllers));
                    baseSourceController.calculateState(list, nodeKey);
                    if (options.uniqueKeys) {
                        listViewModel.mergeItems(list);
                    } else {
                        listViewModel.appendItems(list);
                    }
                    _private.toggleExpandedOnModel(self, listViewModel, dispItem, expanded);
                    if (options.nodeLoadCallback) {
                        options.nodeLoadCallback(list, nodeKey);
                    }
                }, (error) => {
                    _private.processError(self, error);
                    // Нужно удалить sourceController для узла, чтоб содержимое узла считалось незагруженным.
                    _private.clearNodeSourceController(self, nodeKey);
                    // Вернуть элемент модели в предыдущее состояние, т.к. раскрытие не состоялось.
                    _private.toggleExpandedOnModel(self, listViewModel, dispItem, !expanded);
                })
                .addCallback(() => {
                    self._children.baseControl.hideIndicator();
                });
        } else {
            _private.toggleExpandedOnModel(self, listViewModel, dispItem, expanded);
        }
    },
    shouldLoadChildren: function(self, nodeKey): boolean {
        // загружаем узел только если:
        // 1. он не был загружен ранее (определяем по наличию его nodeSourceController'a)
        // 2. у него вообще есть дочерние элементы (по значению поля hasChildrenProperty)
        const isAlreadyLoaded = !!self._nodesSourceControllers.get(nodeKey);
        if (isAlreadyLoaded) {
            return false;
        }
        if (self._options.hasChildrenProperty) {
            const node = self._children.baseControl.getViewModel().getItems().getRecordById(nodeKey);
            return node.get(self._options.hasChildrenProperty) !== false;
        }
        return true;
    },
    prepareHasMoreStorage(sourceControllers: Record<string, SourceController>): Record<string, boolean> {
        const hasMore = {};
        let hasMoreForNode;

        sourceControllers.forEach((controller, nodeKey) => {
            hasMoreForNode = controller.hasMoreData('down');

            if (hasMoreForNode === undefined) {
                hasMoreForNode = controller.hasMoreData('down');
            }

            hasMore[nodeKey] = hasMoreForNode;
        });

        return hasMore;
    },

    getEntries: function(selectedKeys: string|number[], excludedKeys: string|number[], source) {
        let entriesRecord;

        if (selectedKeys && selectedKeys.length) {
            entriesRecord = selectionToRecord({
                selected: selectedKeys || [],
                excluded: excludedKeys || []
            }, _private.getOriginalSource(source).getAdapter());
        }

        return entriesRecord;
    },

    loadMore: function(self, dispItem) {
        const filter = cClone(self._options.filter);
        const listViewModel = self._children.baseControl.getViewModel();
        const baseSourceController = self._children.baseControl.getSourceController();
        const nodeKey = dispItem.getContents().getId();
        const nodeSourceControllers = _private.getNodesSourceControllers(self);

        filter[self._options.parentProperty] = nodeKey;
        self._children.baseControl.showIndicator();
        nodeSourceControllers.get(nodeKey).load(filter, self._options.sorting, 'down').addCallbacks((list) => {
            listViewModel.setHasMoreStorage(_private.prepareHasMoreStorage(nodeSourceControllers));
            baseSourceController.calculateState(list, nodeKey);
            if (self._options.uniqueKeys) {
                listViewModel.mergeItems(list);
            } else {
                listViewModel.appendItems(list);
            }
            if (self._options.dataLoadCallback) {
                self._options.dataLoadCallback(list);
            }
        }, (error) => {
            if (typeof self._options.dataLoadErrback === 'function') {
                self._options.dataLoadErrback(error);
            }
            _private.processError(self, error);
        }).addCallback(() => {
            self._children.baseControl.hideIndicator();
        });
    },
    onNodeRemoved: function(self, nodeId) {
        _private.clearNodeSourceController(self, nodeId);
    },
    isExpandAll: function(expandedItems) {
        return expandedItems instanceof Array && expandedItems[0] === null;
    },
    isDeepReload: function({deepReload}, deepReloadState: boolean): boolean {
        return  deepReload || deepReloadState;
    },
    beforeReloadCallback: function(self, filter, sorting, navigation, cfg) {
        const parentProperty = cfg.parentProperty;
        const baseControl = self._children.baseControl;
        const entries = _private.getEntries(cfg.selectedKeys, cfg.excludedKeys, cfg.source);
        const nodeSourceControllers = _private.getNodesSourceControllers(self);

        let expandedItemsKeys: Array[number | string | null] = [];
        let isExpandAll: boolean;

        if (baseControl && !self._updateExpandedItemsAfterReload) {
            const viewModel = baseControl.getViewModel();
            isExpandAll = viewModel.isExpandAll();
            if (!isExpandAll) {
                viewModel.getExpandedItems().forEach((key) => {
                    expandedItemsKeys.push(key);
                });
            }
            nodeSourceControllers.forEach((controller, key) => {
                if (!expandedItemsKeys.includes(key)) {
                    _private.clearNodeSourceController(self, key);
                }
            });
            viewModel.setHasMoreStorage(_private.prepareHasMoreStorage(nodeSourceControllers));
        } else {
            expandedItemsKeys = cfg.expandedItems || [];
            isExpandAll = _private.isExpandAll(expandedItemsKeys);
        }

        if (_private.isDeepReload(cfg, self._deepReload) && expandedItemsKeys.length && !isExpandAll) {
            filter[parentProperty] = filter[parentProperty] instanceof Array ? filter[parentProperty] : [];
            filter[parentProperty].push(self._root);
            filter[parentProperty] = filter[parentProperty].concat(expandedItemsKeys);
        } else {
            filter[parentProperty] = self._root;
            _private.clearNodesSourceControllers(self);
        }

        if (entries) {
            filter.entries = entries;
        }
    },

    afterReloadCallback: function(self, options, loadedList) {
        const baseControl = self._children.baseControl;
        const viewModel = baseControl && baseControl.getViewModel();

        if (viewModel) {
            const modelRoot = viewModel.getRoot();
            const root = self._options.root !== undefined ? self._options.root : self._root;
            const viewModelRoot = modelRoot ? modelRoot.getContents() : root;
            if (self._updateExpandedItemsAfterReload) {
                _private.clearNodesSourceControllers(self);
                viewModel.setExpandedItems(options.expandedItems);
                self._updateExpandedItemsAfterReload = false;
            }
            const modelExpandedItems = viewModel.getExpandedItems();
            const isDeepReload = _private.isDeepReload(options, self._deepReload);

            // https://online.sbis.ru/opendoc.html?guid=d99190bc-e3e9-4d78-a674-38f6f4b0eeb0
            if (!isDeepReload || self._needResetExpandedItems) {
                viewModel.resetExpandedItems();
                viewModel.setHasMoreStorage({});
                self._needResetExpandedItems = false;
            }

            if (viewModelRoot !== root) {
                viewModel.setRoot(root);
            }
            if (isDeepReload && modelExpandedItems.length && loadedList) {
                const sourceController = baseControl.getSourceController();
                const hasMore = {};
                const expandedItems = modelExpandedItems.slice();
                let hasMoreData: unknown;

                if (_private.isExpandAll(modelExpandedItems) && options.nodeProperty) {
                    loadedList.each((item) => {
                        if (item.get(options.nodeProperty)) {
                            expandedItems.push(item.get(options.keyProperty));
                        }
                    });
                }

                expandedItems.forEach((key) => {
                    hasMoreData = sourceController.hasMoreData('down', key);

                    if (hasMoreData !== undefined) {
                        hasMore[key] = hasMoreData;
                        _private.createSourceControllerForNode(self, key, options.source, options.navigation)
                                .calculateState(loadedList);
                    }
                });

                // if method does not support multi navigation hasMore object will be empty
                if (!isEqual({}, hasMore)) {
                    viewModel.setHasMoreStorage(hasMore);
                }
            }
            if (loadedList) {
                loadedList.each((item) => {
                    if (item.get(options.nodeProperty) !== null) {
                        const itemKey = item.getId();
                        if (!self._nodesSourceControllers[itemKey] && viewModel.getChildren(itemKey, loadedList).length) {
                            _private.createSourceControllerForNode(self, itemKey, options.source, options.navigation);
                        }
                    }
                });
            }
        }
        // reset deepReload after loading data (see reload method or constructor)
        self._deepReload = false;
    },

    beforeLoadToDirectionCallback: function(self, filter, cfg) {
        const entries = _private.getEntries(cfg.selectedKeys, cfg.excludedKeys, cfg.source);

        if (entries) {
            filter.entries = entries;
        }
        if (cfg.parentProperty !== undefined) {
            filter[cfg.parentProperty] = self._root;
        }
    },

    getHasMoreData(self, sourceController, direction, key) {
        const root = key !== undefined ? key : self._root;
        const rootResult = sourceController.hasMoreData(direction, root);
        let moreDataResult;

        // support for not multi root navigation
        if (rootResult !== undefined) {
            moreDataResult = rootResult;
        } else {
            moreDataResult = sourceController.hasMoreData(direction);
        }
        return moreDataResult;
    },

    reloadItem: function(self, key) {
        var viewModel = self._children.baseControl.getViewModel();
        var filter = cClone(self._options.filter);
        var nodes = [key !== undefined ? key : null];
        var nodeProperty = self._options.nodeProperty;
        var keyProperty = self._options.keyProperty;

        filter[self._options.parentProperty] = nodes.concat(_private.getReloadableNodes(viewModel, key, keyProperty, nodeProperty));

        return _private.createSourceControllerForNode(self, key, self._options.source, self._options.navigation).load(filter).addCallback(function(result) {
            _private.applyReloadedNodes(viewModel, key, keyProperty, nodeProperty, result);
            viewModel.setHasMoreStorage(_private.prepareHasMoreStorage(self._nodesSourceControllers));
            return result;
        });
    },

    getReloadableNodes: function(viewModel, nodeKey, keyProp, nodeProp) {
        var nodes = [];
        _private.nodeChildsIterator(viewModel, nodeKey, nodeProp, function(elem) {
            nodes.push(elem.get(keyProp));
        });
        return nodes;
    },

    applyReloadedNodes: function(viewModel, nodeKey, keyProp, nodeProp, newItems) {
        var itemsToRemove = [];
        var items = viewModel.getItems();
        var checkItemForRemove = function(item) {
            if (newItems.getIndexByValue(keyProp, item.get(keyProp)) === -1) {
                itemsToRemove.push(item);
            }
        };

        _private.nodeChildsIterator(viewModel, nodeKey, nodeProp, checkItemForRemove, checkItemForRemove);

        items.setEventRaising(false, true);

        itemsToRemove.forEach(function(item) {
            items.remove(item);
        });
        items.merge(newItems, {
            remove: false,
            inject: true
        });

        items.setEventRaising(true, true);
    },

    initListViewModelHandler(self, listModel): void {
        // https://online.sbis.ru/opendoc.html?guid=d99190bc-e3e9-4d78-a674-38f6f4b0eeb0
        listModel.subscribe('onNodeRemoved', self._onNodeRemovedFn);
        listModel.subscribe('expandedItemsChanged', self._onExpandedItemsChanged.bind(self));
        listModel.subscribe('collapsedItemsChanged', self._onCollapsedItemsChanged.bind(self));
    },

    nodeChildsIterator: function(viewModel, nodeKey, nodeProp, nodeCallback, leafCallback) {
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

    getOriginalSource: function(source) {
        while(source.getOriginal) {
            source = source.getOriginal();
        }

        return source;
    }
};

/**
 * Hierarchical list control with custom item template. Can load data from data source.
 *
 * @class Controls/_treeGrid/TreeControl
 * @mixes Controls/interface/IEditableList
 * @mixes Controls/_treeGrid/TreeGridView/Styles
 * @extends Controls/_list/ListControl
 * @control
 * @private
 * @category List
 */

var TreeControl = Control.extend(/** @lends Controls/_treeGrid/TreeControl.prototype */{
    _onNodeRemovedFn: null,
    _template: TreeControlTpl,
    _root: null,
    _updatedRoot: false,
    _deepReload: false,
    _nodesSourceControllers: null,
    _needResetExpandedItems: false,
    _beforeReloadCallback: null,
    _afterReloadCallback: null,
    _beforeLoadToDirectionCallback: null,
    _getHasMoreData: null,
    _expandOnDragData: null,
    _updateExpandedItemsAfterReload: false,
    _notifyHandler: tmplNotify,
    _errorController: null,
    _errorViewConfig: null,
    constructor: function(cfg) {
        this._nodesSourceControllers = _private.getNodesSourceControllers(this);
        this._onNodeRemovedFn = this._onNodeRemoved.bind(this);
        if (typeof cfg.root !== 'undefined') {
            this._root = cfg.root;
        }
        if (cfg.expandedItems && cfg.expandedItems.length > 0) {
            this._deepReload = true;
        }
        this._beforeReloadCallback = _private.beforeReloadCallback.bind(null, this);
        this._afterReloadCallback = _private.afterReloadCallback.bind(null, this);
        this._beforeLoadToDirectionCallback = _private.beforeLoadToDirectionCallback.bind(null, this);
        this._getHasMoreData = _private.getHasMoreData.bind(null, this);
        this._errorController = cfg.errorController || new dataSourceError.Controller({});
        return TreeControl.superclass.constructor.apply(this, arguments);
    },
    _afterMount: function() {
        _private.initListViewModelHandler(this, this._children.baseControl.getViewModel());
    },
    _onNodeRemoved: function(event, nodeId) {
        _private.onNodeRemoved(this, nodeId);
    },
    _beforeUpdate: function(newOptions) {
        const baseControl = this._children.baseControl;
        const viewModel = baseControl.getViewModel();

        if (typeof newOptions.root !== 'undefined' && this._root !== newOptions.root) {
            this._root = newOptions.root;
            this._updatedRoot = true;

            if (this._options.editingConfig) {
                baseControl.cancelEdit();
            }
            baseControl.recreateSourceController(newOptions.source, newOptions.navigation, newOptions.keyProperty);
        }

        if (newOptions.expandedItems && !isEqual(newOptions.expandedItems, viewModel.getExpandedItems())) {
            _private.clearSourceControllersForNotExpandedNodes(
                this,
                viewModel.getExpandedItems(),
                newOptions.expandedItems
            );
            if (newOptions.source === this._options.source && isEqual(newOptions.filter, this._options.filter)) {
                viewModel.setExpandedItems(newOptions.expandedItems);
            } else {
                this._updateExpandedItemsAfterReload = true;
            }
        }
        if (newOptions.collapsedItems && !isEqual(newOptions.collapsedItems, viewModel.getCollapsedItems())) {
            viewModel.setCollapsedItems(newOptions.collapsedItems);
        }

        if (newOptions.propStorageId && !isEqual(newOptions.sorting, this._options.sorting)) {
            saveConfig(newOptions.propStorageId, ['sorting'], newOptions);
        }
        if (newOptions.nodeFooterTemplate !== this._options.nodeFooterTemplate) {
            viewModel.setNodeFooterTemplate(newOptions.nodeFooterTemplate);
        }
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
    },
    _afterUpdate: function(oldOptions) {
        if (this._updatedRoot) {
            this._updatedRoot = false;
            _private.clearNodesSourceControllers(this);
            // При смене корне, не надо запрашивать все открытые папки,
            // т.к. их может не быть и мы загрузим много лишних данных.
            this._needResetExpandedItems = true;
            // If filter or source was changed, do not need to reload again, baseControl reload list in beforeUpdate
            if (isEqual(this._options.filter, oldOptions.filter) && this._options.source === oldOptions.source) {
                this._children.baseControl.reload();
            }
        }
        if (oldOptions.groupMethod !== this._options.groupMethod || oldOptions.viewModelConstructor !== this._options.viewModelConstructor) {
            _private.initListViewModelHandler(this, this._children.baseControl.getViewModel());
        }
    },
    resetExpandedItems(): void {
        this._children.baseControl.getViewModel().resetExpandedItems();
    },
    toggleExpanded: function(key) {
        var
            item = this._children.baseControl.getViewModel().getItemById(key, this._options.keyProperty);
        _private.toggleExpanded(this, item);
    },
    _onExpanderMouseDown(e, key, dispItem) {
        if (MouseUp.isButton(e.nativeEvent, MouseButtons.Left)) {
            this._mouseDownExpanderKey = key;
        }
    },
    _onExpanderMouseUp: function(e, key, dispItem) {
        if (this._mouseDownExpanderKey === key && MouseUp.isButton(e.nativeEvent, MouseButtons.Left)) {
            _private.toggleExpanded(this, dispItem);
            if (this._options.markItemByExpanderClick) {
                this._children.baseControl.getViewModel().setMarkedKey(key);
            }
        }
        this._mouseDownExpanderKey = undefined;
        e.stopImmediatePropagation();
    },
    _onExpanderClick(e) {
        // e.stopPropagation() на mousedown на ребенке никак не влияет на срабатывание itemClick на родителе.
        // https://online.sbis.ru/opendoc.html?guid=4c3d7560-949c-4672-b252-bccb577aee38
        e.stopImmediatePropagation();
    },
    _onLoadMoreClick: function(e, dispItem) {
        _private.loadMore(this, dispItem);
    },
    _onExpandedItemsChanged(e, expandedItems) {
        this._notify('expandedItemsChanged', [expandedItems]);
        //вызываем обновление, так как, если нет биндинга опции, то контрол не обновится. А обновление нужно, чтобы отдать в модель нужные expandedItems
        this._forceUpdate();
    },
    _onCollapsedItemsChanged(e, collapsedItems) {
        this._notify('collapsedItemsChanged', [collapsedItems]);
        //вызываем обновление, так как, если нет биндинга опции, то контрол не обновится. А обновление нужно, чтобы отдать в модель нужные collapsedItems
        this._forceUpdate();
    },
    reload: function(keepScroll, sourceConfig) {
        var self = this;

        //deep reload is needed only if reload was called from public API.
        //otherwise, option changing will work incorrect.
        //option changing may be caused by search or filtering
        self._deepReload = true;
        return this._children.baseControl.reload(keepScroll, sourceConfig);
    },

    setMarkedKey: function(key) {
        this._children.baseControl.getViewModel().setMarkedKey(key);
    },
    scrollToItem(key: string|number, toBottom: boolean): void {
        this._children.baseControl.scrollToItem(key, toBottom);
    },
    reloadItem: function(key, readMeta, direction):Deferred {
        let baseControl = this._children.baseControl;
        let result;

        if (direction === 'depth') {
            result = _private.reloadItem(this, key);
        } else {
            result = baseControl.reloadItem.apply(baseControl, arguments);
        }

        return result;
    },
    beginEdit: function(options) {
        return this._options.readOnly ? Deferred.fail() : this._children.baseControl.beginEdit(options);
    },
    beginAdd: function(options) {
        return this._options.readOnly ? Deferred.fail() : this._children.baseControl.beginAdd(options);
    },

    cancelEdit: function() {
        return this._options.readOnly ? Deferred.fail() : this._children.baseControl.cancelEdit();
    },

    commitEdit: function() {
        return this._options.readOnly ? Deferred.fail() : this._children.baseControl.commitEdit();
    },

    _markedKeyChangedHandler: function(event, key) {
        this._notify('markedKeyChanged', [key]);
    },

    _draggingItemMouseMove(e, itemData, nativeEvent){
        e.stopPropagation();
        if (itemData.dispItem.isNode()) {
            this._nodeMouseMove(itemData, nativeEvent)
        }
    },

    _draggingItemMouseLeave: function() {
        this._clearTimeoutForExpandOnDrag(this);
        this._expandOnDragData = null;
    },
    _dragEnd: function() {
        this._clearTimeoutForExpandOnDrag(this);
    },

    _clearTimeoutForExpandOnDrag: function() {
        if (this._timeoutForExpandOnDrag) {
            clearTimeout(this._timeoutForExpandOnDrag);
            this._timeoutForExpandOnDrag = null;
        }
        this._expandOnDragData = null;
    },

    _expandNodeOnDrag: function(itemData) {
        if (!itemData.isExpanded) {
            _private.toggleExpanded(this, itemData.dispItem);
        }
    },
    _setTimeoutForExpandOnDrag: function (itemData) {
        this._timeoutForExpandOnDrag = setTimeout(() => {
                this._expandNodeOnDrag(itemData);
            },
            EXPAND_ON_DRAG_DELAY);
    },
    _nodeMouseMove: function(itemData, event) {
        var
            position,
            topOffset,
            bottomOffset,
            dragTargetRect,
            dragTargetPosition,
            model = this._children.baseControl.getViewModel(),
            dragTarget = event.target.closest('.js-controls-TreeView__dragTargetNode');

        if (dragTarget) {
            dragTargetRect = dragTarget.getBoundingClientRect();
            topOffset = event.nativeEvent.pageY - dragTargetRect.top;
            bottomOffset = dragTargetRect.top + dragTargetRect.height - event.nativeEvent.pageY;

            if (topOffset < DRAG_MAX_OFFSET || bottomOffset < DRAG_MAX_OFFSET) {
                if (model.getDragItemData()) {
                    position = topOffset < DRAG_MAX_OFFSET ? 'before' : 'after';
                    dragTargetPosition = model.calculateDragTargetPosition(itemData, position);

                    if (dragTargetPosition && this._notify('changeDragTarget', [model.getDragEntity(), dragTargetPosition.item, dragTargetPosition.position]) !== false) {
                        model.setDragTargetPosition(dragTargetPosition);
                    }
                }
                if (itemData.item.get(itemData.nodeProperty) !== null && (!this._expandOnDragData || this._expandOnDragData !== itemData) && !itemData.isExpanded) {
                    this._clearTimeoutForExpandOnDrag(this);
                    this._expandOnDragData = itemData;
                    this._setTimeoutForExpandOnDrag(this._expandOnDragData);
                }
            }
        }
    },

    _onItemClick: function(e, item, originalEvent, columnIndex: number) {
        e.stopPropagation();
        const eventResult = this._notify('itemClick', [item, originalEvent, columnIndex], { bubbling: true });
        if (eventResult !== false && this._options.expandByItemClick && item.get(this._options.nodeProperty) !== null) {
            const display = this._children.baseControl.getViewModel().getDisplay();
            const dispItem = display.getItemBySourceItem(item);

            // Если в проекции нет такого элемента, по которому произошел клик, то это хлебная крошка, а не запись.
            // После исправления ошибки событие itemClick не будет стрелять при клике на крошку.
            // https://online.sbis.ru/opendoc.html?guid=4017725f-9e22-41b9-adab-0d79ad13fdc9
            if (dispItem) {
                _private.toggleExpanded(this, dispItem);
            }
        }
    },

    handleKeyDown(event): void {
        this._onTreeViewKeyDown(event);
        if (!event.stopped && event._bubbling !== false) {
            this._children.baseControl.handleKeyDown(event);
        }
    },

    _onTreeViewKeyDown: function(event) {
        keysHandler(event, HOT_KEYS, _private, this);
    },

    _beforeUnmount: function() {
        _private.clearNodesSourceControllers(this);
        TreeControl.superclass._beforeUnmount.apply(this, arguments);
        this._clearTimeoutForExpandOnDrag();
    }
});
TreeControl._theme = ['Controls/treeGrid'];

TreeControl.getDefaultOptions = () => {
    return {
        uniqueKeys: true,
        filter: {},
        markItemByExpanderClick: true,
        expandByItemClick: false,
        root: null,
        columns: DEFAULT_COLUMNS_VALUE,
        selectDescendants: true,
        selectAncestors: true
    };
};

TreeControl._private = _private;

export = TreeControl;

/**
 * @event Controls/_treeGrid/TreeControl#expandedItemsChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Array.<Number|String>} expandedItems Массив с идентификаторами развернутых элементов.
 */
