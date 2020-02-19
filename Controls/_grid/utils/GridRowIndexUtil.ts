import ItemsUtil = require('Controls/_list/resources/utils/ItemsUtil')
import {Collection, CollectionItem} from 'Controls/display'
import {IHeaderCell} from '../interface/IHeaderCell';

/**
 * @author Родионов Е.А.
 */

const SINGLE_HEADER_MAX_ROW = 2;

/**
 * @typedef {Object} IBaseGridRowIndexOptions Конфигурационый объект.
 * @param {'Controls/display'} display Проекция элементов списка.
 * @param {Boolean} hasHeader Флаг, указывающий на наличие заголовка в таблице.
 * @param {"top" | "bottom" | null} resultsPosition Позиция результатов таблицы. Null, если результаты не выводятся.
 */
interface IBaseGridRowIndexOptions {
    display: Collection<unknown, CollectionItem<unknown>>;
    hasHeader: boolean;
    hasBottomPadding: boolean;
    resultsPosition?: 'top' | 'bottom';
    multiHeaderOffset?: number;
    editingRowIndex?: number;
    hasColumnScroll?: boolean;
}

/**
 * @typedef {Object} ItemId Объект расширяющий базовую конфигурацию для получения индекса записи по идентификатору элемента таблицы.
 * @param {string} id Идентификатор элемента таблицы.
 */
type ItemId = { id: string };

/**
 * @typedef {Object} DisplayItem Объект расширяющий базовую конфигурацию для получения индекса записи по элементу проекции.
 * @param {'Controls/display:CollectionItem'} item Элемент проекции таблицы.
 */
type DisplayItem = { item: CollectionItem<unknown> };

/**
 * @typedef {Object} DisplayItemIndex Объект расширяющий базовую конфигурацию для получения индекса записи по индексу элемента в проекции.
 * @param {number} index Индекс элемента в проекции.
 */
type DisplayItemIndex = { index: number }

/**
 * @typedef {Object} HasEmptyTemplate Объект расширяющий базовую конфигурацию, необходимый для расчета номера строки подвала и итогов таблицы.
 * @param {Boolean} hasEmptyTemplate Флаг, указывающий, задан ли шаблон отображения пустого списка.
 */
type HasEmptyTemplate = { hasEmptyTemplate: boolean };

/**
 * @typedef {IBaseGridRowIndexOptions & (DisplayItemIndex|DisplayItem|ItemId|HasEmptyTemplate)} GridRowIndexOptions Конфигурационый объект.
 */
type GridRowIndexOptions<T = DisplayItemIndex|DisplayItem|ItemId|HasEmptyTemplate> = IBaseGridRowIndexOptions & T;



/**
 * Возвращает номер строки в списке для элемента с указанным id.
 *
 * @param {GridRowIndexOptions<ItemId>} cfg Конфигурационый объект.
 * @return {Number} Номер строки в списке для элемента с указанным id.
 */
function getIndexById(cfg: GridRowIndexOptions<ItemId>): number {
    let
        idProperty = cfg.display.getIdProperty() || (<Collection<unknown>>cfg.display.getCollection()).getKeyProperty(),
        item = ItemsUtil.getDisplayItemById(cfg.display, cfg.id, idProperty),
        index = cfg.display.getIndex(item);

    return getItemRealIndex(<GridRowIndexOptions<DisplayItemIndex>>{index, ...cfg});
}



/**
 * Возвращает номер строки в списке для указанного элемента.
 *
 * @param {GridRowIndexOptions<DisplayItem>} cfg Конфигурационый объект.
 * @return {Number} Номер строки в списке для указанного элемента проекции.
 */
function getIndexByItem(cfg: GridRowIndexOptions<DisplayItem>): number {
    let index = cfg.display.getIndex(cfg.item);
    return getItemRealIndex(<GridRowIndexOptions<DisplayItemIndex>>{index, ...cfg});

}



/**
 * Возвращает номер строки в списке для элемента с указанным индексом в проекции.
 *
 * @param {GridRowIndexOptions<DisplayItemIndex>} cfg Конфигурационый объект.
 * @return {Number} Номер строки элемента списка с указанным индексом в проекции.
 */
function getIndexByDisplayIndex(cfg: GridRowIndexOptions<DisplayItemIndex>): number {
    return getItemRealIndex(cfg);
}



/**
 * Возвращает номер строки в списке для строки результатов.
 *
 * @param {GridRowIndexOptions<HasEmptyTemplate>} cfg Конфигурационый объект.
 * @return {Number} Номер строки в списке для строки результатов.
 */
function getResultsIndex(cfg: GridRowIndexOptions<HasEmptyTemplate>): number {

    let index = cfg.hasHeader ? 1 : 0;
    index += cfg.multiHeaderOffset ? cfg.multiHeaderOffset : 0;

    if (cfg.resultsPosition === "bottom") {
        let
            itemsCount = cfg.display.getCount(),
            hasEditingItem = typeof cfg.editingRowIndex === "number";

        if (itemsCount) {
            index += itemsCount;
        } else {
            index += cfg.hasEmptyTemplate ? 1 : 0;
        }

        index += hasEditingItem ? 1 : 0;
        index += cfg.hasBottomPadding ? 1 : 0;
    }

    return index;
}


/**
 * Возвращает номер строки в списке для строки-отступа между последней записью в таблице и
 * результатами/подвалом/нижней границей таблицы.
 *
 * @param {GridRowIndexOptions} cfg Конфигурационый объект.
 * @return {Number} Номер строки в списке для строки-отступа.
 */
function getBottomPaddingRowIndex(cfg: GridRowIndexOptions): number {
    let
        index = 0,
        isResultsInTop = cfg.resultsPosition === "top",
        itemsCount = cfg.display.getCount(),
        hasEditingItem = typeof cfg.editingRowIndex === "number";

    index += cfg.hasHeader ? 1 : 0;
    index += isResultsInTop ? 1 : 0;
    index += cfg.multiHeaderOffset ? cfg.multiHeaderOffset : 0;
    index += hasEditingItem ? 1 : 0;
    index += itemsCount;
    index += cfg.hasColumnScroll ? 1 : 0;

    return index;
}


/**
 * Возвращает номер строки в списке для строки подвала.
 *
 * @param {GridRowIndexOptions<HasEmptyTemplate>} cfg Конфигурационый объект.
 * @return {Number} Номер строки в списке для строки подвала
 */
//offset
function getFooterIndex(cfg: GridRowIndexOptions<HasEmptyTemplate>): number {
    let
        hasResults = !!cfg.resultsPosition,
        itemsCount = cfg.display.getCount(), index = 0,
        hasEditingItem = typeof cfg.editingRowIndex === "number";

    index += cfg.hasHeader ? 1 : 0;
    index += hasResults ? 1 : 0;
    index += cfg.hasBottomPadding ? 1 : 0;
    index += cfg.multiHeaderOffset ? cfg.multiHeaderOffset : 0;
    index += hasEditingItem ? 1 : 0;
    index += cfg.hasColumnScroll ? 1 : 0;

    if (itemsCount) {
        index += itemsCount;
    } else {
        index += cfg.hasEmptyTemplate ? 1 : 0;
    }

    return index;
}



/**
 * Возвращиет отступ сверху для первой записи списка.
 *
 * @param {GridRowIndexOptions.hasHeader} hasHeader Флаг, указывающий на наличие заголовка в таблице.
 * @param {GridRowIndexOptions.resultsPosition} resultsPosition Позиция результатов таблицы. Null, если результаты не выводятся.
 * @return {Number} Отступ сверху для первой записи списка
 */
//offset
function getTopOffset(hasHeader: boolean, resultsPosition: GridRowIndexOptions["resultsPosition"] = null, multiHeaderOffset: number, hasColumnScroll: boolean): number {
    let
        topOffset = 0;
    topOffset += multiHeaderOffset ? multiHeaderOffset : 0;
    topOffset += hasHeader ? 1 : 0;
    topOffset += resultsPosition === "top" ? 1 : 0;
    topOffset += hasColumnScroll ? 1 : 0;

    return topOffset;
}



/**
 * Функция расчета номера строки в списке для элемента с указанным индексом в проекции.
 *
 * @private
 * @param {GridRowIndexOptions<HasEmptyTemplate>} cfg Конфигурационый объект.
 * @return {Number} Номера строки в списке для элемента с указанным индексом в проекции.
 */
// offset
function getItemRealIndex(cfg: GridRowIndexOptions<DisplayItemIndex>): number {
    return cfg.index + getTopOffset(cfg.hasHeader, cfg.resultsPosition, cfg.multiHeaderOffset, cfg.hasColumnScroll);
}


/**
 * Функция takeWhile, для пика элеменотов до условия в отсортированном массиве.
 */
const takeWhile = (f, xs) => xs.length ? takeWhileNotEmpty(f, xs) : [];
const takeWhileNotEmpty = (f, [x, ...xs]) =>  f(x) ? [x, ...takeWhile(f, xs)] : [];

/**
 * Функция сортировки колонок хэдера начиная с левой стороны.
 * @param {Array} array Массив строк хэдера.
 * @return {Array} Отсортированный массив строк хэдера.
 */
function sortedColumns(array) {
    return array.map((cur) => {
        const sort = cur.sort((a, b) => {
            if (a.startColumn > b.startColumn) {
                return 1;
            }
            if (a.startColumn < b.startColumn) {
                return -1;
            }
            return 0;
        });
        return sort;
    });
}

/**
 * Функция подсчета строк в массиве объектов columns.
 * @param {Array} array Массив объектов columns.
 * @return {Number} Колличество строк в хэдере.
 */

function getRowsCount(array): number {
    let maxEndRow = 0;
    array.forEach((cur) => {
        if (cur.endRow > maxEndRow) {
            maxEndRow = cur.endRow;
        }
    });
    return maxEndRow - 1;
}

/**
 * Функция подсчета максимальной строки в массиве строк.
 * @param {Array} cells Массив строк _headerRows.
 * @return {Number} Массив Максимальная строка.
 */
function getHeaderMaxEndCellData(cells: IHeaderCell[][]): {maxRow: number, maxColumn: number} {
    const result = {
        maxRow: 0,
        maxColumn: 0
    };
    const isMultiColumn = cells.length > 1;
    cells.forEach((cur) => {
        cur.forEach((c) => {
            if (isMultiColumn && c.endRow !== undefined && c.endRow > result.maxRow) {
                result.maxRow = c.endRow;
            }
            if (c.endColumn !== undefined && c.endColumn > result.maxColumn) {
                result.maxColumn = c.endColumn;
            }
        });
    });
    // If header isn't multiple we should be careful, because endColumn and endRow are unnecessary
    if (!isMultiColumn) {
        if (!result.maxColumn) {
            result.maxColumn = cells[0].length + 1;
}
        result.maxRow = SINGLE_HEADER_MAX_ROW;
    }
    return result;
}

/**
 * Функция создания массива строк хэдера из массива объектов IHeaderCell.
 * @param {Array} cells Массив объектов IHeaderCell.
 * @param {Boolean} hasMultiSelect Отображаются чекбоксы или нет.
 * @param {Boolean} isMultiHeader активированы ли для grid множественные заголовки
 * @param {Boolean} hasActionsCell Необходимо ли добавлять ячейку действий
 * @return {Array} массив строк хэдера.
 * @example getHeaderRowsArray(
 *  [{title: 'name', startRow: 1, endRow: 2...}, {title: 'Price', startRow: 2, endRow: 3...}, ...], true
 *  ) -> [[{}, {title: 'name', startRow: 1, endRow: 2...}}], [{{title: 'Price', startRow: 2, endRow: 3...}}], ...]
 */

function getHeaderRowsArray(cells: IHeaderCell[], hasMultiSelect: boolean, isMultiHeader?: boolean, hasActionsCell?: boolean, stickyLadderCell?: boolean): IHeaderCell[][] {
    let headerRows = [];
    if (!isMultiHeader) {
        headerRows.push(cells);
    } else {
        let sortedArray = cells.sort((a, b) => {
            if (a.startRow > b.startRow) {
                return 1;
            }
            if (a.startRow < b.startRow) {
                return -1;
            }
            return 0;
        });
        for (let i = 1, rows = getRowsCount(sortedArray); i <= rows; i++) {
            const odd = (x) => x.startRow === i || x.isBreadCrumbs;
            const row = takeWhile(odd, sortedArray);
            headerRows.push(row);
            sortedArray = sortedArray.slice(row.length);
        }
        headerRows = sortedColumns(headerRows);
    }
    if (stickyLadderCell) {
        headerRows[0] = [{}, ...headerRows[0]];
    }
    if (hasMultiSelect) {
        headerRows[0] = [{}, ...headerRows[0]];
    }
    if (hasActionsCell) {
        // For multiple headers we have to calculate at least endColumn here, because it is used
        // by ColumnsScroll ScrollWrapper to get the last column number
        // If header isn't multiple we shouldn't care about startColumn, endColumn etc
        headerRows[0] = [...headerRows[0], (isMultiHeader ? getHeaderActionsCellConfig(cells) : {isActionCell: true})];
    }
    return headerRows;
}

/**
 * Производит расчёт параметров экшн-ячейки
 * @param cells
 * caption: "Код"
 */
function getHeaderActionsCellConfig(cells: IHeaderCell[]): IHeaderCell {
    let minStartRow = Number.MAX_VALUE;
    let maxEndRow = 0;
    let maxEndColumn = 0;

    cells.forEach((cell) => {
        minStartRow = cell.startRow < minStartRow ? cell.startRow : minStartRow;
        maxEndRow = cell.endRow > maxEndRow ? cell.endRow : maxEndRow;
        maxEndColumn = cell.endColumn > maxEndColumn ? cell.endColumn : maxEndColumn;
    });

    return {
        isActionCell: true,
        startRow: minStartRow,
        endRow: maxEndRow,
        startColumn: maxEndColumn,
        endColumn: maxEndColumn + 1
    };
}

export {
    ItemId,
    DisplayItem,
    DisplayItemIndex,
    HasEmptyTemplate,

    IBaseGridRowIndexOptions,
    GridRowIndexOptions,

    getIndexById,
    getIndexByItem,
    getIndexByDisplayIndex,
    getResultsIndex,
    getFooterIndex,
    getTopOffset,
    getBottomPaddingRowIndex,
    getHeaderRowsArray,
    getHeaderMaxEndCellData
};
