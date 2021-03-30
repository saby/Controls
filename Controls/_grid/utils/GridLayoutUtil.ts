import {detection} from 'Env/Env';
import {isFullGridSupport, GridLayoutUtil} from 'Controls/display';

const OLD_IE_LAST_VERSION = 11;

const RegExps = {
    pxValue: new RegExp('^[0-9]+px$'),
    percentValue: new RegExp('^[0-9]+%$')
};

interface IColumnOptions {
    columnStart: number;
    columnSpan?: number;
    columnEnd?: number;
}

interface IRowOptions {
    rowStart: number;
    rowSpan?: number;
    rowEnd?: number;
}

function isOldIE(): boolean {
    return detection.isIE && detection.IEVersion <= OLD_IE_LAST_VERSION;
}

function isCompatibleWidth(width: string | number): boolean {
    return !!width && !!(`${width}`.match(RegExps.percentValue) || `${width}`.match(RegExps.pxValue));
}

function getColumnStyles(cfg: IColumnOptions): string {
    const columnStart = cfg.columnStart + 1;
    const columnSpan = typeof cfg.columnEnd !== 'undefined' ? (cfg.columnEnd - cfg.columnStart) : (cfg.columnSpan || 1);
    const columnEnd = (cfg.columnEnd || (cfg.columnStart + columnSpan)) + 1;

    return toCssString([
        {name: 'grid-column-start', value: columnStart},
        {name: 'grid-column-end', value: columnEnd},
        {name: '-ms-grid-column', value: columnStart, applyIf: detection.isIE},
        {name: '-ms-grid-column-span', value: columnSpan, applyIf: detection.isIE}
    ]);
}

function getRowStyles(cfg: IRowOptions): string {
    const rowStart = cfg.rowStart + 1;
    const rowSpan = typeof cfg.rowEnd !== 'undefined' ? (cfg.rowEnd - cfg.rowStart) : (cfg.rowSpan || 1);
    const rowEnd = (cfg.rowEnd || (cfg.rowStart + rowSpan)) + 1;

    return toCssString([
        {name: 'grid-row-start', value: rowStart},
        {name: 'grid-row-end', value: rowEnd},
        {name: '-ms-grid-row', value: rowStart, applyIf: detection.isIE},
        {name: '-ms-grid-row-span', value: rowSpan, applyIf: detection.isIE}
    ]);
}

function getCellStyles(cfg: IColumnOptions & IRowOptions): string {
    return getColumnStyles(cfg) + ' ' + getRowStyles(cfg);
}

function getMultiHeaderStyles(columnStart: number,
                              columnEnd: number,
                              rowStart: number,
                              rowEnd: number,
                              additionalColumn: number,
                              ladderCellsCount: number = 0): string {
    let startColumn = columnStart;
    let endColumn = columnEnd;

    if (ladderCellsCount === 1) {
        startColumn = startColumn + 1;
        endColumn = endColumn + 1;
    }
    if (ladderCellsCount === 2) {
        startColumn = startColumn > 1 ? startColumn + 2 : startColumn + 1;
        endColumn = endColumn + 2;
    }
    return getCellStyles({
        columnStart: startColumn + additionalColumn - 1,
        columnEnd: endColumn + additionalColumn - 1,
        rowStart: rowStart - 1,
        rowEnd: rowEnd - 1
    });
}

function getGridLayoutStyles(): string {
    return toCssString([
        {name: 'display', value: 'grid'},
        {name: 'display', value: '-ms-grid', applyIf: detection.isIE}
    ]);
}

export const getDefaultColumnWidth = GridLayoutUtil.getDefaultColumnWidth;
export const toCssString = GridLayoutUtil.toCssString;
export const getTemplateColumnsStyle = GridLayoutUtil.getTemplateColumnsStyle;

export {
    isCompatibleWidth,
    RegExps,

    isFullGridSupport,
    isOldIE,

    getColumnStyles,
    getRowStyles,
    getCellStyles,
    getGridLayoutStyles,
    getMultiHeaderStyles
};
