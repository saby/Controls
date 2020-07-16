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
import { Model } from 'Types/entity';
import {
    IEditingConfig,
    IItemActionsTemplateConfig,
    ISwipeConfig,
    ANIMATION_STATE,
    CollectionItem
} from 'Controls/display';
import * as Grouping from 'Controls/_list/Controllers/Grouping';
import {JS_SELECTORS as COLUMN_SCROLL_JS_SELECTORS} from './resources/ColumnScroll';
import { shouldAddActionsCell } from 'Controls/_grid/utils/GridColumnScrollUtil';
import {createClassListCollection} from "../Utils/CssClassList";
import { shouldAddStickyLadderCell, prepareLadder,  isSupportLadder, getStickyColumn} from 'Controls/_grid/utils/GridLadderUtil';
import {IHeaderCell} from './interface/IHeaderCell';
import { ItemsEntity } from 'Controls/dragnDrop';
import { IDragPosition, IFlatItemData } from 'Controls/listDragNDrop';

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
            const hasMultiselect = self._options.multiSelectVisibility !== 'hidden';
            let version = `${itemVersion}_${self._columnsVersion}_${hasMultiselect ? columnIndex - 1 : columnIndex}`;
            if (hasMultiselect && columnIndex === 1) {
                version += '_MS';
            }

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
            return itemData.shouldDisplayActions() && _private.isActionsColumn(itemData, currentColumn, colspan);
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
            return !!result ? `_${result}` : '';
        },

        getPaddingHeaderCellClasses: function(params, theme) {
            let preparedClasses = '';
            const { multiSelectVisibility, columnIndex, headerColumns,
                rowIndex, itemPadding, isBreadCrumbs, style, cell: { endColumn }, isMultiHeader } = params;
            if (params.cell.isActionCell) {
                return preparedClasses;
            }

            const actionCellOffset = params.hasActionCell ? 1 : 0;
            const maxEndColumn = params.maxEndColumn - actionCellOffset;
            const columnsLengthExcludedActionCell = headerColumns.length - actionCellOffset;

            const getCellPadding = (side) => _private.getHeaderCellPadding(side, params);
            if (rowIndex === 0) {
                if (multiSelectVisibility ? columnIndex > 1 : columnIndex > 0) {
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

        getColumnScrollCellClasses(params, theme): string {
           return _private.isFixedCell(params) ? ` ${COLUMN_SCROLL_JS_SELECTORS.FIXED_ELEMENT} controls-Grid__cell_fixed controls-Grid__cell_fixed_theme-${theme}` : ` ${COLUMN_SCROLL_JS_SELECTORS.SCROLLABLE_ELEMENT}`;
        },

        getClassesLadderHeading(itemData, theme): String {
            let result = 'controls-Grid__row-ladder-cell__content controls-Grid__row-ladder-cell__content_';
            result += itemData.itemPadding && itemData.itemPadding.top ? itemData.itemPadding.top : 'default';
            result += '_theme-' + theme;
            return result;
        },

        getItemColumnCellClasses: function(current, theme, backgroundColorStyle) {
            const checkBoxCell = current.multiSelectVisibility !== 'hidden' && current.columnIndex === 0;
            const classLists = createClassListCollection('base', 'padding', 'columnScroll', 'relativeCellWrapper', 'columnContent');
            let style = current.style === 'masterClassic' || !current.style ? 'default' : current.style;
            const backgroundStyle = current.backgroundStyle || current.style || 'default';
            const isFullGridSupport = GridLayoutUtil.isFullGridSupport();

            // Стиль колонки
            classLists.base += `controls-Grid__row-cell controls-Grid__row-cell_theme-${theme} controls-Grid__cell_${style} controls-Grid__row-cell_${style}_theme-${theme}`;
            _private.prepareSeparatorClasses(current, classLists, theme);

            if (backgroundColorStyle) {
                classLists.base += _private.getBackgroundStyle({backgroundStyle, theme, backgroundColorStyle}, true);
            }

            if (current.columnScroll) {
                classLists.columnScroll += _private.getColumnScrollCellClasses(current, theme);
            } else if (!checkBoxCell) {
                classLists.base += ' controls-Grid__cell_fit';
            }

            if (current.isEditing) {
                classLists.base += ` controls-Grid__row-cell-background-editing_theme-${theme}`;
            } else {
                classLists.base += ` controls-Grid__row-cell-background-hover_theme-${theme}`;
            }

            if (current.columnScroll && !current.isEditing) {
                classLists.columnScroll += _private.getBackgroundStyle({backgroundStyle, theme}, true);
            }

            // Если включен множественный выбор и рендерится первая колонка с чекбоксом
            if (checkBoxCell) {
                classLists.base += ` controls-Grid__row-cell-checkbox_theme-${theme}`;
                classLists.padding = createClassListCollection('top', 'bottom');
                classLists.padding.top = `controls-Grid__row-checkboxCell_rowSpacingTop_${current.itemPadding.top}_theme-${theme}`;
                classLists.padding.bottom =  `controls-Grid__row-cell_rowSpacingBottom_${current.itemPadding.bottom}_theme-${theme}`;
            } else {
                classLists.padding = _private.getPaddingCellClasses(current, theme);
            }

            if (!current._isSelected && current.columnIndex === current.getLastColumnIndex()) {
                classLists.base += ` controls-Grid__row-cell__last controls-Grid__row-cell__last-${style}_theme-${theme}`;
            }

            if (!isFullGridSupport) {
                classLists.relativeCellWrapper += 'controls-Grid__table__relative-cell-wrapper';
                const _rowSeparatorSize = current.rowSeparatorSize && current.rowSeparatorSize.toLowerCase() === 'l' ? 'l' : 's';
                classLists.relativeCellWrapper += ` controls-Grid__table__relative-cell-wrapper_rowSeparator-${_rowSeparatorSize}_theme-${theme}`;
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
        getColumnAlignGroupStyles(itemData: IGridItemData, leftSideItemsCount: number = 0, isActionsCellExists: boolean): {
            left: string
            right: string
        } {
            const additionalTerm = (itemData.hasMultiSelect ? 1 : 0);
            const result = {left: '', right: ''};
            const start = 1;
            const end = itemData.columns.length + 1 + (isActionsCellExists ? 1 : 0);

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
            if (!self._ladder || self._options.stickyColumn) {
                self.resetCachedItemData();
            }

            const hasVirtualScroll = !!self._options.virtualScrolling || Boolean(self._options.virtualScrollConfig);
            const displayStopIndex = self.getDisplay() ? self.getDisplay().getCount() : 0;
            const startIndex = self.getStartIndex();
            const stopIndex = hasVirtualScroll ? self.getStopIndex() : displayStopIndex;
            const newLadder: any = prepareLadder({
                ladderProperties: self._options.ladderProperties,
                startIndex,
                stopIndex,
                display: self.getDisplay(),
                columns: self._options.columns,
                stickyColumn: self._options.stickyColumn
            });
            //Нужно сбросить кэш для записей, у которых поменялась конфигурация лесенки
            if (self._ladder) {
                for (let i = startIndex; i < stopIndex ; i++) {
                    if (!isEqual(newLadder.stickyLadder[i], self._ladder.stickyLadder[i]) ||
                        !isEqual(newLadder.ladder[i], self._ladder.ladder[i])) {

                        const dispItem = self.getItemById(self.getItems()?.at(i)?.getId());
                        if (dispItem) {
                            self.resetCachedItemData(self._getDisplayItemCacheKey(dispItem));
                        }
                    }
                }
            }
            return newLadder;
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
         * @param options Опции IList | объект, содержащий theme, style, backgroundStyle, backgroundColorStyle
         * @param addSpace Добавлять ли пробел перед выводимой строкой
         */
        getBackgroundStyle(options: {theme: string, style?: string, backgroundStyle?: string, backgroundColorStyle?: string}, addSpace?: boolean): string {
            if (options.backgroundColorStyle) {
                return `${addSpace ? ' ' : ''}controls-Grid__row-cell_background_${options.backgroundColorStyle}_theme-${options.theme}`
            }

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
            } else {
                classLists.base += ` controls-Grid__row-cell_withRowSeparator_size-${current.rowSeparatorSize}_theme-${theme}`;
                classLists.base += ` controls-Grid__rowSeparator_size-${current.rowSeparatorSize}_theme-${theme}`;
            }

            if (current.columnIndex > current.hasMultiSelect ? 1 : 0) {
                const columnSeparatorSize = _private.getSeparatorForColumn(current.columns, current.columnIndex, current.columnSeparatorSize);

                if (columnSeparatorSize !== null) {
                    classLists.base += ' controls-Grid__row-cell_withColumnSeparator';
                    classLists.columnContent += ` controls-Grid__columnSeparator_size-${columnSeparatorSize}_theme-${theme}`;
                }
            }
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
        _resolvers: null,

        _headerModel: null,
        _headerVersion: 0,

        constructor: function(cfg) {
            this._options = cfg;
            GridViewModel.superclass.constructor.apply(this, arguments);

            // Резолверы шаблонов. Передается объект, чтобы всегда иметь актуальные резолверы. Передача по ссылке
            // требуется например для построения таблицы с запущенным редактированием по месту. Редактирование строится
            // до GridView и устанавливает editingItemData в которую передаются резолверы. На момент взятия itemData
            // резолверов еще нет, поэтому передаем объект, позже Gridview запишет в него резолверы. С таким подходом
            // порядок маунтов не важен, главное, что все произойдет до маунта.
            this._resolvers = {};
            this._model = this._createModel(cfg);
            this._onListChangeFn = function(event, changesType, action, newItems, newItemsIndex, removedItems, removedItemsIndex) {
                if (changesType === 'collectionChanged' || changesType === 'indexesChanged') {
                    this._ladder = _private.prepareLadder(this);
                }
                if (changesType !== 'markedKeyChanged' && action !== 'ch') {
                    this._nextHeaderVersion();
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
            }.bind(this);
            // Events will not fired on the PresentationService, which is why setItems will not ladder recalculation.
            // Use callback for fix it. https://online.sbis.ru/opendoc.html?guid=78a1760a-bfcf-4f2c-8b87-7f585ea2707e
            this._model.setUpdateIndexesCallback(this._updateIndexesCallback.bind(this));
            this._model.subscribe('onListChange', this._onListChangeFn);
            this._model.subscribe('onMarkedKeyChanged', this._onMarkedKeyChangedFn);
            this._model.subscribe('onGroupsExpandChange', this._onGroupsExpandChangeFn);
            this._model.subscribe('onCollectionChange', this._onCollectionChangeFn);
            const separatorSizes = _private.getSeparatorSizes(this._options);
            this._options.rowSeparatorSize = separatorSizes.row;
            this._options.columnSeparatorSize = separatorSizes.column;
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
            this._model.setTheme(theme);
        },

        getTheme(): string {
            return this._model.getTheme();
        },

        _updateLastItemKey(): void {
            if (this.getItems()) {
                this._lastItemKey = ItemsUtil.getPropertyValue(this.getLastItem(), this.getKeyProperty());
            }
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
            if (columns && columns.length) {
                this._headerModel = {
                    isStickyHeader: this.isStickyHeader.bind(this),
                    getCurrentHeaderColumn: this.getCurrentHeaderColumn.bind(this),
                    getMultiSelectVisibility: this.getMultiSelectVisibility.bind(this),
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

        _nextHeaderVersion(): void {
            const headerModel = this.getHeaderModel();
            if (headerModel) {
                headerModel.nextVersion();
            }
        },

        getHeaderModel(): IHeaderModel {
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
            const multiSelectOffset = +hasMultiSelect;
            const headerColumn = {
                column: cell,
                index: columnIndex,
                shadowVisibility: 'visible'
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

                // У первой колонки не рисуем вертикальные разделители. startColumn - конфигурация GridLayout, начинается с 1.
                if (!cell.isActionCell && (startColumn - (hasMultiSelect ? 2 : 1))) {
                    const columnSeparatorSize = _private.getSeparatorForColumn(this._columns, startColumn - 1, this._options.columnSeparatorSize);
                    if (columnSeparatorSize !== null) {
                        cellClasses += ` controls-Grid__row-cell_withColumnSeparator controls-Grid__columnSeparator_size-${columnSeparatorSize}_theme-${theme}`;
                    }
                }
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

        setHasMoreData(hasMoreData: boolean, silent: boolean = false): boolean {
            if (this._model.setHasMoreData(hasMoreData)) {
                if (!silent) {
                    this._nextModelVersion(true);
                }
            }
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
            const hasMultiSelect = this._options.multiSelectVisibility !== 'hidden';
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

            if (!resultsColumn.column?.isActionCell && (columnIndex > hasMultiSelect ? 1 : 0)) {
                const columnSeparatorSize = _private.getSeparatorForColumn(
                    this._options.columns,
                    columnIndex - (hasMultiSelect ? 1 : 0),
                    this._options.columnSeparatorSize
                );

                if (columnSeparatorSize !== null) {
                    cellClasses += ' controls-Grid__row-cell_withColumnSeparator';
                    cellClasses += ` controls-Grid__columnSeparator_size-${columnSeparatorSize}_theme-${this._options.theme}`;
                }
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

        _setColumns(columns: IGridColumn[], silent: boolean = false): void {
            this._columns = this._prepareColumns(columns);
            this._ladder = _private.prepareLadder(this);
            this._prepareResultsColumns(this._columns, this._options.multiSelectVisibility !== 'hidden');
            this._prepareColgroupColumns(this._columns, this._options.multiSelectVisibility !== 'hidden');
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
        getIndexByKey: function() {
            return this._model.getIndexByKey.apply(this._model, arguments);
        },

        getSelectionStatus: function() {
            return this._model.getSelectionStatus.apply(this._model, arguments);
        },

        getNextItemKey: function() {
            return this._model.getNextItemKey.apply(this._model, arguments);
        },
        getValidItemForMarker: function(index) {
            return this._model.getValidItemForMarker(index);
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

            stickyColumn = getStickyColumn({
                stickyColumn: this._options.stickyColumn,
                columns: this._options.columns
            });

            current.isFullGridSupport = this.isFullGridSupport.bind(this);
            current.resolvers = this._resolvers;
            current.columnScroll = this._options.columnScroll;
            current.getColspanForColumnScroll = () => _private.getColspanForColumnScroll(self);
            current.getColspanFor = (elementName: string) => self.getColspanFor.apply(self, [elementName]);
            current.stickyColumnsCount = this._options.stickyColumnsCount;

            current.style = this._options.style;
            current.rowSeparatorSize = this._options.rowSeparatorSize;
            current.columnSeparatorSize = this._options.columnSeparatorSize;
            current.multiSelectClassList += current.hasMultiSelect ? ` controls-GridView__checkbox_theme-${this._options.theme}` : '';
            current.getSeparatorForColumn = _private.getSeparatorForColumn;
            current.isLastItem = (!navigation || navigation.view !== 'infinity' || !this.getHasMoreData()) &&
                                 (this.getCount() - 1 === this.getIndex(dispItem));

            current.getColumnAlignGroupStyles = (columnAlignGroup: number) => (
                _private.getColumnAlignGroupStyles(current, columnAlignGroup, self._shouldAddActionsCell())
            );

            const superShouldDrawMarker = current.shouldDrawMarker;
            current.shouldDrawMarker = (marker: boolean, columnIndex: number): boolean => {
                return columnIndex === 0 && superShouldDrawMarker.apply(this, [marker]);
            };
            current.shouldHighlightRow = (marker: boolean): boolean => superShouldDrawMarker.apply(this, [marker]);

            const style = current.style === 'masterClassic' || !current.style ? 'default' : current.style;
            current.getMarkerClasses = () => `controls-GridView__itemV_marker controls-GridView__itemV_marker_theme-${self._options.theme}
            controls-GridView__itemV_marker-${style}_theme-${self._options.theme}
            controls-GridView__itemV_marker-${style}_rowSpacingBottom-${current.itemPadding.bottom}_theme-${self._options.theme}
            controls-GridView__itemV_marker-${style}_rowSpacingTop-${current.itemPadding.top}_theme-${self._options.theme}`;

            if (current.multiSelectVisibility !== 'hidden') {
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

                    let stickyProperties = self._options.columns[0]?.stickyProperty;
                    if (stickyProperties && !(stickyProperties instanceof Array)) {
                        stickyProperties = [stickyProperties];
                    }
                    current.stickyProperties = stickyProperties;
                    current.stickyLadder = self._ladder.stickyLadder[current.index];
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
                    return columnAlignGroup !== undefined && columnAlignGroup < current.columns.length - (current.hasMultiSelect ? 1 : 0);
                };
                return current;
            }

            current.itemActionsDrawPosition = this._options.columnScroll ? 'after' : 'before';
            current.itemActionsColumnScrollDraw = this._options.columnScroll;

            current.columnIndex = 0;

            current.getVersion = function() {
                return self._calcItemVersion(current.item, current.key, current.index);
            };
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
                    if (!hasMainCell) {
                        result += ' controls-Grid__row-cell__ladder-spacing_theme-' + self._options.theme;
                    }
                }
                return result;
            };

            current.getSelectedClasses = () => {
                let result = '';

                const backgroundStyle = current.backgroundStyle || current.style || 'default';
                const isFullGridSupport = GridLayoutUtil.isFullGridSupport();
                const theme = self._options.theme;
                const style = current.style || 'default';

                result += ` controls-Grid__row-cell_selected controls-Grid__row-cell_selected-${style}_theme-${theme}`;

                // при отсутствии поддержки grid (например в IE, Edge) фон выделенной записи оказывается прозрачным,
                // нужно его принудительно установить как фон таблицы
                if (!isFullGridSupport && !current.isEditing) {
                    result += _private.getBackgroundStyle({backgroundStyle, theme}, true);
                }

                if (current.columnIndex === 0) {
                    result += ` controls-Grid__row-cell_selected__first-${style}_theme-${theme}`;
                }
                if (current.columnIndex === current.getLastColumnIndex()) {
                    result += ` controls-Grid__row-cell_selected__last controls-Grid__row-cell_selected__last-${style}_theme-${theme}`;
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
                        getLadderContentClasses: current.getLadderContentClasses,
                        getVersion: function () {
                           return _private.calcItemColumnVersion(self, current.getVersion(), this.columnIndex, this.index);
                        },
                        _preferVersionAPI: true,
                        gridCellStyles: '',
                        tableCellStyles: '',
                        getItemActionPositionClasses: current.getItemActionPositionClasses,
                        getItemActionClasses: current.getItemActionClasses
                    };
                currentColumn.classList = _private.getItemColumnCellClasses(current, self._options.theme, backgroundColorStyle);
                currentColumn.getColspanedPaddingClassList = (columnData, isColspaned) => {
                    /**
                     * isColspaned добавлена как костыль для временного лечения ошибки.
                     * После закрытия можно удалить здесь и из шаблонов.
                     * https://online.sbis.ru/opendoc.html?guid=4230f8f0-7fd1-4018-bd8c-08d703af3899
                     */
                    columnData.classList.padding.right = `controls-Grid__cell_spacingLastCol_${current.itemPadding.right}_theme-${self._options.theme}`;
                    return columnData.classList.padding;
                };
                currentColumn.column = current.columns[current.columnIndex];
                currentColumn.template = currentColumn.column.template ? currentColumn.column.template : self._columnTemplate;
                if (self._isSupportLadder(self._options.ladderProperties)) {
                    currentColumn.ladder = self._ladder.ladder[current.index];
                    currentColumn.ladderWrapper = LadderWrapper;
                }
                if (current.item.get) {
                    currentColumn.column.needSearchHighlight = current.searchValue ?
                        !!_private.isNeedToHighlight(current.item, currentColumn.column.displayProperty, current.searchValue) : false;
                    currentColumn.searchValue = current.searchValue;
                }
                if (stickyColumn) {
                    currentColumn.hiddenForLadder = currentColumn.columnIndex === (current.multiSelectVisibility !== 'hidden' ? stickyColumn.index + 1 : stickyColumn.index);
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

        setItems(items, cfg): void {
            this._model.setItems(items, cfg);
            this._updateLastItemKey();
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

                if (this._options.rowSeparatorSize) {
                    version = 'WITH_SEPARATOR_' + `${this._model.getHasMoreData()}_` + version;
                }
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
        getSwipeAnimation(): ANIMATION_STATE {
            return this._model.getSwipeAnimation();
        },

        // New Model compatibility
        setSwipeAnimation(animation: ANIMATION_STATE): void {
            this._model.setSwipeAnimation(animation);
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
            this._options.rowSeparatorSize = _private.getSeparatorSizes({
                rowSeparatorSize,
                rowSeparatorVisibility: this._options.rowSeparatorVisibility
            }).row;
            this._nextModelVersion();
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

        setDraggedItems(draggedItem: IFlatItemData, dragEntity: ItemsEntity): void {
            this._model.setDraggedItems(draggedItem, dragEntity);
        },
        setDragPosition(position: IDragPosition): void {
            this._model.setDragPosition(position);
        },
        resetDraggedItems(): void {
            this._model.resetDraggedItems();
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

        getPrevDragPosition(): IDragPosition {
            return this._model.getPrevDragPosition();
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
                const offsetForStickyColumn: number = +(this.shouldAddStickyLadderCell());

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
