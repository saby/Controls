import Control = require('Core/Control');
import cClone = require('Core/core-clone');
import Env = require('Env/Env');
import Deferred = require('Core/Deferred');
import { isEqual } from 'Types/object';
import {RecordSet} from 'Types/collection';
import { Model } from 'Types/entity';

import { saveConfig } from 'Controls/Application/SettingsController';
import {tmplNotify, keysHandler} from 'Controls/eventUtils';
import { MouseButtons, MouseUp } from 'Controls/popup';
import { Controller as SourceController } from 'Controls/source';
import { error as dataSourceError, NewSourceController } from 'Controls/dataSource';
import selectionToRecord = require('Controls/_operations/MultiSelector/selectionToRecord');
import { TreeItem } from 'Controls/display';
import ArraySimpleValuesUtil = require('Controls/Utils/ArraySimpleValuesUtil');

import TreeControlTpl = require('wml!Controls/_tree/TreeControl/TreeControl');
import {ISelectionObject, TKey} from 'Controls/interface';
import {CrudEntityKey, LOCAL_MOVE_POSITION} from 'Types/source';
import { SyntheticEvent } from 'UI/Vdom';

const HOT_KEYS = {
    expandMarkedItem: Env.constants.key.right,
    collapseMarkedItem: Env.constants.key.left
};

const DRAG_MAX_OFFSET = 10;
const EXPAND_ON_DRAG_DELAY = 1000;
const DEFAULT_COLUMNS_VALUE = [];

const _private = {
    /**
     * @param {Controls/_tree/TreeControl} self
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
    changeMarkedKeyOnCollapseItemIfNeed(self: typeof TreeControl, collapsedItems: Array<TreeItem<Model>>, newExpandedState: boolean): void {
        // TODO исправить когда будет наследование TreeControl <- BaseControl
        const baseControl = self._children.baseControl;
        // не нужно устанаваливать маркер, если узел развернули, или маркер не нужно отображать, или нет свернутых узлов
        if (collapsedItems.length === 0 || newExpandedState === true || baseControl._options.markerVisibility === 'hidden' || !baseControl._markerController) {
            return;
        }

        const markerController = baseControl._markerController;
        const newMarkedKey = markerController.getMarkedKeyAfterCollapseItems(collapsedItems);
        baseControl.setMarkedKey(newMarkedKey);
    },
    getCollapsedItemsByOptions(
        self: typeof TreeControl,
        oldExpandedItems: [] = [],
        newExpandedItems: [] = [],
        oldCollapsedItems: [] = [],
        newCollapsedItems: [] = []
    ): Array<TreeItem<Model>> {
        // TODO исправить когда будет наследование TreeControl <- BaseControl
        const model = self._children.baseControl.getViewModel();
        const collapsedItems = [];

        if (!isEqual(oldExpandedItems, newExpandedItems)) {
            const expandedItemsDiff = ArraySimpleValuesUtil.getArrayDifference(oldExpandedItems, newExpandedItems);
            if (expandedItemsDiff.removed) {
                const removedExpandedItems = expandedItemsDiff.removed.map((key) => model.getItemBySourceKey(key));
                collapsedItems.push(...removedExpandedItems);
            }
        }

        if (!isEqual(oldCollapsedItems, newCollapsedItems)) {
            const collapsedItemsDiff = ArraySimpleValuesUtil.getArrayDifference(oldCollapsedItems, newCollapsedItems);
            if (collapsedItemsDiff.added) {
                const addedCollapsedItems = collapsedItemsDiff.added.map((key) => model.getItemBySourceKey(key));
                collapsedItems.push(...addedCollapsedItems);
            }
        }

        return collapsedItems;
    },
    toggleExpanded: function(self, dispItem) {
        const listViewModel = self._children.baseControl.getViewModel();
        const item = dispItem.getContents();
        const nodeKey = item.getId();
        const baseSourceController = self._children.baseControl.getSourceController();
        const expanded = !listViewModel.isExpanded(dispItem);
        const options = self._options;
        self._notify(expanded ? 'beforeItemExpand' : 'beforeItemCollapse', [dispItem.getContents()]);

        // todo: удалить события itemExpand и itemCollapse в 20.2000.
        self._notify(expanded ? 'itemExpand' : 'itemCollapse', [item]);
        if (
            !_private.isExpandAll(self._options.expandedItems) &&
            !baseSourceController.hasLoaded(nodeKey) &&
            !dispItem.isRoot() &&
            _private.shouldLoadChildren(self, nodeKey)
        ) {
            self._children.baseControl.showIndicator();
            return baseSourceController
                .load(undefined, nodeKey)
                .addCallbacks((list) => {
                    if (options.uniqueKeys) {
                        listViewModel.mergeItems(list);
                    } else {
                        listViewModel.appendItems(list);
                    }
                    // маркер нужно менять до изменения модели, т.к. после маркер уже пересчитается на другой элемент
                    _private.changeMarkedKeyOnCollapseItemIfNeed(self, [dispItem], expanded);
                    _private.toggleExpandedOnModel(self, listViewModel, dispItem, expanded);
                    listViewModel.setHasMoreStorage(
                        _private.prepareHasMoreStorage(baseSourceController, listViewModel.getExpandedItems())
                    );
                    if (options.nodeLoadCallback) {
                        options.nodeLoadCallback(list, nodeKey);
                    }
                }, (error) => {
                    _private.processError(self, error);
                    // Вернуть элемент модели в предыдущее состояние, т.к. раскрытие не состоялось.
                    _private.toggleExpandedOnModel(self, listViewModel, dispItem, !expanded);
                })
                .addCallback(() => {
                    self._children.baseControl.hideIndicator();
                });
        } else {
            // маркер нужно менять до изменения модели, т.к. после маркер уже пересчитается на другой элемент
            _private.changeMarkedKeyOnCollapseItemIfNeed(self, [dispItem], expanded);
            _private.toggleExpandedOnModel(self, listViewModel, dispItem, expanded);
        }
    },
    shouldLoadChildren: function(self, nodeKey): boolean {
        // загружаем узел только если:
        // 1. он не был загружен ранее (проверяем через sourceController, была ли выполнена загрузка)
        // 2. у него вообще есть дочерние элементы (по значению поля hasChildrenProperty)
        const baseControl = self._children.baseControl;
        const viewModel = baseControl.getViewModel();
        const isAlreadyLoaded = baseControl.getSourceController().hasLoaded(nodeKey);
        if (isAlreadyLoaded) {
            return false;
        }
        if (self._options.hasChildrenProperty) {
            const node = viewModel.getItems().getRecordById(nodeKey);
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
        const listViewModel = self._children.baseControl.getViewModel();
        const baseSourceController = self._children.baseControl.getSourceController();
        const nodeKey = dispItem.getContents().getId();

        self._children.baseControl.showIndicator();
        return baseSourceController.load('down', nodeKey).addCallbacks((list) => {
            listViewModel.setHasMoreStorage(
                _private.prepareHasMoreStorage(baseSourceController, listViewModel.getExpandedItems())
            );
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
    isExpandAll: function(expandedItems) {
        return expandedItems instanceof Array && expandedItems[0] === null;
    },
    isDeepReload: function({deepReload}, deepReloadState: boolean): boolean {
        return  deepReload || deepReloadState;
    },
    beforeReloadCallback: function(self, filter, sorting, navigation, cfg) {
        const baseControl = self._children.baseControl;

        let expandedItemsKeys: Array[number | string | null] = [];
        let isExpandAll: boolean;

        if (baseControl && baseControl.getViewModel() && !self._updateExpandedItemsAfterReload) {
            const viewModel = baseControl.getViewModel();
            isExpandAll = viewModel.isExpandAll();
            if (!isExpandAll) {
                viewModel.getExpandedItems().forEach((key) => {
                    expandedItemsKeys.push(key);
                });
            }
        } else {
            expandedItemsKeys = cfg.expandedItems || [];
            isExpandAll = _private.isExpandAll(expandedItemsKeys);
        }

        if (!(_private.isDeepReload(cfg, self._deepReload) && expandedItemsKeys.length && !isExpandAll)) {
            if (baseControl) {
                baseControl.getSourceController().setExpandedItems([]);
            }
        }
    },

    afterReloadCallback: function(self, options, loadedList: RecordSet) {
        const baseControl = self._children.baseControl;
        // https://online.sbis.ru/opendoc.html?guid=d99190bc-e3e9-4d78-a674-38f6f4b0eeb0
        const viewModel = baseControl && baseControl.getViewModel();

        if (viewModel) {
            const modelRoot = viewModel.getRoot();
            const root = self._options.root !== undefined ? self._options.root : self._root;
            const viewModelRoot = modelRoot ? modelRoot.getContents() : root;
            if (self._updateExpandedItemsAfterReload) {
                viewModel.setExpandedItems(options.expandedItems);
                self._updateExpandedItemsAfterReload = false;
            }
            const modelExpandedItems = viewModel.getExpandedItems();
            const isDeepReload = _private.isDeepReload(options, self._deepReload);

            if (!isDeepReload || self._needResetExpandedItems) {
                _private.resetExpandedItems(self);
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
                    }
                });

                // if method does not support multi navigation hasMore object will be empty
                if (!isEqual({}, hasMore)) {
                    viewModel.setHasMoreStorage(hasMore);
                }
            }
            if (loadedList) {
                const modelHasMoreStorage = viewModel.getHasMoreStorage();
                const sourceController = baseControl.getSourceController();

                loadedList.each((item) => {
                    if (item.get(options.nodeProperty) !== null) {
                        const itemKey = item.getId();

                        if (viewModel.getChildren(itemKey, loadedList).length) {
                            modelHasMoreStorage[itemKey] = sourceController.hasMoreData('down', itemKey);
                        }
                    }
                });
            }
        }
        // reset deepReload after loading data (see reload method or constructor)
        self._deepReload = false;
    },

    resetExpandedItems(self): void {
        const viewModel = self._children.baseControl.getViewModel();

        const collapsedItems = _private.getCollapsedItemsByOptions(self, viewModel.getExpandedItems(), [], [], []);
        _private.changeMarkedKeyOnCollapseItemIfNeed(self, collapsedItems, false);

        viewModel.resetExpandedItems();
        viewModel.setHasMoreStorage({});
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

    reloadItem: function(self, key: TKey) {
        const baseControl = self._children.baseControl;
        const baseSourceController = baseControl.getSourceController();
        const viewModel = baseControl.getViewModel();
        const filter = cClone(self._options.filter);
        const nodes = [key !== undefined ? key : null];
        const nodeProperty = self._options.nodeProperty;
        const keyProperty = self._options.keyProperty;

        filter[self._options.parentProperty] =
            nodes.concat(_private.getReloadableNodes(viewModel, key, keyProperty, nodeProperty));

        return baseSourceController.load(undefined, key, filter).addCallback((result) => {
            _private.applyReloadedNodes(viewModel, key, keyProperty, nodeProperty, result);
            viewModel.setHasMoreStorage(
                _private.prepareHasMoreStorage(baseSourceController, viewModel.getExpandedItems())
            );
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
    },

    /**
     * Получаем по event.target строку списка
     * @param event
     * @private
     * @remark это нужно для того, чтобы когда event.target это содержимое строки, которое по высоте меньше 20 px,
     *  то проверка на 10px сверху и снизу сработает неправильно и нельзя будет навести на узел(position='on')
     */
    getTargetRow(event: SyntheticEvent): Element {
        if (!event.target || !event.target.classList || !event.target.parentNode || !event.target.parentNode.classList) {
            return event.target;
        }

        const startTarget = event.target;
        let target = startTarget;

        while (!target.parentNode.classList.contains('controls-ListView__itemV')) {
            target = target.parentNode;

            // Условие выхода из цикла, когда controls-ListView__itemV не нашелся в родительских блоках
            if (!target.classList || !target.parentNode || !target.parentNode.classList
                || target.classList.contains('controls-BaseControl')) {
                target = startTarget;
                break;
            }
        }

        return target;
    }
};

/**
 * Hierarchical list control with custom item template. Can load data from data source.
 *
 * @class Controls/_tree/TreeControl
 * @mixes Controls/interface/IEditableList
 * @mixes Controls/_list/interface/IMovableList
 * @extends Controls/_list/ListControl
 *
 * @private
 */

var TreeControl = Control.extend(/** @lends Controls/_tree/TreeControl.prototype */{
    _template: TreeControlTpl,
    _root: null,
    _updatedRoot: false,
    _nodesSourceControllers: null,
    _needResetExpandedItems: false,
    _beforeReloadCallback: null,
    _afterReloadCallback: null,
    _getHasMoreData: null,
    _expandOnDragData: null,
    _updateExpandedItemsAfterReload: false,
    _notifyHandler: tmplNotify,
    _errorController: null,
    _errorViewConfig: null,

    _itemOnWhichStartCountDown: null,
    _timeoutForExpandOnDrag: null,

    constructor: function(cfg) {
        this._expandNodeOnDrag = this._expandNodeOnDrag.bind(this);
        if (typeof cfg.root !== 'undefined') {
            this._root = cfg.root;
        }
        if (cfg.expandedItems && cfg.expandedItems.length > 0) {
            this._deepReload = true;
        }
        this._beforeReloadCallback = _private.beforeReloadCallback.bind(null, this);
        this._afterReloadCallback = _private.afterReloadCallback.bind(null, this);
        this._getHasMoreData = _private.getHasMoreData.bind(null, this);
        this._errorController = cfg.errorController || new dataSourceError.Controller({});
        return TreeControl.superclass.constructor.apply(this, arguments);
    },

    _beforeMount(options): void {
        if (options.sourceController) {
            // FIXME для совместимости, т.к. сейчас люди задают опции, которые требуетюся для запроса
            //  и на списке и на Browser'e
            const sourceControllerState = options.sourceController.getState();

            if (options.parentProperty && sourceControllerState.parentProperty !== options.parentProperty ||
                options.root !== undefined && options.root !== sourceControllerState.root) {
                options.sourceController.updateOptions(options);
            }
        }
    },

    _afterMount: function() {
        _private.initListViewModelHandler(this, this._children.baseControl.getViewModel());
    },
    _beforeUpdate: function(newOptions) {
        const baseControl = this._children.baseControl;
        const viewModel = baseControl.getViewModel();
        const sourceController = baseControl.getSourceController();
        const searchValueChanged = this._options.searchValue !== newOptions.searchValue;
        let updateSourceController = false;

        if (typeof newOptions.root !== 'undefined' && this._root !== newOptions.root) {
            const sourceControllerRoot = sourceController.getState().root;

            this._root = newOptions.root;
            this._updatedRoot = true;

            if (sourceControllerRoot === undefined || sourceControllerRoot !== newOptions.root) {
                updateSourceController = true;
            }

            if (this.isEditing()) {
                baseControl.cancelEdit();
            }
        }

        if (this._options.deepReload !== newOptions.deepReload) {
            updateSourceController = true;
        }

        if (searchValueChanged && newOptions.searchValue && !_private.isDeepReload(this, newOptions)) {
            _private.resetExpandedItems(this);
        } else {
            const collapsedItems = _private.getCollapsedItemsByOptions(this, this._options.expandedItems, newOptions.expandedItems, this._options.collapsedItems, newOptions.collapsedItems);
            _private.changeMarkedKeyOnCollapseItemIfNeed(this, collapsedItems, false);
        }

        if (newOptions.expandedItems && !isEqual(newOptions.expandedItems, viewModel.getExpandedItems())) {
            if ((newOptions.source === this._options.source || newOptions.sourceController) && isEqual(newOptions.filter, this._options.filter) ||
                (searchValueChanged && newOptions.sourceController)) {
                viewModel.setExpandedItems(newOptions.expandedItems);
            } else {
                this._updateExpandedItemsAfterReload = true;
            }
            updateSourceController = true;
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
            updateSourceController = true;
        }
        if (newOptions.hasChildrenProperty !== this._options.hasChildrenProperty) {
            viewModel.setHasChildrenProperty(newOptions.hasChildrenProperty);
        }

        if (sourceController && updateSourceController) {
            sourceController.updateOptions(newOptions);
        }
    },
    _afterUpdate: function(oldOptions) {
        let afterUpdateResult;

        if (this._updatedRoot) {
            this._updatedRoot = false;
            // При смене корне, не надо запрашивать все открытые папки,
            // т.к. их может не быть и мы загрузим много лишних данных.
            // Так же учитываем, что вместе со сменой root могут поменять и expandedItems - тогда не надо их сбрасывать.
            if (!isEqual(oldOptions.expandedItems, this._options.expandedItems)) {
                this._needResetExpandedItems = true;
            }
            // If filter or source was changed, do not need to reload again, baseControl reload list in beforeUpdate
            if (isEqual(this._options.filter, oldOptions.filter) && this._options.source === oldOptions.source) {
                afterUpdateResult = this._children.baseControl.reload();
            }
        }
        if (oldOptions.viewModelConstructor !== this._options.viewModelConstructor) {
            _private.initListViewModelHandler(this, this._children.baseControl.getViewModel());
        }

        return afterUpdateResult;
    },
    resetExpandedItems(): void {
        _private.resetExpandedItems(this);
    },
    toggleExpanded: function(key) {
        const item = this._children.baseControl.getViewModel().getItemById(key, this._options.keyProperty);
        return _private.toggleExpanded(this, item);
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
                this.setMarkedKey(key);
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
    _onExpandedItemsChanged(e, expandedItems): void {
        this._notify('expandedItemsChanged', [expandedItems]);
        this._children.baseControl.getSourceController().setExpandedItems(expandedItems);
        // вызываем обновление, так как, если нет биндинга опции, то контрол не обновится.
        // А обновление нужно, чтобы отдать в модель нужные expandedItems
        this._forceUpdate();
    },
    _onCollapsedItemsChanged(e, collapsedItems) {
        this._notify('collapsedItemsChanged', [collapsedItems]);
        //вызываем обновление, так как, если нет биндинга опции, то контрол не обновится. А обновление нужно, чтобы отдать в модель нужные collapsedItems
        this._forceUpdate();
    },

    getItems(): RecordSet {
        return this._children.baseControl.getItems();
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
        this._children.baseControl.setMarkedKey(key);
    },
    scrollToItem(key: string|number, toBottom: boolean, force: boolean): void {
        this._children.baseControl.scrollToItem(key, toBottom, force);
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

    // region Edit in place

    isEditing(): Model {
        return this._children.baseControl.isEditing();
    },

    beginEdit(options) {
        return this._children.baseControl.beginEdit(options);
    },

    beginAdd(options) {
        return this._children.baseControl.beginAdd(options);
    },

    cancelEdit() {
        return this._children.baseControl.cancelEdit();
    },

    commitEdit() {
        return this._children.baseControl.commitEdit();
    },

    // endregion


    // region mover

    moveItems(selection: ISelectionObject, targetKey: CrudEntityKey, position: LOCAL_MOVE_POSITION): Promise<void> {
        return this._children.baseControl.moveItems(selection, targetKey, position);
    },

    moveItemUp(selectedKey: CrudEntityKey): Promise<void> {
        return this._children.baseControl.moveItemUp(selectedKey);
    },

    moveItemDown(selectedKey: CrudEntityKey): Promise<void> {
        return this._children.baseControl.moveItemDown(selectedKey);
    },

    moveItemsWithDialog(selection: ISelectionObject): Promise<void> {
        return this._children.baseControl.moveItemsWithDialog(selection);
    },

    // endregion mover

    // region remover

    removeItems(selection: ISelectionObject): Promise<void> {
        return this._children.baseControl.removeItems(selection);
    },

    removeItemsWithConfirmation(selection: ISelectionObject): Promise<void> {
        return this._children.baseControl.removeItemsWithConfirmation(selection);
    },

    // endregion remover

    _draggingItemMouseMove(e, itemData, nativeEvent): void {
        e.stopPropagation();
        if (itemData.dispItem.isNode()) {
            const dndListController = this._children.baseControl.getDndListController();
            const dispItem = this._options.useNewModel ? itemData : itemData.dispItem;
            const targetElement = _private.getTargetRow(nativeEvent);
            const mouseOffsetInTargetItem = this._calculateOffset(nativeEvent, targetElement);
            const dragTargetPosition = dndListController.calculateDragPosition({
                targetItem: dispItem,
                mouseOffsetInTargetItem
            });

        if (dragTargetPosition) {
            if (this._notify('changeDragTarget', [dndListController.getDragEntity(), dragTargetPosition.dispItem.getContents(), dragTargetPosition.position]) !== false) {
                dndListController.setDragPosition(dragTargetPosition);
            }

                /*
                    Если мы сверху меняем позицию на before, то есть перед этим узлом вставляем элемент,
                    то почему-то не срабатывает mouseLeave
                 */
                if (dragTargetPosition.position === 'before') {
                    this._clearTimeoutForExpandOnDrag();
                }
            }

            if (!itemData.isExpanded && dndListController.getDraggableItem() !== dispItem && this._isInsideDragTargetNode(nativeEvent, targetElement)) {
                this._startCountDownForExpandNode(dispItem, this._expandNodeOnDrag);
            }
        }
    },
    _draggingItemMouseLeave: function() {
        this._clearTimeoutForExpandOnDrag();
    },
    _dragEnd: function() {
        this._clearTimeoutForExpandOnDrag();
    },

    _expandNodeOnDrag(dispItem: TreeItem<Model>): void {
        _private.toggleExpanded(this, dispItem);
    },

    _onItemClick: function(e, item, originalEvent, columnIndex: number, returnExpandResult: boolean /* for tests */) {
        e.stopPropagation();
        const eventResult = this._notify('itemClick', [item, originalEvent, columnIndex], { bubbling: true });
        if (eventResult !== false && this._options.expandByItemClick && item.get(this._options.nodeProperty) !== null) {
            const display = this._children.baseControl.getViewModel().getDisplay();
            const dispItem = display.getItemBySourceItem(item);

            // Если в проекции нет такого элемента, по которому произошел клик, то это хлебная крошка, а не запись.
            // После исправления ошибки событие itemClick не будет стрелять при клике на крошку.
            // https://online.sbis.ru/opendoc.html?guid=4017725f-9e22-41b9-adab-0d79ad13fdc9
            if (dispItem) {
                const expandResult = _private.toggleExpanded(this, dispItem);

                if (returnExpandResult) {
                    return expandResult;
                }
            }
        }
        return eventResult;
    },

    handleKeyDown(event): void {
        this._onTreeViewKeyDown(event);
        if (!event.stopped && event._bubbling !== false) {
            this._children.baseControl.handleKeyDown(event);
        }
    },

    clearSelection(): void {
        this._children.baseControl.clearSelection();
    },

    isAllSelected(): void {
        this._children.baseControl.isAllSelected();
    },

    _onTreeViewKeyDown: function(event) {
        keysHandler(event, HOT_KEYS, _private, this);
    },

    _startCountDownForExpandNode(item: TreeItem<Model>, expandNode: Function): void {
        if (!this._itemOnWhichStartCountDown && item.isNode()) {
            this._clearTimeoutForExpandOnDrag();
            this._itemOnWhichStartCountDown = item;
            this._setTimeoutForExpandOnDrag(item, expandNode);
        }
    },

    _clearTimeoutForExpandOnDrag(): void {
        if (this._timeoutForExpandOnDrag) {
            clearTimeout(this._timeoutForExpandOnDrag);
            this._timeoutForExpandOnDrag = null;
            this._itemOnWhichStartCountDown = null;
        }
    },

    _setTimeoutForExpandOnDrag(item: TreeItem<Model>, expandNode: Function): void {
        this._timeoutForExpandOnDrag = setTimeout(() => {
            expandNode(item);
        }, EXPAND_ON_DRAG_DELAY);
    },

    _isInsideDragTargetNode(event: SyntheticEvent<MouseEvent>, targetElement: EventTarget): boolean {
        const offset = this._calculateOffset(event, targetElement);

        if (offset) {
            if (offset.top > DRAG_MAX_OFFSET && offset.bottom > DRAG_MAX_OFFSET) {
                return true;
            }
        }

        return false;
    },

    _calculateOffset(event: SyntheticEvent<MouseEvent>, targetElement: Element): {top: number, bottom: number} {
        let result = null;

        if (targetElement) {
            const dragTargetRect = targetElement.getBoundingClientRect();

            result = { top: null, bottom: null };
            result.top = event.nativeEvent.pageY - dragTargetRect.top;
            result.bottom = dragTargetRect.top + dragTargetRect.height - event.nativeEvent.pageY;
        }

        return result;
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
        selectAncestors: true,
        expanderPosition: 'default'
    };
};

TreeControl._private = _private;

export = TreeControl;

/**
 * @event Событие контрола.
 * @name Controls/_tree/TreeControl#expandedItemsChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Array.<Number|String>} expandedItems Массив с идентификаторами развернутых элементов.
 */
