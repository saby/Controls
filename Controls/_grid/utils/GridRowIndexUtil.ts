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
    return getItemRealIndex({
        ...cfg,
        index: cfg.display.getIndexByKey(cfg.id)
    });
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

    if (cfg.resultsPosition === 'bottom') {
        const itemsCount = cfg.display.getCount();

        if (itemsCount) {
            index += itemsCount;
        } else {
            index += cfg.hasEmptyTemplate ? 1 : 0;
        }

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
    let index = 0;
    const isResultsInTop = cfg.resultsPosition === 'top';
    const itemsCount = cfg.display.getCount();

    index += cfg.hasHeader ? 1 : 0;
    index += isResultsInTop ? 1 : 0;
    index += cfg.multiHeaderOffset ? cfg.multiHeaderOffset : 0;
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
    const hasResults = !!cfg.resultsPosition;
    const itemsCount = cfg.display.getCount();
    let index = 0;

    index += cfg.hasHeader ? 1 : 0;
    index += hasResults ? 1 : 0;
    index += cfg.hasBottomPadding ? 1 : 0;
    index += cfg.multiHeaderOffset ? cfg.multiHeaderOffset : 0;
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
 * @param {Array} headerRows Массив строк _headerRows.
 * @return {Number} Массив Максимальная строка.
 */
function getHeaderMaxEndCellData(headerRows: IHeaderCell[][]): {maxRow: number, maxColumn: number} {
    const result = {
        maxRow: 0,
        maxColumn: 0
    };
    const isMultiColumn = headerRows.length > 1;
    headerRows.forEach((headerRow) => {
        headerRow.forEach((cell, i) => {
            if (isMultiColumn && cell.endRow !== undefined && cell.endRow > result.maxRow) {
                result.maxRow = cell.endRow;
            }
            if (cell.endColumn !== undefined && cell.endColumn > result.maxColumn) {
                result.maxColumn = cell.endColumn;
            }
        });
    });
    // If header isn't multiple we should be careful, because endColumn and endRow are unnecessary
    if (!isMultiColumn) {
        if (!result.maxColumn) {
            // calculating w/o consideration of multiselect column
            // we need +1 here, because otherwise it calculates incorrect last right column side
            result.maxColumn = headerRows[0].length + 1;
        }
        result.maxRow = SINGLE_HEADER_MAX_ROW;
    }
    return result;
}

/**
 * Функция создания массива строк хэдера из массива объектов IHeaderCell.
 * @param {Array} cells Массив объектов IHeaderCell.
 * @param {Boolean} [hasMultiSelect] Отображаются чекбоксы или нет.
 * @param {Boolean} [isMultiHeader] активированы ли для grid множественные заголовки
 * @param {Boolean} [hasActionsCell] Необходимо ли добавлять ячейку действий
 * @param {Number} [stickyLadderCellsCount] Количество ячеек, добавляемых для лесенки
 * @return {Array} массив строк хэдера.
 * @example
 * const headerCells: IHeaderCell[] = [{title: 'name', startRow: 1, endRow: 2...}, {title: 'Price', startRow: 2, endRow: 3...}, ...];
 * let headerRowsArray = getHeaderRowsArray(headerCells, true, true, false, false);
 * // [[{}, {title: 'name', startRow: 1, endRow: 2...}}], [{{title: 'Price', startRow: 2, endRow: 3...}}], ...]
 *
 * let headerRowsArray = getHeaderRowsArray(headerCells, true, true, false, 2);
 * // [[{}, {}, {title: 'name', startRow: 1, endRow: 2...}}], {}, [{{title: 'Price', startRow: 2, endRow: 3...}}], ...]
 *
 * let headerRowsArray = getHeaderRowsArray(headerCells, true, true, true, 1);
 * // [[{}, {}, {title: 'name', startRow: 1, endRow: 2...}}], [{{title: 'Price', startRow: 2, endRow: 3...}}], ..., {isActionCell: true, endColumn: ...}]
 */

function getHeaderRowsArray(cells: IHeaderCell[], hasMultiSelect: boolean, isMultiHeader?: boolean, hasActionsCell?: boolean, stickyLadderCellsCount?: number): IHeaderCell[][] {
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
    if (stickyLadderCellsCount === 2 ) {
        headerRows[0] = [{ladderCell: true}, headerRows[0][0], {ladderCell: true}].concat(headerRows[0].slice(1));
    } else if (stickyLadderCellsCount === 1) {
        headerRows[0] = [{ladderCell: true}].concat(headerRows[0]);
    }
    if (hasMultiSelect) {
        headerRows[0] = [{}, ...headerRows[0]];
    }
    if (hasActionsCell) {
        // For multiple headers we have to calculate at least endColumn here, because it is used
        // by ColumnsScroll ScrollWrapper to get the last column number
        headerRows[0] = [...headerRows[0], getHeaderActionsCellConfig(cells, isMultiHeader)];
    }
    return headerRows;
}

/**
 * Производит расчёт параметров экшн-ячейки
 * @param headerRow
 * @param isMultiHeader
 * caption: "Код"
 */
function getHeaderActionsCellConfig(headerRow: IHeaderCell[], isMultiHeader: boolean): IHeaderCell {
    let minStartRow = Number.MAX_VALUE;
    let maxEndRow = 0;
    let maxEndColumn = 0;

    // Бывают случаи, когда в не-multiHeader headerRow приходит массив IHeaderCell из трёх, например, записей.
    // При этом у одной из них указан startRow, endRow и endColumn так, что явно объединяются несколько колонок.
    // В этих случаях старым методом (если не-multiHeader, то maxEndColumn = headerRow.length + 1;) происходит
    // некорректный расчёт maxEndColumn. Это влияет в дальнейшем на расчёт в методе getHeaderMaxEndCellData,
    // и для headerRow, в которых IHeaderCell объединяют несколько колонок последняя колонка считалась не правильно.
    // Это потенциальная ошибка, и в таких случаях было не понятно, почему у actionCell, которая по факту последняя,
    // maxEndRow могла посчитаться на несколько колонок раньше реально последней колонки.
    headerRow.forEach((cell) => {
        minStartRow = cell.startRow && cell.startRow < minStartRow ? cell.startRow : minStartRow;
        maxEndRow = cell.endRow && cell.endRow > maxEndRow ? cell.endRow : maxEndRow;
        maxEndColumn = cell.endColumn && cell.endColumn > maxEndColumn ? cell.endColumn : maxEndColumn;
    });

    // В случае, когда в не-isMultiHeader headerRow приходят ячейки IHeaderCell без endColumn, мы должны исходить из
    // величины текущего headerRow + 1.
    // Задаём maxEndColumn явно, как величину headerRow + 1, что соответствует правой границе grid-column.
    if (!isMultiHeader && maxEndColumn === 0) {
        maxEndColumn = headerRow.length + 1;
    }

    // В случае, если minStartRow не была высчитана, то начинаем с первой строки
    if (minStartRow === Number.MAX_VALUE) {
        minStartRow = 1;
    }

    return {
        isActionCell: true,
        startRow: minStartRow,
        endRow: maxEndRow > 0 ? maxEndRow : minStartRow + 1,
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
