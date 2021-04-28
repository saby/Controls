import {GridViewModel, GridLayoutUtil, COLUMN_SCROLL_JS_SELECTORS, DRAG_SCROLL_JS_SELECTORS} from 'Controls/gridOld';
import {
    getBottomPaddingRowIndex,
    getFooterIndex,
    getIndexByDisplayIndex, getIndexById, getIndexByItem,
    getResultsIndex, getTopOffset, IBaseTreeGridRowIndexOptions
} from 'Controls/_treeGridOld/utils/TreeGridRowIndexUtil';
import { TreeViewModel } from 'Controls/tree';


function isLastColumn(
   itemData: object,
   colspan: boolean
): boolean {
   const columnWidth = itemData.hasMultiSelectColumn ? 2 : 1;
   return itemData.getLastColumnIndex() >= itemData.columnIndex && (!colspan || itemData.columnIndex < columnWidth);
}

export type TreeGridColspanableElements = GridColspanableElements | 'node' | 'nodeFooter';

var _private = {
    getExpandedItems<T = unknown>(display, expandedItems: Array<T>, nodeProperty: string): Array<T> {
        if (display && expandedItems.length === 1 && expandedItems[0] === null) {
            const nodes = display.getItems().filter((item) => {
                return item.getContents().get && item.getContents().get(nodeProperty) !== null
            });
            return nodes.map(node => node.getContents().getId());
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
        getNextByKey(key: string|number, forMoving?: boolean) {
            if (forMoving) {
                const items = this.getItems();
                const relation = this._model.getHierarchyRelation();
                const item = items.getRecordById(key);
                const itemParent = item.get(this._options.parentProperty);
                const children = relation.getChildren(itemParent, items);
                const curItemIndex = children.indexOf(item);
                const display = this.getDisplay();
                if (curItemIndex === -1 || curItemIndex === children.length - 1) {
                    return this._model.getNextByKey(key);
                } else {
                    return display.getItemBySourceItem(children[curItemIndex + 1]);
                }
            } else {
                return this._model.getNextByKey(key);
            }
        },
        getPrevByKey(key: string|number, forMoving?: boolean) {
            if (forMoving) {
                const items = this.getItems();
                const relation = this._model.getHierarchyRelation();
                const item = items.getRecordById(key);
                const itemParent = item.get(this._options.parentProperty);
                const children = relation.getChildren(itemParent, items);
                const curItemIndex = children.indexOf(item);
                const display = this.getDisplay();
                if (curItemIndex <= 0) {
                    return this._model.getPrevByKey(key);
                } else {
                    return display.getItemBySourceItem(children[curItemIndex - 1]);
                }
            } else {
                return this._model.getPrevByKey(key);
            }
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
            this._model.setParentProperty(parentProperty);
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
        // TODO: Удалить #rea_1179794968
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
            const items = this.getDisplay();
            if (items) {
                const parentProperty = this._options.parentProperty;
                const parent = items.getRoot().getContents();
                if (!parentProperty) {
                    let count = 0;
                    if (!parent) {
                        this.getItems().each(() => {
                            count++;
                        });
                    }
                    return this.getHasMoreData() || count > 1;
                } else {
                    let parentId = parent;
                    if ((parent && parent['[Types/_entity/Record]'])) {
                        parentId = parent.get(parentProperty);
                    }
                    let item = this.getItems().getIndicesByValue(parentProperty, parentId);
                    return this.getHasMoreData() || item.length > 1;
                }
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

            current.getColspanType = (tmplOptions) => {
                if (tmplOptions.colspan === true) {
                    return 'full';
                } else if (tmplOptions.colspan === false && !!tmplOptions.colspanLength) {
                    return 'partial';
                } else {
                    return 'none';
                }
            };
            current.getPartialColspanStyles = (columnStart, columnSpan) => GridLayoutUtil.getColumnStyles({ columnStart, columnSpan });

            current.isLastColumn = isLastColumn;

            if (!GridLayoutUtil.isFullGridSupport()) {
                const superClassesGetter = current.getRelativeCellWrapperClasses;
                current.getRelativeCellWrapperClasses = (colspan, fixVerticalAlignment) => {
                    return `controls-TreeGridView__row-cell_innerWrapper ${superClassesGetter(colspan, fixVerticalAlignment)}`;
                };
            }

            if (current.isLastRow) {
                //Проверяем, что под послдней записью нет nodeFooter'a
                const itemParent = current.dispItem.getParent && current.dispItem.getParent();
                const itemParentRecord = itemParent && itemParent.getContents();
                const parentKey = itemParentRecord && itemParentRecord.getKey && itemParentRecord.getKey();
                current.isLastRow = current.isLastRow &&
                    (!current.nodeFooters || !current.nodeFooters.some((element) => {
                        return element.key === parentKey;
                    }));
            }

            current.getCurrentColumn = function (backgroundColorStyle: string) {
                let
                    currentColumn = superGetCurrentColumn(backgroundColorStyle);
                currentColumn.nodeType = current.item && current.item.get && current.item.get(current.nodeProperty);

                currentColumn.getExpanderSize = current.getExpanderSize;

                currentColumn.isExpanded = current.isExpanded;
                currentColumn.classList.base += ` controls-TreeGrid__row-cell controls-TreeGrid__row-cell_${currentColumn.style || 'default'}`;

                currentColumn.getExpanderClasses = (expanderIcon, expanderSize) => current.getExpanderClasses(expanderIcon, expanderSize);

                if (currentColumn.nodeType) {
                    currentColumn.classList.base += ' controls-TreeGrid__row-cell__node';
                } else if (currentColumn.nodeType === false) {
                    currentColumn.classList.base += ' controls-TreeGrid__row-cell__hiddenNode';
                } else {
                    currentColumn.classList.base += ' controls-TreeGrid__row-cell__item';
                }

                // если текущая колонка первая и для нее не задан мультиселект, то убираем левый отступ
                if (currentColumn.columnIndex === 0 && !current.hasMultiSelectColumn) {
                    currentColumn.classList.padding.left += ' controls-TreeGrid__row-cell__firstColumn__contentSpacing_null';
                }

                return currentColumn;
            };

            const setNodeFooterRowStyles = (footer, index) => {
                const columns = self._options.columns;
                footer.columns = columns;
                footer.isFullGridSupport = GridLayoutUtil.isFullGridSupport();
                footer.colspan = self.getColspanFor('nodeFooter');
                footer.hasMultiSelectColumn = self._hasMultiSelectColumn();


                if (current.useNewNodeFooters) {
                    footer.template = self._options.nodeFooterTemplate || 'wml!Controls/_treeGridOld/TreeGridView/NodeFooterTemplate';
                }

                footer.getColumnClasses = (index, tmplOptions = {}) => {
                    let rowSeparatorSize: 's' | 'l' | null;

                    if (self._options.rowSeparatorSize) {
                        rowSeparatorSize = self._options.rowSeparatorSize.toLowerCase();
                    } else {
                        rowSeparatorSize = self._options.rowSeparatorVisibility ? 's' : null;
                    }

                    let classes =
                        'controls-TreeGrid__nodeFooterContent ' +
                        `controls-TreeGrid__nodeFooterContent_rowSeparatorSize-${rowSeparatorSize}`;


                    if (tmplOptions.colspan === false) {
                        if (index > 0) {
                            classes += ` controls-TreeGrid__nodeFooterCell_columnSeparator-size_${current.getSeparatorForColumn(columns, index, current.columnSeparatorSize)}`;
                        }
                        if (!current.hasMultiSelectColumn && index === 0) {
                            classes += ` controls-TreeGrid__nodeFooterContent_spacingLeft-${current.itemPadding.left}`;
                        }

                        if (index === self._options.columns.length - 1) {
                            classes += ` controls-TreeGrid__nodeFooterContent_spacingRight-${current.itemPadding.right}`;
                        }

                        if (self._options.columnScroll && (index < self._options.stickyColumnsCount)) {
                            classes += ` ${COLUMN_SCROLL_JS_SELECTORS.FIXED_ELEMENT} ${DRAG_SCROLL_JS_SELECTORS.NOT_DRAG_SCROLLABLE}`;
                        }
                    } else {
                        if (!current.hasMultiSelect) {
                            classes += ` controls-TreeGrid__nodeFooterContent_spacingLeft-${current.itemPadding.left}`;
                        }
                        classes += ` controls-TreeGrid__nodeFooterContent_spacingRight-${current.itemPadding.right}`;
                        classes += ` ${COLUMN_SCROLL_JS_SELECTORS.FIXED_ELEMENT} ${DRAG_SCROLL_JS_SELECTORS.NOT_DRAG_SCROLLABLE}`;
                    }

                    return classes;
                };

                footer.classes = footer.getColumnClasses(0);
                const colspanCfg = {
                    columnStart: self._hasMultiSelectColumn() ? 1 : 0,
                    columnSpan: self._columns.length +
                        (self._options.columnScroll && self._options.itemActionsPosition !== 'custom' ? 1 : 0) +
                        self.stickyLadderCellsCount()
                };
                if (self._options.task1181099336 && footer.isFullGridSupport) {
                    colspanCfg.columnStart += this.stickyLadderCellsCount();
                    colspanCfg.columnSpan -= this.stickyLadderCellsCount();
                }
                if (current.columnScroll) {
                    footer.rowIndex = current.rowIndex + index + 1;

                    footer.colspanStyles = '';
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
                return this._columns.length + this.stickyLadderCellsCount();
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

        getChildren(node, withFilter, items) {
            return this._model.getChildren(node, withFilter, items);
        },

        getChildrenByRecordSet(node) {
            return this.getChildren(node);
        },

        getDisplayChildrenCount(nodeKey, items) {
            return this._model.getDisplayChildrenCount(nodeKey, items);
        },

        _setFooter(footerColumns) {
            TreeGridViewModel.superclass._setFooter.apply(this, arguments);

            let shouldDrawExpanderPadding: boolean =
                (this._options.expanderIcon !== 'none' && this._options.expanderPosition === 'default') &&
                (this._options.expanderVisibility === 'hasChildren' ? this._model.thereIsChildItem() : !this._options.expanderSize);

            if (shouldDrawExpanderPadding) {
                const expanderColumnIndex = +(this._options.multiSelectVisibility !== 'hidden' && this._options.multiSelectPosition === 'default');
                const superGetter = this._footer[expanderColumnIndex].getContentClasses;

                this._footer[expanderColumnIndex].getContentClasses = () => {
                    const expanderSize = this._options.expanderSize || 'default';
                    return superGetter.apply(this, arguments) +
                        ` controls-TreeGridView__footer__expanderPadding-${expanderSize.toLowerCase()}`;
                }
            }
        }
    });

TreeGridViewModel._private = _private;

export = TreeGridViewModel;
