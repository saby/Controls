import {TemplateFunction} from 'UI/Base';
import {BaseViewModel, ItemsUtil, ListViewModel} from 'Controls/list';
import * as GridLayoutUtil from 'Controls/_grid/utils/GridLayoutUtil';
import {isStickySupport} from 'Controls/scroll';
import * as LadderWrapper from 'wml!Controls/_grid/LadderWrapper';
import {isEqual} from 'Types/object';
import cInstance = require('Core/core-instance');
import {
    getBottomPaddingRowIndex,
    getFooterIndex,
    getIndexByDisplayIndex,
    getIndexById,
    getIndexByItem,
    getHeaderMaxEndCellData,
    getResultsIndex,
    getHeaderRowsArray,
    getTopOffset,
    IBaseGridRowIndexOptions
} from 'Controls/_grid/utils/GridRowIndexUtil';
import cClone = require('Core/core-clone');
import collection = require('Types/collection');
import * as Grouping from 'Controls/_list/Controllers/Grouping';
import { shouldAddActionsCell } from 'Controls/_grid/utils/GridColumnScrollUtil';
import {createClassListCollection} from "../Utils/CssClassList";
import { shouldAddStickyLadderCell, prepareLadder,  isSupportLadder, getStickyColumn} from 'Controls/_grid/utils/GridLadderUtil';
import {IHeaderCell} from './interface/IHeaderCell';

const FIXED_HEADER_ZINDEX = 4;
const STICKY_HEADER_ZINDEX = 3;

interface IGridColumn {
    displayProperty?: string;
    template?: string | TemplateFunction;
    width?: string;
    compatibleWidth?: string;
}

interface IGridItemData {
    hasMultiSelect: boolean;
    columns: any[];
}

interface IColgroupColumn {
    classes: string;
    style: string;
    index: number;
}

type GridColspanableElements = 'customResults' | 'fixedColumnOfColumnScroll' | 'scrollableColumnOfColumnScroll' |
    'colspanedRow' | 'editingRow' | 'bottomPadding' | 'emptyTemplate' | 'emptyTemplateAndColumnScroll' | 'footer'
    | 'headerBreadcrumbs' | 'fullWithoutMultiSelect';

interface IGetColspanStylesForParams {
    columnIndex: number;
    columnsLength: number;
    maxEndRow?: number;
}

var
    _private = {
        calcItemColumnVersion: function(self, itemVersion, columnIndex, index) {
            let
                hasMultiselect = self._options.multiSelectVisibility !== 'hidden',
                version = `${itemVersion}_${self._columnsVersion}_${hasMultiselect ? columnIndex - 1 : columnIndex}`;

            version += _private.calcLadderVersion(self._ladder, index);

            return version;
        },
        isActionsColumn(itemData, currentColumn, colspan) {
            return (
                itemData.getLastColumnIndex() === currentColumn.columnIndex ||
                (
                    colspan &&
                    currentColumn.columnIndex === (itemData.multiSelectVisibility === 'hidden' ? 0 : 1)
                )
            );
        },
        isDrawActions: function(itemData, currentColumn, colspan) {
            return itemData.drawActions && _private.isActionsColumn(itemData, currentColumn, colspan);
        },
        getCellStyle: function(self, itemData, currentColumn, colspan) {
           var
               style = '';
           if (colspan) {
                style += self.getColspanStylesFor(
                    'fullWithoutMultiSelect',
                    {
                        columnIndex: currentColumn.columnIndex,
                        columnsLength: self._columns.length
                    });
           }
           return style;
        },

        getPaddingCellClasses: function(params, theme) {
            const { columns, columnIndex } = params;
            const { cellPadding } = columns[columnIndex];
            const classLists = createClassListCollection('top', 'bottom', 'left', 'right');


            if (columns[columnIndex].isActionCell) {
                return classLists;
            }
            const arrayLengthOffset = params.hasActionCell ? 2 : 1;
            const getCellPadding = (side) => cellPadding && cellPadding[side] ? `_${cellPadding[side]}` : '';

            // Колонки
            if (params.hasMultiSelect ? params.columnIndex > 1 : params.columnIndex > 0) {
                classLists.left += ` controls-Grid__cell_spacingLeft${getCellPadding('left')}_theme-${theme}`;
            }
            if (params.columnIndex < params.columns.length - arrayLengthOffset) {
                classLists.right += ` controls-Grid__cell_spacingRight${getCellPadding('right')}_theme-${theme}`;
            }

            // Отступ для первой колонки. Если режим мультиселект, то отступ обеспечивается чекбоксом.
            if (params.columnIndex === 0 && !params.hasMultiSelect) {
                classLists.left += ` controls-Grid__cell_spacingFirstCol_${params.itemPadding.left}_theme-${theme}`;
            }

            // TODO: удалить isBreadcrumbs после https://online.sbis.ru/opendoc.html?guid=b3647c3e-ac44-489c-958f-12fe6118892f
            if (params.isBreadCrumbs) {
                classLists.left += ` controls-Grid__cell_spacingFirstCol_null_theme-${theme}`;
            }

            // Отступ для последней колонки
            if (params.columnIndex === params.columns.length - arrayLengthOffset) {
                classLists.right += ` controls-Grid__cell_spacingLastCol_${params.itemPadding.right}_theme-${theme}`;
            }
            if (!params.isHeader && !params.isResult) {
                classLists.top += ` controls-Grid__row-cell_rowSpacingTop_${params.itemPadding.top}_theme-${theme}`;
                classLists.bottom += ` controls-Grid__row-cell_rowSpacingBottom_${params.itemPadding.bottom}_theme-${theme}`;
            }

            return classLists;
        },

        getPaddingHeaderCellClasses: function(params, theme) {
            let preparedClasses = '';
            const { multiSelectVisibility, columnIndex, columns,
                rowIndex, itemPadding, isBreadCrumbs, style, cell: { endColumn }, isMultiHeader } = params;
            if (params.cell.isActionCell) {
                return preparedClasses;
            }
            const actionCellOffset = params.hasActionCell ? 1 : 0;
            const maxEndColumn = params.maxEndColumn - actionCellOffset;
            const columnsLengthExcludedActionCell = columns.length - actionCellOffset;
            if (rowIndex === 0) {
                if (multiSelectVisibility ? columnIndex > 1 : columnIndex > 0) {
                    preparedClasses += ' controls-Grid__cell_spacingLeft' + `_theme-${theme}`;
                }
            } else {
                preparedClasses += ' controls-Grid__cell_spacingLeft' + `_theme-${theme}`;
            }

            if (columnIndex < (columnsLengthExcludedActionCell - 1) || (maxEndColumn && endColumn < maxEndColumn)) {
                preparedClasses += ' controls-Grid__cell_spacingRight' + `_theme-${theme}`;
            }
            // Отступ для последней колонки
            const lastColClass = ' controls-Grid__cell_spacingLastCol_' + (itemPadding.right || 'default').toLowerCase() + `_theme-${theme}`;
            if (isMultiHeader && maxEndColumn) {
                // у мультихэдера последняя ячейка определяется по endColumn, а не по последнему элементу массива.
                if (maxEndColumn === endColumn) {
                    preparedClasses += lastColClass;
                }
            } else {
                if (columnIndex === columnsLengthExcludedActionCell - 1) {
                    preparedClasses += lastColClass;
                }
            }

            // Отступ для первой колонки. Если режим мультиселект, то отступ обеспечивается чекбоксом.
            if (columnIndex === 0 && !multiSelectVisibility && rowIndex === 0 && !isBreadCrumbs) {
                preparedClasses += ' controls-Grid__cell_spacingFirstCol_' + (itemPadding.left || 'default').toLowerCase() + `_theme-${theme}`;
            }

            // TODO: удалить isBreadcrumbs после https://online.sbis.ru/opendoc.html?guid=b3647c3e-ac44-489c-958f-12fe6118892f
            if (isBreadCrumbs) {
                preparedClasses += ' controls-Grid__cell_spacingFirstCol_null' + `_theme-${theme}`;
                if (params.multiSelectVisibility && GridLayoutUtil.isFullGridSupport()) {
                    preparedClasses += ' controls-Grid__cell_spacingBackButton_with_multiSelection' + `_theme-${theme}`;
                }
            }
            // Стиль колонки
            preparedClasses += ' controls-Grid__cell_' + (style || 'default');
            if (!params.isHeader) {
                preparedClasses += ' controls-Grid__row-cell_rowSpacingTop_' + (itemPadding.top || 'default').toLowerCase() + `_theme-${theme}`;
                preparedClasses += ' controls-Grid__row-cell_rowSpacingBottom_' + (itemPadding.bottom || 'default').toLowerCase() + `_theme-${theme}`;
            }

            return preparedClasses;
        },
        isLastItem: function(editingItem, rowCount, itemIndex) {
            if (editingItem && editingItem.index >= rowCount) {
                return itemIndex === editingItem.index;
            } else {
                return itemIndex === rowCount - 1;
            }
        },
        prepareRowSeparatorClasses: function (current, theme) {
            let result = '';
            if (current.rowSeparatorVisibility) {
                result += ` controls-Grid__row-cell_withRowSeparator${current.rowSeparatorSize && current.rowSeparatorSize.toLowerCase() === 'l' ? '-l' : ''}_theme-${theme} `;
            } else {
                result += `controls-Grid__row-cell_withoutRowSeparator_theme-${theme}`;
            }
            return result;
        },

        isFixedCell: function(params) {
            const { multiSelectVisibility, stickyColumnsCount, columnIndex, rowIndex, isMultiHeader } = params;
            const
                hasMultiSelect = multiSelectVisibility !== 'hidden',
                columnOffset = hasMultiSelect ? 1 : 0;
            const isCellIndexLessTheFixedIndex = columnIndex < (stickyColumnsCount + columnOffset);
            if (isMultiHeader !== undefined) {
                return isCellIndexLessTheFixedIndex && rowIndex === 0;
            }
            return isCellIndexLessTheFixedIndex;
        },


        getHeaderZIndex: function(params) {
           return _private.isFixedCell(params) && params.columnScroll ? FIXED_HEADER_ZINDEX : STICKY_HEADER_ZINDEX;
        },

        getColumnScrollCellClasses: function(params, theme) {
           return _private.isFixedCell(params) ? ` controls-Grid__cell_fixed controls-Grid__cell_fixed_theme-${theme}` : ' controls-Grid__cell_transform';
        },

        getClassesLadderHeading(itemData, theme): String {
            let result = 'controls-Grid__row-ladder-cell__content controls-Grid__row-ladder-cell__content_';
            result += itemData.itemPadding && itemData.itemPadding.top ? itemData.itemPadding.top : 'default';
            result += '_theme-' + theme;
            return result;
        },

        getItemColumnCellClasses: function(current, theme) {
            const checkBoxCell = current.multiSelectVisibility !== 'hidden' && current.columnIndex === 0;
            const classLists = createClassListCollection('base', 'padding', 'columnScroll');
            const style = current.style || 'default';
            const backgroundStyle = current.backgroundStyle || current.style || 'default';

            // Стиль колонки
            const rowSeparatorSize = ` controls-Grid__row-cell_rowSeparatorSize-${current.rowSeparatorSize && current.rowSeparatorSize.toLowerCase() === 'l' ? 'l' : 's'}_theme-${theme} `;
            classLists.base += `controls-Grid__row-cell controls-Grid__row-cell_theme-${theme} controls-Grid__cell_${style} ${rowSeparatorSize}`;
            classLists.base += ` ${_private.prepareRowSeparatorClasses(current, theme)}`;

            if (current.columnScroll) {
                classLists.columnScroll += _private.getColumnScrollCellClasses(current, theme);
                classLists.columnScroll += _private.getBackgroundStyle({backgroundStyle, theme}, true);
            } else if (!checkBoxCell) {
                classLists.base += ' controls-Grid__cell_fit';
            }

            if (current.isEditing) {
                classLists.base += ` controls-Grid__row-cell-background-editing_theme-${theme}`;
            } else {
                classLists.base += ` controls-Grid__row-cell-background-hover_theme-${theme}`;
            }

            // Если включен множественный выбор и рендерится первая колонка с чекбоксом
            if (checkBoxCell) {
                classLists.base += ` controls-Grid__row-cell-checkbox_theme-${theme}`;
                classLists.padding = createClassListCollection('top', 'bottom');
                classLists.padding.top = `controls-Grid__row-cell_rowSpacingTop_${current.itemPadding.top}_theme-${theme}`;
                classLists.padding.bottom =  `controls-Grid__row-cell_rowSpacingBottom_${current.itemPadding.bottom}_theme-${theme}`;
            } else {
                classLists.padding = _private.getPaddingCellClasses(current, theme);
            }

            if (current.isSelected) {
                classLists.base += ` controls-Grid__row-cell_selected controls-Grid__row-cell_selected-${style}_theme-${theme}`;

                // при отсутствии поддержки grid (например в IE, Edge) фон выделенной записи оказывается прозрачным,
                // нужно его принудительно установить как фон таблицы
                if (!GridLayoutUtil.isFullGridSupport()) {
                    classLists.base += _private.getBackgroundStyle({backgroundStyle, theme}, true);
                }

                if (current.columnIndex === 0) {
                    classLists.base += ` controls-Grid__row-cell_selected__first-${style}_theme-${theme}`;
                }
                if (current.columnIndex === current.getLastColumnIndex()) {
                    classLists.base += ` controls-Grid__row-cell_selected__last controls-Grid__row-cell_selected__last-${style}_theme-${theme}`;
                }
            } else if (current.columnIndex === current.getLastColumnIndex()) {
                classLists.base += ` controls-Grid__row-cell__last controls-Grid__row-cell__last-${style}_theme-${theme}`;
            }

            return classLists;
        },

        getSortingDirectionByProp: function(sorting, prop) {
            var sortingDirection;

            if (sorting) {
                sorting.forEach(function(elem) {
                    if (elem[prop]) {
                        sortingDirection = elem[prop];
                    }
                });
            }

            return sortingDirection;
        },

        isNeedToHighlight: function(item, dispProp, searchValue) {
            var itemValue = item.get(dispProp);
            return itemValue && searchValue && String(itemValue).toLowerCase().indexOf(searchValue.toLowerCase()) !== -1;
        },

        calcLadderVersion(ladder = {}, index): string {

            function getItemsLadderVersion(ladder) {
                let ladderVersion = '';

                Object.keys(ladder).forEach((ladderProperty) => {
                    ladderVersion += (ladder[ladderProperty].ladderLength || 0) + '_';
                });

                return ladderVersion;
            }

            let
                version = '',
                simpleLadder = ladder.ladder && ladder.ladder[index],
                stickyLadder = ladder.stickyLadder && ladder.stickyLadder[index];

            if (simpleLadder) {
                version += 'LP_' + getItemsLadderVersion(simpleLadder);
            }
            if (stickyLadder) {
                version += 'SP_' + getItemsLadderVersion(stickyLadder);
            }

            return version;
        },

        /**
         * Производит пересчёт групп объединяемых колонок для заголовков (разделителей) записей
         * @param itemData информация о записи
         * @param leftSideItemsCount число колонок в группе (или номер последней колонки)
         * @private
         */
        getColumnAlignGroupStyles(itemData: IGridItemData, leftSideItemsCount: number = 0): {
            left: string
            right: string
        } {
            const additionalTerm = (itemData.hasMultiSelect ? 1 : 0);
            const result = {left: '', right: ''};
            const start = 1;
            const end = itemData.columns.length + 1;

            if (leftSideItemsCount > 0) {
                const center = leftSideItemsCount + additionalTerm + 1;
                result.left = `grid-column: ${start} / ${center - end - 1}; -ms-grid-column: ${start}; -ms-grid-column-span: ${(center - 1)};`;
                // Расчёт был изменён из-за того, что в случае установки колонки MultiSelect необходимо делать перерасчёт размеров,
                // но getColumnAlignGroupStyles при добавлении колонки MultiSelect не вызывается
                result.right = `grid-column: span ${(end - center)} / auto; -ms-grid-column: ${center}; -ms-grid-column-span: ${(end - center)};`;
            } else {
                result.left = `grid-column: ${start} / ${end}; -ms-grid-column: ${start}; -ms-grid-column-span: ${end - 1};`;
            }
            return result;
        },

        getColspanForColumnScroll(self): {
            fixedColumns: string,
            scrollableColumns: string,
            actions: string
        } {

            const stickyColumnsCount = self._options.stickyColumnsCount || 1;
            const scrollableColumnsCount = self._columns.length - self._options.stickyColumnsCount;
            const start = (self._options.multiSelectVisibility !== 'hidden' ? 1 : 0) + 1;
            const center = start + (self._options.stickyColumnsCount || 1);
            const end = start + self._columns.length;

            const scrollableColumnsStyle = `grid-column: ${center} / ${end}; -ms-grid-column: ${center}; -ms-grid-column-span: ${scrollableColumnsCount};`;

            return {
                fixedColumns: `grid-column: ${start} / ${center}; -ms-grid-column: ${start}; -ms-grid-column-span: ${stickyColumnsCount}; z-index: 3;`,
                scrollableColumns: `${scrollableColumnsStyle} z-index: auto;`,
                actions: scrollableColumnsStyle
            };
        },

        getGroupPaddingClasses(current, theme): { left: string, right: string } {
            let right = `controls-Grid__groupContent__spacingRight_${current.itemPadding.right}_theme-${theme}`;
            let left =  'controls-Grid__groupContent__spacingLeft_';
            if (current.hasMultiSelect) {
                left += `withCheckboxes_theme-${theme}`;
            } else {
                left += `${current.itemPadding.left}_theme-${theme}`;
            }
            return { left, right };
        },

        prepareLadder(self) {
            if (!self._isSupportLadder(self._options.ladderProperties)) {
                return {};
            }
            self.resetCachedItemData();

            const hasVirtualScroll = !!self._options.virtualScrolling || Boolean(self._options.virtualScrollConfig);
            const displayStopIndex = self.getDisplay() ? self.getDisplay().getCount() : 0;

            return prepareLadder({
                ladderProperties: self._options.ladderProperties,
                startIndex: self.getStartIndex(),
                stopIndex: hasVirtualScroll ? self.getStopIndex() : displayStopIndex,
                display: self.getDisplay(),
                columns: self._options.columns,
                stickyColumn: self._options.stickyColumn
            });
        },
        getTableCellStyles(currentColumn): string {
            let styles = '';
            const isCheckbox = currentColumn.hasMultiSelect && currentColumn.columnIndex === 0;
            if (!isCheckbox && currentColumn.column.width !== 'auto') {
                styles += `min-width: ${currentColumn.column.width}; max-width: ${currentColumn.column.width};`;
            }
            return styles;
        },

        /**
         * Возвращает префикс стиля, выставленный для grid
         * @param options
         */
        getStylePrefix(options: {theme: string, style?: string, backgroundStyle?: string}): string {
            return options.backgroundStyle || options.style || 'default';
        },

        /**
         * Возвращает CSS класс для установки background
         * @param options Опции IList | объект, содержащий theme, style, backgroundStyle
         * @param addSpace Добавлять ли пробел перед выводимой строкой
         */
        getBackgroundStyle(options: {theme: string, style?: string, backgroundStyle?: string}, addSpace?: boolean): string {
            return `${addSpace ? ' ' : ''}controls-background-${_private.getStylePrefix(options)}_theme-${options.theme}`;
        },

        /**
         * Проверяет, присутствует ли "прилипающая" колонка
         * @param self
         */
        hasStickyColumn(self): boolean {
            return !!getStickyColumn({
                stickyColumn: self._options.stickyColumn,
                columns: self._options.columns
            });
        }
    },

    GridViewModel = BaseViewModel.extend({
        _model: null,
        _columnTemplate: null,

        _columns: [],
        _curColumnIndex: 0,

        _lastItemKey: undefined,
        _headerRows: [],
        _headerColumns: [],
        _curHeaderColumnIndex: 0,
        _maxEndRow: 0,
        _maxEndColumn: 0,
        _curHeaderRowIndex: 0,
        _multiHeaderOffset: 0,
        _headerCellMinHeight: null,
        _resultOffset: null,

        _resultsColumns: [],
        _curResultsColumnIndex: 0,

        _colgroupColumns: [],
        _curColgroupColumnIndex: 0,

        _ladder: null,
        _columnsVersion: 0,

        _isMultiHeader: null,

        constructor: function(cfg) {
            this._options = cfg;
            GridViewModel.superclass.constructor.apply(this, arguments);
            this._model = this._createModel(cfg);
            this._onListChangeFn = function(event, changesType, action, newItems, newItemsIndex, removedItems, removedItemsIndex) {
                if (changesType === 'collectionChanged' || changesType === 'indexesChanged') {
                    this._ladder = _private.prepareLadder(this);
                    if (changesType === 'indexesChanged') {
                        this._nextModelVersion();
                    }
                }
                this._nextVersion();
                this._notify('onListChange', changesType, action, newItems, newItemsIndex, removedItems, removedItemsIndex);
            }.bind(this);
            this._onMarkedKeyChangedFn = function(event, key) {
                this._notify('onMarkedKeyChanged', key);
            }.bind(this);
            this._onGroupsExpandChangeFn = function(event, changes) {
                this._notify('onGroupsExpandChange', changes);
            }.bind(this);
            this._onCollectionChangeFn = function(event, action) {
                this._updateLastItemKey();
                this._notify.apply(this, ['onCollectionChange'].concat(Array.prototype.slice.call(arguments, 1)));
                // When item is added to or removed from the grid with ladder support, we have to recalculate
                // ladder styles for every cell, so we need to update prefix version
                if (
                    this._isSupportLadder(this._options.ladderProperties) &&
                    (
                        action === collection.IObservable.ACTION_ADD ||
                        action === collection.IObservable.ACTION_REMOVE
                    ) &&
                    !this._options.columnScroll
                ) {
                    event.setResult('updatePrefix');
                }
            }.bind(this);
            // Events will not fired on the PresentationService, which is why setItems will not ladder recalculation.
            // Use callback for fix it. https://online.sbis.ru/opendoc.html?guid=78a1760a-bfcf-4f2c-8b87-7f585ea2707e
            this._model.setUpdateIndexesCallback(this._updateIndexesCallback.bind(this));
            this._model.subscribe('onListChange', this._onListChangeFn);
            this._model.subscribe('onMarkedKeyChanged', this._onMarkedKeyChangedFn);
            this._model.subscribe('onGroupsExpandChange', this._onGroupsExpandChangeFn);
            this._model.subscribe('onCollectionChange', this._onCollectionChangeFn);
            this._ladder = _private.prepareLadder(this);
            this._setColumns(this._options.columns);
            if (this._options.header && this._options.header.length) {
                this._isMultiHeader = this.isMultiHeader(this._options.header);
            }
            this._setHeader(this._options.header);
            this._updateLastItemKey();
        },
        _isSupportLadder(ladderProperties: []): boolean {
            return isSupportLadder(ladderProperties);
        },
        setTheme(theme: string): void {
            this._options.theme = theme;
        },

        _updateLastItemKey(): void {
            if (this.getItems()) {
                this._lastItemKey = ItemsUtil.getPropertyValue(this.getLastItem(), this._options.keyProperty);
            }
        },

        _updateIndexesCallback(): void {
            this._ladder = _private.prepareLadder(this);
        },

        setKeyProperty(keyProperty: string): void {
            this._options.keyProperty = keyProperty;
        },

        isGroupExpanded(groupId: Grouping.TGroupId): boolean {
            return this._model.isGroupExpanded(groupId);
        },

        setGroupProperty(groupProperty: string): void {
            this._model.setGroupProperty(groupProperty);
        },

        getGroupProperty(): string {
            return this._model.getGroupProperty();
        },

        _nextModelVersion: function(notUpdatePrefixItemVersion) {
            this._model.nextModelVersion(notUpdatePrefixItemVersion);
        },

        _prepareCrossBrowserColumn(column: IGridColumn): IGridColumn {
            const result = cClone(column) as IGridColumn;

            if (!GridLayoutUtil.isFullGridSupport()) {
                if (column.compatibleWidth) {
                    result.width = column.compatibleWidth;
                } else {
                    result.width = GridLayoutUtil.isCompatibleWidth(column.width) ? column.width : GridLayoutUtil.getDefaultColumnWidth();
                }
            }
            return result;
        },

        _prepareColumns(columns: IGridColumn[]): IGridColumn[] {
            const result: IGridColumn[] = [];
            for (let i = 0; i < columns.length; i++) {
                result.push(this._prepareCrossBrowserColumn(columns[i]));
            }
            return result;
        },

        _createModel: function(cfg) {
            return new ListViewModel(cfg);
        },

        setColumnTemplate: function(columnTpl) {
            this._columnTemplate = columnTpl;
        },

        // -----------------------------------------------------------
        // ---------------------- headerColumns ----------------------
        // -----------------------------------------------------------

        getHeader: function() {
            return this._header;
        },

        _setHeader: function(columns) {
            this._header = columns;
            this._prepareHeaderColumns(
                this._header,
                this._options.multiSelectVisibility !== 'hidden',
                this._shouldAddActionsCell(),
                this.shouldAddStickyLadderCell()
            );
        },

        setHeader: function(columns) {
            this._setHeader(columns);
            this._nextModelVersion();
        },
        isMultiHeader: function(columns?: any) {
            let result = false;
            if (columns) {
            let k = 0;
            while(columns.length > k) {
                if (columns[k].endRow > 2) {
                        result = true;
                }
                k++;
            }
            } else if (this._isMultiHeader !== null) {
                result = this._isMultiHeader;
            }
            return result;
        },
        _prepareHeaderColumns: function(columns, multiSelectVisibility, actionsCell, stickyLadderCell) {
            if (columns && columns.length) {
                this._isMultiHeader = this.isMultiHeader(columns);
                this._headerRows = getHeaderRowsArray(columns, multiSelectVisibility, this._isMultiHeader, actionsCell, stickyLadderCell);
                const headerMaxEndCellData = getHeaderMaxEndCellData(this._headerRows);
                this._maxEndRow = headerMaxEndCellData.maxRow;
                this._maxEndColumn = headerMaxEndCellData.maxColumn;
            } else if (multiSelectVisibility) {
                this._headerRows = [{}];
            } else {
                this._headerRows = [];
            }
            this._multiHeaderOffset = this._headerRows.length ? this._headerRows.length - 1 : 0;
            this.resetHeaderRows();
        },
        getMultiHeaderOffset: function() {
          return this._multiHeaderOffset;
        },

        _shouldAddActionsCell(): boolean {
            return shouldAddActionsCell({
                hasColumnScroll: !!this._options.columnScroll,
                isFullGridSupport: GridLayoutUtil.isFullGridSupport(),
                hasColumns: !!this._columns.length
            });
        },
        /**
         * Проверка необходимости добавлять ячейку для лесенки
         */
        shouldAddStickyLadderCell(): boolean {
            return shouldAddStickyLadderCell(
                this._options.columns,
                this._options.stickyColumn,
                this.getDragItemData());
        },
        resetHeaderRows: function() {
            this._curHeaderRowIndex = 0;
        },
        goToNextHeaderRow: function() {
            this._curHeaderRowIndex++;
        },

        getStickyColumnsCount: function() {
            return this._options.stickyColumnsCount;
        },

        getHeaderMaxEndColumn: function() {
            return this._maxEndColumn;
        },

        /**
         * Метод проверяет, рисовать ли header при отсутствии записей.
         */
        isDrawHeaderWithEmptyList(): boolean {
            return this.headerInEmptyListVisible || this.isGridListNotEmpty();
        },

        isGridListNotEmpty(): boolean {
            const items = this.getItems();
            return !!items && items.getCount() > 0;
        },

        getCurrentHeaderRow: function() {
            const self = this;
            let obj = {
                curHeaderColumnIndex: 0,
                curRowIndex: this._curHeaderRowIndex,
                headerCells: this._headerRows[this._curHeaderRowIndex],
                getCurrentHeaderColumn: function() {
                    return self.getCurrentHeaderColumn(this.curRowIndex, this.curHeaderColumnIndex);
                }
            };
            obj.resetHeaderColumns = function() {
                this.curHeaderColumnIndex = 0;
            };
            obj.goToNextHeaderColumn = function() {
                this.curHeaderColumnIndex++;
            };
            obj.isEndHeaderColumn = function() {
                return this.curHeaderColumnIndex < this.headerCells.length;
            };
            return obj;
        },

        isEndHeaderRow: function() {
            return this._curHeaderRowIndex < this._headerRows.length;
        },

        getColumnsVersion: function() {
            return this._columnsVersion;
        },

        isStickyHeader: function() {
           return this._options.stickyHeader && GridLayoutUtil.isFullGridSupport();
        },

        getCurrentHeaderColumn: function(rowIndex, columnIndex) {
            const cell = this._headerRows[rowIndex][columnIndex];
            const theme = this._options.theme;
            const hasMultiSelect = this._options.multiSelectVisibility !== 'hidden';
            const headerColumn = {
                column: cell,
                index: columnIndex
            };
            let cellClasses = `controls-Grid__header-cell controls-Grid__header-cell_theme-${theme}` +
                ` controls-Grid__${this._isMultiHeader ? 'multi-' : ''}header-cell_min-height_theme-${theme}` +
                _private.getBackgroundStyle(this._options, true);

            if (this.isStickyHeader()) {
               headerColumn.zIndex = _private.getHeaderZIndex({
                  columnIndex: columnIndex,
                  rowIndex,
                  isMultiHeader: this._isMultiHeader,
                  multiSelectVisibility: this._options.multiSelectVisibility,
                  stickyColumnsCount: this._options.stickyColumnsCount,
                  columnScroll: this._options.columnScroll
               });
            }

            if (!isStickySupport()) {
                cellClasses = cellClasses + ' controls-Grid__header-cell_static';
            }

            if (this._options.columnScroll) {
                cellClasses += _private.getColumnScrollCellClasses({
                    columnIndex: columnIndex,
                    rowIndex,
                    isMultiHeader: this._isMultiHeader,
                    multiSelectVisibility: this._options.multiSelectVisibility,
                    stickyColumnsCount: this._options.stickyColumnsCount
                }, this._options.theme);
            }

            // Если включен множественный выбор и рендерится первая колонка с чекбоксом
            if (hasMultiSelect && columnIndex === 0 && !cell.title) {
                cellClasses += ' controls-Grid__header-cell-checkbox' + `_theme-${theme}` + ` controls-Grid__header-cell-checkbox_min-width_theme-${theme}`;

                // В grid-layout хлебные крошки нельзя расположить в первой ячейке, если в таблице включен множественный выбор,
                // т.к. крошки растянут колонку, поэтому размещаем крошки во второй колонке и задаем отрицательный margin слева.
                // https://online.sbis.ru/doc/9fcac920-479a-40a3-8b8a-5aabb2886628
                // В table-layout проблемы с растягиванием нет, поэтому используем colspan на крошке.
                if (!GridLayoutUtil.isFullGridSupport() && this._headerRows[0][1] && this._headerRows[0][1].isBreadCrumbs) {
                    headerColumn.isHiddenForBreadcrumbs = true;
                }
            } else {
                cellClasses += _private.getPaddingHeaderCellClasses({
                    style: this._options.style,
                    columns: this._headerRows[rowIndex],
                    columnIndex: columnIndex,
                    multiSelectVisibility: hasMultiSelect,
                    itemPadding: this._model.getItemPadding(),
                    isMultiHeader: this._isMultiHeader,
                    isHeader: true,
                    cell,
                    rowIndex,
                    maxEndColumn: this._maxEndColumn,
                    // TODO: удалить isBreadcrumbs после https://online.sbis.ru/opendoc.html?guid=b3647c3e-ac44-489c-958f-12fe6118892f
                    isBreadCrumbs: headerColumn.column.isBreadCrumbs,
                    hasActionCell: this._shouldAddActionsCell()
                }, this._options.theme);
                cellClasses += ' controls-Grid__header-cell_min-width';
            }

            // TODO: удалить isBreadcrumbs после https://online.sbis.ru/opendoc.html?guid=b3647c3e-ac44-489c-958f-12fe6118892f
            if (headerColumn.column.isBreadCrumbs) {
               headerColumn.style = this.getColspanStylesFor(
                   'headerBreadcrumbs',
                   {
                       columnIndex,
                       columnsLength: this._headerRows[0].length,
                       maxEndRow: this._maxEndRow
                   }
               );
               headerColumn.colSpan = this.getColspanFor('headerBreadcrumbs');
            }

            if (this._options.columnScroll && !this._isMultiHeader && !GridLayoutUtil.isFullGridSupport()) {
                headerColumn.style += ' ' + _private.getTableCellStyles({
                    hasMultiSelect,
                    columnIndex,
                    column: this._columns[columnIndex - (hasMultiSelect ? 1 : 0)]
                });
            }

            if (headerColumn.column.sortingProperty) {
                headerColumn.sortingDirection = _private.getSortingDirectionByProp(this.getSorting(), headerColumn.column.sortingProperty);
            }
            // -----------------------------------------------------------
            // ---------------------- multiHeader ------------------------
            // -----------------------------------------------------------

            let cellContentClasses = '';
            let cellStyles = '';
            let shadowVisibility = 'visible';

            if (cell.startRow || cell.startColumn) {
                let { endRow, startRow, endColumn, startColumn } = cell;

                if (!startRow) {
                    startRow = 1;
                    endRow = 2;
                }
                if (!GridLayoutUtil.isFullGridSupport()) {
                    headerColumn.rowSpan = endRow - startRow;
                    // Для хлебных крошек колспан проставляется выше и не зависит от мультишапки.
                    if (!headerColumn.column.isBreadCrumbs) {
                        headerColumn.colSpan = endColumn - startColumn;
                    }
                } else {

                    const additionalColumn = this._options.multiSelectVisibility === 'hidden' ? 0 : 1;
                    const gridStyles = GridLayoutUtil.getMultiHeaderStyles(startColumn, endColumn, startRow, endRow, additionalColumn);
                    cellStyles += gridStyles;

                }
                cellClasses += endRow - startRow > 1 ? ' controls-Grid__header-cell_justify_content_center' : '';
                cellContentClasses += rowIndex !== this._headerRows.length - 1 && endRow - startRow === 1 ? ` controls-Grid__cell_header-content_border-bottom_theme-${this._options.theme}` : '';
            }

            if (columnIndex === 0 && rowIndex === 0 && this._options.multiSelectVisibility !== 'hidden' && this._headerRows[rowIndex][columnIndex + 1].startColumn && !cell.title) {
                cellStyles = GridLayoutUtil.getMultiHeaderStyles(1, 2, 1, this._maxEndRow, 0)
                if (!GridLayoutUtil.isFullGridSupport()) {
                    headerColumn.rowSpan = this._maxEndRow - 1;
                    headerColumn.colSpan = 1;
                }
            }
            if (headerColumn.column.align) {
                cellContentClasses += ' controls-Grid__header-cell_justify_content_' + headerColumn.column.align;
            }
            if (headerColumn.column.valign) {
                cellContentClasses += ' controls-Grid__header-cell_align_items_' + headerColumn.column.valign;
            }

            if (GridLayoutUtil.isOldIE()) {
                cellContentClasses += ' controls-Grid__header-cell-content-block';
            }

            headerColumn.shadowVisibility = shadowVisibility;
            headerColumn.cellStyles = cellStyles;
            headerColumn.cellClasses = cellClasses;
            headerColumn.cellContentClasses = cellContentClasses;

            return headerColumn;
        },

        // -----------------------------------------------------------
        // ---------------------- resultColumns ----------------------
        // -----------------------------------------------------------

        getResultsPosition: function() {
            if (this.isDrawResults()) {
                if (this._options.results) {
                    return this._options.results.position;
                }
                return this._options.resultsPosition;
            }
        },

        setHasMoreData: function(hasMore: boolean) {
            this._model.setHasMoreData(hasMore);
        },

        getHasMoreData: function() {
          return this._model.getHasMoreData();
        },

        isDrawResults: function() {
            if (this._options.resultsVisibility === 'visible') {
                return true;
            }
            const items = this.getItems();
            return this.getHasMoreData() || items && items.getCount() > 1;
        },

        setResultsPosition: function(position) {
            this._options.resultsPosition = position;
        },

        setResultsVisibility(resultsVisibility) {
            this._options.resultsVisibility = resultsVisibility;
        },

        getStyleForCustomResultsTemplate(): string {
            return this.getColspanStylesFor(
                'customResults',
                {
                    columnIndex: 0,
                    columnsLength: this._columns.length
                });
        },

        _prepareResultsColumns: function(columns, multiSelectVisibility) {
            if (multiSelectVisibility) {
                this._resultsColumns = [{}].concat(columns);
            } else {
                this._resultsColumns = columns;
            }
            if (this.shouldAddStickyLadderCell()) {
                this._resultsColumns = [{}].concat(this._resultsColumns);
            }
            if (this._shouldAddActionsCell()) {
                this._resultsColumns = this._resultsColumns.concat([{ isActionCell: true }]);
            }

            this.resetResultsColumns();
        },

        resetResultsColumns: function() {
            this._curResultsColumnIndex = 0;
        },

        getCurrentResultsColumn(): {column: IHeaderCell, index: number, zIndex?: number, cellClasses?: string} {
            const columnIndex = this._curResultsColumnIndex;
            const resultsColumn: {column: IHeaderCell, index: number, zIndex?: number, cellClasses?: string} = {
                   column: this._resultsColumns[columnIndex],
                   index: columnIndex
            };
            let cellClasses = `controls-Grid__results-cell ${_private.getBackgroundStyle(this._options)} controls-Grid__cell_${this._options.style} controls-Grid__results-cell_theme-${this._options.theme}`;

            if (resultsColumn.column?.align) {
                cellClasses += ` controls-Grid__row-cell__content_halign_${resultsColumn.column.align}`;
            }

            if (this.isStickyHeader()) {
                resultsColumn.zIndex = _private.getHeaderZIndex({
                    columnIndex,
                    multiSelectVisibility: this._options.multiSelectVisibility,
                    stickyColumnsCount: this._options.stickyColumnsCount,
                    columnScroll: this._options.columnScroll
                });
            }

            if (this._options.columnScroll) {
                cellClasses += _private.getColumnScrollCellClasses({
                    columnIndex,
                    multiSelectVisibility: this._options.multiSelectVisibility,
                    stickyColumnsCount: this._options.stickyColumnsCount
                }, this._options.theme);

                if (!GridLayoutUtil.isFullGridSupport()) {
                    const hasMultiSelect = this._options.multiSelectVisibility !== 'hidden';
                    resultsColumn.tableCellStyles = _private.getTableCellStyles({
                        hasMultiSelect,
                        columnIndex,
                        column: this._columns[columnIndex - (hasMultiSelect ? 1 : 0)]
                    });
                }
            }

            // Если включен множественный выбор и рендерится первая колонка с чекбоксом
            if ((this._options.multiSelectVisibility !== 'hidden') && columnIndex === 0) {
                cellClasses += ' controls-Grid__results-cell-checkbox' + `_theme-${this._options.theme}`;
            } else if (resultsColumn.column) {
                cellClasses += ' ' + _private.getPaddingCellClasses({
                    style: this._options.style,
                    columns: this._resultsColumns,
                    columnIndex,
                    hasMultiSelect: this._options.multiSelectVisibility !== 'hidden',
                    itemPadding: this._model.getItemPadding(),
                    isResult: true,
                    hasActionCell: this._shouldAddActionsCell()
                }, this._options.theme).getAll();

                if (resultsColumn.column.displayProperty) {
                    const results = this._model.getMetaResults();
                    if (results && cInstance.instanceOfModule(results, 'Types/entity:Model')) {
                        resultsColumn.results = results.get(resultsColumn.column.displayProperty);
                        const format = results.getFormat();
                        const fieldIndex = format.getIndexByValue('name', resultsColumn.column.displayProperty);
                        resultsColumn.resultsFormat = fieldIndex !== -1 ? format.at(fieldIndex).getType() : undefined;
            }
                }

                resultsColumn.showDefaultResultTemplate = !!resultsColumn.resultsFormat;
            }
            resultsColumn.cellClasses = cellClasses;
            return resultsColumn;
        },

        goToNextResultsColumn: function() {
            this._curResultsColumnIndex++;
        },

        isEndResultsColumn: function() {
            return this._curResultsColumnIndex < this._resultsColumns.length;
        },

        getResults() {
            return this._model.getMetaResults();
        },

        // -----------------------------------------------------------
        // -------------------------- items --------------------------
        // -----------------------------------------------------------

        _setColumns(columns: IGridColumn[]): void {
            this._columns = this._prepareColumns(columns);
            this._ladder = _private.prepareLadder(this);
            this._prepareResultsColumns(this._columns, this._options.multiSelectVisibility !== 'hidden');
            this._prepareColgroupColumns(this._columns, this._options.multiSelectVisibility !== 'hidden');
            this._columnsVersion++;
        },

        setColumns(columns: IGridColumn[]): void {
            this._setColumns(columns);
            this._nextModelVersion();
        },

        setLeftSpacing: function(leftSpacing) {
            //TODO: Выпилить в 19.200 https://online.sbis.ru/opendoc.html?guid=837b45bc-b1f0-4bd2-96de-faedf56bc2f6
            this._model.setLeftSpacing(leftSpacing);
        },

        setRightSpacing: function(rightSpacing) {
            //TODO: Выпилить в 19.200 https://online.sbis.ru/opendoc.html?guid=837b45bc-b1f0-4bd2-96de-faedf56bc2f6
            this._model.setRightSpacing(rightSpacing);
        },

        setLeftPadding: function(leftPadding) {
            //TODO: Выпилить в 19.200 https://online.sbis.ru/opendoc.html?guid=837b45bc-b1f0-4bd2-96de-faedf56bc2f6
            this._model.setLeftPadding(leftPadding);
        },

        setRightPadding: function(rightPadding) {
            //TODO: Выпилить в 19.200 https://online.sbis.ru/opendoc.html?guid=837b45bc-b1f0-4bd2-96de-faedf56bc2f6
            this._model.setRightPadding(rightPadding);
        },

        setRowSpacing: function(rowSpacing) {
            //TODO: Выпилить в 19.200 https://online.sbis.ru/opendoc.html?guid=837b45bc-b1f0-4bd2-96de-faedf56bc2f6
            this._model.setRowSpacing(rowSpacing);
        },

        isAllGroupsCollapsed(): boolean {
            return this._model.isAllGroupsCollapsed();
        },

        getColumns: function() {
            return this._columns;
        },

        getMultiSelectVisibility: function() {
            return this._model.getMultiSelectVisibility();
        },

        setMultiSelectVisibility: function(multiSelectVisibility) {
            const hasMultiSelect = multiSelectVisibility !== 'hidden';
            this._model.setMultiSelectVisibility(multiSelectVisibility);
            this._prepareColgroupColumns(this._columns, hasMultiSelect);
            this._prepareHeaderColumns(this._header, hasMultiSelect, this._shouldAddActionsCell(), this.shouldAddStickyLadderCell());

            this._prepareResultsColumns(this._columns, hasMultiSelect);
        },

        hasItemById: function(id, keyProperty) {
            return this._model.hasItemById(id, keyProperty);
        },

        getItemById: function(id, keyProperty) {
            return this._model.getItemById(id, keyProperty);
        },

        setMarkedKey: function(key, byOptions) {
            this._model.setMarkedKey(key, byOptions);
        },

        setMarkerVisibility: function(markerVisibility) {
            this._model.setMarkerVisibility(markerVisibility);
        },

        getMarkedKey: function() {
            return this._model.getMarkedKey();
        },
        getMarkedItem: function() {
            return this._model.getMarkedItem();
        },
        getFirstItem: function() {
            return this._model.getFirstItem.apply(this._model, arguments);
        },
        getLastItem: function() {
            return this._model.getLastItem.apply(this._model, arguments);
        },
        getIndexByKey: function() {
            return this._model.getIndexByKey.apply(this._model, arguments);
        },

        getSelectionStatus: function() {
            return this._model.getSelectionStatus.apply(this._model, arguments);
        },

        getNextItemKey: function() {
            return this._model.getNextItemKey.apply(this._model, arguments);
        },
        setMarkerOnValidItem: function(index) {
            this._model.setMarkerOnValidItem(index);
        },
        setIndexes: function(startIndex, stopIndex) {
            return this._model.setIndexes(startIndex, stopIndex);
        },

        getPreviousItemKey: function() {
            return this._model.getPreviousItemKey.apply(this._model, arguments);
        },

        setSorting: function(sorting) {
            this._model.setSorting(sorting);
        },

        setSearchValue: function(value) {
            this._model.setSearchValue(value);
        },

        getSorting: function() {
            return this._model.getSorting();
        },
        setEditingConfig: function(editingConfig) {
            this._model.setEditingConfig(editingConfig);
        },

        setItemPadding: function(itemPadding) {
            this._model.setItemPadding(itemPadding);
        },

        getSwipeItem: function() {
            return this._model.getSwipeItem();
        },

        getCollapsedGroups(): Grouping.TArrayGroupId {
            return this._model.getCollapsedGroups();
        },

        setCollapsedGroups(collapsedGroups: Grouping.TArrayGroupId): void {
            this._model.setCollapsedGroups(collapsedGroups);
        },

        reset: function() {
            this._model.reset();
        },

        isEnd: function() {
            return this._model.isEnd();
        },

        isShouldBeDrawnItem: function(item) {
            return this._model.isShouldBeDrawnItem(item);
        },

        goToNext: function() {
            this._model.goToNext();
        },

        _calcRowIndex: function(current) {
            if (current.isGroup) {
                return this._getRowIndexHelper().getIndexByDisplayIndex(current.index);
            } else if (current.index !== -1) {
                return this._getRowIndexHelper().getIndexById(current.key);
            }
        },

        _getRowIndexHelper() {
            let
                cfg: IBaseGridRowIndexOptions = {
                    display: this.getDisplay(),
                    hasHeader: !!this.getHeader(),
                    resultsPosition: this.getResultsPosition(),
                    multiHeaderOffset: this.getMultiHeaderOffset(),
                    hasBottomPadding: this._options._needBottomPadding,
                    hasColumnScroll: this._options.columnScroll
                },
                hasEmptyTemplate = !!this._options.emptyTemplate;

            if (this.getEditingItemData()) {
                cfg.editingRowIndex = this.getEditingItemData().index;
            }

            return {
                getIndexByItem: (item) => getIndexByItem({item, ...cfg}),
                getIndexById: (id) => getIndexById({id, ...cfg}),
                getIndexByDisplayIndex: (index) => getIndexByDisplayIndex({index, ...cfg}),
                getResultsIndex: () => getResultsIndex({...cfg, hasEmptyTemplate}),
                getBottomPaddingRowIndex: () => getBottomPaddingRowIndex(cfg),
                getFooterIndex: () => getFooterIndex({...cfg, hasEmptyTemplate}),
                getTopOffset: () => getTopOffset(cfg.hasHeader, cfg.resultsPosition, cfg.multiHeaderOffset,  cfg.hasColumnScroll)
            };
        },

        setMenuState(state: string): void {
            this._model.setMenuState(state);
        },

        isCachedItemData: function(itemKey) {
            return this._model.isCachedItemData(itemKey);
        },
        getCachedItemData: function(itemKey) {
            return this._model.getCachedItemData(itemKey);
        },
        setCachedItemData: function(itemKey, cache) {
            this._model.setCachedItemData(itemKey, cache);
        },
        resetCachedItemData: function(itemKey?) {
            this._model.resetCachedItemData(itemKey);
        },

        getItemDataByItem: function(dispItem) {
            var
                self = this,
                current = this._model.getItemDataByItem(dispItem),
                stickyColumn;

            if (current._gridViewModelCached) {
                return current;
            } else {
                current._gridViewModelCached = true;
            }

            stickyColumn = getStickyColumn({
                stickyColumn: this._options.stickyColumn,
                columns: this._options.columns
            });

            current.isFullGridSupport = this.isFullGridSupport.bind(this);
            current.resolveBaseItemTemplate = this._baseItemTemplateResolver;

            current.columnScroll = this._options.columnScroll;
            current.getColspanForColumnScroll = () => _private.getColspanForColumnScroll(self);
            current.getColspanFor = (elementName: string) => self.getColspanFor.apply(self, [elementName]);
            current.stickyColumnsCount = this._options.stickyColumnsCount;

            current.style = this._options.style;
            current.multiSelectClassList += current.hasMultiSelect ? ` controls-GridView__checkbox_theme-${this._options.theme}` : '';

            current.getColumnAlignGroupStyles = (columnAlignGroup: number) => (
                _private.getColumnAlignGroupStyles(current, columnAlignGroup)
            );

            const superShouldDrawMarker = current.shouldDrawMarker;
            current.shouldDrawMarker = (marker?: boolean, columnIndex: number): boolean => {
                return columnIndex === 0 && superShouldDrawMarker.apply(this, [marker]);
            };
            const superGetMarkerClasses = current.getMarkerClasses;
            current.getMarkerClasses = (rowSeparatorVisibility): string => {
                let classes = ' controls-GridView__itemV_marker controls-GridView__itemV_marker_theme-' + self._options.theme;

                if (rowSeparatorVisibility) {
                    classes += ' controls-GridView-with-rowSeparator_item_marker';
                } else {
                    classes += ' controls-GridView-without-rowSeparator_item_marker';
                }
                classes += '_theme-' + self._options.theme;

                return superGetMarkerClasses.apply(this) + classes;
            }

            if (current.multiSelectVisibility !== 'hidden') {
                current.columns = [{}].concat(this._columns);
            } else {
                current.columns = this._columns;
            }


            current.isHovered = !!self._model.getHoveredItem() && self._model.getHoveredItem().getId() === current.key;

            // current.index === -1 если записи ещё нет в проекции/рекордсете. такое возможно при добавлении по месту
            if (stickyColumn && current.isFullGridSupport()  && !current.dragTargetPosition && current.index !== -1) {
                current.styleLadderHeading = self._ladder.stickyLadder[current.index].headingStyle;
            }

            // TODO: Разобраться, зачем это. По задаче https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
            if (current.columnScroll) {
                current.rowIndex = this._calcRowIndex(current);
                if (this.getEditingItemData() && (current.rowIndex >= this.getEditingItemData().rowIndex)) {
                    current.rowIndex++;
                }
            }

            if (current.isGroup) {
                current.groupPaddingClasses = _private.getGroupPaddingClasses(current, this._options.theme);
                current.shouldFixGroupOnColumn = (columnAlignGroup?: number) => {
                    return columnAlignGroup !== undefined && columnAlignGroup < current.columns.length - (current.hasMultiSelect ? 1 : 0)
                };
                return current;
            }

                current.rowSeparatorVisibility = this._options.showRowSeparator !== undefined ? this._options.showRowSeparator : this._options.rowSeparatorVisibility;
                current.rowSeparatorSize = this._options.rowSeparatorSize;

            current.itemActionsDrawPosition =
                this._options.columnScroll ? 'after' : 'before';
            current.itemActionsColumnScrollDraw = this._options.columnScroll;

            current.columnIndex = 0;

            current.getVersion = function() {
                return self._calcItemVersion(current.item, current.key, current.index);
            };

            current.resetColumnIndex = () => {
                current.columnIndex = 0;
            };
            current.goToNextColumn = () => {
                current.columnIndex++;
            };
            current.getLastColumnIndex = () => {
                return current.columns.length - 1;
            };
            current.hasNextColumn = (isColumnColspaned: boolean) => {
                if (isColumnColspaned) {
                    return current.columnIndex <= (current.hasMultiSelect ? 1 : 0);
                } else {
                    return current.getLastColumnIndex() >= current.columnIndex;
                }
            };
            current.getClassesLadderHeading = _private.getClassesLadderHeading;
            current.isDrawActions = _private.isDrawActions;
            current.isActionsColumn = _private.isActionsColumn;
            current.getCellStyle = (itemData, currentColumn, colspan) => _private.getCellStyle(self, itemData, currentColumn, colspan);

            current.getItemColumnCellClasses = _private.getItemColumnCellClasses;

            current.getCurrentColumnKey = function() {
                return self._columnsVersion + '_' +
                    (self._options.multiSelectVisibility === 'hidden' ? current.columnIndex : current.columnIndex - 1);
            };

            current.getCurrentColumn = function() {
                const currentColumn: any = {
                        item: current.item,
                        style: current.style,
                        isMenuShown: current.isMenuShown,
                        dispItem: current.dispItem,
                        keyProperty: current.keyProperty,
                        displayProperty: current.displayProperty,
                        index: current.index,
                        columnIndex: current.columnIndex,
                        key: current.key,
                        getPropValue: current.getPropValue,
                        isEditing: current.isEditing,
                        isActive: current.isActive,
                        showEditArrow: current.showEditArrow,
                        itemPadding: current.itemPadding,
                        getVersion: () => {
                           return _private.calcItemColumnVersion(self, current.getVersion(), current.columnIndex, current.index);
                        },
                        _preferVersionAPI: true,
                        gridCellStyles: '',
                        tableCellStyles: ''
                    };
                currentColumn.classList = _private.getItemColumnCellClasses(current, self._options.theme);
                currentColumn.getColspanedPaddingClassList = () => {
                    currentColumn.classList.padding.right = `controls-Grid__cell_spacingLastCol_${current.itemPadding.right}_theme-${self._options.theme}`;
                    return currentColumn.classList.padding;
                };
                currentColumn.column = current.columns[current.columnIndex];
                currentColumn.template = currentColumn.column.template ? currentColumn.column.template : self._columnTemplate;
                if (self._isSupportLadder(self._options.ladderProperties)) {
                    currentColumn.ladder = self._ladder.ladder[current.index];
                    currentColumn.ladderWrapper = LadderWrapper;
                }
                if (current.item.get) {
                    currentColumn.column.needSearchHighlight = !!_private.isNeedToHighlight(current.item, currentColumn.column.displayProperty, current.searchValue);
                    currentColumn.searchValue = current.searchValue;
                }
                if (stickyColumn) {
                    currentColumn.hiddenForLadder = currentColumn.columnIndex === (current.multiSelectVisibility !== 'hidden' ? stickyColumn.index + 1 : stickyColumn.index);
                }

                if (current.columnScroll && !GridLayoutUtil.isFullGridSupport()) {
                    currentColumn.tableCellStyles = _private.getTableCellStyles(currentColumn);
                }

                if (current.columnScroll) {
                    currentColumn.itemActionsGridCellStyles =
                        ' position: sticky; overflow: visible; display: inline-block; right: 0;';
                }

                return currentColumn;
            };
            return current;
        },

        getCurrent: function() {
            var dispItem = this._model._display.at(this._model._curIndex);
            return this.getItemDataByItem(dispItem);
        },

        toggleGroup(groupId: Grouping.TGroupId, state: boolean): void {
            this._model.toggleGroup(groupId, state);
        },

        getNext: function() {
            return this._model.getNext();
        },

        isLast: function() {
            return this._model.isLast();
        },

        setStickyColumn: function(stickyColumn) {
            this._options.stickyColumn = stickyColumn;
            this._ladder = _private.prepareLadder(this);
            this._nextModelVersion();
        },

        setColumnScroll(columnScroll: boolean): void {
            this._options.columnScroll = columnScroll;
            this._nextModelVersion();
        },

        setLadderProperties: function(ladderProperties) {
            if (!isEqual(this._options.ladderProperties, ladderProperties)) {
                this._options.ladderProperties = ladderProperties;
                this._ladder = _private.prepareLadder(this);
                this._nextModelVersion();
            }
        },

        updateIndexes: function(startIndex, stopIndex) {
            this._model.updateIndexes(startIndex, stopIndex);
        },

        setItems: function(items) {
            this._model.setItems(items);
            this._updateLastItemKey();
        },

        setItemTemplateProperty: function(itemTemplateProperty) {
            this._model.setItemTemplateProperty(itemTemplateProperty);
        },

        setBaseItemTemplateResolver(baseItemTemplateResolver: () => TemplateFunction): void {
            this._baseItemTemplateResolver = baseItemTemplateResolver;
            this.resetCachedItemData();
        },

        getItems: function() {
            return this._model.getItems();
        },

        setActiveItem: function(itemData) {
            this._model.setActiveItem(itemData);
        },

        mergeItems: function(items) {
            this._model.mergeItems(items);
        },

        appendItems: function(items) {
            this._model.appendItems(items);
        },

        acceptChanges(): void {
            this._model.acceptChanges();
        },

        prependItems: function(items) {
            this._model.prependItems(items);
        },

        setItemActions: function(item, actions) {
            return this._model.setItemActions(item, actions);
        },

        nextModelVersion: function() {
            this._model.nextModelVersion.apply(this._model, arguments);
        },

        _setEditingItemData: function (itemData) {
            this._model._setEditingItemData(itemData);

            /*
            * https://online.sbis.ru/opendoc.html?guid=8a8dcd32-104c-4564-8748-2748af03b4f1
            * Нужно пересчитать и перерисовать записи после начала и завершения редактирования.
            * При старте редактирования индексы пересчитываются, и, в случе если началось добавление, индексы записей после добавляемой увеличиваются на 1.
            * При отмене добавления индексы нужно вернуть в изначальное состояние.
            * */
            // TODO: Разобраться, нужно ли. https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
            if (this._options.columnScroll) {
                this._nextModelVersion();
            }
        },

        getEditingItemData(): object | null {
            return this._model.getEditingItemData();
        },

        setItemActionVisibilityCallback: function(callback) {
            this._model.setItemActionVisibilityCallback(callback);
        },

        _calcItemVersion(item, key, index): string {
            let version: string = this._model._calcItemVersion(item, key) + (item.getId ? item.getId() : '');

            if (this._lastItemKey === key) {
                version = 'LAST_ITEM_' + version;
            }

            version += _private.calcLadderVersion(this._ladder, index);

            return version;
        },

        _prepareDisplayItemForAdd: function(item) {
            return this._model._prepareDisplayItemForAdd(item);
        },

        getCurrentIndex: function() {
            return this._model.getCurrentIndex();
        },

        getItemActions: function(item) {
            return this._model.getItemActions(item);
        },

        getIndexBySourceItem: function(item) {
            return this._model.getIndexBySourceItem(item);
        },

        at: function(index) {
            return this._model.at(index);
        },

        getCount: function() {
            return this._model.getCount();
        },

        setSwipeItem: function(itemData) {
            this._model.setSwipeItem(itemData);
        },

        setRightSwipedItem: function(itemData) {
            this._model.setRightSwipedItem(itemData);
        },

        setShowRowSeparator: function(showRowSeparator) {
            this._options.showRowSeparator = showRowSeparator;
            this._nextModelVersion();
        },

        setRowSeparatorVisibility: function(rowSeparatorVisibility) {
            this._options.rowSeparatorVisibility = rowSeparatorVisibility;
            this._nextModelVersion();
        },

        setStickyColumnsCount: function(stickyColumnsCount) {
            this._options.stickyColumnsCount = stickyColumnsCount;
            this._nextModelVersion();
        },

        updateSelection: function(selectedKeys) {
            this._model.updateSelection(selectedKeys);
        },

        setDragTargetPosition: function(position) {
            this._model.setDragTargetPosition(position);
        },

        getDragTargetPosition: function() {
            return this._model.getDragTargetPosition();
        },

        setDragEntity: function(entity) {
            this._model.setDragEntity(entity);
        },

        getDragEntity: function() {
            return this._model.getDragEntity();
        },

        setDragItemData: function(itemData) {
            this._model.setDragItemData(itemData);
            if (_private.hasStickyColumn(this)) {
                this._setHeader(this._options.header);
                this._prepareResultsColumns(this._columns, this._options.multiSelectVisibility !== 'hidden');
            }
        },

        getDragItemData: function() {
            return this._model.getDragItemData();
        },

        calculateDragTargetPosition: function(targetData, position) {
            return this._model.calculateDragTargetPosition(targetData, position);
        },

        getActiveItem: function() {
            return this._model.getActiveItem();
        },

        getChildren: function() {
            return this._model.getChildren.apply(this._model, arguments);
        },

        getStartIndex(): number {
            return this._model.getStartIndex();
        },

        getStopIndex(): number {
            return this._model.getStopIndex();
        },

        setHoveredItem: function (item) {
            this._model.setHoveredItem(item);
        },

        getHoveredItem: function () {
            return this._model.getHoveredItem();
        },

        getDisplay: function () {
            return this._model.getDisplay();
        },

        isFullGridSupport(): boolean {
            return GridLayoutUtil.isFullGridSupport();
        },

        isNoGridSupport(): boolean {
            return !GridLayoutUtil.isFullGridSupport();
        },

        getFooterStyles(): string {
            if (GridLayoutUtil.isFullGridSupport()) {
                const offsetForMultiSelect: number = +(this.getMultiSelectVisibility() !== 'hidden');
                const offsetForStickyColumn: number = +(_private.hasStickyColumn(this));

                return GridLayoutUtil.getColumnStyles({
                    columnStart: 0,
                    columnSpan: this._columns.length + offsetForMultiSelect + offsetForStickyColumn
                });
            }
            return '';
        },

        getEmptyTemplateStyles(): string {
            if (GridLayoutUtil.isFullGridSupport()) {
                const hasColumnScroll: boolean = !!this._options.columnScroll;
                // активирована колонка для множественного выбора?
                const offsetForMultiSelect: number = +(this.getMultiSelectVisibility() !== 'hidden');
                // к колонкам была добавлена "прилипающая" колонка?
                const offsetForStickyColumn: number = +(_private.hasStickyColumn(this));
                // к колонкам была добавлена колонка "Действий"?
                const offsetForActionCell: number = +(this._shouldAddActionsCell());
                // В случае, если у нас приходит после поиска пустой массив колонок,
                // пытаемся установить значение по длине массива заголовков, а если и он пуст,
                // то необходимо установить columnsCount в 1, иначе весь дальнейший расчёт
                // производится некорректно
                const columnsCount = this._columns?.length || this._header?.length || 1;
                const result = {
                    columnStart: 0,
                    columnSpan: columnsCount + offsetForActionCell + offsetForStickyColumn
                };
                if (!hasColumnScroll) {
                    result.columnStart += offsetForMultiSelect;
                } else {
                    result.columnSpan += offsetForMultiSelect;
            }
                return GridLayoutUtil.getColumnStyles(result);
            }
            return '';
        },

        getBottomPaddingStyles(): string {
            if (GridLayoutUtil.isFullGridSupport()) {
                const rowIndex = this._getRowIndexHelper().getBottomPaddingRowIndex();
                return GridLayoutUtil.getCellStyles({
                    rowStart: rowIndex,
                    columnStart: this.getMultiSelectVisibility() === 'hidden' ? 0 : 1,
                    columnSpan: this._columns.length
                });
            }
            return '';
        },

        _getItemGroup: function(item): boolean {
            const groupingKeyCallback = this._options.groupingKeyCallback;
            if (groupingKeyCallback) {
                return groupingKeyCallback(item);
            }
            const groupProperty = this._options.groupProperty;
            if (groupProperty) {
                return item.get(groupProperty);
            }
            return null;
        },

        markItemReloaded: function(key) {
            this._model.markItemReloaded(key);
        },

        clearReloadedMarks: function() {
            this._model.clearReloadedMarks();
        },

        destroy: function() {
            this._model.unsubscribe('onListChange', this._onListChangeFn);
            this._model.unsubscribe('onMarkedKeyChanged', this._onMarkedKeyChangedFn);
            this._model.unsubscribe('onGroupsExpandChange', this._onGroupsExpandChangeFn);
            this._model.unsubscribe('onCollectionChange', this._onCollectionChangeFn);
            this._model.destroy();
            GridViewModel.superclass.destroy.apply(this, arguments);
        },

        getColspanStylesFor(colspanFor: GridColspanableElements, params: IGetColspanStylesForParams): string {
            const multiSelectOffset = this._options.multiSelectVisibility !== 'hidden' ? 1 : 0;
            if (params.columnIndex !== multiSelectOffset) {
                return '';
            }
            const columnCfg = {
                columnStart: multiSelectOffset,
                columnSpan: 1,
                rowStart: 1
            };

            if (colspanFor === 'headerBreadcrumbs') {
                if (params.maxEndRow > 2) {
                    // -1, потому что раньше сюда передавался индекс последне колонки.
                    return GridLayoutUtil.getCellStyles({...columnCfg, rowSpan: params.maxEndRow - 1});
                }
                return GridLayoutUtil.getColumnStyles(columnCfg);
            } else {
                columnCfg.columnSpan = params.columnsLength;
                if (this.shouldAddStickyLadderCell()) {
                    columnCfg.columnSpan += 1;
                }
                return GridLayoutUtil.getColumnStyles(columnCfg);
            }
        },

        // region Table Layout

        getColspanFor(gridElementName: GridColspanableElements): number {
            switch (gridElementName) {
                case 'headerBreadcrumbs':
                    return this._options.multiSelectVisibility !== 'hidden' ? 2 : 1;
                case 'bottomPadding':
                case 'emptyTemplateAndColumnScroll':
                case 'footer':
                    return this._columns.length + (this._options.multiSelectVisibility !== 'hidden' ? 1 : 0);
                case 'customResults':
                case 'emptyTemplate':
                case 'editingRow':
                case 'colspanedRow':
                    return this._columns.length;
                case 'fixedColumnOfColumnScroll':
                    return this._options.stickyColumnsCount || 1;
                case 'scrollableColumnOfColumnScroll':
                    return this._columns.length - (this._options.stickyColumnsCount || 1);
                default:
                    return 1;
            }
        },

        isFixedLayout(): boolean {
            return this._options.columnScroll !== true;
        },

        _prepareWidthForTableColumn(column: IGridColumn): string {
            let resultWidth;

            if (column.compatibleWidth) {
                resultWidth = column.compatibleWidth;
            } else if (!column.width) {
                resultWidth = 'auto';
            } else {
                if (
                    column.width.match(GridLayoutUtil.RegExps.pxValue) ||
                    column.width.match(GridLayoutUtil.RegExps.percentValue)
                ) {
                    resultWidth = column.width;
                } else {
                    resultWidth = 'auto';
                }
            }
            return resultWidth;
        },

        // region Colgroup columns

        _prepareColgroupColumns(columns: IGridColumn[], hasMultiSelect: boolean): void {

            const colgroupColumns: IColgroupColumn[] = [];

            columns.forEach((column, index) => {
                colgroupColumns.push({
                    classes: 'controls-Grid__colgroup-column',
                    style: `width: ${this._prepareWidthForTableColumn(column)};`,
                    index: index + (hasMultiSelect ? 1 : 0)
                });
            });

            if (hasMultiSelect) {
                colgroupColumns.unshift({
                    classes: 'controls-Grid__colgroup-column controls-Grid__colgroup-columnMultiSelect' + `_theme-${this._options.theme}`,
                    // Ширина колонки чекбоксов задается через CSS класс
                    style: '',
                    index: 0
                });
            }

            this._colgroupColumns = colgroupColumns;
        },

        getCurrentColgroupColumn(): IColgroupColumn {
            return this._colgroupColumns[this._curColgroupColumnIndex];
        },

        resetColgroupColumns(): void {
            this._curColgroupColumnIndex = 0;
        },

        isEndColgroupColumn(): boolean {
            return this._curColgroupColumnIndex < this._colgroupColumns.length;
        },

        goToNextColgroupColumn(): void {
            this._curColgroupColumnIndex++;
        }

        // endregion Colgroup columns

        // endregion Table Layout

    });

GridViewModel._private = _private;

export = GridViewModel;
