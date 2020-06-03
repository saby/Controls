import {ListViewModel, ItemsUtil, TreeItemsUtil} from 'Controls/list';
import cClone = require('Core/core-clone');
import _entity = require('Types/entity');
import collection = require('Types/collection');
import {Tree as TreeCollectionDisplay, TreeItem as TreeCollectionDisplayItem, TreeChildren} from 'Controls/display';
import {Model} from 'Types/entity';
import {isEqual} from 'Types/object';
import {TemplateFunction} from 'UI/Base';

type TItemKey = number|string;
type TTreeItemType = 'leaf'|'node'|'hiddenNode';

type TreeDisplayItem = TreeCollectionDisplayItem<Model>;
type TreeDisplay = TreeCollectionDisplay<TreeDisplayItem>;
type TreeChildrenItems = TreeChildren<TreeDisplayItem>;

interface ITreeViewModelOptions {
    expandedItems: TItemKey[];
    collapsedItems: TItemKey[];
    itemsFilterMethod: Function;
    parentProperty: string;
    uniqueKeys: boolean;
    nodeProperty: string;
    expanderVisibility: string; // deprecated
    expanderDisplayMode: string;
    hasChildrenProperty: string;
    nodeFooterTemplate: TemplateFunction;
    nodeFooterVisibilityCallback: Function;
    theme: string;
}

interface IDisplayFilterData {
    uniqueKeys: boolean;
    expandedItems: TItemKey[];
    collapsedItems: TItemKey[];
    isExpandAll: Function;
    hasChildItem: Function;
}

interface ITreeViewModel {
    _options: ITreeViewModelOptions;

    _editingItemData: {};
    _items: collection.RecordSet;
    _display: TreeDisplay;
    _expandedItems: TItemKey[];
    _collapsedItems: TItemKey[];
    _hierarchyRelation: _entity.relation.Hierarchy;
    _thereIsChildItem: boolean;

    getDisplayFilter: Function;
    prepareDisplayFilterData: Function;
    setExpandedItems: Function;
}

var
    _private = {
        getDispItemKey(dispItem: TreeDisplayItem, hierarchical: boolean): string|number {
            if (hierarchical) {
                let hierarchicalKey = dispItem.getContents().getKey();
                let curItem = dispItem.getParent();
                if (!curItem.isRoot()) {
                    hierarchicalKey +=  ',';
                    while (!curItem.isRoot()) {
                        hierarchicalKey += curItem.getContents().getKey();
                        curItem = curItem.getParent();
                    }
                }
                return hierarchicalKey;
            } else {
                return dispItem.getContents().getKey();
            }
        },
        pushItemToKeysArray(dispItems: TreeDisplayItem, keysArray: TItemKey[], uniqueKeys: boolean): void {
            const hierarchicalKey = _private.getDispItemKey(dispItems, uniqueKeys === false);
            keysArray.push(hierarchicalKey);
        },
        removeItemFromKeysArray(dispItems: TreeDisplayItem, keysArray: TItemKey[], uniqueKeys: boolean): void {
            const hierarchicalKey = _private.getDispItemKey(dispItems, uniqueKeys === false);
            const itemIndex = keysArray.indexOf(hierarchicalKey);
            if (itemIndex !== -1) {
                keysArray.splice(itemIndex, 1);
            }
        },
        isItemInKeysArray(dispItems: TreeDisplayItem, keysArray: TItemKey[], uniqueKeys: boolean): boolean {
            const hierarchicalKey = _private.getDispItemKey(dispItems, uniqueKeys === false);
            return keysArray.indexOf(hierarchicalKey) !== -1;
        },
        isExpandedWithChild(dispItem: TreeDisplayItem, expandedItems: TItemKey[], collapsedItems: TItemKey[],
                   hasChildItem: Function, isExpandAll: boolean, uniqueKeys: boolean): boolean {
            let expanded = false;
            const item = dispItem.getContents();
            if (item) {
                if (isExpandAll) {
                    expanded = !_private.isItemInKeysArray(dispItem, collapsedItems, uniqueKeys) &&
                        hasChildItem(item.getKey());
                } else {
                    expanded = _private.isItemInKeysArray(dispItem, expandedItems, uniqueKeys);
                }
            }
            return expanded;
        },
        isVisibleItem(item: TreeDisplayItem): boolean {
            const itemParent = item.getParent ? item.getParent() : undefined;
            const isExpandAll = this.isExpandAll(this.expandedItems);
            if (itemParent) {
                if (itemParent.isRoot()) {
                    if (itemParent.getOwner().isRootEnumerable()) {
                        return _private.isExpandedWithChild(itemParent, this.expandedItems, this.collapsedItems,
                                                   this.hasChildItem, isExpandAll, this.uniqueKeys);
                    }
                    return true;
                }
                if (_private.isExpandedWithChild(itemParent, this.expandedItems, this.collapsedItems,
                                        this.hasChildItem, isExpandAll, this.uniqueKeys)) {
                    return _private.isVisibleItem.call(this, itemParent);
                }
                return false;
            }
            return true;
        },

        getExpanderVisibility(cfg: ITreeViewModelOptions): string {
            // Если передана новая опция, смотрим на нее, иначе приводим значения старой опции к новому,
            // поддерживая дефолтное значение "visible"
            // Выпилить в 19.200 https://online.sbis.ru/opendoc.html?guid=4e0354e9-0519-4714-a67c-a1af433820aa
            if (cfg.expanderVisibility) {
                return cfg.expanderVisibility;
            }
            return cfg.expanderDisplayMode === 'adaptive' ? 'hasChildren' : 'visible';
        },

        displayFilterTree(item: Model, index: number, itemDisplay: TreeDisplayItem): boolean {
            return _private.isVisibleItem.call(this, itemDisplay);
        },

        getDisplayFilter(data: IDisplayFilterData, cfg: ITreeViewModelOptions): Function[] {
            const filter = [];
            filter.push(_private.displayFilterTree.bind(data));
            if (cfg.itemsFilterMethod) {
                filter.push(cfg.itemsFilterMethod);
            }
            return filter;
        },

        hasChildItem(self: ITreeViewModel, key: TItemKey): boolean {
            const item = self._items.getRecordById(key);
            if (self._options.hasChildrenProperty) {
                return item ? !!item.get(self._options.hasChildrenProperty) : false;
            }
            return !!self._hierarchyRelation.getChildren(key, self._items).length;
        },

        determinePresenceChildItem(self: ITreeViewModel): void {
            let thereIsChildItem = false;
            const items = self._items;
            let rootItems;
            if (items) {
                rootItems = self._hierarchyRelation.getChildren(self._display.getRoot().getContents(), items);
                for (let idx = 0; idx < rootItems.length; idx++) {
                    const item = rootItems[idx];
                    if (_private.hasChildItem(self, item.getKey())) {
                        thereIsChildItem = true;
                        break;
                    }
                }
            }
            self._thereIsChildItem = thereIsChildItem;
        },

        onBeginCollectionChange(self: ITreeViewModel, action: string, newItems: TreeDisplayItem[],
                                newItemsIndex: number, removedItems: TreeDisplayItem[],
                                removedItemsIndex: number): void {
            if (action === collection.IObservable.ACTION_REMOVE) {
                _private.checkRemovedNodes(self, removedItems);
            }
            if (_private.getExpanderVisibility(self._options) === 'hasChildren') {
                const currentValue = self._thereIsChildItem;

                _private.determinePresenceChildItem(self);

                if (currentValue !== self._thereIsChildItem) {
                    self._nextModelVersion();
                }
            }
        },

        removeNodeFromExpandedIfNeed(self: ITreeViewModel, dispItem: TreeDisplayItem): void {
            if (_private.isItemInKeysArray(dispItem, self._expandedItems, self._options.uniqueKeys) &&
                !_private.hasChildItem(self, dispItem.getContents().getKey())) {
                // If it is necessary to delete only the nodes deleted from the items, add this condition:
                // if (!self._items.getRecordById(nodeId)) {
                _private.removeNodeFromExpanded(self, dispItem);
            }
        },

        removeNodeFromExpanded(self: ITreeViewModel, dispItem: TreeDisplayItem): void {
            _private.removeItemFromKeysArray(dispItem, self._expandedItems, self._options.uniqueKeys);
            self._notify('onNodeRemoved', _private.getDispItemKey(dispItem, false));
        },

        checkRemovedNodes(self: ITreeViewModel, removedItems: TreeDisplayItem[]): void {
            if (removedItems.length) {
                for (let idx = 0; idx < removedItems.length; idx++) {
                    // removedItems[idx].isNode - fast check on item type === 'group'
                    if (removedItems[idx].isNode &&
                        removedItems[idx].getContents().get(self._options.nodeProperty) !== null) {
                        _private.removeNodeFromExpandedIfNeed(self, removedItems[idx]);
                    }
                }
            }
        },
        shouldDrawExpander(itemData, expanderIcon): boolean {
            if (expanderIcon === 'none' || itemData.item.get(itemData.nodeProperty) === null) {
                return false;
            }

            // Show expander icon if it is not equal 'none' or render leafs
            return (itemData.expanderVisibility !== 'hasChildren' ||
                itemData.thereIsChildItem && itemData.hasChildItem);
        },
        shouldDrawExpanderPadding(itemData, expanderIcon, expanderSize): boolean {
            if (itemData.expanderVisibility === 'hasChildren') {
                return itemData.thereIsChildItem && expanderIcon !== 'none';
            } else {
                return !expanderSize && expanderIcon !== 'none';
            }
        },
        getExpanderPaddingClasses(expanderSize, theme, isNodeFooter): string {
            let expanderPaddingClasses = `controls-TreeGrid__row-expanderPadding controls-TreeGrid__${isNodeFooter ? 'node-footer' : 'row'}-expanderPadding` + `_theme-${theme}`;
            expanderPaddingClasses += ' controls-TreeGrid__row-expanderPadding_size_' + (expanderSize || 'default') + `_theme-${theme}`;
            return expanderPaddingClasses;
        },
        prepareExpanderClasses(itemData, expanderIcon, expanderSize, theme): string {
            const itemType = itemData.item.get(itemData.nodeProperty);
            const style = itemData.style || 'default';
            let expanderClasses = `controls-TreeGrid__row-expander_theme-${theme}`;
            let expanderIconClass;

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
        prepareCollapsedItems(expandedItems: TItemKey[], collapsedItems: TItemKey[]): [] {
            if (_private.isExpandAll(expandedItems) && collapsedItems) {
                return cClone(collapsedItems);
            }
            return [];
        },
        isExpandAll(expandedItems: TItemKey[]): boolean {
            return expandedItems.indexOf(null) !== -1;
        },

        resetExpandedItems(self: ITreeViewModel): void {
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

        recursiveCollapseChildNodes(self: ITreeViewModel, dispItem: TreeDisplayItem): void {
            _private.removeItemFromKeysArray(dispItem, self._expandedItems, self._options.uniqueKeys);
            _private.collapseChildNodes(self, dispItem);
        },

        collapseChildNodes(self: ITreeViewModel, dispItem: TreeDisplayItem): void {
            if (self._options.uniqueKeys) {
                const dispItemKey = _private.getDispItemKey(dispItem, false);
                self._hierarchyRelation.getChildren(dispItemKey, self._items).forEach((childItem) => {
                    const childItemKey = childItem.getKey();
                    const childDispItem = self.getItemById(childItemKey);

                    // hierarchyRelation возвращает все дочерние элементы (даже если они просто лежат в recordSet и
                    // не были ранее развернуты), т.о. childDispItem может отсутствовать.
                    if (childDispItem) {
                        _private.recursiveCollapseChildNodes(self, childDispItem);
                    }
                });
            } else {
                self._display.getChildren(dispItem).forEach((childDispItem) => {
                    _private.recursiveCollapseChildNodes(self, childDispItem);
                });
            }
        },

        collapseNode(self: ITreeViewModel, dispItem: TreeDisplayItem): void {
            _private.removeItemFromKeysArray(dispItem, self._expandedItems, self._options.uniqueKeys);
            _private.collapseChildNodes(self, dispItem);
        },

        getExpandedParents(self: ITreeViewModel, dispItem: TreeDisplayItem): TItemKey[] {
            const parents: TItemKey[] = [];
            const uniqueKeys = self._options.uniqueKeys;
            let parentId = null;
            while ((parentId = dispItem.getContents().get(self._options.parentProperty)) !== null) {
                dispItem = self.getItemById(parentId);
                parents.push(_private.getDispItemKey(dispItem, !uniqueKeys));
            }
            return parents;
        },

        toggleSingleExpanded(self: ITreeViewModel, dispItem: TreeDisplayItem): void {
            const withoutExpandedItems = self._expandedItems.length === 0;
            const uniqueKeys = self._options.uniqueKeys;

            if (withoutExpandedItems) {
                _private.pushItemToKeysArray(dispItem, self._expandedItems, uniqueKeys);
                return;
            }

            if (_private.isItemInKeysArray(dispItem, self._expandedItems, uniqueKeys)) {
                _private.collapseNode(self, dispItem);
            } else {
                self.setExpandedItems(_private.getExpandedParents(self, dispItem));
                _private.pushItemToKeysArray(dispItem, self._expandedItems, uniqueKeys);
            }
        },

        isDrawNodeFooterTemplate(self: ITreeViewModel, item: Model): boolean {
            let nodeFooterVisibility = !!self._options.nodeFooterTemplate;
            if (nodeFooterVisibility && self._options.nodeFooterVisibilityCallback) {
                nodeFooterVisibility = self._options.nodeFooterVisibilityCallback(item) !== false;
            }
            return nodeFooterVisibility;
        },

        setNodeFooterIfNeed(self: ITreeViewModel, current: any): void {
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
                const getFooterClasses = () => {
                    let classes = `controls-TreeGrid__nodeFooterContent controls-TreeGrid__nodeFooterContent_theme-${theme} ` +
                        `controls-TreeGrid__nodeFooterContent_spacingRight-${current.itemPadding.right}_theme-${theme}`;
                    if (!current.hasMultiSelect) {
                        classes += ` controls-TreeGrid__nodeFooterContent_spacingLeft-${current.itemPadding.left}_theme-${theme}`;
                    }
                    // TODO: Исправить по ошибке https://online.sbis.ru/opendoc.html?guid=e4de50e3-8071-49bf-8cd1-69944e8704e5
                    if (self._options.rowSeparatorVisibility) {
                        const separatorSize = self._options.rowSeparatorSize;
                        const isWideSeparator = separatorSize && separatorSize.toLowerCase() === 'l';
                        classes += ` controls-TreeGrid__nodeFooterContent_withRowSeparator${isWideSeparator ? '-l' : ''}_theme-${theme}`;
                        classes += ` controls-TreeGrid__nodeFooterContent_rowSeparatorSize-${isWideSeparator ? 'l' : 's'}_theme-${theme}`;
                        classes += ` controls-TreeGrid__nodeFooterContent_padding-top-${isWideSeparator ? 'l' : 's'}_theme-${theme}`;
                    } else {
                        classes += ` controls-TreeGrid__nodeFooterContent_withoutRowSeparator_theme-${theme} controls-TreeGrid__nodeFooterContent_padding-top-s_theme-${theme} controls-TreeGrid__nodeFooterContent_rowSeparatorSize-s_theme${theme}`;
                    }
                    return classes;
                };

                current.nodeFooters.push({
                    key: params.key,
                    item: params.dispItem.getContents(),
                    dispItem: params.dispItem,
                    level: params.dispItem.getLevel(),
                    getExpanderPaddingClasses: _private.getExpanderPaddingClasses,
                    multiSelectVisibility: current.multiSelectVisibility,
                    template: params.template,
                    classes: getFooterClasses(),
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
                    const _parentKey = _parentItem && _parentItem.getKey();
                    const _parentChildren = self._hierarchyRelation.getChildren(_parentKey, self._items);
                    return !!_parentChildren.length && _parentChildren[_parentChildren.length - 1].getKey() === dispItem.getContents().getKey();
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
                        const parentKey = currParent.getContents() && currParent.getContents().getKey();
                        const parentChilds = self._hierarchyRelation.getChildren(parentKey, self._items);
                        if (parentChilds[parentChilds.length - 1].getKey() === currentChild.getContents().getKey()) {
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
                const parentId = parentItem.getKey();
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

        constructor(cfg: ITreeViewModelOptions): void {
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

        setExpandedItems(expandedItems: TItemKey[]): void {
            if (!isEqual(this._expandedItems, expandedItems)) {
                this._expandedItems = expandedItems ? cClone(expandedItems) : [];
                this._collapsedItems = _private.prepareCollapsedItems(expandedItems, this._options.collapsedItems);
                this._display.setFilter(this.getDisplayFilter(this.prepareDisplayFilterData(), this._options));
                this._nextModelVersion();
            }
        },

        setCollapsedItems(collapsedItems: []): void {
            if (!isEqual(this._collapsedItems, collapsedItems)) {
                this._collapsedItems = _private.prepareCollapsedItems(
                    this._options.expandedItems, collapsedItems ? collapsedItems : []);
                this._display.setFilter(this.getDisplayFilter(this.prepareDisplayFilterData(), this._options));
                this._nextModelVersion();
            }
        },

        getExpandedItems(): TItemKey[] {
            return this._expandedItems;
        },

        resetExpandedItems(): void {
            _private.resetExpandedItems(this);
        },

        getCollapsedItems(): TItemKey[] {
            return this._collapsedItems;
        },

        _prepareDisplay(items: collection.RecordSet, cfg: ITreeViewModelOptions): TreeDisplay {
            return TreeItemsUtil.getDefaultDisplayTree(items, cfg,
                this.getDisplayFilter(this.prepareDisplayFilterData(), cfg)) as TreeDisplay;
        },

        getItemType(dispItem: TreeDisplayItem): TTreeItemType {
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

        isExpanded(dispItem: TreeDisplayItem): boolean {
            const isExpandAll = _private.isExpandAll(this._expandedItems);
            const uniqueKeys = this._options.uniqueKeys;
            return isExpandAll ? !_private.isItemInKeysArray(dispItem, this._collapsedItems, uniqueKeys)
                : _private.isItemInKeysArray(dispItem, this._expandedItems, uniqueKeys);
        },

        isExpandAll(): boolean {
            return _private.isExpandAll(this.getExpandedItems());
        },

        setExpanderSize(expanderSize: string): void {
            this._options.expanderSize = expanderSize;
        },

        toggleExpanded(dispItem: TreeDisplayItem, expanded: boolean): void {
            const currentExpanded = this.isExpanded(dispItem);
            const uniqueKeys = this._options.uniqueKeys;

            if (expanded !== currentExpanded || expanded === undefined) {
                if (_private.isExpandAll(this._expandedItems)) {
                    if (expanded) {
                        _private.removeItemFromKeysArray(dispItem, this._collapsedItems, uniqueKeys);
                    } else {
                        _private.pushItemToKeysArray(dispItem, this._collapsedItems, uniqueKeys);
                    }
                    this._notify('collapsedItemsChanged', this._collapsedItems);
                } else if (this._options.singleExpand) {
                    _private.toggleSingleExpanded(this, dispItem);
                } else {
                    if (_private.isItemInKeysArray(dispItem, this._expandedItems, uniqueKeys)) {
                        _private.collapseNode(this, dispItem);
                    } else {
                        _private.pushItemToKeysArray(dispItem, this._expandedItems, uniqueKeys);
                    }
                }
                this._display.setFilter(this.getDisplayFilter(this.prepareDisplayFilterData(), this._options));
                this.updateDragItemIndex(this._draggingItemData);
                this._nextModelVersion(true, 'expandedChanged', null, [dispItem]);
                this._notify('expandedItemsChanged', this._expandedItems);
            }
        },

        getDisplayFilter(data: IDisplayFilterData, cfg: ITreeViewModelOptions): collection.FilterFunction[] {
            return Array.prototype.concat(TreeViewModel.superclass.getDisplayFilter.apply(this, arguments),
                _private.getDisplayFilter(data, cfg));
        },

        getLastItem(): TreeDisplayItem {
            return ItemsUtil.getLastItem(this._display.getChildren(this._display.getRoot()));
        },

        prepareDisplayFilterData(): IDisplayFilterData {
            const data = TreeViewModel.superclass.prepareDisplayFilterData.apply(this, arguments);
            data.uniqueKeys = this._options.uniqueKeys;
            data.expandedItems = this._expandedItems;
            data.collapsedItems = this._collapsedItems;
            data.isExpandAll = _private.isExpandAll;
            data.hasChildItem = _private.hasChildItem.bind(null, this);
            return data;
        },

        _onBeginCollectionChange(action: string, newItems: TreeDisplayItem[], newItemsIndex: number,
                                 removedItems: TreeDisplayItem[], removedItemsIndex: number): void {
            TreeViewModel.superclass._onBeginCollectionChange.apply(this, arguments);
            _private.onBeginCollectionChange(this, action, newItems, newItemsIndex, removedItems, removedItemsIndex);
        },

        setNodeFooterTemplate(nodeFooterTemplate: TemplateFunction): void {
            this._options.nodeFooterTemplate = nodeFooterTemplate;
            this._nextModelVersion();
        },

        getNodeFooterTemplate(): TemplateFunction {
            return this._options.nodeFooterTemplate;
        },

        setExpanderDisplayMode(expanderDisplayMode: string): void {
            this._options.expanderDisplayMode = expanderDisplayMode;
            this._nextModelVersion();
        },

        setExpanderVisibility(expanderVisibility: string): void {
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

        getItemDataByItem(dispItem: TreeDisplayItem): any {
            const current = TreeViewModel.superclass.getItemDataByItem.apply(this, arguments);

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

            if (this._dragTargetPosition && this._dragTargetPosition.position === 'on') {
                if (this._dragTargetPosition.index === current.index) {
                    current.dragTargetNode = true;
                }
                if (this._prevDragTargetPosition && this._prevDragTargetPosition.index === current.index) {
                    current.dragTargetPosition = this._prevDragTargetPosition.position;
                    current.draggingItemData = this._draggingItemData;
                }
            }

            if (current.item.get) {
                _private.setNodeFooterIfNeed(this, current);
            }
            return current;
        },

        _calcItemVersion(item: Model, key: TItemKey, dispItem: TreeDisplayItem): string {
            let version = TreeViewModel.superclass._calcItemVersion.apply(this, arguments);

            // При добавлении по месту в display нет добавляемого элемента и дополнительное версионирование не нужно.
            if (dispItem) {
                if (_private.isItemInKeysArray(dispItem, this._expandedItems, this._options.uniqueKeys)) {
                    version = 'EXPANDED_' + version;
                } else if (_private.isItemInKeysArray(dispItem, this._collapsedItems, this._options.uniqueKeys)) {
                    version = 'COLLAPSED_' + version;
                }
            }

            return version;
        },

        setDragEntity(entity): void {
            let item;

            if (entity) {
                //Collapse all the nodes that we move.
                entity.getItems().forEach((id: TItemKey) => {
                    item = this.getItemById(id, this._options.keyProperty);

                    //Not all of the moved items can be in the current recordSet
                    if (item) {
                        this.toggleExpanded(item, false);
                    }
                }, this);
            }

            TreeViewModel.superclass.setDragEntity.apply(this, arguments);
        },

        updateDragItemIndex(itemData): void {
            if (itemData) {
                itemData.index = this._display.getIndex(itemData.dispItem);
            }
        },

        setDragItemData(itemDragData): void {
            let getVersionOrigin;

            //Displays the movable item as closed
            if (itemDragData) {
                itemDragData.isExpanded = false;

                getVersionOrigin = itemDragData.getVersion;
                itemDragData.getVersion = () => {
                    return getVersionOrigin() + '_LEVEL_' + itemDragData.level;
                };
            }
            TreeViewModel.superclass.setDragItemData.apply(this, arguments);
        },

        calculateDragTargetPosition(targetData, position): any {
            let result;

            //If you hover over the dragged item, and the current position is on the folder,
            //then you need to return the position that was before the folder.
            if (this._draggingItemData && this._draggingItemData.index === targetData.index) {
                result = this._prevDragTargetPosition || null;
            } else if (targetData.dispItem.isNode()) {
                if (position === 'after' || position === 'before') {
                    result = this._calculateDragTargetPosition(targetData, position);
                } else {
                    result = {
                        index: targetData.index,
                        position: 'on',
                        item: targetData.item,
                        data: targetData
                    };
                }
            } else {
                result = TreeViewModel.superclass.calculateDragTargetPosition.apply(this, arguments);
            }

            return result;
        },

        _calculateDragTargetPosition(itemData, position): any {
            let result;
            let startPosition;
            const afterExpandedNode = position === 'after' &&
                _private.isItemInKeysArray(itemData.dispItem, this._expandedItems, this._options.uniqueKeys);

            //The position should not change if the record is dragged from the
            //bottom/top to up/down and brought to the bottom/top of the folder.
            if (this._prevDragTargetPosition) {
                if (this._prevDragTargetPosition.index === itemData.index) {
                    startPosition = this._prevDragTargetPosition.position;
                } else {
                    startPosition = this._prevDragTargetPosition.index < itemData.index ? 'before' : 'after';
                }
            }

            if (position !== startPosition && !afterExpandedNode) {
                result = {
                    index: itemData.index,
                    item: itemData.item,
                    data: itemData,
                    position
                };
            }

            return result;
        },

        setDragTargetPosition(targetPosition): void {
            if (targetPosition && targetPosition.position === 'on') {

                //When an item is moved to a folder, the fake record should be displayed at the previous position.
                //If do not display the fake entry, there will be a visual jump of the interface.
                this._setPrevDragTargetPosition(targetPosition);
            } else {
                this._prevDragTargetPosition = null;

                //The fake item must be displayed at the correct level.
                if (targetPosition) {
                    this._draggingItemData.level = targetPosition.data.level;
                }
            }
            TreeViewModel.superclass.setDragTargetPosition.apply(this, arguments);
        },

        _setPrevDragTargetPosition(targetPosition): void {
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

        setHasMoreStorage(hasMoreStorage: any): void {
            if (hasMoreStorage !== this._hasMoreStorage) {
                this._hasMoreStorage = hasMoreStorage;
                this._nextModelVersion();
            }
        },

        getHasMoreStorage(): any {
            return this._hasMoreStorage;
        },

        getHierarchyRelation(): _entity.relation.Hierarchy {
            return this._hierarchyRelation;
        },

        getRoot(): any {
            return this._display ? this._display.getRoot() : undefined;
        },

        setRoot(root: any): void {
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

        getChildren(rootId: TItemKey, items: collection.RecordSet): TItemKey[] {
            return this._hierarchyRelation.getChildren(rootId, items || this._items);
        },

        getDisplayChildrenCount(nodeId: TItemKey, items: collection.RecordSet): number {
            const display = this.getDisplay();
            const curNodeChildren: TreeChildrenItems = display.getChildren(display.getItemBySourceKey(nodeId));
            let childrenCount = curNodeChildren.getCount();

            curNodeChildren.forEach((child: TreeDisplayItem) => {
                const childId = _private.getDispItemKey(child, false);

                // Заменить на TreeItem.isExpanded(), пока он не работает, возвращает false.
                const isNodeExpanded = child.isNode() && this.isExpanded(child);

                if (isNodeExpanded) {
                    childrenCount += this.getDisplayChildrenCount(childId, items);
                }
            });

            return childrenCount;
        }
    });

TreeViewModel._private = _private;

export = TreeViewModel;
