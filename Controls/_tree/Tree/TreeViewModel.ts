import {ListViewModel, ItemsUtil, TreeItemsUtil} from 'Controls/list';
import cClone = require('Core/core-clone');
import { relation, Model } from 'Types/entity';
import { RecordSet, IObservable } from 'Types/collection';
import { isEqual } from 'Types/object';
import { TemplateFunction } from 'UI/Base';

import { IDragPosition } from 'Controls/display';
import {Logger} from 'UI/Utils';
import { TreeChildren, TreeItem } from 'Controls/display';
import {JS_SELECTORS as EDIT_IN_PLACE_JS_SELECTORS} from 'Controls/editInPlace';

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
            // TODO: Удалить #rea_1179794968
            if (typeof cfg.expanderDisplayMode !== 'undefined') {
                Logger.warn('TreeGrid: option expanderDisplayMode is deprecated and will be removed in first next major version after 15.6000. Use expanderVisibility.');
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
            if (action === IObservable.ACTION_REMOVE) {
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

        shouldDrawExpander(itemData, tmplExpanderIcon): boolean {
            const expanderIcon = itemData.getExpanderIcon(tmplExpanderIcon);

            // Hide expander icon if it is equal 'none' or render leafs
            if (expanderIcon === 'none' || itemData.item.get(itemData.nodeProperty) === null) {
                return false;
            }

            // For cases when expanderVisibility equal 'visible' or 'hasChildrenOrHover' always show the expander icon
            // For case when expanderVisibility equal 'hasChildren' show the expander icon if node has leafs
            return (itemData.expanderVisibility !== 'hasChildren' || itemData.thereIsChildItem && itemData.hasChildItem);
        },
        shouldDrawExpanderPadding(itemData, tmplExpanderIcon, tmplExpanderSize): boolean {
            const expanderIcon = itemData.getExpanderIcon(tmplExpanderIcon);
            const expanderPosition = itemData.getExpanderPosition();
            const expanderSize = itemData.getExpanderSize(tmplExpanderSize);

            if (itemData.expanderVisibility === 'hasChildren') {
                return itemData.thereIsChildItem && (expanderIcon !== 'none' && expanderPosition === 'default');
            } else {
                return !expanderSize && (expanderIcon !== 'none' && expanderPosition === 'default');
            }
        },
        getExpanderPaddingClasses(itemData, tmplExpanderSize, isNodeFooter): string {
            const expanderSize = itemData.getExpanderSize(tmplExpanderSize);
            let expanderPaddingClasses = `controls-TreeGrid__row-expanderPadding controls-TreeGrid__${isNodeFooter ? 'node-footer' : 'row'}-expanderPadding` + `_theme-${itemData.theme}`;
            expanderPaddingClasses += ' controls-TreeGrid__row-expanderPadding_size_' + (expanderSize || 'default') + `_theme-${itemData.theme}`;
            return expanderPaddingClasses;
        },
        getExpanderClasses(itemData, tmplExpanderIcon, tmplExpanderSize): string {
            const expanderIcon = itemData.getExpanderIcon(tmplExpanderIcon);
            const expanderSize = itemData.getExpanderSize(tmplExpanderSize);
            const expanderPosition = itemData.getExpanderPosition();
            const theme = itemData.theme;
            const isExpanded = itemData.isExpanded;
            const style = itemData.style || 'default';
            const itemType = itemData.item.get(itemData.nodeProperty);

            let expanderClasses = `controls-TreeGrid__row-expander_theme-${theme}`;
            let expanderIconClass = '';

            let expanderIconStyle = itemData.style;
            if (expanderPosition !== 'right') {
                expanderClasses += ` controls-TreeGrid__row_${style}-expander_size_${(expanderSize || 'default')}_theme-${theme} `;
            } else {
                expanderClasses += ` controls-TreeGrid__row_expander_position_right_theme-${theme} `;
                expanderIconStyle = 'default';
            }
            expanderClasses += EDIT_IN_PLACE_JS_SELECTORS.NOT_EDITABLE;

            expanderClasses += ` controls-TreeGrid__row-expander__spacingTop_${itemData.itemPadding.top}_theme-${theme}`;
            expanderClasses += ` controls-TreeGrid__row-expander__spacingBottom_${itemData.itemPadding.bottom}_theme-${theme}`;

            if (expanderIcon) {
                expanderIconClass = ' controls-TreeGrid__row-expander_' + expanderIcon;
                expanderClasses += expanderIconClass;

                // могут передать node или hiddenNode в этом случае добавляем наши классы для master/default
                if ((expanderIcon === 'node') || (expanderIcon === 'hiddenNode') || (expanderIcon === 'emptyNode')) {
                    expanderIconClass += '_' + (expanderIconStyle === 'master' ? 'master' : 'default');
                }
            } else {
                const needEmptyFolderIcon = itemData.expanderVisibility === 'hasChildrenOrHover' && !itemData.hasChildItem;
                if (needEmptyFolderIcon && !isExpanded) {
                    expanderIconClass = ' controls-TreeGrid__row-expander_visibility_hover';
                }

                // В случае если expanderVisibility === 'hasChildrenOrHover' и у узла нет дочерних элементов, то
                // рисуем иконку пустого узла. Во всех остальных случаях рисуем иконку в зависимости от типа узла.
                const iconType = needEmptyFolderIcon ? 'emptyNode' : itemType === true ? 'node' : 'hiddenNode';
                const iconStyle = expanderIconStyle === 'master' ? 'master' : 'default';

                expanderIconClass += ` controls-TreeGrid__row-expander_${iconType}_${iconStyle}`;
            }

            expanderClasses += expanderIconClass + `_theme-${theme}`;

            // добавляем класс свертнутости развернутости для тестов
            expanderClasses += ' controls-TreeGrid__row-expander' + (isExpanded ? '_expanded' : '_collapsed');
            // добавляем класс свертнутости развернутости стилевой
            expanderClasses += expanderIconClass + (isExpanded ? '_expanded' : '_collapsed') + `_theme-${theme}`;

            return expanderClasses;
        },
        getLevelIndentSize(expanderSize: string, levelIndentSize: string): string {
            const sizes = ['null', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl'];
            let resultLevelIndentSize;

            if (expanderSize && levelIndentSize) {
                if (sizes.indexOf(expanderSize) >= sizes.indexOf(levelIndentSize)) {
                    resultLevelIndentSize = expanderSize;
                } else {
                    resultLevelIndentSize = levelIndentSize;
                }
            } else if (!expanderSize && !levelIndentSize) {
                resultLevelIndentSize = 'default';
            } else {
                resultLevelIndentSize = expanderSize || levelIndentSize;
            }

            return resultLevelIndentSize;
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
            const isRootChild = (item) => item.get(current.parentProperty) === null;
            const getChildCount = (dispItem) => self._display.getChildren(dispItem).getCount();
            const hasChildren = (dispItem) => !!getChildCount(dispItem);
            const hasEditingInCurrent = (itemData) => {
                if (self.isEditing()) {
                    const editingItem = self.getDisplay().find((el) => el.isEditing()).contents;
                    return editingItem.get(itemData.parentProperty) === itemData.key;
                }
                return false;
            };
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
                    shouldDrawExpanderPadding: (expanderIcon, expanderSize) => _private.shouldDrawExpanderPadding(current, expanderIcon, expanderSize),
                    getExpanderPaddingClasses: (tmplExpanderSize) => _private.getExpanderPaddingClasses(current, tmplExpanderSize, true),
                    template: params.template,
                    hasMoreStorage: !!params.hasMoreStorage,
                    getExpanderSize: (tplExpanderSize) => tplExpanderSize || self._options.expanderSize,
                    getLevelIndentClasses: (expanderSize: string, levelIndentSize: string) => {
                        return current.getLevelIndentClasses(current, expanderSize, levelIndentSize);
                    }
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
            this._hasMoreStorage = {};
            this._hierarchyRelation = new relation.Hierarchy({
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

            dispItem.setExpanded(expanded);
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

        // TODO: Удалить #rea_1179794968
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
            const current = TreeViewModel.superclass.getItemDataByItem.apply(this, arguments);

            if (current._treeViewModelCached) {
                return current;
            } else {
                current._treeViewModelCached = true;
            }

            current.getExpanderIcon = (tmplExpanderIcon) => tmplExpanderIcon || this._options.expanderIcon;
            current.getExpanderPosition = () => this._options.expanderPosition;
            current.getExpanderSize = (tmplExpanderSize) => tmplExpanderSize || this._options.expanderSize;

            current.isDrawExpander = (columnIndex, expanderIcon, expanderPosition: 'default' | 'right') => {
                return ((current.hasMultiSelectColumn && columnIndex === 1 ||
                    !current.hasMultiSelectColumn && columnIndex === 0) &&
                    current.shouldDrawExpander(current, expanderIcon) &&
                    current.getExpanderPosition() === expanderPosition);
            };

            // 1. Нужен ли экспандер.
            current.shouldDrawExpander = _private.shouldDrawExpander;

            // 2. Классы экспандера.
            current.getExpanderClasses = () => _private.getExpanderClasses(current, ...arguments);

            // 3. Нужны ли отступы под экспандер
            current.shouldDrawExpanderPadding = _private.shouldDrawExpanderPadding;

            // 4. Отступы под экспандер
            current.getExpanderPaddingClasses = _private.getExpanderPaddingClasses;

            // todo remove multiSelectVisibility, multiSelectPosition and multiSelectClassList by task:
            // https://online.sbis.ru/opendoc.html?guid=50811b1e-7362-4e56-b52c-96d63b917dc9
            current.multiSelectVisibility = this._options.multiSelectVisibility;
            current.multiSelectPosition = this._options.multiSelectPosition;

            current.expanderVisibility = _private.getExpanderVisibility(this._options);
            current.getLevelIndentSize = _private.getLevelIndentSize;
            current.getLevelIndentClasses = (itemData, tmplExpanderSize: string, levelIndentSize: string): string => {
                const expanderSize = itemData.getExpanderSize(tmplExpanderSize);
                const correctLevelIndentSize = _private.getLevelIndentSize(expanderSize, levelIndentSize);
                return `controls-TreeGrid__row-levelPadding_size_${correctLevelIndentSize}_theme-${current.theme}`;
            };

            current.isExpanded = current.item && current.item.get && this.isExpanded(dispItem);
            current.parentProperty = this._options.parentProperty;
            current.nodeProperty = this._options.nodeProperty;
            current.thereIsChildItem = this._thereIsChildItem;
            current.hasChildItem = !current.isGroup && _private.hasChildItem(this, current.key);

            // todo https://online.sbis.ru/opendoc.html?guid=0649e69a-d507-4024-9f99-c70205f535ef
            current.expanderTemplate = this._options.expanderTemplate;
            current.footerContentTemplate = this._options.footerContentTemplate;

            if (current.item && current.item.get) {
                current.level = current.dispItem.getLevel();
            }

            if (this._dragTargetPosition && this._dragTargetPosition.position === 'on') {
                if (this._dragTargetPosition.index === current.index) {
                    current.dragTargetNode = true;
                }
                // Предыдущая позиция нужна, чтобы когда навели на узел, элемент не пропал из списка,
                // а отобразился там где был до наведения на узел
                if (this._prevDragTargetPosition && this._prevDragTargetPosition.index === current.index) {
                    current.dragTargetPosition = this._prevDragTargetPosition.position;
                    current.draggingItemData = this._draggingItemData;
                }
            }

            current.useNewNodeFooters = this._options.useNewNodeFooters;
            if (current.item && current.item.get) {
                _private.setNodeFooterIfNeed(this, current);
            }

            const originalGetVersion = current.getVersion;
            current.getVersion = () => {
                let version = originalGetVersion();
                if (current.dragTargetNode) {
                    version = 'DRAGTARGETNODE_' + version;
                }
                return version;
            };

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
        resetDraggedItems(): void {
            this._prevDragTargetPosition = null;
            TreeViewModel.superclass.resetDraggedItems.apply(this, arguments);
        },
        setDragEntity: function(entity) {
            var item;

            if (entity) {
                // Collapse all the nodes that we move.
                entity.getItems().forEach(function(id) {
                    item = this.getItemById(id, this.getKeyProperty());

                    // Not all of the moved items can be in the current recordSet
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
        setDragItemData(itemDragData: any): void {
            // Displays the movable item as closed
            if (itemDragData) {
                itemDragData.isExpanded = false;

                const getVersionOrigin = itemDragData.getVersion;
                itemDragData.getVersion = () => getVersionOrigin() + '_LEVEL_' + itemDragData.level;
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

                // The fake item must be displayed at the correct level.
                if (this._draggingItemData && targetPosition) {
                    this._draggingItemData.level = targetPosition.dispItem.getLevel();
                }
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
                        dispItem: this._draggingItemData.dispItem,
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
                if (this._display) {
                    this._display.setParentProperty(parentProperty);
                }
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
        thereIsChildItem(): boolean {
            return this._thereIsChildItem;
        },
        getDisplayChildrenCount(nodeId: number | string | null, items: RecordSet): number {
            const display = this.getDisplay();
            const curNodeChildren: TreeChildren<Model> = display.getChildren(display.getItemBySourceKey(nodeId));
            let childrenCount = curNodeChildren.getCount();

            curNodeChildren.forEach((child: TreeItem<Model>) => {
                const childId = child.getContents().getId();

                // Заменить на TreeItem.isExpanded(), пока он не работает, возвращает false.
                const isNodeExpanded = child.isNode() && (
                    this._expandedItems.indexOf(childId) !== -1 ||
                    (
                        this._expandedItems.length === 1 &&
                        this._expandedItems[0] === null &&
                        this._collapsedItems.indexOf(childId) === -1
                    )
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
