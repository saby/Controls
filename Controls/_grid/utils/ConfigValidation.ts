import {TColumns} from '../display/interface/IColumn';
import {THeader} from '../display/interface/IHeaderCell';
import {TFooter} from '../display/interface/IFooter';
import {TEmptyTemplateColumns} from '../display/interface/IEmptyTemplateColumns';
import {GridLayoutUtil} from 'Controls/display';
import {Logger} from 'UI/Utils';

const ERROR_MSG = {
    INVALID_COLUMN_WIDTH: 'Error in Controls/grid:View: invalid column width value.\n' +
        'Please set valid value following the instructions https://wi.sbis.ru/docs/js/Controls/grid/IColumn/options/width\n\n' +
        'columns = [\n\t{\n\t\twidth: \'${width}\',\n\t\t...\n\t},\n\t...\n]\n',
    COLUMNS_ARE_REQUIRED: 'Grid columns is undefined or empty! Please set columns for correct control behaviour.\n' +
        'Dont set empty columns to hide grid!',
    FIRST_COLUMN_INDEX_IS_NOT_ONE: 'Invalid columns indexes configuration!\nFirst column index is not equal to "1". ' +
        'Please set it to one or undefined.\ncolumns = [\n\t{\n\t\tstartColumn: \'${startColumn}\',\n\t\t...\n\t},\n\t...\n]\n',
    END_OF_COLUMN_IS_NOT_A_START_OF_NEXT: 'Invalid columns indexes configuration! ' +
        'End column index in columns is not equal to start column index of next.\n' +
        'Columns should set in column indexes order, for ex. \n[\n\t{startColumns: 1, endColumns: 3},\n\t{startColumns: 3, endColumns: 4}\n]\n',
    LAST_COLUMN_END_INDEX_IS_NOT_COLUMNS_END: 'Invalid columns indexes configuration!\nEnd column index of last column is not ' +
        'equal to end column index of last column in grid.\n\n' +
        'End column index of last column in grid: ${gridColumnsEnd};\n' +
        'End column index of last column in option: ${columnsEnd};',
    COLUMN_INDEX_OUT_OF_GRID_COLUMNS_RANGE: 'Invalid columns indexes configuration!\n' +
        'End column index of column is out of grid columns range.\n\n' +
        'End column index of last column in grid: ${gridColumnsEnd};\n' +
        'End column index of last column in option: ${columnsEnd};',
    START_INDEX_REQUIRE_END_INDEX: 'Invalid header columns configuration! Indexes configuration can work correctly only in pair.\n' +
        'If start index setted, end index is required and vice-versa.',
    NOT_ALL_COLUMN_INDEXES_SETTED: 'Invalid header columns configuration! Column indexes setted not in all columns. ' +
        'Please set it for correct control behaviour.',
    NOT_ALL_ROW_INDEXES_SETTED: 'Invalid header columns configuration! Row indexes setted not in all columns. ' +
        'Please set it for correct control behaviour.',
    ROW_INDEX_SETTED_BUT_COLUMNS_INDEXES_NOT: 'Invalid header columns configuration! Row indexes setted, but column indexes setted not in all columns. ' +
        'Please set it for correct control behaviour.',
    HEADER_CELL_COLLISION: 'Invalid header columns configuration! Please check columns indexes. \n' +
        'There are a few reasons of error:\n' +
        '1. Header columns length is not equal to grid column length.\n' +
        '2. Header cell indexes is not match to grid column config.\n' +
        'Indexes must be in range from 1 to ${gridColumnsLength}.\n' +
        'Maybe, first columns in any row starts not from 1 or last columns separated from right edge of grid or gap exists between any columns/rows.\n' +
        'Also column indexes may be out of grid columns range.\n' +
        '3. One of header cell overflows other header cell.'
};

interface IGridParts {
    header?: THeader;
    columns?: TColumns;
    footer?: TFooter;
    emptyTemplateColumns?: TEmptyTemplateColumns;
}

type TLogType = 'error' | 'warn' | 'throw' | false;

const notify = (msg: string, logType: TLogType = 'error'): void | never => {
    if (logType) {
        if (logType === 'throw') {
            throw Error(msg);
        } else {
            Logger[logType](msg);
        }
    }
};

const checkRequiredCellIndexes = (headerConfig: THeader, logType: TLogType): boolean => {
    const hasCellWithConfig = {row: false, column: false};
    const hasCellWithOutConfig = {row: false, column: false};

    const checkCell = (cell: THeader[number], type: 'Row' | 'Column'): boolean => {
        const hasStart = typeof cell[`start${type}`] === 'number';
        const hasEnd = typeof cell[`end${type}`] === 'number';

        if (hasStart && hasEnd) {
            // Заданы и начало и конец диапазона. Правильно в контексте ячейки.
            hasCellWithConfig[type.toLowerCase()] = true;
        } else if (!(!hasStart && !hasEnd)) {
            // Задано только начало или только конец диапазона, неправильная конфигурация.
            notify(ERROR_MSG.START_INDEX_REQUIRE_END_INDEX, logType);
            return false;
        } else {
            // Не задано ни начало ни конец диапазона, правильно в контексте ячейки.
            hasCellWithOutConfig[type.toLowerCase()] = true;
        }

        return true;
    };

    for (let i = 0; i < headerConfig.length; i++) {
        if (!checkCell(headerConfig[i], 'Row') || !checkCell(headerConfig[i], 'Column')) {
            return false;
        }
    }

    // Обработка ошибочной конфигурации.
    // Пара начало/конец колонки задана не на всех ячейках.
    // Если конфигурация колспана задана хотябы на одной ячейке, то она обязательно должна быть указана на всех ячейках.
    if (hasCellWithConfig.column && hasCellWithOutConfig.column) {
        notify(ERROR_MSG.NOT_ALL_COLUMN_INDEXES_SETTED, logType);
        return false;
    }

    // Пара начало/конец строки задана не на всех ячейках.
    // Если конфигурация роуспана задана хотябы на одной ячейке, то она обязательно должна быть указана на всех ячейках.
    if (hasCellWithConfig.row && hasCellWithOutConfig.row) {
        notify(ERROR_MSG.NOT_ALL_ROW_INDEXES_SETTED, logType);
        return false;
    }

    // Задана конфигурация индексов строки, но не задана конфигурация индексов колонок.
    // Если задана конфигурация строк, то обязательна конфигурация колонок
    if (hasCellWithConfig.row && hasCellWithOutConfig.column) {
        notify(ERROR_MSG.ROW_INDEX_SETTED_BUT_COLUMNS_INDEXES_NOT, logType);
        return false;
    }
    return true;
};

const _validateBaseColumnsIndexes = (columns: TColumns, partColumns: TFooter | TEmptyTemplateColumns, optionName?: string, logType: TLogType = 'error'): boolean => {
    const prefix = optionName ? `[${optionName}] ` : '';
    const maxGridColumnEndIndex = columns.length + 1;

    let prevColumnEnd = 1;
    for (let i = 0; i < partColumns.length; i++) {
        const startColumn = typeof partColumns[i].startColumn === 'number' ? partColumns[i].startColumn : prevColumnEnd;
        const endColumn = typeof partColumns[i].endColumn === 'number' ? partColumns[i].endColumn : (startColumn + 1);

        // Начало следующей колонки должно быть концом предыдущей, без исключений.
        if (startColumn !== prevColumnEnd) {
            if (i === 0) {
                notify(
                    prefix + ERROR_MSG.FIRST_COLUMN_INDEX_IS_NOT_ONE.replace('${startColumn}', `${startColumn}`),
                    logType
                );
            } else {
                notify(prefix + ERROR_MSG.END_OF_COLUMN_IS_NOT_A_START_OF_NEXT, logType);
            }
            return false;
        }

        prevColumnEnd = endColumn;

        if (prevColumnEnd > maxGridColumnEndIndex) {
            notify(
                prefix + ERROR_MSG.COLUMN_INDEX_OUT_OF_GRID_COLUMNS_RANGE
                    .replace('${gridColumnsEnd}', `${maxGridColumnEndIndex}`)
                    .replace('${columnsEnd}', `${prevColumnEnd}`),
                logType
            );
            return false;
        }
    }

    if (prevColumnEnd !== maxGridColumnEndIndex) {
        notify(
            prefix + ERROR_MSG.LAST_COLUMN_END_INDEX_IS_NOT_COLUMNS_END
                .replace('${gridColumnsEnd}', `${maxGridColumnEndIndex}`)
                .replace('${columnsEnd}', `${prevColumnEnd}`),
            logType
        );
        return false;
    }

    return true;
};

const _validateHeader = (columnsConfig: TColumns, headerConfig: THeader, logType: TLogType = 'error'): boolean => {
    // Если заданы границы для колонок или строк, то нужно задать на всех ячейках соответствующие опции.
    if (!checkRequiredCellIndexes(headerConfig, logType)) {
        return false;
    }

    let maxRowEnd = 2;
    let maxColumnEnd = columnsConfig.length + 1;
    headerConfig.forEach((c) => {
        if (typeof c.endRow !== 'undefined') {
            maxRowEnd = Math.max(maxRowEnd, c.endRow);
        }
        if (typeof c.endColumn !== 'undefined') {
            maxColumnEnd = Math.max(maxColumnEnd, c.endColumn);
        }
    });

    if (maxRowEnd <= 2) {
        maxColumnEnd = Math.max(maxColumnEnd, headerConfig.length + 1);
    }

    if (maxColumnEnd > columnsConfig.length + 1) {
        notify(ERROR_MSG.HEADER_CELL_COLLISION, logType);
        return false;
    }

    const headerTable = new Array(maxRowEnd - 1);

    for (let i = 0; i < headerTable.length; i++) {
        headerTable[i] = new Array(maxColumnEnd - 1);
    }

    headerConfig.forEach((cellConfig, index) => {
        for (let rowIndex = (cellConfig.startRow || 1) - 1; rowIndex < ((cellConfig.endRow || 2) - 1); rowIndex++) {
            const startColumn = cellConfig.startColumn || (index + 1);
            const endColumn = cellConfig.endColumn || (startColumn + 1);

            for (let columnIndex = startColumn - 1; columnIndex < (endColumn - 1); columnIndex++) {
                headerTable[rowIndex][columnIndex] = headerTable[rowIndex][columnIndex] === undefined;
            }
        }
    });

    for (let i = 0; i < headerTable.length; i++) {
        for (let j = 0; j < headerTable[i].length; j++) {
            if (headerTable[i][j] !== true) {
                notify(ERROR_MSG.HEADER_CELL_COLLISION, logType);
                return false;
            }
        }
    }

    return true;
};

const validateColumnsWidths = (columns: TColumns, logType: TLogType = 'error'): boolean => {
    return columns.reduce((acc, column) => {
        if (!column.width || GridLayoutUtil.isValidWidthValue(column.width)) {
            return acc && true;
        } else {
            notify(ERROR_MSG.INVALID_COLUMN_WIDTH.replace('${width}', column.width), logType);
            return false;
        }
    }, true);
};

const validateGridParts = ({header, columns, footer, emptyTemplateColumns}: IGridParts, logType: TLogType = 'error'): boolean => {
    if (!(columns && columns.length)) {
        notify(ERROR_MSG.COLUMNS_ARE_REQUIRED, logType);
        return false;
    }

    if (!validateColumnsWidths(columns, logType)) {
        return false;
    }

    if (header && header.length) {
        if (!_validateHeader(columns, header, logType)) {
            return false;
        }
    }

    if (footer && footer.length) {
        if (!_validateBaseColumnsIndexes(columns, footer, 'IFooter', logType)) {
            return false;
        }
    }

    if (emptyTemplateColumns && emptyTemplateColumns.length) {
        if (!_validateBaseColumnsIndexes(columns, emptyTemplateColumns, 'IEmptyTemplateColumns', logType)) {
            return false;
        }
    }

    return true;
};

export {
    ERROR_MSG,
    IGridParts,
    validateGridParts
};
