import {GridViewModel} from 'Controls/grid';
import * as GridLayoutUtil from 'Controls/_grid/utils/GridLayoutUtil';
import {
    getBottomPaddingRowIndex,
    getFooterIndex,
    getIndexByDisplayIndex, getIndexById, getIndexByItem,
    getResultsIndex, getTopOffset, IBaseTreeGridRowIndexOptions
} from 'Controls/_treeGrid/utils/TreeGridRowIndexUtil';
import TreeViewModel = require('Controls/_treeGrid/Tree/TreeViewModel');

function isLastColumn(
   itemData: object,
   colspan: boolean
): boolean {
   const columnWidth = itemData.multiSelectVisibility === 'hidden' ? 1 : 2;
   return itemData.getLastColumnIndex() >= itemData.columnIndex && (!colspan || itemData.columnIndex < columnWidth);
}

export type TreeGridColspanableElements = GridColspanableElements | 'node' | 'nodeFooter';

var _private = {
    getExpandedItems<T = unknown>(display, expandedItems: Array<T>, nodeProperty: string): Array<T> {
        if (display && expandedItems.length === 1 && expandedItems[0] === null) {
            const nodes = display.getItems().filter((item) => {
                return item.getContents().get && item.getContents().get(nodeProperty) !== null
            });
            return nodes.map(node => node.getContents().getKey());
        } else {
            return <Array<T>>expandedItems;
        }
    }
};

var
    TreeGridViewModel = GridViewModel.extend({
        _onNodeRemovedFn: null,
        constructor: function () {
            TreeGridViewModel.superclass.constructor.apply(this, arguments);
            this._onNodeRemovedFn = this._onNodeRemoved.bind(this);
            this._model.subscribe('onNodeRemoved', this._onNodeRemovedFn);
            this._model.subscribe('expandedItemsChanged', this._onExpandedItemsChanged.bind(this));
            this._model.subscribe('collapsedItemsChanged', this._onCollapsedItemsChanged.bind(this));
        },
        _onCollapsedItemsChanged: function(e, collapsedItems) {
            this._notify('collapsedItemsChanged', collapsedItems);
        },
        _onExpandedItemsChanged: function(e, expandedItems) {
            this._notify('expandedItemsChanged', expandedItems);
        },
        _createModel: function (cfg) {
            return new TreeViewModel(cfg);
        },
        toggleExpanded: function (dispItem, expand) {
            this._model.toggleExpanded(dispItem, expand);
        },
        getItemType: function (dispItem) {
            return this._model.getItemType(dispItem);
        },
        isExpanded: function (dispItem) {
            return this._model.isExpanded(dispItem);
        },
        isExpandAll: function () {
            return this._model.isExpandAll();
        },
        setExpandedItems: function (expandedItems: Array<unknown>) {
            this._model.setExpandedItems(expandedItems);
        },
        setCollapsedItems: function (collapsedItems: Array<unknown>) {
            this._model.setCollapsedItems(collapsedItems);
        },
        getExpandedItems: function () {
            return this._model.getExpandedItems();
        },
        getCollapsedItems(): unknown[] {
            return this._model.getCollapsedItems();
        },
        getRoot: function() {
            return this._model.getRoot();
        },
        getNextByKey: function() {
           return this._model.getNextByKey.apply(this._model, arguments);
        },
        getPrevByKey: function() {
           return this._model.getPrevByKey.apply(this._model, arguments);
        },
        getNextByIndex: function() {
           return this._model.getNextByIndex.apply(this._model, arguments);
        },
        getPrevByIndex: function() {
           return this._model.getPrevByIndex.apply(this._model, arguments);
        },
        setRoot: function (root) {
            this._model.setRoot(root);
        },
        setParentProperty(parentProperty: string): void {
            this._model.setParentProperty.apply(this, arguments);
            this._options.parentProperty = parentProperty;
        },
        setHasChildrenProperty(hasChildrenProperty: string): void {
            this._model.setHasChildrenProperty.apply(this, arguments);
            this._options.hasChildrenProperty = hasChildrenProperty;
        },
        setNodeProperty(nodeProperty: string): void {
            this._model.setNodeProperty.apply(this, arguments);
            this._options.nodeProperty = nodeProperty;
        },
        setNodeFooterTemplate: function (nodeFooterTemplate) {
            this._model.setNodeFooterTemplate(nodeFooterTemplate);
        },
        setExpanderDisplayMode: function (expanderDisplayMode) {
            // Выпилить в 19.200
            this._model.setExpanderDisplayMode(expanderDisplayMode);
        },
        setExpanderVisibility: function (expanderVisibility) {
            this._model.setExpanderVisibility(expanderVisibility);
        },
        setExpanderSize(expanderSize): void {
            this._model.setExpanderSize(expanderSize);
        },
        resetExpandedItems: function () {
            this._model.resetExpandedItems();
        },
        isDrawResults: function() {
            if (this._options.resultsVisibility === 'visible') {
                return true;
            }
            var items = this.getDisplay();
            if (items) {
                var rootItems = this._model.getHierarchyRelation().getChildren(items.getRoot().getContents(), this.getItems());
                return this.getHasMoreData() || rootItems && rootItems.length > 1;
            }
        },
        getItemDataByItem: function(dispItem) {
            const current = TreeGridViewModel.superclass.getItemDataByItem.apply(this, arguments);
            const superGetCurrentColumn = current.getCurrentColumn;
            const self = this;
            const theme = this._options.theme;

            if (current._treeGridViewModelCached) {
                return current;
            } else {
                current._treeGridViewModelCached = true;
            }

            current.isLastColumn = isLastColumn;

            current.getCurrentColumn = function () {
                let
                    currentColumn = superGetCurrentColumn();
                currentColumn.nodeType = current.item.get && current.item.get(current.nodeProperty);

                currentColumn.prepareExpanderClasses = current.prepareExpanderClasses;
                currentColumn.getExpanderSize = current.getExpanderSize;

                currentColumn.isExpanded = current.isExpanded;
                currentColumn.classList.base += ` controls-TreeGrid__row-cell_theme-${theme} controls-TreeGrid__row-cell_${currentColumn.style || 'default'}_theme-${theme}`;

                if (currentColumn.nodeType) {
                    currentColumn.classList.base += ` controls-TreeGrid__row-cell__node_theme-${theme}`;
                } else if (currentColumn.nodeType === false) {
                    currentColumn.classList.base += ` controls-TreeGrid__row-cell__hiddenNode_theme-${theme}`;
                } else {
                    currentColumn.classList.base += ` controls-TreeGrid__row-cell__item_theme-${theme}`;
                }

                // если текущая колонка первая и для нее не задан мультиселект, то убираем левый отступ
                if (currentColumn.columnIndex === 0 && !current.hasMultiSelect) {
                    currentColumn.classList.padding.left += ' controls-TreeGrid__row-cell__firstColumn__contentSpacing_null';
                }

                return currentColumn;
            };

            current.getLevelIndentClasses = function (expanderSize, levelIndentSize) {
                let
                    sizeEnum = ['null', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl'],
                    resultPaddingSize;

                if (expanderSize && levelIndentSize) {
                    if (sizeEnum.indexOf(expanderSize) >= sizeEnum.indexOf(levelIndentSize)) {
                        resultPaddingSize = expanderSize;
                    } else {
                        resultPaddingSize = levelIndentSize;
                    }
                } else if (!expanderSize && !levelIndentSize) {
                    resultPaddingSize = 'default';
                } else {
                    resultPaddingSize = expanderSize || levelIndentSize;
                }

                return `controls-TreeGrid__row-levelPadding_size_${resultPaddingSize}_theme-${theme}`;
            };

            const setNodeFooterRowStyles = (footer, index) => {
                footer.columns = current.columns;
                footer.isFullGridSupport = GridLayoutUtil.isFullGridSupport();
                footer.colspan = self.getColspanFor('nodeFooter');
                footer.getLevelIndentClasses = current.getLevelIndentClasses;
                const colspanCfg = {
                    columnStart: self._options.multiSelectVisibility !== 'hidden' ? 1 : 0,
                    columnSpan: self._options.columnScroll ? self._columns.length + 1 : self._columns.length,
                };
                if (current.columnScroll) {
                    footer.rowIndex = current.rowIndex + index + 1;

                    if (self._options.columnScroll) {
                        footer.colspanStyles = GridLayoutUtil.getColumnStyles(colspanCfg);
                    } else {
                        footer.colspanStyles = GridLayoutUtil.getCellStyles({...colspanCfg, rowStart: footer.rowIndex});
                    }
                } else if (footer.isFullGridSupport) {
                    footer.colspanStyles = GridLayoutUtil.getColumnStyles(colspanCfg);
                }
            };
            if (current.nodeFooters) {
                current.nodeFooters.forEach(setNodeFooterRowStyles);
            }
            return current;
        },
        _onNodeRemoved: function (event, nodeId) {
            this._notify('onNodeRemoved', nodeId);
        },

        getHasMoreStorage(): object {
            return this._model.getHasMoreStorage();
        },

        setHasMoreStorage: function (hasMoreStorage) {
            this._model.setHasMoreStorage(hasMoreStorage);
        },

        destroy: function () {
            this._model.unsubscribe('onNodeRemoved', this._onNodeRemovedFn);
            TreeGridViewModel.superclass.destroy.apply(this, arguments);
        },

        getColspanFor(gridElementName: TreeGridColspanableElements): number {
            if (gridElementName === 'node' || gridElementName === 'nodeFooter') {
                return this._columns.length;
            } else {
                return TreeGridViewModel.superclass.getColspanFor.apply(this, arguments);
            }
        },

        _getRowIndexHelper() {

            let
                self = this,
                cfg: IBaseTreeGridRowIndexOptions = {
                    display: this.getDisplay(),
                    hasHeader: !!this.getHeader(),
                    hasBottomPadding: this._options._needBottomPadding,
                    resultsPosition: this.getResultsPosition(),
                    multiHeaderOffset: this.getMultiHeaderOffset(),
                    hierarchyRelation: self._model.getHierarchyRelation(),
                    hasMoreStorage: self._model.getHasMoreStorage() || {},
                    expandedItems: _private.getExpandedItems(self.getDisplay(), self._model.getExpandedItems() || [], self._options.nodeProperty),
                    hasNodeFooterTemplate: !!self._model.getNodeFooterTemplate(),
                    hasColumnScroll: this._options.columnScroll,
                },
                hasEmptyTemplate = !!this._options.emptyTemplate;

            if (this.getEditingItemData()) {
                cfg.editingRowIndex = this.getEditingItemData().index;
            }

            return {
                getIndexByItem: (item) => getIndexByItem({item, ...cfg}),
                getIndexById: (id) => getIndexById({id, ...cfg}),
                getIndexByDisplayIndex: (index) => getIndexByDisplayIndex({index, ...cfg}),
                getResultsIndex: () => getResultsIndex({hasEmptyTemplate, ...cfg}),
                getBottomPaddingRowIndex: () => getBottomPaddingRowIndex(cfg),
                getFooterIndex: () => getFooterIndex({hasEmptyTemplate, ...cfg}),
                getTopOffset: () => getTopOffset(cfg.hasHeader, cfg.resultsPosition, cfg.multiHeaderOffset, cfg.hasColumnScroll),
            };
        },

        getChildren(nodeKey, items) {
            return this._model.getChildren(nodeKey, items);
        },

        getDisplayChildrenCount(nodeKey, items) {
            return this._model.getDisplayChildrenCount(nodeKey, items);
        }
    });

TreeGridViewModel._private = _private;

export = TreeGridViewModel;
