import {TemplateFunction} from 'UI/Base';
import {BaseViewModel, ItemsUtil, ListViewModel, createClassListCollection} from 'Controls/list';
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
import { Model } from 'Types/entity';
import {
    IEditingConfig,
    ISwipeConfig,
    CollectionItem
} from 'Controls/display';
import {Logger} from 'UI/Utils';
import {IItemActionsTemplateConfig} from 'Controls/itemActions';
import * as Grouping from 'Controls/_list/Controllers/Grouping';
import {JS_SELECTORS as COLUMN_SCROLL_JS_SELECTORS} from './resources/ColumnScroll';
import {JS_SELECTORS as DRAG_SCROLL_JS_SELECTORS} from './resources/DragScroll';
import { shouldAddActionsCell } from 'Controls/_grid/utils/GridColumnScrollUtil';
import {IHeaderCell} from './interface/IHeaderCell';
import { IDragPosition, GridLadderUtil } from 'Controls/display';
import {IPreparedColumn, prepareColumns} from 'Controls/Utils/GridColumnsColspanUtil';

const FIXED_HEADER_ZINDEX = 4;
const STICKY_HEADER_ZINDEX = 3;

interface IGridSeparatorOptions {
    rowSeparatorSize?: null | 's' | 'l';
    columnSeparatorSize?: null | 's';
}

// TODO: Удалить по задаче https://online.sbis.ru/opendoc.html?guid=2c5630f6-814a-4284-b3fb-cc7b32a0e245.
interface IGridSeparatorOptionsDeprecated {
    rowSeparatorVisibility?: 'visible' | 'hidden' | boolean;
}

interface IGridColumn {
    displayProperty?: string;
    template?: string | TemplateFunction;
    width?: string;
    compatibleWidth?: string;
}

interface IGridItemData extends Partial<IGridSeparatorOptions> {
    hasMultiSelect: boolean;
    hasMultiSelectColumn: boolean;
    columns: any[];
    columnIndex: number;
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

interface IHeaderModel {
    isStickyHeader: Function;
    getCurrentHeaderColumn: Function;
    getMultiSelectVisibility: Function;
    isMultiHeader: Function;
    resetHeaderRows: Function;
    isEndHeaderRow: Function;
    goToNextHeaderRow: Function;
    getCurrentHeaderRow: Function;
    getVersion: Function;
    nextVersion: Function;
}

var
    _private = {
        calcItemColumnVersion: function(self, itemVersion, columnIndex, index) {
            const hasMultiSelectColumn = self._hasMultiSelectColumn();
            let version = `${itemVersion}_${self._columnsVersion}_${hasMultiSelectColumn ? columnIndex - 1 : columnIndex}`;
            if (hasMultiSelectColumn && columnIndex === 1) {
                version += '_MS';
            }

            version += _private.calcLadderVersion(self._ladder, index);

            return version;
        },

        // TODO нужна проверка, что в таблице добавлена actionsColumn: this._shouldAddActionsCell()
        isActionsColumn(itemData, currentColumn, colspan) {
            return (
                itemData.getLastColumnIndex() === currentColumn.columnIndex ||
                (
                    colspan &&
                    currentColumn.columnIndex === (itemData.hasMultiSelectColumn ? 1 : 0)
                )
            );
        },
        isDrawActions: function(itemData, currentColumn, colspan) {
            return (itemData.hasVisibleActions() || itemData.isEditing()) && _private.isActionsColumn(itemData, currentColumn, colspan);
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
            const isRootItemsSeparator = params.dispItem && params.dispItem['[Controls/_display/SearchSeparator]'];

            if (columns[columnIndex].isActionCell) {
                return classLists;
            }
            const arrayLengthOffset = params.hasActionCell ? 2 : 1;
            const getCellPadding = (side) => cellPadding && cellPadding[side] ? `_${cellPadding[side].toLowerCase()}` : '';

            // Колонки
            if (params.hasMultiSelectColumn ? params.columnIndex > 1 : params.columnIndex > 0) {
                classLists.left += ` controls-Grid__cell_spacingLeft${getCellPadding('left')}_theme-${theme}`;
            }
            if (params.columnIndex < params.columns.length - arrayLengthOffset) {
                classLists.right += ` controls-Grid__cell_spacingRight${getCellPadding('right')}_theme-${theme}`;
            }

            // Отступ для первой колонки.
            if (params.columnIndex === 0) {
                // Если режим мультиселект, то отступ обеспечивается чекбоксом.
                if (!params.hasMultiSelectColumn) {
                    classLists.left += ` controls-Grid__cell_spacingFirstCol_${params.itemPadding.left}_theme-${theme}`;
                }
            }

            // TODO: удалить isBreadcrumbs после https://online.sbis.ru/opendoc.html?guid=b3647c3e-ac44-489c-958f-12fe6118892f
            if (params.isBreadCrumbs) {
                classLists.left += ` controls-Grid__cell_spacingFirstCol_null_theme-${theme}`;
            }

            // Отступ для последней колонки
            if (params.columnIndex === params.columns.length - arrayLengthOffset) {
                classLists.right += ` controls-Grid__cell_spacingLastCol_${params.itemPadding.right}_theme-${theme}`;
            }

            // У разделителя записей в поиске не должно быть стандартных отступов
            if (!isRootItemsSeparator && !params.isHeader && !params.isResult) {
                classLists.top += ` controls-Grid__row-cell_rowSpacingTop_${params.itemPadding.top}_theme-${theme}`;
                classLists.bottom += ` controls-Grid__row-cell_rowSpacingBottom_${params.itemPadding.bottom}_theme-${theme}`;
            }

            return classLists;
        },

        getHeaderCellPadding(side: 'left' | 'right', params: {
            isMultiHeader: boolean,
            columns: unknown[],
            headerColumns: unknown[],
            columnIndex: number
        }): string {
            let result = '';
            if (params.isMultiHeader) {
                if (side === 'left') {

                    // startColumn - индекс в спецификации CSS Grid, начинается с 1
                    let headerCellIndex = params.headerColumns[params.columnIndex].startColumn - 1;
                    result = params.columns && params.columns[headerCellIndex].cellPadding && params.columns[headerCellIndex].cellPadding.left
                } else {

                    // startColumn - индекс в спецификации CSS Grid, начинается с 1. Уменьшаем еще на 1, т.к. индекс конца колонки фактически -
                    // начальный индекс следующей. Границы нужно брать с колонки, которая является последней под текущей ячейкой шапки.
                    // Шапка    0 - 2 3  |  Первая ячейка шапки определена как {..., startColumn: 1, endColumn: 4}.
                    // Колонки  0 1 2 3  |  Правый отступ для нее берется с колоки с индексом 2.
                    let headerCellIndex = params.headerColumns[params.columnIndex].endColumn - 2;
                    result = params.columns && params.columns[headerCellIndex].cellPadding && params.columns[headerCellIndex].cellPadding.right
                }
            } else {
                const { cellPadding } = (params.columns && params.columns[params.columnIndex]) || {};
                result = (cellPadding && cellPadding[side]) || '';
            }
            return !!result ? `_${result.toLowerCase()}` : '';
        },

        getPaddingHeaderCellClasses: function(params, theme) {
            let preparedClasses = '';
            const { hasMultiSelectColumn, columnIndex, headerColumns,
                rowIndex, itemPadding, isBreadCrumbs, style, cell: { endColumn }, isMultiHeader } = params;
            if (params.cell.isActionCell) {
                return preparedClasses;
            }

            const actionCellOffset = params.hasActionCell ? 1 : 0;
            const maxEndColumn = params.maxEndColumn - actionCellOffset;
            const columnsLengthExcludedActionCell = headerColumns.length - actionCellOffset;

            const getCellPadding = (side) => _private.getHeaderCellPadding(side, params);
            if (rowIndex === 0) {
                if (hasMultiSelectColumn ? columnIndex > 1 : columnIndex > 0) {
                    preparedClasses += ` controls-Grid__cell_spacingLeft${getCellPadding('left')}_theme-${theme}`;
                }
            } else {
                preparedClasses += ` controls-Grid__cell_spacingLeft${getCellPadding('left')}_theme-${theme}`;
            }

            if (columnIndex < (columnsLengthExcludedActionCell - 1) || (maxEndColumn && endColumn < maxEndColumn)) {
                preparedClasses += ` controls-Grid__cell_spacingRight${getCellPadding('right')}_theme-${theme}`;
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
            if (columnIndex === 0 && !hasMultiSelectColumn && rowIndex === 0 && !isBreadCrumbs) {
                preparedClasses += ' controls-Grid__cell_spacingFirstCol_' + (itemPadding.left || 'default').toLowerCase() + `_theme-${theme}`;
            }

            // TODO: удалить isBreadcrumbs после https://online.sbis.ru/opendoc.html?guid=b3647c3e-ac44-489c-958f-12fe6118892f
            if (isBreadCrumbs) {
                preparedClasses += ' controls-Grid__cell_spacingFirstCol_null' + `_theme-${theme}`;
                if (hasMultiSelectColumn && GridLayoutUtil.isFullGridSupport()) {
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

        isFixedCell: function(params) {
            const { hasMultiSelectColumn, stickyColumnsCount, columnIndex, rowIndex, isHeader, isMultiHeader, endColumn } = params;
            const
                columnOffset = hasMultiSelectColumn ? 1 : 0;

            if (isHeader && typeof endColumn !== 'undefined') {
                // endColumn - конфиг GridLayout, он всегда больше на 1.
                return endColumn - 1 <= stickyColumnsCount;
            }
            const isCellIndexLessTheFixedIndex = columnIndex < (stickyColumnsCount + columnOffset);
            if (isMultiHeader !== undefined) {
                return isCellIndexLessTheFixedIndex && rowIndex === 0;
            }
            return isCellIndexLessTheFixedIndex;
        },

        // Правки здесь выполены по задаче https://online.sbis.ru/doc/a4b0487a-4bc4-47e4-afce-3340833b1232
        // В этом методе ОБЯЗАТЕЛЬНО нужна проверка на isColumnScrollVisible, иначе в случаях, подобно ошибке
        // https://online.sbis.ru/opendoc.html?guid=2525593a-46ac-4223-9124-e507659cf85e ломается вёрстка
        // в реестрах, в которых использовался тот факт, что в таблицах у всех столбцов одинаковые z-index.
        // Для решения же ошибки https://online.sbis.ru/opendoc.html?guid=42614e54-3ed7-41f4-9d57-a6971df66f9c,
        // сделаем перерисовку столбцов после установки isColumnScrollVisible
        getHeaderZIndex(params): number {
            if (params.isColumnScrollVisible) {
                return _private.isFixedCell(params) ? FIXED_HEADER_ZINDEX : STICKY_HEADER_ZINDEX;
            } else {
                // Пока в таблице нет горизонтального скролла, шапка ен может быть проскролена по горизонтали.
                return FIXED_HEADER_ZINDEX;
            }
        },

        getColumnScrollCellClasses(params, theme): string {
           return _private.isFixedCell(params) ? ` controls-Grid__cell_fixed controls-Grid__cell_fixed_theme-${theme}` : '';
        },

        /**
         * Горизонтальный скролл строится на афтермаунте списка. При создании горизонтальный скролл считает для себя все,
         * что ему надо. В том числе и ширины фиксированной и скроллированой областей.
         * А их он считает по селекторам COLUMN_SCROLL_JS_SELECTORS.FIXED_ELEMENT
         * @param params
         * @param theme
         */
        getColumnScrollCalculationCellClasses(params, theme): string {
            return _private.isFixedCell(params) ? ` ${COLUMN_SCROLL_JS_SELECTORS.FIXED_ELEMENT}` : ` ${COLUMN_SCROLL_JS_SELECTORS.SCROLLABLE_ELEMENT}`;
        },

        getClassesLadderHeading(itemData, theme): String {
            let result = 'controls-Grid__row-ladder-cell__content controls-Grid__row-ladder-cell__content_';
            result += itemData.itemPadding && itemData.itemPadding.top ? itemData.itemPadding.top : 'default';
            result += '_theme-' + theme;
            return result;
        },

        getItemColumnCellClasses(self, current, theme, backgroundColorStyle) {
            const isRootItemsSeparator = current.dispItem && current.dispItem['[Controls/_display/SearchSeparator]'];
            const checkBoxCell = current.hasMultiSelectColumn && current.columnIndex === 0;
            const classLists = createClassListCollection('base', 'padding', 'columnScroll', 'columnContent');
            let style = !current.style ? 'default' : current.style;
            const backgroundStyle = current.backgroundStyle || current.style || 'default';
            const isFullGridSupport = GridLayoutUtil.isFullGridSupport();

            // Стиль колонки
            if (!isRootItemsSeparator) {
                if (current.itemPadding.top === 'null' && current.itemPadding.bottom === 'null') {
                    classLists.base += `controls-Grid__row-cell_small_min_height-theme-${theme} `;
                } else {
                    classLists.base += `controls-Grid__row-cell_default_min_height-theme-${theme} `;
                }
                classLists.base += `controls-Grid__row-cell controls-Grid__cell_${style} controls-Grid__row-cell_${style}_theme-${theme}`;
                _private.prepareSeparatorClasses(current, classLists, theme);

                if (backgroundColorStyle) {
                    classLists.base += _private.getBackgroundStyle({backgroundStyle, theme, backgroundColorStyle}, true);
                }
            }

            if (self._options.columnScroll) {
                classLists.columnScroll += _private.getColumnScrollCalculationCellClasses(current, theme);
                if (self._options.columnScrollVisibility) {
                    classLists.columnScroll += _private.getColumnScrollCellClasses(current, theme);
                }
            } else if (!checkBoxCell) {
                classLists.base += ' controls-Grid__cell_fit';
            }

            if (current.isEditing()) {
                const editingBackgroundStyle = current.editingBackgroundStyle || 'default';
                classLists.base += ` controls-Grid__row-cell-editing_theme-${theme}`;
                classLists.base += ` controls-Grid__row-cell-background-editing_${editingBackgroundStyle}_theme-${theme}`;
            } else {
                let backgroundHoverStyle = current.hoverBackgroundStyle || 'default';
                classLists.base += ` controls-Grid__row-cell-background-hover-${backgroundHoverStyle}_theme-${theme}`;
            }

            if (current.columnScroll && !current.isEditing()) {
                classLists.columnScroll += _private.getBackgroundStyle({backgroundStyle, theme}, true);
            }

            // Если включен множественный выбор и рендерится первая колонка с чекбоксом
            if (checkBoxCell) {
                classLists.base += ` controls-Grid__row-cell-checkbox_theme-${theme}`;
                classLists.padding = createClassListCollection('top', 'bottom');
                classLists.padding.top = `controls-OldGrid__row-checkboxCell_rowSpacingTop_${current.itemPadding.top}_theme-${theme}`;
                classLists.padding.bottom =  `controls-Grid__row-cell_rowSpacingBottom_${current.itemPadding.bottom}_theme-${theme}`;
            } else {
                classLists.padding = _private.getPaddingCellClasses(current, theme);
            }

            if (current.dispItem.isMarked() && current.markerVisibility !== 'hidden') {
                style = current.style || 'default';
                classLists.marked = `controls-Grid__row-cell_selected controls-Grid__row-cell_selected-${style}_theme-${theme}`;

                if (current.columnIndex === 0) {
                    classLists.marked += ` controls-Grid__row-cell_selected__first-${style}_theme-${theme}`;
                }
                if (current.columnIndex === current.getLastColumnIndex()) {
                    classLists.marked += ` controls-Grid__row-cell_selected__last controls-Grid__row-cell_selected__last-${style}_theme-${theme}`;
                }
            } else if (current.columnIndex === current.getLastColumnIndex()) {
                classLists.base += ` controls-Grid__row-cell__last controls-Grid__row-cell__last-${style}_theme-${theme}`;
            }

            if (!GridLayoutUtil.isFullGridSupport() && !(current.columns.length === (current.hasMultiSelectColumn ? 2 : 1)) && self._options.fixIEAutoHeight) {
                classLists.base += ' controls-Grid__row-cell__autoHeight';
            }
            return classLists;
        },

        getRelativeCellWrapperClasses(itemData, colspan, fixVerticalAlignment): string {
            let classes = 'controls-Grid__table__relative-cell-wrapper ';
            const _rowSeparatorSize = (itemData.rowSeparatorSize && itemData.rowSeparatorSize.toLowerCase()) === 'l' ? 'l' : 's';
            classes += `controls-Grid__table__relative-cell-wrapper_rowSeparator-${_rowSeparatorSize}_theme-${itemData.theme} `;

            // Единственная ячейка с данными сама формирует высоту строки и не нужно применять хак для растягивания контента ячеек по высоте ячеек.
            // Подробнее искать по #grid_relativeCell_td.
            if (
                fixVerticalAlignment && (
                    colspan || (
                        itemData.columns.length === (itemData.hasMultiSelectColumn ? 2 : 1)
                    )
                )
            ) {
                classes += 'controls-Grid__table__relative-cell-wrapper_singleCell ';
            }

            return classes.trim();
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
            return itemValue && searchValue;
        },
        getItemsLadderVersion(ladder) {
            let ladderVersion = '';

            Object.keys(ladder).forEach((ladderProperty) => {
                ladderVersion += (ladder[ladderProperty].ladderLength || 0) + '_';
            });

            return ladderVersion;
        },
        calcLadderVersion(ladder = {}, index): string {
            let
                version = '',
                simpleLadder = ladder.ladder && ladder.ladder[index],
                stickyLadder = ladder.stickyLadder && ladder.stickyLadder[index];

            if (simpleLadder) {
                version += 'LP_';
            }
            if (stickyLadder) {
                version += 'SP_' + _private.getItemsLadderVersion(stickyLadder);
            }

            return version;
        },

        /**
         * Производит пересчёт групп объединяемых колонок для заголовков (разделителей) записей
         * @param itemData информация о записи
         * @param leftSideItemsCount число колонок в группе (или номер последней колонки)
         * @param isActionsCellExists выводится ли в строке дополнительная ячейка под операции над записью
         * @private
         */
        getColumnAlignGroupStyles(itemData: IGridItemData, leftSideItemsCount: number = 0, isActionsCellExists: boolean, stickyLadderCellsCount: number = 0): {
            left: string
            right: string
        } {
            const additionalTerm = (itemData.hasMultiSelectColumn ? 1 : 0);
            const result = {left: '', right: ''};
            const start = 1;
            const end = itemData.columns.length + 1 + (isActionsCellExists ? 1 : 0) + stickyLadderCellsCount;

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
            const start = (self._hasMultiSelectColumn() ? 1 : 0) + 1;
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
            if (current.hasMultiSelectColumn) {
                left += `withCheckboxes_theme-${theme}`;
            } else {
                left += `${current.itemPadding.left}_theme-${theme}`;
            }
            return { left, right };
        },

        prepareLadder(self) {
            if (!self.isSupportLadder(self._options.ladderProperties)) {
                return {};
            }

            // Если при перестройке "лесенки" не сбрасывать кеш, то после добавления элементов по месту при скролле
            // реестра ломается вёрстка, т.к. в span подставляются старые данные.
            // см. https://online.sbis.ru/opendoc.html?guid=4fe3dd6f-c76b-45fa-b676-5914a896c7c9
            // Предыдущая реализацию согласно док-там:
            // см. https://online.sbis.ru/opendoc.html?guid=d3a0a646-9a22-4a61-be98-7c8570c7a295
            // см. https://online.sbis.ru/opendoc.html?guid=458ac3b7-b899-4fff-8fcf-ae8168b67b80
            self.resetCachedItemData();

            const hasVirtualScroll = !!self._options.virtualScrolling || Boolean(self._options.virtualScrollConfig);
            const displayStopIndex = self.getDisplay() ? self.getDisplay().getCount() : 0;
            const startIndex = self.getStartIndex();
            const stopIndex = hasVirtualScroll ? self.getStopIndex() : displayStopIndex;
            const newLadder: any = GridLadderUtil.prepareLadder({
                ladderProperties: self._options.ladderProperties,
                startIndex,
                stopIndex,
                display: self.getDisplay(),
                columns: self._columns,
                stickyColumn: self._options.stickyColumn
            });
            return newLadder;
        },
        getTableCellStyles(currentColumn): string {
            let styles = '';
            const isCheckbox = currentColumn.hasMultiSelectColumn && currentColumn.columnIndex === 0;
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
         * @param options Опции IList | объект, содержащий theme, style, backgroundStyle, backgroundColorStyle
         * @param addSpace Добавлять ли пробел перед выводимой строкой
         */
        getBackgroundStyle(options: {theme: string, style?: string, backgroundStyle?: string, backgroundColorStyle?: string}, addSpace?: boolean): string {
            if (options.backgroundColorStyle) {
                return `${addSpace ? ' ' : ''}controls-Grid__row-cell_background_${options.backgroundColorStyle}_theme-${options.theme}`
            }

            return `${addSpace ? ' ' : ''}controls-background-${_private.getStylePrefix(options)}_theme-${options.theme}`;
        },

        getStickyColumn(self): GridLadderUtil.IStickyColumn {
            return GridLadderUtil.getStickyColumn({
                stickyColumn: self._options.stickyColumn,
                columns: self._columns
            });
        },

        /**
         * Проверяет, присутствует ли "прилипающая" колонка
         * @param self
         */
        hasStickyColumn(self): boolean {
            return !!_private.getStickyColumn(self);
        },

        // TODO: Исправить по задаче https://online.sbis.ru/opendoc.html?guid=2c5630f6-814a-4284-b3fb-cc7b32a0e245.
        // Оставить просто
        // options.rowSeparatorSize && options.rowSeparatorSize.toLowerCase() || null,
        // options.columnSeparatorSize && options.columnSeparatorSize.toLowerCase() || null
        getSeparatorSizes(options: Partial<IGridSeparatorOptions & IGridSeparatorOptionsDeprecated>): {
            row: IGridSeparatorOptions['rowSeparatorSize'],
            column: IGridSeparatorOptions['columnSeparatorSize']
        } {
            let row: IGridSeparatorOptions['rowSeparatorSize'];

            // Поддерживаем старое поведение. Чтобы не отвалилось, делаю его приоритетным. Кидаю варнинг.
            // Условие сложное: если Visibility задано, надо брать size(только строки, потому что могли смешать
            // старое и новое), если нет, то устанавливать null.
            // Все условие удаляется в 20.5000
            if (typeof options.rowSeparatorVisibility !== 'undefined') {
                if (options.rowSeparatorVisibility === 'visible' || options.rowSeparatorVisibility === true) {
                    if (typeof options.rowSeparatorSize === 'string') {
                        row = options.rowSeparatorSize.toLowerCase();
                    } else {
                        // Старое дефолтное значение.
                        row = 's';
                    }
                } else {
                    row = null;
                }
            } else {
                row = options.rowSeparatorSize ? options.rowSeparatorSize.toLowerCase() : options.rowSeparatorSize || null;
            }

            return {
                row,
                column:  options.columnSeparatorSize ? options.columnSeparatorSize.toLowerCase() : options.columnSeparatorSize || null
            };
        },
        getSeparatorForColumn(columns, index, baseColumnSeparatorSize) {
            let columnSeparatorSize;
            const hasInColumn = (c, side) => !!c && !!c.columnSeparatorSize && typeof c.columnSeparatorSize === 'object'
                && c.columnSeparatorSize.hasOwnProperty(side);
            const normalize = (value) => typeof value === 'string' ? value.toLowerCase() : null;
            const currentColumn = columns[index];
            const previousColumn = columns[index - 1];

            if (hasInColumn(currentColumn, 'left')) {
                columnSeparatorSize = normalize(currentColumn.columnSeparatorSize.left);
            } else if (hasInColumn(previousColumn, 'right')) {
                columnSeparatorSize = normalize(previousColumn.columnSeparatorSize.right);
            } else {
                columnSeparatorSize = baseColumnSeparatorSize;
            }
            return columnSeparatorSize;
        },
        prepareSeparatorClasses(current: IGridItemData, classLists, theme): void {

            if (current.rowSeparatorSize === null) {

                // Вспомогательный класс, вешается на ячейку. Через него задаются правильные отступы ячейке
                // обеспечивает отсутствие "скачков" при динамической смене размера границы.
                classLists.base += ` controls-Grid__row-cell_withRowSeparator_size-${current.rowSeparatorSize}`;
                classLists.base += ' controls-Grid__no-rowSeparator';
            } else {
                classLists.base += ` controls-Grid__row-cell_withRowSeparator_size-${current.rowSeparatorSize}_theme-${theme}`;
                classLists.base += ` controls-Grid__rowSeparator_size-${current.rowSeparatorSize}_theme-${theme}`;
            }

            if (current.columnIndex > (current.hasMultiSelectColumn ? 1 : 0)) {
                const columnSeparatorSize = _private.getSeparatorForColumn(current.columns, current.columnIndex, current.columnSeparatorSize);

                if (columnSeparatorSize !== null) {
                    classLists.base += ' controls-Grid__row-cell_withColumnSeparator';
                    classLists.columnContent += ` controls-Grid__columnSeparator_size-${columnSeparatorSize}_theme-${theme}`;
                }
            }
        },
        setRowClassesGettersOnItemData(self, itemData): void {
            const style = itemData.style || 'default';
            const theme = itemData.theme || 'default';

            itemData._staticRowClassses = `controls-Grid__row controls-Grid__row_${style}_theme-${theme} `;

            itemData.getRowClasses = (tmplParams: {
                highlightOnHover?: boolean;
                clickable?: boolean;
                cursor?: 'default' | 'pointer';
            }) => {
                let classes = `${itemData.calcCursorClasses(tmplParams.clickable, tmplParams.cursor).trim()} `;

                if (tmplParams.highlightOnHover !== false && !itemData.isEditing()) {
                    classes += `controls-Grid__row_highlightOnHover_${style}_theme-${theme} `;
                }

                if (itemData.isLastRow) {
                    itemData._staticRowClassses += 'controls-Grid__row_last ';
                }

                return `${itemData._staticRowClassses} ${classes.trim()}`;
            };
        },
        resolveEditArrowVisibility(item, options) {
            let contents = item.getContents();
            if (!options.editArrowVisibilityCallback) {
                return options.showEditArrow;
            }
            if (item['[Controls/_display/BreadcrumbsItem]']) {
                contents = contents[(contents as any).length - 1];
            }
            return options.showEditArrow && options.editArrowVisibilityCallback(contents);
        }
    },

    GridViewModel = BaseViewModel.extend({
        _model: null,
        _columnTemplate: null,

        _columns: [],
        _curColumnIndex: 0,

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
        _resolvers: null,

        _headerModel: null,
        _headerVersion: 0,

        constructor: function(cfg) {
            this._options = cfg;
            GridViewModel.superclass.constructor.apply(this, arguments);

            // Резолверы шаблонов. Передается объект, чтобы всегда иметь актуальные резолверы. Передача по ссылке
            // требуется например для построения таблицы с запущенным редактированием по месту. Редактирование строится
            // до GridView и устанавливает редактируемую запись в которую передаются резолверы. На момент взятия itemData
            // резолверов еще нет, поэтому передаем объект, позже Gridview запишет в него резолверы. С таким подходом
            // порядок маунтов не важен, главное, что все произойдет до маунта.
            // TODO: Проверить, возможно стало неактуальным в 20.7000
            this._resolvers = {};
            this._model = this._createModel(cfg);
            this._onListChangeFn = function(event, changesType, action, newItems, newItemsIndex, removedItems, removedItemsIndex) {
                this._notify('onListChange', changesType, action, newItems, newItemsIndex, removedItems, removedItemsIndex);
                if (changesType === 'collectionChanged' || changesType === 'indexesChanged') {
                    this._ladder = _private.prepareLadder(this);

                    if (action === 'rs') {
                        this._setHeader(this._header);
                    }
                }
                if (changesType !== 'markedKeyChanged' && action !== 'ch') {
                    this._nextHeaderVersion();
                }
                if (this._options.header && action === 'a' && this.getDisplay().getCount() === newItems.length) {
                    if (this.getHeaderModel()) {
                        this._nextHeaderVersion();
                    } else {
                        this._setHeader(this._header);
                    }
                }
                this._nextVersion();
            }.bind(this);
            this._onGroupsExpandChangeFn = function(event, changes) {
                this._notify('onGroupsExpandChange', changes);
            }.bind(this);
            this._onCollectionChangeFn = function(event, action) {
                this._notify.apply(this, ['onCollectionChange'].concat(Array.prototype.slice.call(arguments, 1)));
            }.bind(this);
            this._onAfterCollectionChangeFn = function() {
                this._notify('onAfterCollectionChange');
            }.bind(this);
            // Events will not fired on the PresentationService, which is why setItems will not ladder recalculation.
            // Use callback for fix it. https://online.sbis.ru/opendoc.html?guid=78a1760a-bfcf-4f2c-8b87-7f585ea2707e
            this._model.setUpdateIndexesCallback(this._updateIndexesCallback.bind(this));
            this._model.subscribe('onListChange', this._onListChangeFn);
            this._model.subscribe('onGroupsExpandChange', this._onGroupsExpandChangeFn);
            this._model.subscribe('onCollectionChange', this._onCollectionChangeFn);
            this._model.subscribe('onAfterCollectionChange', this._onAfterCollectionChangeFn);
            const separatorSizes = _private.getSeparatorSizes(this._options);
            this._options.rowSeparatorSize = separatorSizes.row;
            this._options.columnSeparatorSize = separatorSizes.column;
            this._ladder = _private.prepareLadder(this);
            this._setColumns(this._options.columns);
            if (this._options.header && this._options.header.length) {
                this._isMultiHeader = this.isMultiHeader(this._options.header);
            }
            this._setHeader(this._options.header);
        },
        isSupportLadder(ladderProperties: []): boolean {
            return GridLadderUtil.isSupportLadder(ladderProperties);
        },

        setTheme(theme: string): void {
            this._model.setTheme(theme);
            this._options.theme = theme;
        },

        getTheme(): string {
            return this._model.getTheme();
        },

        _updateIndexesCallback(): void {
            this._ladder = _private.prepareLadder(this);
        },

        setKeyProperty(keyProperty: string): void {
            this._model.setKeyProperty(keyProperty);
        },

        getKeyProperty(): string {
            return this._model.getKeyProperty();
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
            // проверка нужна, т.к. падают автотесты в разных реестрах
            // по https://online.sbis.ru/opendoc.html?guid=058c8ec7-598b-413f-a082-59d6d67f0408.
            if (columns) {
                for (let i = 0; i < columns.length; i++) {
                    result.push(this._prepareCrossBrowserColumn(columns[i]));
                }
            } else {
                Logger.warn('You must set "columns" option to make grid work correctly!', this);
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
            if (!this.isDrawHeaderWithEmptyList()) {
                this._headerModel = null;
                return;
            } else {
                this._createHeaderModel();
            }
        },

        _createHeaderModel() {
            this._prepareHeaderColumns(
                this._header,
                this._hasMultiSelectColumn(),
                this._shouldAddActionsCell(),
                this.stickyLadderCellsCount()
            );
            if (this._header && this._header.length) {
                this._headerModel = {
                    isStickyHeader: this.isStickyHeader.bind(this),
                    getCurrentHeaderColumn: this.getCurrentHeaderColumn.bind(this),
                    hasMultiSelectColumn: this._hasMultiSelectColumn.bind(this),
                    isMultiHeader: () => this._isMultiHeader,
                    resetHeaderRows: this.resetHeaderRows.bind(this),
                    isEndHeaderRow: this.isEndHeaderRow.bind(this),
                    goToNextHeaderRow: this.goToNextHeaderRow.bind(this),
                    getCurrentHeaderRow: this.getCurrentHeaderRow.bind(this),
                    getVersion: () => this._headerVersion,
                    nextVersion: () => ++this._headerVersion
                };
            } else {
                this._headerModel = null;
            }
        },

        setHeaderVisibility(newVisibility) {
            this.headerVisibility = newVisibility;
            this.setHeader(this._header, true);
        },

        _nextHeaderVersion(): void {
            const headerModel = this.getHeaderModel();
            if (headerModel) {
                headerModel.nextVersion();
            }
        },

        getHeaderModel(): IHeaderModel {
            if (this.isDrawHeaderWithEmptyList() && !this._headerModel && this._header && this._header.length) {
                this._createHeaderModel();
            }
            return this._headerModel;
        },

        setHeader: function(columns, silent: boolean = false) {
            this._setHeader(columns);
            if (!silent) {
                this._nextModelVersion();
            }
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
        _prepareHeaderColumns: function(columns, hasMultiSelectColumn, actionsCell, stickyLadderCellsCount) {
            if (columns && columns.length) {
                this._isMultiHeader = this.isMultiHeader(columns);
                this._headerRows = getHeaderRowsArray(columns, hasMultiSelectColumn, this._isMultiHeader, actionsCell, stickyLadderCellsCount);
                const headerMaxEndCellData = getHeaderMaxEndCellData(this._headerRows);
                this._maxEndRow = headerMaxEndCellData.maxRow;
                this._maxEndColumn = headerMaxEndCellData.maxColumn;
            } else if (hasMultiSelectColumn) {
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
                hasColumns: !!this._columns.length,
                itemActionsPosition: this._options.itemActionsPosition
            });
        },
        /**
         * Проверка необходимости добавлять ячейку для лесенки
         */
        stickyLadderCellsCount(): number {
            return GridLadderUtil.stickyLadderCellsCount(
                this._columns,
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
            return (this.headerVisibility === 'visible') || this.isGridListNotEmpty();
        },

        isGridListNotEmpty(): boolean {
            return !!(this.getDisplay()?.getCount());
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
            const hasMultiSelectColumn = this._hasMultiSelectColumn();
            const multiSelectOffset = +hasMultiSelectColumn;
            const headerColumn = {
                column: cell,
                key: (rowIndex) + '-' + (columnIndex + (hasMultiSelectColumn ? 0 : 1)),
                index: columnIndex,
                backgroundStyle: cell.ladderCell ? 'transparent' : '',
                shadowVisibility: cell.ladderCell ? 'hidden' : 'visible'
            };
            let cellClasses = `controls-Grid__header-cell controls-Grid__header-cell_theme-${theme}` +
                ` controls-Grid__${this._isMultiHeader ? 'multi-' : ''}header-cell_min-height_theme-${theme}` +
                _private.getBackgroundStyle(this._options, true);

            if (this.isStickyHeader()) {
               headerColumn.zIndex = _private.getHeaderZIndex({
                  columnIndex,
                  rowIndex,
                  endColumn: cell.endColumn,
                  isHeader: true,
                  isMultiHeader: this._isMultiHeader,
                  hasMultiSelectColumn,
                  stickyColumnsCount: this._options.stickyColumnsCount,
                  isColumnScrollVisible: this._options.columnScroll && this._options.columnScrollVisibility,
               });
            }

            if (!isStickySupport()) {
                cellClasses = cellClasses + ' controls-Grid__header-cell_static';
            }

            if (this._options.columnScroll) {
                const params = {
                    columnIndex,
                    rowIndex,
                    endColumn: cell.endColumn,
                    isHeader: true,
                    isMultiHeader: this._isMultiHeader,
                    hasMultiSelectColumn,
                    stickyColumnsCount: this._options.stickyColumnsCount
                };
                cellClasses += _private.getColumnScrollCalculationCellClasses(params, this._options.theme);
                if (this._options.columnScrollVisibility) {
                    cellClasses += _private.getColumnScrollCellClasses(params, this._options.theme);
                }
                // Этот костыль выпилен в 6000 по https://online.sbis.ru/opendoc.html?guid=f5e830c3-7be2-4272-9c38-594c241401cc
                if (this._options.columnScrollVisibility && this.isStickyHeader()) {
                    cellClasses += ' controls-Grid__columnScroll_will-transform';
                }
            }

            // Если включен множественный выбор и рендерится первая колонка с чекбоксом
            if (hasMultiSelectColumn && columnIndex === 0 && !(cell.title || cell.caption)) {
                cellClasses += ' controls-Grid__header-cell-checkbox' + `_theme-${theme}` + ` controls-Grid__header-cell-checkbox_min-width_theme-${theme}`;

                // В grid-layout хлебные крошки нельзя расположить в первой ячейке, если в таблице включен множественный выбор,
                // т.к. крошки растянут колонку, поэтому размещаем крошки во второй колонке и задаем отрицательный margin слева.
                // https://online.sbis.ru/doc/9fcac920-479a-40a3-8b8a-5aabb2886628
                // В table-layout проблемы с растягиванием нет, поэтому используем colspan на крошке.
                if (this._headerRows[0][1] && this._headerRows[0][1].isBreadCrumbs) {
                    if (!GridLayoutUtil.isFullGridSupport()) {
                        headerColumn.isHiddenForBreadcrumbs = true;
                    } else {
                        headerColumn.shadowVisibility = 'hidden';
                    }
                }

            } else {
                cellClasses += _private.getPaddingHeaderCellClasses({
                    style: this._options.style,
                    headerColumns: this._headerRows[rowIndex],
                    columns: this._columns,
                    columnIndex,
                    hasMultiSelectColumn,
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

                if (!this._isMultiHeader && !cell.isActionCell && (columnIndex > multiSelectOffset)) {
                    // В this._columns нет колонки под чекбокс, а в this._headerRows[N] есть, поэтому индекс может быть больше.
                    const columnSeparatorSize = _private.getSeparatorForColumn(this._columns, columnIndex - multiSelectOffset, this._options.columnSeparatorSize);
                    if (columnSeparatorSize !== null) {
                        cellClasses += ` controls-Grid__row-cell_withColumnSeparator controls-Grid__columnSeparator_size-${columnSeparatorSize}_theme-${theme}`;
                    }
                }
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
                    hasMultiSelectColumn,
                    columnIndex,
                    column: this._columns[columnIndex - (hasMultiSelectColumn ? 1 : 0)]
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

                    const additionalColumn = hasMultiSelectColumn ? 1 : 0;
                    const gridStyles = GridLayoutUtil.getMultiHeaderStyles(startColumn, endColumn, startRow, endRow, additionalColumn);
                    cellStyles += gridStyles;

                }
                cellClasses += endRow - startRow > 1 ? ' controls-Grid__header-cell_justify_content_center' : '';
                cellContentClasses += rowIndex !== this._headerRows.length - 1 && endRow - startRow === 1 ? ` controls-Grid__cell_header-content_border-bottom_theme-${this._options.theme}` : '';

                // У первой колонки не рисуем вертикальные разделители. startColumn - конфигурация GridLayout, начинается с 1.
                if (!cell.isActionCell && (startColumn - (hasMultiSelectColumn ? 2 : 1))) {
                    const columnSeparatorSize = _private.getSeparatorForColumn(this._columns, startColumn - 1, this._options.columnSeparatorSize);
                    if (columnSeparatorSize !== null) {
                        cellClasses += ` controls-Grid__row-cell_withColumnSeparator controls-Grid__columnSeparator_size-${columnSeparatorSize}_theme-${theme}`;
                    }
                }
            }

            if (
                columnIndex === 0 && rowIndex === 0 && hasMultiSelectColumn &&
                this._headerRows[rowIndex][columnIndex + 1].startColumn &&
                !(cell.title || cell.caption)
            ) {
                cellStyles = GridLayoutUtil.getMultiHeaderStyles(1, 2, 1, this._maxEndRow, 0)
                if (!GridLayoutUtil.isFullGridSupport()) {
                    headerColumn.rowSpan = this._maxEndRow - 1;
                    headerColumn.colSpan = 1;
                }
            }
            if (headerColumn.column.align) {
                cellContentClasses += ' controls-Grid__header-cell_justify_content_' + headerColumn.column.align;
            }

            if (!GridLayoutUtil.isFullGridSupport()) {
                cellClasses += ` controls-Grid__header-cell_align_items_${headerColumn.column.valign || 'top'}`;
            } else if (headerColumn.column.valign) {
                cellContentClasses += ` controls-Grid__header-cell_align_items_${headerColumn.column.valign}`;
            }

            if (GridLayoutUtil.isOldIE()) {
                cellContentClasses += ' controls-Grid__header-cell-content-block';
            }

            headerColumn.cellStyles = cellStyles;
            headerColumn.cellClasses = cellClasses;
            headerColumn.cellContentClasses = cellContentClasses;
            headerColumn.itemActionsPosition = this._options.itemActionsPosition;

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

        setHasMoreData(hasMoreData: boolean, silent: boolean = false): void {
            this._model.setHasMoreData(hasMoreData);
        },

        getHasMoreData(): boolean {
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
                    columnIndex: +this._hasMultiSelectColumn(),
                    columnsLength: this._columns.length
                });
        },

        _prepareResultsColumns: function(columns, hasMultiSelectColumn) {
            if (hasMultiSelectColumn) {
                this._resultsColumns = [{}].concat(columns);
            } else {
                this._resultsColumns = columns;
            }
            let stickyCellsCount = this.stickyLadderCellsCount();
            if (stickyCellsCount === 2) {
                this._resultsColumns = [{}, this._resultsColumns[0], {}].concat(this._resultsColumns.slice(1));
            } else if (stickyCellsCount === 1) {
                this._resultsColumns = [{}, ...this._resultsColumns];
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
            const hasMultiSelectColumn = this._hasMultiSelectColumn();
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
                    hasMultiSelectColumn,
                    stickyColumnsCount: this._options.stickyColumnsCount,
                    isColumnScrollVisible: this._options.columnScroll && this._options.columnScrollVisibility
                });
            }

            if (!resultsColumn.column?.isActionCell && (columnIndex > hasMultiSelectColumn ? 1 : 0)) {
                const columnSeparatorSize = _private.getSeparatorForColumn(
                    this._resultsColumns,
                    columnIndex,
                    this._options.columnSeparatorSize
                );

                if (columnSeparatorSize !== null) {
                    cellClasses += ' controls-Grid__row-cell_withColumnSeparator';
                    cellClasses += ` controls-Grid__columnSeparator_size-${columnSeparatorSize}_theme-${this._options.theme}`;
                }
            }

            if (this._options.columnScroll) {
                const params = {
                    columnIndex,
                    hasMultiSelectColumn,
                    stickyColumnsCount: this._options.stickyColumnsCount
                };
                cellClasses += _private.getColumnScrollCalculationCellClasses(params, this._options.theme);
                if (this._options.columnScrollVisibility) {
                    cellClasses += _private.getColumnScrollCellClasses(params, this._options.theme);
                }
                // Этот костыль выпилен в 6000 по https://online.sbis.ru/opendoc.html?guid=f5e830c3-7be2-4272-9c38-594c241401cc
                if (this._options.columnScrollVisibility && this.isStickyHeader()) {
                    cellClasses += ' controls-Grid__columnScroll_will-transform';
                }

                if (!GridLayoutUtil.isFullGridSupport()) {
                    resultsColumn.tableCellStyles = _private.getTableCellStyles({
                        hasMultiSelectColumn,
                        columnIndex,
                        column: this._columns[columnIndex - (hasMultiSelectColumn ? 1 : 0)]
                    });
                }
            }

            // Если включен множественный выбор и рендерится первая колонка с чекбоксом
            if (hasMultiSelectColumn && columnIndex === 0) {
                cellClasses += ' controls-Grid__results-cell-checkbox' + `_theme-${this._options.theme}`;
            } else if (resultsColumn.column) {
                cellClasses += ' ' + _private.getPaddingCellClasses({
                    style: this._options.style,
                    columns: this._resultsColumns,
                    columnIndex,
                    hasMultiSelectColumn,
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

        _setColumns(columns: IGridColumn[], silent: boolean = false): void {
            this._columns = this._prepareColumns(columns);
            this._ladder = _private.prepareLadder(this);
            this._prepareResultsColumns(this._columns, this._hasMultiSelectColumn());
            this._prepareColgroupColumns(this._columns, this._hasMultiSelectColumn());
            if (!silent) {
                this._columnsVersion++;
            }
        },

        setColumns(columns: IGridColumn[], silent: boolean = false): void {
            this._setColumns(columns, silent);
            if (!silent) {
                this._nextModelVersion();
            }
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

        setMultiSelectPosition(position) {
            this._model.setMultiSelectPosition(position);

            const hasMultiSelectColumn = this._hasMultiSelectColumn();
            this._prepareColgroupColumns(this._columns, hasMultiSelectColumn);
            this._prepareHeaderColumns(this._header, hasMultiSelectColumn, this._shouldAddActionsCell(), this.stickyLadderCellsCount());
            this._prepareResultsColumns(this._columns, hasMultiSelectColumn);
        },

        getMultiSelectPosition() {
            return this._model.getMultiSelectPosition();
        },

        setMultiSelectVisibility: function(multiSelectVisibility) {
            this._model.setMultiSelectVisibility(multiSelectVisibility);

            const hasMultiSelectColumn = this._hasMultiSelectColumn();
            this._prepareColgroupColumns(this._columns, hasMultiSelectColumn);
            this._prepareHeaderColumns(this._header, hasMultiSelectColumn, this._shouldAddActionsCell(), this.stickyLadderCellsCount());
            this._prepareResultsColumns(this._columns, hasMultiSelectColumn);
        },

        hasItemById: function(id, keyProperty) {
            return this._model.hasItemById(id, keyProperty);
        },

        getItemById: function(id, keyProperty) {
            return this._model.getItemById(id, keyProperty);
        },
        setSupportVirtualScroll: function(value) {
            this._model.setSupportVirtualScroll(value);
        },
        setMarkedKey: function(key, status, silent) {
            this._model.setMarkedKey(key, status, silent);
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
        getLast() {
            return this._model.getLast();
        },
        getIndexByKey: function() {
            return this._model.getIndexByKey.apply(this._model, arguments);
        },
        getIndexBySourceIndex(sourceIndex: number): number {
            return this._model.getIndexBySourceIndex(sourceIndex);
        },

        getSelectionStatus: function() {
            return this._model.getSelectionStatus.apply(this._model, arguments);
        },

        getNextItemKey: function() {
            return this._model.getNextItemKey.apply(this._model, arguments);
        },
        setIndexes: function(startIndex, stopIndex) {
            return this._model.setIndexes(startIndex, stopIndex);
        },

        getPreviousItemKey: function() {
            return this._model.getPreviousItemKey.apply(this._model, arguments);
        },

        setSorting: function(sorting) {
            this._model.setSorting(sorting);
            this._nextHeaderVersion();
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

        setItemPadding: function(itemPadding, silent) {
            this._model.setItemPadding(itemPadding, silent);
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
        _getDisplayItemCacheKey(dispItem) {
            return this._model._getDisplayItemCacheKey(dispItem);
        },

        getItemDataByItem(dispItem) {
            const self = this;
            const current = this._model.getItemDataByItem(dispItem);
            const navigation = this._options.navigation;
            let stickyColumn;

            if (current._gridViewModelCached) {
                return current;
            } else {
                current._gridViewModelCached = true;
            }

            stickyColumn = GridLadderUtil.getStickyColumn({
                stickyColumn: this._options.stickyColumn,
                columns: this._columns
            });

            current.showEditArrow = _private.resolveEditArrowVisibility(dispItem, this._options);
            current.isFullGridSupport = this.isFullGridSupport.bind(this);
            current.resolvers = this._resolvers;
            current.columnScroll = this._options.columnScroll;
            current.isColumnScrollVisible = this._options.columnScrollVisibility;
            // todo remove multiSelectVisibility, multiSelectPosition and multiSelectClassList by task:
            // https://online.sbis.ru/opendoc.html?guid=50811b1e-7362-4e56-b52c-96d63b917dc9
            current.multiSelectVisibility = this._options.multiSelectVisibility;
            current.multiSelectPosition = this._options.multiSelectPosition;
            current.hasMultiSelectColumn = this._hasMultiSelectColumn();
            current.getColspanForColumnScroll = () => _private.getColspanForColumnScroll(self);
            current.getColspanFor = (elementName: string) => self.getColspanFor.apply(self, [elementName]);
            current.stickyColumnsCount = this._options.stickyColumnsCount;

            current.rowSeparatorSize = this._options.rowSeparatorSize;
            current.columnSeparatorSize = this._options.columnSeparatorSize;
            if (current.hasMultiSelect) {
                current.multiSelectClassList += ` controls-GridView__checkbox_theme-${current.theme} controls-GridView__checkbox_position-${current.multiSelectPosition}_theme-${current.theme}`;
            }
            current.getSeparatorForColumn = _private.getSeparatorForColumn;
            current.isLastRow = (!navigation || navigation.view !== 'infinity' || !this.getHasMoreData()) &&
                                 (this.getCount() - 1 === current.index);

            current.getColumnAlignGroupStyles = (columnAlignGroup: number) => (
                _private.getColumnAlignGroupStyles(current, columnAlignGroup, self._shouldAddActionsCell(), self.stickyLadderCellsCount())
            );

            const style = !current.style ? 'default' : current.style;

            current.markerPosition = this._options.markerPosition || 'left';
            current.shouldDisplayMarker = (columnIndex): boolean => {
                const isShouldDisplayMarker = (current.markerVisibility !== 'hidden' &&
                    !current.isEditing() &&
                    current.isMarked());
                if (current.markerPosition === 'right') {
                    return isShouldDisplayMarker && columnIndex === current.columns.length - 1;
                } else {
                    return isShouldDisplayMarker && columnIndex === 0;
                }
            };

            current.getMarkerClasses = (markerClassName = 'default') => `controls-GridView__itemV_marker controls-GridView__itemV_marker_theme-${current.theme}
            controls-GridView__itemV_marker-${style}_theme-${current.theme}
            controls-GridView__itemV_marker-${style}_rowSpacingBottom-${current.itemPadding.bottom}_theme-${current.theme}
            controls-GridView__itemV_marker-${style}_rowSpacingTop-${current.itemPadding.top}_theme-${current.theme}
            controls-ListView__itemV_marker_${(markerClassName === 'default') ? 'default' : ('padding-' + (current.itemPadding.top || 'l') + '_' + markerClassName)}
            controls-ListView__itemV_marker-${current.markerPosition}`;

            if (current.hasMultiSelectColumn) {
                current.columns = [{}].concat(this._columns);
            } else {
                current.columns = this._columns;
            }

            current.isHovered = !!self._model.getHoveredItem() && self._model.getHoveredItem().getId() === current.key;

            // current.index === -1 если записи ещё нет в проекции/рекордсете. такое возможно при добавлении по месту
            // лесенка не хранится для элементов вне текущего диапазона startIndex - stopIndex
            if (stickyColumn &&
                current.isFullGridSupport() &&
                !current.dragTargetPosition &&
                current.index !== -1 &&
                self._ladder.stickyLadder[current.index]) {

                    let stickyProperties = self._columns[0]?.stickyProperty;
                    if (stickyProperties && !(stickyProperties instanceof Array)) {
                        stickyProperties = [stickyProperties];
                    }
                    current.stickyProperties = stickyProperties;
                    current.stickyLadder = self._ladder.stickyLadder[current.index];
            }

            // TODO: Разобраться, зачем это. По задаче https://online.sbis.ru/doc/5d2c482e-2b2f-417b-98d2-8364c454e635
            if (current.columnScroll) {
                current.rowIndex = this._calcRowIndex(current);
            }

            if (current.isGroup) {
                current.groupPaddingClasses = _private.getGroupPaddingClasses(current, current.theme);
                current.shouldFixGroupOnColumn = (columnAlignGroup?: number) => {
                    return columnAlignGroup !== undefined && columnAlignGroup < current.columns.length - (current.hasMultiSelectColumn ? 1 : 0);
                };
                return current;
            }

            current.itemActionsDrawPosition = this._options.columnScroll ? 'after' : 'before';
            current.itemActionsColumnScrollDraw = this._options.columnScroll;

            current.columnIndex = 0;

            current.getVersion = function() {
                return self._calcItemVersion(current.item, current.key, current.index);
            };

            current.shouldDrawLadderContent = (stickyProperty: string, ladderProperty: string) => {
                if (!self._options.itemsDragNDrop && current.stickyProperties && self._ladder.stickyLadder[current.index]) {
                    const index = current.stickyProperties.indexOf(stickyProperty);
                    const hasMainCell = !! (self._ladder.stickyLadder[current.index][current.stickyProperties[0]].ladderLength);
                    if (stickyProperty && ladderProperty && stickyProperty !== ladderProperty && (
                        index === 1 && !hasMainCell ||
                        index === 0 && hasMainCell)) {
                        return false;
                    }
                }
                return true;
            }
            current.getLadderContentClasses = (stickyProperty, ladderProperty) => {
                let result = '';
                if (current.stickyProperties && self._ladder.stickyLadder[current.index]) {
                    const index = current.stickyProperties.indexOf(stickyProperty);
                    const hasMainCell = !! (self._ladder.stickyLadder[current.index][current.stickyProperties[0]].ladderLength);
                    if (stickyProperty && ladderProperty && stickyProperty !== ladderProperty && (
                        index === 1 && !hasMainCell ||
                        index === 0 && hasMainCell)) {
                        result += ' controls-Grid__row-cell__ladder-content_displayNoneForLadder';
                    }
                    if (stickyProperty === ladderProperty && index === 1 && hasMainCell) {
                        result += ' controls-Grid__row-cell__ladder-content_additional-with-main';
                    }
                }
                return result;
            };

            current.getAdditionalLadderClasses = () => {
                let result = '';
                if (current.stickyProperties && self._ladder.stickyLadder[current.index]) {
                    const hasMainCell = !! self._ladder.stickyLadder[current.index][current.stickyProperties[0]].ladderLength;
                    const hasHeader = !!self.getHeaderModel();
                    const hasTopResults = self.isDrawResults() && self.getResultsPosition() === 'top';
                    if (!hasMainCell) {
                        result += ` controls-Grid__row-cell__ladder-spacing${hasHeader ? '_withHeader' : ''}${hasTopResults ? '_withResults' : ''}_theme-${current.theme}`;
                    }
                }
                return result;
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
                    return current.columnIndex <= (current.hasMultiSelectColumn ? 1 : 0);
                } else {
                    return current.getLastColumnIndex() >= current.columnIndex;
                }
            };
            current.getClassesLadderHeading = _private.getClassesLadderHeading;
            current.isDrawActions = _private.isDrawActions;
            current.isActionsColumn = _private.isActionsColumn;
            current.shouldAddActionsCell = self._shouldAddActionsCell();
            current.getCellStyle = (itemData, currentColumn, colspan) => _private.getCellStyle(self, itemData, currentColumn, colspan);

            current.getRelativeCellWrapperClasses = !GridLayoutUtil.isFullGridSupport() ?
                _private.getRelativeCellWrapperClasses.bind(null, current) :
                () => {
                    Logger.warn('Used table markup when full grid support. View may be displayed incorrectly!', this);
                    return '';
                };

            current.getCurrentColumnKey = function() {
                return self._columnsVersion + '_' +
                    (!self._hasMultiSelectColumn() ? current.columnIndex : current.columnIndex - 1);
            };

            _private.setRowClassesGettersOnItemData(this, current);

            if (self._options.editingConfig) {
                current.editingBackgroundStyle = self._options.editingConfig.backgroundStyle || 'default';
            } else {
                current.editingBackgroundStyle = 'default';
            }

            current.getCurrentColumn = function(backgroundColorStyle) {
                const currentColumn: any = {
                        item: current.item,
                        style: current.style,
                        backgroundStyle: current.backgroundStyle,
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
                        shouldDrawLadderContent: current.shouldDrawLadderContent,
                        getLadderContentClasses: current.getLadderContentClasses,
                        hoverBackgroundStyle: self._options.hoverBackgroundStyle || 'default',
                        getVersion: function () {
                           return _private.calcItemColumnVersion(self, current.getVersion(), this.columnIndex, this.index);
                        },
                        _preferVersionAPI: true,
                        gridCellStyles: '',
                        tableCellStyles: '',
                        getItemActionPositionClasses: current.getItemActionPositionClasses,
                        getItemActionClasses: current.getItemActionClasses,
                        isSwiped: current.isSwiped,
                        getActions: current.getActions,
                        getContents: current.getContents,
                        hasMultiSelectColumn: current.hasMultiSelectColumn
                };
                currentColumn.classList = _private.getItemColumnCellClasses(self, current, current.theme, backgroundColorStyle);


                currentColumn.getColspanedPaddingClassList = (columnData, isColspaned) => {
                    /**
                     * isColspaned добавлена как костыль для временного лечения ошибки.
                     * После закрытия можно удалить здесь и из шаблонов.
                     * https://online.sbis.ru/opendoc.html?guid=4230f8f0-7fd1-4018-bd8c-08d703af3899
                     */
                    if (isColspaned) {
                        columnData.classList.padding.right = `controls-Grid__cell_spacingLastCol_${current.itemPadding.right}_theme-${current.theme}`;
                    }
                    return columnData.classList.padding;
                };
                currentColumn.column = current.columns[current.columnIndex];
                currentColumn.template = currentColumn.column.template ? currentColumn.column.template : self._columnTemplate;
                if (self.isSupportLadder(self._options.ladderProperties)) {
                    currentColumn.ladder = self._ladder.ladder[current.index];
                    currentColumn.ladderWrapper = LadderWrapper;
                }
                if (current.item && current.item.get) {
                    currentColumn.needSearchHighlight = current.searchValue ?
                        !!_private.isNeedToHighlight(current.item, currentColumn.column.displayProperty, current.searchValue) : false;
                    currentColumn.searchValue = current.searchValue;
                }
                if (stickyColumn) {
                    currentColumn.hiddenForLadder = currentColumn.columnIndex === (current.hasMultiSelectColumn ? stickyColumn.index + 1 : stickyColumn.index);
                }

                if (current.columnScroll) {
                    currentColumn.itemActionsGridCellStyles = ' position: sticky; overflow: visible; display: inline-block; right: 0;';
                    if (!GridLayoutUtil.isFullGridSupport()) {
                        currentColumn.tableCellStyles = _private.getTableCellStyles(currentColumn);
                    }
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

        isLast: function() {
            return this._model.isLast();
        },

        setStickyColumn: function(stickyColumn) {
            this._options.stickyColumn = stickyColumn;
            this._ladder = _private.prepareLadder(this);
            this._nextModelVersion();
        },

        setColumnScroll(columnScroll: boolean, silent: boolean = false): void {
            this._options.columnScroll = columnScroll;
            if (!silent) {
                this._nextModelVersion();
            }
        },

        setColumnScrollVisibility(columnScrollVisibility: boolean) {
            if (this._options && !!this._options.columnScrollVisibility !== columnScrollVisibility) {
                this._options.columnScrollVisibility = columnScrollVisibility;

                // Нужно обновить классы с z-index на всех ячейках
                this._nextModelVersion();
            }
        },

        getColumnScrollVisibility(): boolean {
            return this._options.columnScrollVisibility;
        },

        setFooter: function(footerColumns, silent: boolean = false): void {
            this._setFooter(footerColumns);
            if (!silent) {
                this._nextModelVersion();
            }
        },

        getFooter() {
            return this._footer;
        },

        _setFooter(footerColumns): void {
            this._footerColumns = footerColumns;
            const hasMultiSelect = this._options.multiSelectVisibility !== 'hidden' && this._options.multiSelectPosition === 'default';
            const isFullGridSupport = GridLayoutUtil.isFullGridSupport();

            const prepared = prepareColumns<{
                isFullGridSupport: boolean;
                getWrapperClasses(backgroundStyle: string): string;
                getWrapperStyles(containerSize: number): string;
                getContentClasses(containerSize: number): string;
                getContentStyles(containerSize: number): string;
                colspan: number;
            } & IPreparedColumn>({
                gridColumns: this._columns,
                colspanColumns: footerColumns,
                hasMultiSelect,
                stickyLadderCount: this.stickyLadderCellsCount()
            });

            const isMultiColumn = prepared.length > 1;

            const itemPadding = this._model.getItemPadding();
            const theme = this._options.theme;

            prepared.forEach((column, index, columns) => {
                column.isFullGridSupport = isFullGridSupport;
                let styles = '';
                let classes = `controls-GridView__footer__cell controls-GridView__footer__cell_theme-${theme}`;

                if (this._options.footer) {
                    classes += ` controls-GridView__newFooter__cell_theme-${theme}`;
                }

                if (!(index < 2 && hasMultiSelect)) {
                    if (index === 0) {
                        classes += ` controls-GridView__footer__cell__paddingLeft_${itemPadding.left}_theme-${theme}`;
                    } else {
                        const dataColumnIndex = column.startColumn - +hasMultiSelect - 1;
                        const leftCellPadding = this._columns[dataColumnIndex].cellPadding?.left?.toLowerCase() || 'default';
                        classes += ` controls-GridView__footer__cell__cellPaddingLeft_${leftCellPadding}_theme-${theme}`;
                    }
                }
                if (!(index === 0 && hasMultiSelect)) {
                    if (index === columns.length - 1) {
                        classes += ` controls-GridView__footer__cell__paddingRight_${itemPadding.right}_theme-${theme}`;
                    } else {
                        const dataColumnIndex = column.endColumn - +hasMultiSelect - 2;
                        const rightCellPadding = this._columns[dataColumnIndex].cellPadding?.right?.toLowerCase() || 'default';
                        classes += ` controls-GridView__footer__cell__cellPaddingRight_${rightCellPadding}_theme-${theme}`;
                    }
                }

                if (this._options.columnScroll) {

                    // Не скроллируем 1) растянутый подвал; 2) фиксированную часть разбитого на колонки подвала.
                    if (!isMultiColumn) {
                        classes += ` ${COLUMN_SCROLL_JS_SELECTORS.FIXED_ELEMENT}`;
                        classes += ` ${DRAG_SCROLL_JS_SELECTORS.NOT_DRAG_SCROLLABLE}`;
                    } else if ((column.endColumn - 1 - +hasMultiSelect) <= this._options.stickyColumnsCount) {
                        classes += ` ${COLUMN_SCROLL_JS_SELECTORS.FIXED_ELEMENT}`;
                        classes += ` ${DRAG_SCROLL_JS_SELECTORS.NOT_DRAG_SCROLLABLE}`;
                    }
                }

                if (isFullGridSupport) {
                    styles += `grid-column: ${column.startColumn} / ${column.endColumn};`;
                } else {
                    column.colspan = column.endColumn - column.startColumn;
                }

                column.getWrapperClasses = (needBottomPadding: boolean, backgroundStyle: string = 'default') => {
                    // TODO: Для предотвращения скролла одной записи в таблице с экшнами отступ
                    //  под плашку операций над записью вне строки обеспечивался не только блоком
                    //  между записями и подвалом, но и с помощью min-height на подвал. Объяснялось
                    //  это тем, что _options._needBottomPadding иногда не работает по неясным причинам.
                    //  https://online.sbis.ru/opendoc.html?guid=3d84bd7a-039d-4a30-915b-41c75ed501cd
                    const shouldDrawBottomPadding =
                        (this.getCount() || this.isEditing()) &&
                        this._options.itemActionsPosition === 'outside' &&
                        !needBottomPadding &&
                        this._options.resultsPosition !== 'bottom';

                    return `${classes} controls-background-${backgroundStyle}_theme-${theme} ` +
                           (shouldDrawBottomPadding ? `controls-GridView__footer__itemActionsV_outside_theme-${theme} ` : '');
                };

                column.getWrapperStyles = (containerSize: number) => {
                    // При горизонтальном скролле, растянутый подвал должен растягиваться только на ширину видимой области таблицы.
                    if (isFullGridSupport && prepared.length === 1 && containerSize && this._options.columnScrollVisibility) {
                        return `${styles} width: ${containerSize}px;`;
                    }
                    return styles;
                };

                column.getContentClasses = (containerSize: number) => {
                    if (!isFullGridSupport && prepared.length === 1 && containerSize) {
                        return 'controls-GridView__footer__cell-content_colspan';
                    }
                };

                column.getContentStyles = (containerSize: number) => {
                    // При горизонтальном скролле, растянутый подвал должен растягиваться только на ширину видимой области таблицы.
                    // При табличной верстке выводится td который игнорирует width. Ограничивать необходимо контент
                    if (!isFullGridSupport && prepared.length === 1 && containerSize && this._options.columnScrollVisibility) {
                        return `width: ${containerSize}px;`;
                    }
                    return '';
                };
            });

            this._footer = prepared;
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

        setItems(items, cfg): void {
            this._model.setItems(items, cfg);
            this._setHeader(cfg.header);
        },

        setItemTemplateProperty: function(itemTemplateProperty) {
            this._model.setItemTemplateProperty(itemTemplateProperty);
        },

        setBaseItemTemplateResolver(baseItemTemplateResolver: () => TemplateFunction): void {
            this._baseItemTemplateResolver = baseItemTemplateResolver;
            this._resolvers.baseItemTemplate = baseItemTemplateResolver;
            this.resetCachedItemData();
        },

        getItems: function() {
            return this._model.getItems();
        },

        // для совместимости с новой моделью
        getCollection: function() {
            return this.getItems();
        },
        /**
         * TODO работа с activeItem Должна производиться через item.isActive(),
         *  но из-за того, как в TileView организована работа с isHovered, isScaled и isAnimated
         *  мы не можем снять эти состояния при клике внутри ItemActions
         * @param itemData
         */
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

        nextModelVersion: function() {
            this._model.nextModelVersion.apply(this._model, arguments);
        },

        setItemActionVisibilityCallback: function(callback) {
            this._model.setItemActionVisibilityCallback(callback);
        },

        _calcItemVersion(item, key, index): string {
            if (item === null) {
                return;
            }
            let version: string = this._model._calcItemVersion(item, key) + (item.getId ? item.getId() : '');

            if (this.getCount() - 1 === index) {
                version = 'LAST_ITEM_' + version;

                if (this._options.rowSeparatorSize) {
                    version = 'WITH_SEPARATOR_' + version;
                }
            }

            version += _private.calcLadderVersion(this._ladder, index);

            return version;
        },

        createItem(options: {contents: Model}): CollectionItem<Model> {
            return this._model.createItem(options);
        },

        getCurrentIndex: function() {
            return this._model.getCurrentIndex();
        },

        // New Model compatibility
        getItemBySourceKey(key: number | string): Model {
            return this._model.getItemBySourceKey(key);
        },

        // New Model compatibility
        nextVersion(): void {
            this._nextVersion();
        },

        // New Model compatibility
        isActionsAssigned(): boolean {
            return this._model.isActionsAssigned();
        },

        // New Model compatibility
        setActionsAssigned(assigned: boolean): void {
            this._model.setActionsAssigned(assigned);
        },

        // New Model compatibility
        getEditingConfig(): IEditingConfig {
            return this._model.getEditingConfig();
        },

        // New Model compatibility
        getActionsTemplateConfig(): IItemActionsTemplateConfig {
            return this._model.getActionsTemplateConfig();
        },

        // New Model compatibility
        setActionsTemplateConfig(config: IItemActionsTemplateConfig): void {
            this._model.setActionsTemplateConfig(config);
        },

        // New Model compatibility
        getActionsMenuConfig(): any {
            return this._model.getActionsMenuConfig();
        },

        // New Model compatibility
        setActionsMenuConfig(config: any): void {
            this._model.setActionsMenuConfig(config);
        },

        // New Model compatibility
        getSwipeConfig(): ISwipeConfig {
            return this._model.getSwipeConfig();
        },

        // New Model compatibility
        setSwipeConfig(config: ISwipeConfig): void {
            this._model.setSwipeConfig(config);
        },

        // New Model compatibility
        each(callback: collection.EnumeratorCallback<Model>, context?: object): void {
            this._model.each(callback, context);
        },

        // New Model compatibility
        find(predicate: (item: Model) => boolean): Model {
            return this._model.find(predicate);
        },

        // New Model compatibility
        getIndex(item: CollectionItem<Model>): number | string {
            return this._model ? this._model.getIndex(item) : undefined;
        },

        // New Model compatibility
        getSourceIndexByItem(item: CollectionItem<Model>): number {
            return this._model ? this._model.getSourceIndexByItem(item) : undefined;
        },

        // New Model compatibility
        getIndexBySourceItem(item: Model): number | string {
            return this._model ? this._model.getIndexBySourceItem(item) : undefined;
        },

        // New Model compatibility
        isEventRaising(): boolean {
            return this._model.isEventRaising();
        },

        // New Model compatibility
        setEventRaising(enabled: boolean, analyze: boolean): void {
            return this._model.setEventRaising(enabled, analyze);
        },

        /**
         * Возвращает состояние editing для модели.
         * New Model compatibility
         */
        isEditing(): boolean {
            return this._model.isEditing();
        },

        /**
         * Устанавливает состояние editing для модели.
         * New Model compatibility
         */
        setEditing(editing): void {
            this._model.setEditing(editing);
        },

        at(index: number): Model {
            return this._model.at(index);
        },

        getCount: function() {
            return this._model.getCount();
        },

        setSwipeItem: function(itemData) {
            this._model.setSwipeItem(itemData);
        },

        // TODO: Исправить по задаче https://online.sbis.ru/opendoc.html?guid=2c5630f6-814a-4284-b3fb-cc7b32a0e245.
        setRowSeparatorVisibility: function(rowSeparatorVisibility) {
            this._options.rowSeparatorVisibility = rowSeparatorVisibility;
            this._nextModelVersion();
        },

        setRowSeparatorSize(rowSeparatorSize: IGridSeparatorOptions['rowSeparatorSize']): void {
            rowSeparatorSize = _private.getSeparatorSizes({
                rowSeparatorSize,
                rowSeparatorVisibility: this._options.rowSeparatorVisibility
            }).row;
            this._model.setRowSeparatorSize(rowSeparatorSize);
        },

        setColumnSeparatorSize(columnSeparatorSize: IGridSeparatorOptions['columnSeparatorSize']): void {
            this._options.columnSeparatorSize = _private.getSeparatorSizes({
                columnSeparatorSize
            }).column;
            this._nextModelVersion();
        },

        setStickyColumnsCount: function(stickyColumnsCount) {
            this._options.stickyColumnsCount = stickyColumnsCount;
            this._nextModelVersion();
        },

        setSelectedItems(items: Model[], selected: boolean|null): void {
            this._model.setSelectedItems(items, selected);
        },

        setDraggedItems(draggableItem: CollectionItem<Model>, draggedItemsKeys: Array<number|string>): void {
            this._model.setDraggedItems(draggableItem, draggedItemsKeys);
            // Если есть прилипающая колонка, то нужно пересчитать футер,
            // т.к. прилипающая колонка во время днд скрывается и кол-во grid cтолбцов уменьшается
            if (_private.hasStickyColumn(this) && this._footerColumns) {
                this._setFooter(this._footerColumns);
            }
        },
        setDragPosition(position: IDragPosition<CollectionItem<Model>>): void {
            this._model.setDragPosition(position);
        },
        resetDraggedItems(): void {
            this._model.resetDraggedItems();
            // Если есть прилипающая колонка, то нужно пересчитать футер,
            // т.к. прилипающая колонка во время днд скрывается и кол-во grid cтолбцов уменьшается
            if (_private.hasStickyColumn(this) && this._footerColumns) {
                this._setFooter(this._footerColumns);
            }
        },

        setDragTargetPosition: function(position) {
            this._model.setDragTargetPosition(position);
        },

        setDragEntity: function(entity) {
            this._model.setDragEntity(entity);
        },

        setDragItemData: function(itemData) {
            this._model.setDragItemData(itemData);
            if (_private.hasStickyColumn(this)) {
                this._setHeader(this._options.header);
                this._prepareResultsColumns(this._columns, this._hasMultiSelectColumn());
            }
        },

        getDragItemData: function() {
            return this._model.getDragItemData();
        },

        getPrevDragPosition(): IDragPosition<CollectionItem<Model>> {
            return this._model.getPrevDragPosition();
        },

        getActiveItem: function() {
            return this._model.getActiveItem();
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

        _hasMultiSelectColumn(): boolean {
            return this._options.multiSelectVisibility !== 'hidden' && this._options.multiSelectPosition === 'default';
        },

        getEmptyTemplateStyles(): string {
            if (GridLayoutUtil.isFullGridSupport()) {
                const hasColumnScroll: boolean = !!this._options.columnScroll;
                // активирована колонка для множественного выбора?
                const offsetForMultiSelect: number = +(this._hasMultiSelectColumn());
                // к колонкам была добавлена "прилипающая" колонка?
                const ladderStickyColumn = _private.getStickyColumn(this);
                const offsetForStickyColumn: number = ladderStickyColumn ? ladderStickyColumn.property.length : 0;
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
                    columnStart: +this._hasMultiSelectColumn(),
                    columnSpan: this._columns.length
                });
            }
            return '';
        },

        markItemReloaded: function(key) {
            this._model.markItemReloaded(key);
        },

        clearReloadedMarks: function() {
            this._model.clearReloadedMarks();
        },

        destroy: function() {
            this._model.unsubscribe('onListChange', this._onListChangeFn);
            this._model.unsubscribe('onGroupsExpandChange', this._onGroupsExpandChangeFn);
            this._model.unsubscribe('onCollectionChange', this._onCollectionChangeFn);
            this._model.unsubscribe('onAfterCollectionChange', this._onAfterCollectionChangeFn);
            this._model.destroy();
            GridViewModel.superclass.destroy.apply(this, arguments);
        },

        getColspanStylesFor(colspanFor: GridColspanableElements, params: IGetColspanStylesForParams): string {
            const multiSelectOffset = +this._hasMultiSelectColumn();
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
                columnCfg.columnSpan += this.stickyLadderCellsCount();

                return GridLayoutUtil.getColumnStyles(columnCfg);
            }
        },

        // region Table Layout

        getColspanFor(gridElementName: GridColspanableElements): number {
            switch (gridElementName) {
                case 'headerBreadcrumbs':
                    return this._hasMultiSelectColumn() ? 2 : 1;
                case 'bottomPadding':
                case 'emptyTemplateAndColumnScroll':
                case 'footer':
                    return this._columns.length + (this._hasMultiSelectColumn() ? 1 : 0);
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

        _prepareColgroupColumns(columns: IGridColumn[], hasMultiSelectColumn: boolean): void {
            if (this.isFullGridSupport()) {
                this._colgroupColumns = undefined;
                return;
            }

            const colgroupColumns: IColgroupColumn[] = [];

            columns.forEach((column, index) => {
                colgroupColumns.push({
                    classes: 'controls-Grid__colgroup-column',
                    style: `width: ${this._prepareWidthForTableColumn(column)};`,
                    index: index + (hasMultiSelectColumn ? 1 : 0)
                });
            });

            if (hasMultiSelectColumn) {
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
        },

        // endregion Colgroup columns

        // endregion Table Layout

        /**
         * Обновляет стиль фона фиксированных элемекнтов
         * @param backgroundStyle
         */
        setBackgroundStyle(backgroundStyle): void {
            if (this._model) {
                this._model.setBackgroundStyle(backgroundStyle);
            }
        }

    });

GridViewModel._private = _private;

export = GridViewModel;
