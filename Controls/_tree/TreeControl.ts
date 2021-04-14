import {Control} from 'UI/Base';
import {isEqual} from 'Types/object';
import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';

import {saveConfig} from 'Controls/Application/SettingsController';
import {EventUtils} from 'UI/Events';
import {MouseButtons, MouseUp} from 'Controls/popup';
import {error as dataSourceError, NewSourceController} from 'Controls/dataSource';
import {selectionToRecord} from 'Controls/operations';
import {Collection, Tree, TreeItem} from 'Controls/display';
import {ISelectionObject, TKey} from 'Controls/interface';
import {CrudEntityKey, DataSet, LOCAL_MOVE_POSITION} from 'Types/source';
import {SyntheticEvent} from 'UI/Vdom';
import {constants} from 'Env/Env';
import cClone = require('Core/core-clone');
import Env = require('Env/Env');
import Deferred = require('Core/Deferred');


import TreeControlTpl = require('wml!Controls/_tree/TreeControl/TreeControl');

const HOT_KEYS = {
    expandMarkedItem: Env.constants.key.right,
    collapseMarkedItem: Env.constants.key.left
};

const DRAG_MAX_OFFSET = 0.3;
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
    toggleExpandedOnNewModel(self: any, options: any, model: Tree<Model>, item: TreeItem<Model>): void {
        const newExpandedState = !item.isExpanded();
        const itemKey = item.getContents().getKey();

        const newExpandedItems = cClone(options.expandedItems) || [];
        const newCollapsedItems = cClone(options.collapsedItems) || [];

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
    toggleExpandedOnModel: function(self, listViewModel, dispItem, expanded) {
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
    expandMarkedItem(self: typeof TreeControl): void {
        const markerController = self._children.baseControl._markerController;
        if (markerController && markerController.getMarkedKey() !== null) {
            const model = self._children.baseControl.getViewModel();
            const markedItem = model.getItemBySourceKey(markerController.getMarkedKey());
            if (markedItem && markedItem.isNode() !== null && !markedItem.isExpanded()) {
                self.toggleExpanded(markerController.getMarkedKey());
            }
        }
    },
    collapseMarkedItem(self: typeof TreeControl): void {
        const markerController = self._children.baseControl._markerController;
        if (markerController && markerController.getMarkedKey() !== null) {
            const model = self._children.baseControl.getViewModel();
            const markedItem = model.getItemBySourceKey(markerController.getMarkedKey());
            if (markedItem && markedItem.isNode() !== null && markedItem.isExpanded()) {
                self.toggleExpanded(markerController.getMarkedKey());
            }
        }
    },
    toggleExpanded: function(self, dispItem, model?) {
        const listViewModel = model || self._children.baseControl.getViewModel();
        const item = dispItem.getContents();
        const nodeKey = item.getId();
        const baseSourceController = self._children.baseControl.getSourceController();
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
                self._children.baseControl.showIndicator();
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
                        self._children.baseControl.hideIndicator();
                    }).catch((error: Error) => {
                        if (error.isCanceled) {
                            return;
                        }
                        _private.processError(self, error);
                        // Вернуть элемент модели в предыдущее состояние, т.к. раскрытие не состоялось.
                        _private.toggleExpandedOnModel(self, listViewModel, dispItem, !expanded);
                        self._children.baseControl.hideIndicator();
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
            self._children.baseControl.showIndicator('all');
            return eventResult.then(() => {
                self._children.baseControl.hideIndicator();
                return doExpand().then(expandToFirstLeafIfNeed);
            }, () => {
                self._children.baseControl.hideIndicator();
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
    shouldLoadChildren: function(self, nodeKey): boolean {
        // загружаем узел только если:
        // 1. он не был загружен ранее (проверяем через sourceController, была ли выполнена загрузка)
        // 2. у него вообще есть дочерние элементы (по значению поля hasChildrenProperty)
        const baseControl = self._children.baseControl;
        const viewModel = baseControl.getViewModel();
        const items = viewModel.getCollection();
        const dispItem = viewModel.getItemBySourceKey(nodeKey);
        const loadedChildren = dispItem && (self._options.useNewModel ?
            viewModel.getChildren(dispItem, items).getCount() :
            viewModel.getChildren(nodeKey, items).length);
        const isAlreadyLoaded =
            baseControl.getSourceController().hasLoaded(nodeKey) ||
            (self._options.taks1181268322 ? viewModel.getHasMoreStorage().hasOwnProperty(nodeKey) : loadedChildren);

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
        return baseSourceController.load('down', nodeKey)
            .then((list) => {
                const expandedItems = _private.getExpandedItems(self, self._options, listViewModel.getCollection());
                listViewModel.setHasMoreStorage(_private.prepareHasMoreStorage(baseSourceController, expandedItems));
                self._children.baseControl.stopBatchAdding();
                return list;
            })
            .catch((error) => {
                _private.processError(self, error);
                return error;
            })
            .finally(() => {
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

        const needResetExpandedItems = !(_private.isDeepReload(cfg, self._deepReload) &&
                                         expandedItemsKeys.length &&
                                         !isExpandAll);
        // состояние _needResetExpandedItems устанавливается при смене корня
        // переменная needResetExpandedItems вычисляется по опциям и состояниям
        if (baseControl && (needResetExpandedItems || self._needResetExpandedItems)) {
            baseControl.getSourceController().setExpandedItems([]);
        } else if (baseControl && !self._needResetExpandedItems && expandedItemsKeys.length) {
            baseControl.getSourceController().setExpandedItems(expandedItemsKeys);
        }
    },

    afterReloadCallback: function(self, options, loadedList: RecordSet, baseControlViewModel) {
        const baseControl = self._children.baseControl;
        // https://online.sbis.ru/opendoc.html?guid=d99190bc-e3e9-4d78-a674-38f6f4b0eeb0
        const viewModel = baseControl && baseControl.getViewModel();
        const sourceController = options.sourceController;
        const updateHasMoreStorage = (model) => {
            if (loadedList) {
                const modelHasMoreStorage = model.getHasMoreStorage();

                loadedList.each((item) => {
                    if (item.get(options.nodeProperty) !== null) {
                        const itemKey = item.getId();
                        const dispItem = model.getItemBySourceKey(itemKey);
                        if (dispItem && model.getChildren(dispItem, loadedList).length) {
                            modelHasMoreStorage[itemKey] = sourceController.hasMoreData('down', itemKey);
                        }
                    }
                });
            }
        };

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
                const hasMore = {};
                const expandedItems = _private.getExpandedItems(self, options, loadedList);
                let hasMoreData: unknown;

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
            updateHasMoreStorage(viewModel);
        } else if (baseControlViewModel && options.taks1181268322) {
            updateHasMoreStorage(baseControlViewModel);
        }

        // reset deepReload after loading data (see reload method or constructor)
        self._deepReload = false;
    },

    afterSetItemsOnReloadCallback(self): void {
        if (self._options.afterSetItemsOnReloadCallback instanceof Function) {
            self._options.afterSetItemsOnReloadCallback();
        }

        // После релоад разворачиваем узлы до первого leaf и ставим на него маркер
        if (self._options.markerMoveMode === 'leaves') {
            self._tempItem = null;
            self._currentItem = null;
            self.goToNext();
        }
    },

    resetExpandedItems(self): void {
        const viewModel = self._children.baseControl.getViewModel();
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

        filter[self._options.parentProperty] =
            nodes.concat(_private.getReloadableNodes(viewModel, key, self._keyProperty, nodeProperty));

        return baseSourceController.load(undefined, key, filter).addCallback((result) => {
            _private.applyReloadedNodes(viewModel, key, self._keyProperty, nodeProperty, result);
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

        itemsToRemove.forEach((item) => {
            items.remove(item);
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
    getTargetRow(self: any, event: SyntheticEvent): Element {
        if (!event.target || !event.target.classList || !event.target.parentNode || !event.target.parentNode.classList) {
            return event.target;
        }

        const startTarget = event.target;
        let target = startTarget;

        const condition = () => {
            // В плитках элемент с классом controls-ListView__itemV имеет нормальные размеры,
            // а в обычном списке данный элемент будет иметь размер 0x0
            if (self._children.baseControl.getViewModel()['[Controls/_tile/TreeTileViewModel]']) {
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

    getExpandedItems(self, options, items): TKey[] {
        const listViewModel = self._children.baseControl.getViewModel();
        const modelExpandedItems = listViewModel.getExpandedItems();
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
    _notifyHandler: EventUtils.tmplNotify,
    _errorController: null,
    _errorViewConfig: null,
    _editingItem: null,
    _currentItem: null,
    _tempItem: null,
    _markedLeaf: '',
    _goToNextAfterExpand: true,
    _scrollToLeaf: null,
    _scrollToLeafOnDrawItems: false,

    _itemOnWhichStartCountDown: null,
    _timeoutForExpandOnDrag: null,
    _keyProperty: null,

    constructor: function(cfg) {
        this._expandNodeOnDrag = this._expandNodeOnDrag.bind(this);
        if (typeof cfg.root !== 'undefined') {
            this._root = cfg.root;
        }
        if (cfg.expandedItems && cfg.expandedItems.length > 0) {
            this._deepReload = true;
        }
        this._beforeReloadCallback = _private.beforeReloadCallback.bind(null, this);
        this._keyDownHandler = this._keyDownHandler.bind(this);
        this._afterReloadCallback = _private.afterReloadCallback.bind(null, this);
        this._getHasMoreData = _private.getHasMoreData.bind(null, this);
        this._afterSetItemsOnReloadCallback = _private.afterSetItemsOnReloadCallback.bind(null, this);
        this._canChangeMarker = this._canChangeMarker.bind(this);
        this._errorController = cfg.errorController || new dataSourceError.Controller({});
        return TreeControl.superclass.constructor.apply(this, arguments);
    },

    _beforeMount(options): void {
        this._initKeyProperty(options);
        if (options.markerMoveMode === 'leaves') {

            // TODO: отрефакторить после наследования (TreeControl <- BaseControl)
            this._beforeMountCallback = ({viewModel, markerController}) => {
                const items = viewModel.getItems();
                const current = items.getRecordById(this._options.markedKey) || items.at(0);
                if (current) {
                    if (current.get(this._options.nodeProperty) !== null) {
                        this._tempItem = current.getKey();
                        this._currentItem = this._tempItem;
                        this._doAfterItemExpanded = (itemKey) => {
                            this._doAfterItemExpanded = null;
                            this._applyMarkedLeaf(itemKey, viewModel, markerController);
                        };
                        this._expandedItemsToNotify = this._expandToFirstLeaf(this._tempItem, viewModel.getItems(), viewModel);
                        if (this._expandedItemsToNotify) {
                            viewModel.setExpandedItems(this._expandedItemsToNotify);
                        }
                    } else {
                        this._applyMarkedLeaf(current.getKey(), viewModel, markerController);
                    }
                }
            };
        }
        if (options.sourceController) {
            // FIXME для совместимости, т.к. сейчас люди задают опции, которые требуетюся для запроса
            //  и на списке и на Browser'e
            const sourceControllerState = options.sourceController.getState();

            if (options.parentProperty && sourceControllerState.parentProperty !== options.parentProperty ||
                options.root !== undefined && options.root !== sourceControllerState.root) {
                options.sourceController.updateOptions({...options, keyProperty: this._keyProperty});
            }
        }
    },

    _afterMount: function() {
        const viewModel = this._children.baseControl.getViewModel();
        _private.initListViewModelHandler(this, viewModel);
        if (this._expandedItemsToNotify) {
            this._notify('expandedItemsChanged', [this._expandedItemsToNotify]);
            this._expandedItemsToNotify = null;
        }
    },
    _beforeUpdate: function(newOptions) {
        const baseControl = this._children.baseControl;
        const viewModel = baseControl.getViewModel();
        const sourceController = baseControl.getSourceController();
        const searchValueChanged = this._options.searchValue !== newOptions.searchValue;
        let updateSourceController = false;

        if ((this._options.keyProperty !== newOptions.keyProperty) || (newOptions.source !== this._options.source)) {
            this._initKeyProperty(newOptions);
        }

        if (typeof newOptions.root !== 'undefined' && this._root !== newOptions.root) {
            const sourceControllerRoot = sourceController.getState().root;

            this._root = newOptions.root;

            this._updatedRoot = !(newOptions.task1181246826 && sourceControllerRoot === this._root && sourceController.isLoading());

            if (sourceControllerRoot === undefined || sourceControllerRoot !== newOptions.root) {
                updateSourceController = true;
            }

            // Костыль, до 21.2000
            // Проблема возникает из-за того, что корень в модели меняется на callback загрузки данных
            // А при поиске запрос идёт за пределами списка
            if (searchValueChanged && newOptions.sourceController &&
                newOptions.viewModelConstructor === this._options.viewModelConstructor &&
                newOptions.searchValue) {
                viewModel.setRoot(newOptions.root);
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
        }

        if (newOptions.expandedItems && !isEqual(newOptions.expandedItems, viewModel.getExpandedItems()) && newOptions.source) {
            // Если обновился корень, то expandedItems нужно применить после релоада. Иначе из-за нового expandedItems
            // может вызваться загрузка данных по скроллу, которая прервет загрузку по смене узла, и в TreeControl не отработает колбэк загрузки данных
            if (((newOptions.source === this._options.source || newOptions.sourceController) && isEqual(newOptions.filter, this._options.filter) ||
                (searchValueChanged && newOptions.sourceController)) && !this._updatedRoot) {
                viewModel.setExpandedItems(newOptions.expandedItems);
            } else {
                this._updateExpandedItemsAfterReload = true;
            }
            if (newOptions.sourceController && !isEqual(newOptions.expandedItems, newOptions.sourceController.getExpandedItems())) {
                newOptions.sourceController.setExpandedItems(newOptions.expandedItems);
            }
        }
        if (newOptions.collapsedItems && !isEqual(newOptions.collapsedItems, viewModel.getCollapsedItems())) {
            viewModel.setCollapsedItems(newOptions.collapsedItems);
        }
        if (this._options.markedKey !== newOptions.markedKey) {
            if (newOptions.markerMoveMode === 'leaves') {
                this._applyMarkedLeaf(newOptions.markedKey, viewModel, this._children.baseControl.getMarkerController());
            }
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
        if (sourceController) {
            const sourceControllerState = sourceController.getState();
            if (newOptions.parentProperty && sourceControllerState.parentProperty !== newOptions.parentProperty) {
                updateSourceController = true;
            }
        }
        if (sourceController && updateSourceController) {
            sourceController.updateOptions({...newOptions, keyProperty: this._keyProperty});
        }
    },
    _componentDidUpdate() {
        if (this._scrollToLeaf && !this._scrollToLeafOnDrawItems) {
            this._scrollToLeaf();
            this._scrollToLeaf = null;
        }
    },
    _afterUpdate: function(oldOptions) {
        let afterUpdateResult;
        if (this._expandedItemsToNotify) {
            this._notify('expandedItemsChanged', [this._expandedItemsToNotify]);
            this._expandedItemsToNotify = null;
        }
        if (this._updatedRoot) {
            const sourceController = this._options.sourceController;
            const isSourceControllerLoadingNewData = sourceController && sourceController.isLoading();
            this._updatedRoot = false;
            // При смене корне, не надо запрашивать все открытые папки,
            // т.к. их может не быть и мы загрузим много лишних данных.
            // Так же учитываем, что вместе со сменой root могут поменять и expandedItems - тогда не надо их сбрасывать.
            if (isEqual(oldOptions.expandedItems, this._options.expandedItems)) {
                this._needResetExpandedItems = true;
            }
            // If filter or source was changed, do not need to reload again, baseControl reload list in beforeUpdate
            if (isEqual(this._options.filter, oldOptions.filter) &&
                this._options.source === oldOptions.source &&
                !isSourceControllerLoadingNewData) {
                afterUpdateResult = this._children.baseControl.reload();
            }
        }
        if (oldOptions.viewModelConstructor !== this._options.viewModelConstructor) {
            _private.initListViewModelHandler(this, this._children.baseControl.getViewModel());
        }

        return afterUpdateResult;
    },
    _beforeUnmount(): void {
        this._scrollToLeaf = null;
        this._clearTimeoutForExpandOnDrag();
    },
    _onDrawItems(): void {
        if (this._scrollToLeaf && this._scrollToLeafOnDrawItems) {
            this._scrollToLeaf();
            this._scrollToLeaf = null;
            this._scrollToLeafOnDrawItems = false;
        }
    },
    _initKeyProperty(options) {
        let keyProperty = options.keyProperty;
        if (keyProperty === undefined) {
            if (options.source && options.source.getKeyProperty) {
                keyProperty = options.source.getKeyProperty();
            }
        }
        if (keyProperty !== undefined) {
            this._keyProperty = keyProperty;
        }
    },

    resetExpandedItems(): void {
        _private.resetExpandedItems(this);
    },
    toggleExpanded: function(key, model?) {
        const listModel = model || this._children.baseControl.getViewModel();
        const item = listModel.getItemBySourceKey(key);
        return _private.toggleExpanded(this, item, model);
    },
    _onExpanderMouseDown(e, key, dispItem) {
        if (this._children.baseControl.isLoading()) {
            return;
        }
        if (MouseUp.isButton(e.nativeEvent, MouseButtons.Left)) {
            this._mouseDownExpanderKey = key;
        }
    },
    _onExpanderMouseUp: function(e, key, itemData) {
        if (this._children.baseControl.isLoading()) {
            return;
        }
        if (this._mouseDownExpanderKey === key && MouseUp.isButton(e.nativeEvent, MouseButtons.Left)) {
            const dispItem = this._options.useNewModel ? itemData : itemData.dispItem;
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
        return this._children.baseControl.scrollToItem(key, toBottom, force);
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

    moveItems(selection: ISelectionObject, targetKey: CrudEntityKey, position: LOCAL_MOVE_POSITION): Promise<DataSet> {
        return this._children.baseControl.moveItems(selection, targetKey, position);
    },

    moveItemUp(selectedKey: CrudEntityKey): Promise<void> {
        return this._children.baseControl.moveItemUp(selectedKey);
    },

    moveItemDown(selectedKey: CrudEntityKey): Promise<void> {
        return this._children.baseControl.moveItemDown(selectedKey);
    },

    moveItemsWithDialog(selection: ISelectionObject): Promise<DataSet> {
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
        const dispItem = this._options.useNewModel ? itemData : itemData.dispItem;
        const dndListController = this._children.baseControl.getDndListController();
        const targetIsNotDraggableItem = dndListController.getDraggableItem()?.getContents() !== dispItem.getContents();
        if (dispItem['[Controls/_display/TreeItem]'] && dispItem.isNode() && targetIsNotDraggableItem) {
            const dndListController = this._children.baseControl.getDndListController();
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
            const display = this._options.useNewModel ? this._children.baseControl.getViewModel() : this._children.baseControl.getViewModel().getDisplay();
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

    _onAfterBeginEdit(e, item, isAdd) {
        e.stopPropagation();
        this._notify('afterBeginEdit', [item, isAdd]);
        this._editingItem = item;
    },

    _onAfterEndEdit(e, item, isAdd) {
        e.stopPropagation();
        this._notify('afterEndEdit', [item, isAdd]);
        this._editingItem = null;
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
        EventUtils.keysHandler(event, HOT_KEYS, _private, this);
    },

    _startCountDownForExpandNode(item: TreeItem<Model>, expandNode: Function): void {
        if (!this._itemOnWhichStartCountDown && item.isNode()) {
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

    _calculateOffset(event: SyntheticEvent<MouseEvent>, targetElement: Element): {top: number, bottom: number} {
        let result = null;

        if (targetElement) {
            const dragTargetRect = targetElement.getBoundingClientRect();

            result = { top: null, bottom: null };

            // В плитке порядок записей слева направо, а не сверху вниз, поэтому считаем отступы слева и справа
            if (this._children.baseControl.getViewModel()['[Controls/_tile/TreeTileViewModel]']) {
                result.top = (event.nativeEvent.pageX - dragTargetRect.left) / dragTargetRect.width;
                result.bottom = (dragTargetRect.right - event.nativeEvent.pageX) / dragTargetRect.width;
            } else {
                result.top = (event.nativeEvent.pageY - dragTargetRect.top) / dragTargetRect.height;
                result.bottom = (dragTargetRect.top + dragTargetRect.height - event.nativeEvent.pageY) / dragTargetRect.height;
            }
        }

        return result;
    },

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
    },
    _expandToFirstLeaf(key: CrudEntityKey, items, listModel?): CrudEntityKey[] {
        if (items.getCount()) {
            const model = listModel || this._children.baseControl.getViewModel();
            const expanded = [key];
            let curItem = model.getChildren(key, items)[0];
            while (curItem && curItem.get(this._options.nodeProperty) !== null) {
                expanded.push(curItem.get(this._options.keyProperty));
                curItem = model.getChildren(curItem, items)[0];
            }
            if (curItem && this._doAfterItemExpanded) {
                this._doAfterItemExpanded(curItem.get(this._options.keyProperty));
            }
            return expanded;
        }
    },
    _getMarkedLeaf(key: CrudEntityKey, model): 'first' | 'last' | 'middle' | 'single' {
        const index = model.getIndexByKey(key);
        const hasNextLeaf = index < model.getCount() - 1;
        let hasPrevLeaf = false;
        for (let i = index - 1; i >= 0; i--) {
            if (model.at(i).isNode() === null || !this._isExpanded(model.at(i), model)) {
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
    },
    goToNext(listModel?, mController?): Promise {
        return new Promise((resolve) => {
            // Это исправляет ошибку плана 0 || null
            const key = this._tempItem === undefined || this._tempItem === null ? this._currentItem : this._tempItem;
            const item = this.getNextItem(key, listModel);
            const model = listModel || this._children.baseControl.getViewModel();
            const markerController = mController || this._children.baseControl.getMarkerController();
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
    },
    goToPrev(listModel?, mController?): Promise {
        return new Promise((resolve) => {
            const item = this.getPrevItem(this._tempItem || this._currentItem, listModel);
            const model = listModel || this._children.baseControl.getViewModel();
            const markerController = mController || this._children.baseControl.getMarkerController();
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
                                this._expandToFirstLeaf(itemKey, model.getItems(), model);
                                resolve();
                            });
                        } else {
                            this._expandToFirstLeaf(itemKey, model.getItems(), model);
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
    },
    _applyMarkedLeaf(key: CrudEntityKey, model, markerController): void {
        this._currentItem = key;
        const newMarkedLeaf = this._getMarkedLeaf(this._currentItem, model);
        if (this._markedLeaf !== newMarkedLeaf) {
            if (this._options.markedLeafChangeCallback) {
                this._options.markedLeafChangeCallback(newMarkedLeaf);
            }
            this._markedLeaf = newMarkedLeaf;
        }

        // TODO: отрефакторить после наследования (TreeControl <- BaseControl) Нужно вызывать BaseControl._private::changeMarkedKey
        if (markerController.getMarkedKey() !== this._currentItem) {
            markerController.setMarkedKey(this._currentItem);
            this._notify('markedKeyChanged', [this._currentItem]);
        }

        this._tempItem = null;
        this._goToNextAfterExpand = true;

    },
    _canChangeMarker(key: CrudEntityKey): boolean {
        // TODO: отрефакторить после наследования (TreeControl <- BaseControl)
        //  Нужно вызывать TreeControl::changeMarkedKey, который переопределит BaseControl._private::changeMarkedKey
        if (this._options.markerMoveMode === 'leaves') {
            const item = this._children.baseControl.getViewModel().getItemBySourceKey(key);
            return !item || item.isNode() === null;
        }
        return true;
    },
    getNextItem(key: CrudEntityKey, model?): Model {
        const listModel = model || this._children.baseControl.getViewModel();
        const nextItem = listModel.getNextByKey(key);
        return nextItem ? nextItem.getContents() : null;
    },
    getPrevItem(key: CrudEntityKey, model?): Model {
        const listModel = model || this._children.baseControl.getViewModel();
        const prevItem = listModel.getPrevByKey(key);
        return prevItem ? prevItem.getContents() : null;
    },
    _isExpanded(item, model): boolean {
        return model.getExpandedItems().indexOf(item.getContents().get(this._options.keyProperty)) > -1;
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
        expanderPosition: 'default',
        selectionType: 'all',
        markerMoveMode: 'all'
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
