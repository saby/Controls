import { detection } from 'Env/Env';
import isFullGridSupport from './GridSupportUtil';

// 1) N%, где N - число больше или равно 0
// 2) Npx, где N - число больше или равно 0
// 3) Nfr, где N - число больше или равно 1
// 4) auto|min-content|max-content
// 5) minmax(N, N), где N - валидные значения в px, %, fr, либо константы auto, min-content, max-content
const VALID_GRID_COLUMN_WIDTH_VALUE = new RegExp(/^((([1-9][0-9]*px)|0px)|(([1-9][0-9]*%)|0%)|([1-9][0-9]*fr)|(auto|min-content|max-content)|(minmax\(((\d+px)|(\d+%)|([1-9][0-9]*fr)|(auto|min-content|max-content)),\s?(((\d+px)|(\d+%)|([1-9][0-9]*fr)|(auto|min-content|max-content)))\)))$/);

const DEFAULT_GRID_COLUMN_WIDTH = '1fr';
const DEFAULT_TABLE_COLUMN_WIDTH = 'auto';

interface ICssRule {
    name: string;
    value: string | number;
    applyIf?: boolean;
}

function toCssString(cssRules: ICssRule[]): string {
    let cssString = '';

    cssRules.forEach((rule) => {
        // Применяем правило если нет условия или оно задано и выполняется
        cssString += (!rule.hasOwnProperty('applyIf') || !!rule.applyIf) ? `${rule.name}: ${rule.value}; ` : '';
    });

    return cssString.trim();
}

function getTemplateColumnsStyle(columnsWidth: Array<string | number>): string {
    const widths = columnsWidth.join(' ');
    return toCssString([
        {name: 'grid-template-columns', value: widths},
        {name: '-ms-grid-columns', value: widths, applyIf: detection.isIE}
    ]);
}

function getDefaultColumnWidth(): string {
    return isFullGridSupport() ? DEFAULT_GRID_COLUMN_WIDTH : DEFAULT_TABLE_COLUMN_WIDTH;
}

function isValidWidthValue(widthValue: string): boolean {
    return !!widthValue.trim().match(VALID_GRID_COLUMN_WIDTH_VALUE);
}

export default {
    toCssString,
    getDefaultColumnWidth,
    getTemplateColumnsStyle,
    isValidWidthValue
};
