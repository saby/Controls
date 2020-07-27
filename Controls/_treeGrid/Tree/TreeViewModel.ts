import {ListViewModel, ItemsUtil, TreeItemsUtil} from 'Controls/list';
import cClone = require('Core/core-clone');
import _entity = require('Types/entity');
import collection = require('Types/collection');
import {isEqual} from 'Types/object';
import {TemplateFunction} from 'UI/Base';
import { IDragPosition, ITreeItemData } from 'Controls/listDragNDrop';
import { ItemsEntity } from 'Controls/dragnDrop';

var
    _private = {
        isVisibleItem: function(item) {
            var
                itemParent = item.getParent ? item.getParent() : undefined,
                isExpandAll = this.isExpandAll(this.expandedItems),
                keyProperty = this.keyProperty,
                collapsedItems = this.collapsedItems,
                expandedItems = this.expandedItems,
                hasChildItem = this.hasChildItem,
                itemParentContents;
            function isExpanded(contents) {
                var
                    expanded = false,
                    key;
                if (contents) {
                    key = contents.get(keyProperty);
                    if (isExpandAll) {
                        expanded = collapsedItems.indexOf(key) === -1 && hasChildItem(key);
                    } else {
                        expanded = expandedItems.indexOf(key) !== -1;
                    }
                }
                return expanded;
            }
            if (itemParent) {
                itemParentContents = itemParent.getContents();
                if (itemParent.isRoot()) {
                    return itemParent.getOwner().isRootEnumerable() ? isExpanded(itemParentContents) : true;
                }
                if (isExpanded(itemParentContents)) {
                    return _private.isVisibleItem.call(this, itemParent);
                }
                return false;
            }
            return true;
        },

        getExpanderVisibility: function(cfg) {

            // Если передана новая опция, смотрим на нее, иначе приводим значения старой опции к новому,
            // поддерживая дефолтное значение "visible"
            // Выпилить в 19.200 https://online.sbis.ru/opendoc.html?guid=4e0354e9-0519-4714-a67c-a1af433820aa
            if (cfg.expanderVisibility) {
                return cfg.expanderVisibility;
            }
            return cfg.expanderDisplayMode === 'adaptive' ? 'hasChildren' : 'visible';
        },

        displayFilterTree: function(item, index, itemDisplay) {
            return _private.isVisibleItem.call(this, itemDisplay);
        },

        getDisplayFilter: function(data, cfg) {
            var
                filter = [];
            filter.push(_private.displayFilterTree.bind(data));
            if (cfg.itemsFilterMethod) {
                filter.push(cfg.itemsFilterMethod);
            }
            return filter;
        },

        hasChildItem: function(self, key) {
            var
                item;
            if (self._options.hasChildrenProperty) {
                item = self._items.getRecordById(key);
                return item ? !!item.get(self._options.hasChildrenProperty) : false;
            }
            return !!self._hierarchyRelation.getChildren(key, self._items).length;
        },

        determinePresenceChildItem: function(self) {
            var
                thereIsChildItem = false,
                items = self._items,
                rootItems;
            if (items) {
                rootItems = self._hierarchyRelation.getChildren(self._display.getRoot().getContents(), items);
                for (var idx = 0; idx < rootItems.length; idx++) {
                    if (_private.hasChildItem(self, rootItems[idx].getId())) {
                        thereIsChildItem = true;
                        break;
                    }
                }
            }
            self._thereIsChildItem = thereIsChildItem;
        },

        onBeginCollectionChange: function(self, action, newItems, newItemsIndex, removedItems, removedItemsIndex) {
            if (action === collection.IObservable.ACTION_REMOVE) {
                _private.checkRemovedNodes(self, removedItems);
            }
            if (_private.getExpanderVisibility(self._options) === 'hasChildren') {
                var currentValue = self._thereIsChildItem;

                _private.determinePresenceChildItem(self);

                if (currentValue !== self._thereIsChildItem) {
                    self._nextModelVersion();
                }
            }
        },

        removeNodeFromExpandedIfNeed: function(self, nodeId) {
            if (self._expandedItems.indexOf(nodeId) !== -1 && !_private.hasChildItem(self, nodeId)) {
                // If it is necessary to delete only the nodes deleted from the items, add this condition:
                // if (!self._items.getRecordById(nodeId)) {
                _private.removeNodeFromExpanded(self, nodeId);
            }
        },

        removeNodeFromExpanded: function(self, nodeId) {
            _private.removeFromArray(self._expandedItems, nodeId);
            self._notify('onNodeRemoved', nodeId);
        },

        removeFromArray: function(array, elem) {
            if (array.indexOf(elem) !== -1) {
                array.splice(array.indexOf(elem), 1);
            }
        },

        checkRemovedNodes: function(self, removedItems) {
            if (removedItems.length) {
                for (var idx = 0; idx < removedItems.length; idx++) {

                    // removedItems[idx].isNode - fast check on item type === 'group'
                    if (removedItems[idx].isNode && removedItems[idx].getContents().get(self._options.nodeProperty) !== null) {
                        _private.removeNodeFromExpandedIfNeed(self, removedItems[idx].getContents().getId());
                    }
                }
            }
        },
        shouldDrawExpander: function(itemData, expanderIcon) {
            if (expanderIcon === 'none' || itemData.item.get(itemData.nodeProperty) === null) {
                return false;
            }

            // Show expander icon if it is not equal 'none' or render leafs
            return (itemData.expanderVisibility !== 'hasChildren' || itemData.thereIsChildItem && itemData.hasChildItem);
        },
        shouldDrawExpanderPadding: function(itemData, expanderIcon, expanderSize) {
            if (itemData.expanderVisibility === 'hasChildren') {
                return itemData.thereIsChildItem && expanderIcon !== 'none';
            } else {
                return !expanderSize && expanderIcon !== 'none';
            }
        },
        getExpanderPaddingClasses: function(expanderSize, theme, isNodeFooter) {
            let expanderPaddingClasses = `controls-TreeGrid__row-expanderPadding controls-TreeGrid__${isNodeFooter ? 'node-footer' : 'row'}-expanderPadding` + `_theme-${theme}`;
            expanderPaddingClasses += ' controls-TreeGrid__row-expanderPadding_size_' + (expanderSize || 'default') + `_theme-${theme}`;
            return expanderPaddingClasses;
        },
        prepareExpanderClasses: function(itemData, expanderIcon, expanderSize, theme) {
            var
                itemType = itemData.item.get(itemData.nodeProperty),
                expanderClasses = `controls-TreeGrid__row-expander_theme-${theme}`,
                style = itemData.style || 'default',
                expanderIconClass;

            expanderClasses += ' controls-TreeGrid__row_' + style + '-expander_size_' + (expanderSize || 'default') + `_theme-${theme}`;
            expanderClasses += ' js-controls-ListView__notEditable';

            expanderClasses += ` controls-TreeGrid__row-expander__spacingTop_${itemData.itemPadding.top}_theme-${theme}`;
            expanderClasses += ` controls-TreeGrid__row-expander__spacingBottom_${itemData.itemPadding.bottom}_theme-${theme}`;

            if (expanderIcon) {
                expanderIconClass = ' controls-TreeGrid__row-expander_' + expanderIcon;
                expanderClasses += expanderIconClass;

                // могут передать node или hiddenNode в этом случае добавляем наши классы для master/default
                if ((expanderIcon === 'node') || (expanderIcon === 'hiddenNode')) {
                    expanderIconClass += '_' + (itemData.style === 'master' || itemData.style === 'masterClassic' ? 'master' : 'default');
                }
            } else {
                expanderIconClass = ' controls-TreeGrid__row-expander_' + (itemType === true ? 'node_' : 'hiddenNode_')
                + (itemData.style === 'master' || itemData.style === 'masterClassic' ? 'master' : 'default');
            }

            expanderClasses += expanderIconClass + `_theme-${theme}`;

            // добавляем класс свертнутости развернутости для тестов
            expanderClasses += ' controls-TreeGrid__row-expander' + (itemData.isExpanded ? '_expanded' : '_collapsed');
            // добавляем класс свертнутости развернутости стилевой
            expanderClasses += expanderIconClass + (itemData.isExpanded ? '_expanded' : '_collapsed') + `_theme-${theme}`;

            return expanderClasses;
        },
        prepareCollapsedItems: function(expandedItems, collapsedItems) {
            if (_private.isExpandAll(expandedItems) && collapsedItems) {
                return cClone(collapsedItems);
            }
            return [];
        },
        isExpandAll: function(expandedItems) {
            return expandedItems.indexOf(null) !== -1;
        },

        resetExpandedItems: function(self) {
            if (_private.isExpandAll(self._expandedItems)) {
                self._expandedItems = [null];
            } else {
                self._expandedItems = [];
            }
            self._collapsedItems = _private.prepareCollapsedItems(self._expandedItems, self._options.collapsedItems);
            if (self._display) {
                self._display.setFilter(self.getDisplayFilter(self.prepareDisplayFilterData(), self._options));
            }
            self._nextModelVersion();
            self._notify('expandedItemsChanged', self._expandedItems);
        },
        collapseChildNodes: function(self, nodeId) {
            self._hierarchyRelation.getChildren(nodeId, self._items).forEach(function(item) {
                var
                    itemId = item.getId();
                _private.removeFromArray(self._expandedItems, itemId);
                _private.collapseChildNodes(self, itemId);
            });
        },

        collapseNode: function (self, nodeId) {
            _private.removeFromArray(self._expandedItems, nodeId);
            _private.collapseChildNodes(self, nodeId);
        },

        getExpandedParents: function (self, elem) {
            let parents = [],
                parentId = null;
            while ((parentId = elem.getContents().get(self._options.parentProperty)) !== null) {
                elem = self.getItemById(parentId);
                parents.push(parentId);
            }
            return parents;
        },

        toggleSingleExpanded: function (self, itemId, parentId): void {
            let
                hasNoExpanded = self._expandedItems.length === 0;

            if (hasNoExpanded) {
                self._expandedItems.push(itemId);
                return;
            }

            if (self._expandedItems.indexOf(itemId) !== -1) {
                _private.collapseNode(self, itemId);
            } else {
                self.setExpandedItems(_private.getExpandedParents(self, self.getItemById(itemId)));
                self._expandedItems.push(itemId);
            }
        },

        isDrawNodeFooterTemplate(self, item) {
            let nodeFooterVisibility = !!self._options.nodeFooterTemplate;
            if (nodeFooterVisibility && self._options.nodeFooterVisibilityCallback) {
                nodeFooterVisibility = self._options.nodeFooterVisibilityCallback(item) !== false;
            }
            return nodeFooterVisibility;
        },

        setNodeFooterIfNeed(self, current) {
            current.nodeFooters = [];

            // Flat TileView uses TreeViewModel, but may has no hierarchy.
            if (!current.nodeProperty || !current.parentProperty) {
                return;
            }
            const theme = self._options.theme;
            const isRootChild = (item) => item.get(current.parentProperty) === null;
            const getChildCount = (dispItem) => self._display.getChildren(dispItem).getCount();
            const hasChildren = (dispItem) => !!getChildCount(dispItem);
            const hasEditingInCurrent = (itemData) => !!self._editingItemData && self._editingItemData.item.get(itemData.parentProperty) === itemData.key;
            const isNotLeaf = (item) => !!item && item.get && item.get(current.nodeProperty) !== null;

            const fillNodeFooter = (params: {
                key: string | number | null,
                dispItem: unknown,
                template?: TemplateFunction,
                hasMoreStorage?: boolean
            }) => {
                current.nodeFooters.push({
                    key: params.key,
                    item: params.dispItem.getContents(),
                    dispItem: params.dispItem,
                    level: params.dispItem.getLevel(),
                    getExpanderPaddingClasses: _private.getExpanderPaddingClasses,
                    multiSelectVisibility: self._options.multiSelectVisibility,
                    template: params.template,
                    hasMoreStorage: !!params.hasMoreStorage,
                    getExpanderSize: (tplExpanderSize) => tplExpanderSize || self._options.expanderSize
                });
            };

            // Сначала проверим данный узел. В нем мы можем отрисовать только nodeFooter, при условии,
            // что в нем нет детей, потому что если есть, то все подвалы  будут рисоваться у его последнего ребенка.
            if (isNotLeaf(current.item) && current.isExpanded) {
                current.hasChildren = hasChildren(current.dispItem) || hasEditingInCurrent(current);
                if (!current.hasChildren && _private.isDrawNodeFooterTemplate(self, current.item)) {
                    fillNodeFooter({
                        key: current.key,
                        dispItem: current.dispItem,
                        template: self._options.nodeFooterTemplate
                    });
                }
            }

            // Теперь рекурсивно заполняем подвалы пока не доберемся
            // 1) до корня
            // 2) или до узла, в котором данный узел не последний ребенок
            // 3) или до родителя который является листом.

            const isLastChild = (parent, child) => {
                const isLastInParent = (dispItem) => {
                    const _parentItem = dispItem.getParent().getContents();
                    const _parentKey = _parentItem && _parentItem.getId();
                    const _parentChildren = self._hierarchyRelation.getChildren(_parentKey, self._items);
                    return !!_parentChildren.length && _parentChildren[_parentChildren.length - 1].getId() === dispItem.getContents().getId();
                };

                let result = true;
                let currParent = child.getParent();
                let currentChild = child;

                // от переданного ребенка к переданному родителю.
                if (currParent === parent) {
                    result = isLastInParent(currentChild);
                } else {
                    do {
                        // У корня ключ null, берем его
                        const parentKey = currParent.getContents() && currParent.getContents().getId();
                        const parentChilds = self._hierarchyRelation.getChildren(parentKey, self._items);
                        if (parentChilds[parentChilds.length - 1].getId() === currentChild.getContents().getId()) {
                            currentChild = currParent;
                            currParent = currParent.getParent();
                        } else {
                            result = false;
                            break;
                        }
                    } while (currParent !== parent);
                }

                return result;
            };

            let curNodeForDispItem = current.dispItem;
            let curNodeForItem = curNodeForDispItem.getContents();
            let dispParent = curNodeForDispItem.getParent();

            while (
                dispParent &&
                curNodeForItem !== null &&
                !isRootChild(curNodeForItem) &&
                isNotLeaf(dispParent.getContents()) &&
                isLastChild(dispParent, curNodeForDispItem) &&
                !(current.isExpanded && current.hasChildren)
                ) {
                const parentItem = dispParent.getContents();
                const parentId = parentItem.getId();
                if (self._hasMoreStorage && self._hasMoreStorage[parentId]) {
                    fillNodeFooter({
                        key: parentId,
                        dispItem: dispParent,
                        hasMoreStorage: true
                    });
                } else if (_private.isDrawNodeFooterTemplate(self, parentItem)) {
                    fillNodeFooter({
                        key: parentId,
                        dispItem: dispParent,
                        template: self._options.nodeFooterTemplate
                    });
                }
                curNodeForDispItem = dispParent;
                curNodeForItem = parentItem;
                dispParent = curNodeForDispItem.getParent();
            }
        }

    },

    TreeViewModel = ListViewModel.extend({
        _expandedItems: null,
        _collapsedItems: null,
        _hasMoreStorage: null,
        _thereIsChildItem: false,

        constructor: function(cfg) {
            this._options = cfg;
            this._expandedItems = cfg.expandedItems ? cClone(cfg.expandedItems) : [];
            this._collapsedItems = _private.prepareCollapsedItems(this._expandedItems, cfg.collapsedItems);
            this._hierarchyRelation = new _entity.relation.Hierarchy({
                keyProperty: cfg.keyProperty || 'id',
                parentProperty: cfg.parentProperty || 'Раздел',
                nodeProperty: cfg.nodeProperty || 'Раздел@'
            });
            TreeViewModel.superclass.constructor.apply(this, arguments);
            if (_private.getExpanderVisibility(this._options) === 'hasChildren') {
                _private.determinePresenceChildItem(this);
            }
        },

        setExpandedItems: function(expandedItems: Array<unknown>) {
            if (!isEqual(this._expandedItems, expandedItems)) {
                this._expandedItems = expandedItems ? cClone(expandedItems) : [];
                this._collapsedItems = _private.prepareCollapsedItems(expandedItems, this._options.collapsedItems);
                this._display.setFilter(this.getDisplayFilter(this.prepareDisplayFilterData(), this._options));
                this._nextModelVersion();
            }
        },

        setCollapsedItems: function(collapsedItems: Array<unknown>) {
            if (!isEqual(this._collapsedItems, collapsedItems)) {
                this._collapsedItems = _private.prepareCollapsedItems(this._options.expandedItems, collapsedItems ? collapsedItems : []);
                this._display.setFilter(this.getDisplayFilter(this.prepareDisplayFilterData(), this._options));
                this._nextModelVersion();
            }
        },

        getExpandedItems: function() {
            return this._expandedItems;
        },

        resetExpandedItems: function() {
            _private.resetExpandedItems(this);
        },

        getCollapsedItems(): unknown[] {
            return this._collapsedItems;
        },

        _prepareDisplay: function(items, cfg) {
            return TreeItemsUtil.getDefaultDisplayTree(items, cfg, this.getDisplayFilter(this.prepareDisplayFilterData(), cfg));
        },

        getItemType(dispItem) {
            const contents = dispItem && dispItem.getContents();
            if (contents && contents.get) {
                const itemType = contents.get(this._options.nodeProperty);
                if (itemType === false) {
                    return 'hiddenNode';
                }
                if (itemType === true) {
                    return 'node';
                }
            }
            return 'leaf';
        },

        isExpanded: function(dispItem) {
            var
                itemId = dispItem.getContents().getId();
            return _private.isExpandAll(this._expandedItems) ? (this._collapsedItems.indexOf(itemId) === -1)
                : (this._expandedItems.indexOf(itemId) !== -1);
        },

        isExpandAll: function() {
            return _private.isExpandAll(this.getExpandedItems());
        },

        setExpanderSize(expanderSize): void {
            this._options.expanderSize = expanderSize;
        },

        toggleExpanded: function(dispItem, expanded) {
            var
                itemId = dispItem.getContents().getId(),
                parentId = dispItem.getContents().get(this._options.parentProperty),
                currentExpanded = this.isExpanded(dispItem);

            if (expanded !== currentExpanded || expanded === undefined) {
                if (_private.isExpandAll(this._expandedItems)) {
                    if (expanded) {
                        _private.removeFromArray(this._collapsedItems,itemId);
                    } else {
                        this._collapsedItems.push(itemId);
                    }
                    this._notify('collapsedItemsChanged', this._collapsedItems);
                } else if (this._options.singleExpand) {
                    _private.toggleSingleExpanded(this, itemId, parentId);

                } else {
                    if (this._expandedItems.indexOf(itemId) !== -1) {
                        _private.collapseNode(this, itemId);
                    } else {
                        this._expandedItems.push(itemId);
                    }
                }
                this._display.setFilter(this.getDisplayFilter(this.prepareDisplayFilterData(), this._options));
                this.updateDragItemIndex(this._draggingItemData);
                this._nextModelVersion(true, 'expandedChanged', null, [dispItem]);
                this._notify('expandedItemsChanged', this._expandedItems);
            }
        },

        getDisplayFilter: function(data, cfg) {
            return Array.prototype.concat(TreeViewModel.superclass.getDisplayFilter.apply(this, arguments),
                _private.getDisplayFilter(data, cfg));
        },

        getLastItem: function() {
            return ItemsUtil.getLastItem(this._display.getChildren(this._display.getRoot()));
        },

        prepareDisplayFilterData: function() {
            var
                data = TreeViewModel.superclass.prepareDisplayFilterData.apply(this, arguments);
            data.keyProperty = this.getKeyProperty();
            data.expandedItems = this._expandedItems;
            data.collapsedItems = this._collapsedItems;
            data.isExpandAll = _private.isExpandAll;
            data.hasChildItem = _private.hasChildItem.bind(null, this);
            return data;
        },

        _onBeginCollectionChange: function(action, newItems, newItemsIndex, removedItems, removedItemsIndex) {
            TreeViewModel.superclass._onBeginCollectionChange.apply(this, arguments);
            _private.onBeginCollectionChange(this, action, newItems, newItemsIndex, removedItems, removedItemsIndex);
        },

        setNodeFooterTemplate: function(nodeFooterTemplate) {
            this._options.nodeFooterTemplate = nodeFooterTemplate;
            this._nextModelVersion();
        },

        getNodeFooterTemplate: function() {
            return this._options.nodeFooterTemplate;
        },

        setExpanderDisplayMode: function(expanderDisplayMode) {
            this._options.expanderDisplayMode = expanderDisplayMode;
            this._nextModelVersion();
        },

        setExpanderVisibility: function(expanderVisibility) {
            this._options.expanderVisibility = expanderVisibility;
            if (_private.getExpanderVisibility(this._options) === 'hasChildren') {
                _private.determinePresenceChildItem(this);
            }
            this._nextModelVersion();
        },

        setItems(): void {
            TreeViewModel.superclass.setItems.apply(this, arguments);
            if (_private.getExpanderVisibility(this._options) === 'hasChildren') {
                _private.determinePresenceChildItem(this);
            }
        },

        getItemDataByItem: function(dispItem) {
            var
                current = TreeViewModel.superclass.getItemDataByItem.apply(this, arguments);

            if (current._treeViewModelCached) {
                return current;
            } else {
                current._treeViewModelCached = true;
            }

            current.isExpanded = current.item.get && this.isExpanded(dispItem);
            current.parentProperty = this._options.parentProperty;
            current.nodeProperty = this._options.nodeProperty;
            current.expanderVisibility = _private.getExpanderVisibility(this._options);
            current.thereIsChildItem = this._thereIsChildItem;
            current.hasChildItem = !current.isGroup && _private.hasChildItem(this, current.key);
            current.shouldDrawExpander = _private.shouldDrawExpander;
            current.shouldDrawExpanderPadding = _private.shouldDrawExpanderPadding;
            current.getExpanderPaddingClasses = _private.getExpanderPaddingClasses;
            current.prepareExpanderClasses = _private.prepareExpanderClasses;

            current.getExpanderSize = (tplExpanderSize) => tplExpanderSize || this._options.expanderSize;

            // todo https://online.sbis.ru/opendoc.html?guid=0649e69a-d507-4024-9f99-c70205f535ef
            current.expanderTemplate = this._options.expanderTemplate;

            if (current.item.get) {
                current.level = current.dispItem.getLevel();
            }


            if (this._dragTargetPosition) {
                if (this._dragTargetPosition.position === 'on' && this._dragTargetPosition.index === current.index) {
                    current.dragTargetNode = true;
                }
                if (this._dragTargetPosition.position === 'on' && this._prevDragTargetPosition && this._prevDragTargetPosition.index === current.index) {
                    current.dragTargetPosition = this._prevDragTargetPosition.position;
                    current.draggingItemData = this._draggingItemData;
                }
            }

           current.useNewNodeFooters = this._options.useNewNodeFooters;
           if (current.item.get) {
               _private.setNodeFooterIfNeed(this, current);
           }
            return current;
        },

        _calcItemVersion(item, key): string {
            let version = TreeViewModel.superclass._calcItemVersion.apply(this, arguments);

            if (this._expandedItems.indexOf(key) >= 0) {
                version = 'EXPANDED_' + version;
            } else if (this._collapsedItems.indexOf(key) >= 0) {
                version = 'COLLAPSED_' + version;
            }

            return version;
        },

        setDraggedItems(draggedItem: ITreeItemData, dragEntity: ItemsEntity): void {
            this.setDragItemData(draggedItem);
            this.setDragEntity(dragEntity);
        },
        setDragPosition(position: IDragPosition): void {
            this.setDragTargetPosition(position);
        },
        resetDraggedItems(): void {
            this._dragEntity = null;
            this._draggingItemData = null;
            this._dragTargetPosition = null;
            this._prevDragTargetPosition = null;
            this._nextModelVersion(true);
        },
        setDragEntity: function(entity) {
            var item;

            if (entity) {
                //Collapse all the nodes that we move.
                entity.getItems().forEach(function(id) {
                    item = this.getItemById(id, this.getKeyProperty());

                    //Not all of the moved items can be in the current recordSet
                    if (item) {
                        this.toggleExpanded(item, false);
                    }
                }, this);
            }

            TreeViewModel.superclass.setDragEntity.apply(this, arguments);
        },
        updateDragItemIndex: function(itemData) {
            if (itemData) {
                itemData.index = this._display.getIndex(itemData.dispItem);
            }
        },
        setDragItemData: function(itemDragData) {
            var getVersionOrigin;

            //Displays the movable item as closed
            if (itemDragData) {
                itemDragData.isExpanded = false;

                getVersionOrigin = itemDragData.getVersion;
                itemDragData.getVersion = function() {
                    return getVersionOrigin() + '_LEVEL_' + itemDragData.level;
                };
            }
            TreeViewModel.superclass.setDragItemData.apply(this, arguments);
        },

        setDragTargetPosition: function(targetPosition) {
            if (targetPosition && targetPosition.position === 'on') {

                // When an item is moved to a folder, the fake record should be displayed at the previous position.
                // If do not display the fake entry, there will be a visual jump of the interface.
                this._setPrevDragTargetPosition(targetPosition);
            } else {
                this._prevDragTargetPosition = null;
            }

            TreeViewModel.superclass.setDragTargetPosition.apply(this, arguments);
        },

        getPrevDragPosition(): IDragPosition {
            return this._prevDragTargetPosition;
        },

        _setPrevDragTargetPosition: function(targetPosition) {
            if (!this._prevDragTargetPosition) {
                if (this._dragTargetPosition) {
                    this._prevDragTargetPosition = this._dragTargetPosition;
                } else if (this._draggingItemData) {
                    this._prevDragTargetPosition = {
                        index: this._draggingItemData.index,
                        item: this._draggingItemData.item,
                        data: this._draggingItemData,
                        position: this._draggingItemData.index > targetPosition.index ? 'after' : 'before'
                    };
                }
            }
        },

        setHasMoreStorage: function(hasMoreStorage) {
            if (hasMoreStorage !== this._hasMoreStorage) {
                this._hasMoreStorage = hasMoreStorage;
                this._nextModelVersion();
            }
        },

        getHasMoreStorage: function() {
            return this._hasMoreStorage;
        },

        getHierarchyRelation: function () {
            return this._hierarchyRelation;
        },

        getRoot: function() {
            return this._display ? this._display.getRoot() : undefined;
        },

        setRoot: function(root) {
            this._expandedItems = [];
            this._display.setRoot(root);
            this._options.root = root;
            this._nextModelVersion();
        },
        setNodeProperty(nodeProperty: string): void {
            if (nodeProperty !== this._options.nodeProperty) {
                this._options.nodeProperty = nodeProperty;
            }
        },
        setParentProperty(parentProperty: string): void {
            if (parentProperty !== this._options.parentProperty) {
                this._options.parentProperty = parentProperty;
            }
        },
        setHasChildrenProperty(hasChildrenProperty: string): void {
            if (hasChildrenProperty !== this._options.hasChildrenProperty) {
                this._options.hasChildrenProperty = hasChildrenProperty;
            }
        },
        getChildren: function(rootId, items) {
            return this._hierarchyRelation.getChildren(rootId, items || this._items);
        },
        getDisplayChildrenCount(nodeId: number | string | null, items: RecordSet): number {
            const display = this.getDisplay();
            let curNodeChildren: TreeChildren = display.getChildren(display.getItemBySourceKey(nodeId));
            let childrenCount = curNodeChildren.getCount();

            curNodeChildren.forEach((child: TreeItem) => {
                const childId = child.getContents().getId();

                // Заменить на TreeItem.isExpanded(), пока он не работает, возвращает false.
                const isNodeExpanded = child.isNode() && (
                    this._expandedItems.indexOf(childId) !== -1 ||
                    (this._expandedItems.length === 1 && this._expandedItems[0] === null && this._collapsedItems.indexOf(childId) === -1)
                );

                if (isNodeExpanded) {
                    childrenCount += this.getDisplayChildrenCount(childId, items);
                }
            });

            return childrenCount;
        }
    });

TreeViewModel._private = _private;

export = TreeViewModel;
