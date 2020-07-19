import {detection} from 'Env/Env';

interface ICssRule {
    name: string;
    value: string | number;
    applyIf?: boolean;
}

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

export function getColumnStyles(cfg: IColumnOptions): string {
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

export function getRowStyles(cfg: IRowOptions): string {
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

export function getCellStyles(cfg: IColumnOptions & IRowOptions): string {
    return getColumnStyles(cfg) + ' ' + getRowStyles(cfg);
}

export function getMultiHeaderStyles(columnStart: number, columnEnd: number, rowStart: number, rowEnd: number, additionalColumn: number): string {
    return getCellStyles({
        columnStart: columnStart + additionalColumn - 1,
        columnEnd: columnEnd + additionalColumn - 1,
        rowStart: rowStart - 1,
        rowEnd: rowEnd - 1
    });
}

export function getTemplateColumnsStyle(columnsWidth: Array<string | number>): string {
    const widths = columnsWidth.join(' ');
    return toCssString([
        {name: 'grid-template-columns', value: widths},
        {name: '-ms-grid-columns', value: widths, applyIf: detection.isIE}
    ]);
}

export function getGridLayoutStyles(): string {
    return toCssString([
        {name: 'display', value: 'grid'},
        {name: 'display', value: '-ms-grid', applyIf: detection.isIE}
    ]);
}

export function toCssString(cssRules: ICssRule[]): string {
    let cssString = '';

    cssRules.forEach((rule) => {
        // Применяем правило если нет условия или оно задано и выполняется
        cssString += (!rule.hasOwnProperty('applyIf') || !!rule.applyIf) ? `${rule.name}: ${rule.value}; ` : '';
    });

    return cssString.trim();
}
