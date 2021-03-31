import {isFullGridSupport} from './GridLayoutUtil';
import {COLUMN_SCROLL_JS_SELECTORS} from 'Controls/columnScroll';

// Процент скроллируемой области справа, свайп по которой способен привезти к открытию операций над записью.
// Значение в соответствии со стандартом
const PERCENT_OF_SCROLLABLE_AREA_FOR_SWIPE = 0.15;

interface IShouldAddActionsCellArgs {
    // legacy для работы со старыми браузерами
    isFullGridSupport: boolean;

    // Дополнительная колонка нужна только если есть скролл
    hasColumnScroll: boolean;

    // Не нужно ничего добавлять, когда колонок нет.
    // Всегда, когда нет колонок мы ничего больше не добавляем.
    // PS. Эта опция не учитывает, что в таблицу был передан header.
    hasColumns: boolean;

    // Дополнительная колонка нужны, если itemActionsPosition !== custom
    itemActionsPosition?: string;
}

export function shouldAddActionsCell(opts: IShouldAddActionsCellArgs): boolean {
    return opts.hasColumns && opts.hasColumnScroll && opts.isFullGridSupport && (opts.itemActionsPosition !== 'custom');
}

export function shouldDrawColumnScroll(scrollContainer: HTMLDivElement, contentContainer: HTMLDivElement): boolean {
    const contentContainerSize = contentContainer.scrollWidth;
    const scrollContainerSize = isFullGridSupport() ? contentContainer.offsetWidth : scrollContainer.offsetWidth;
    return contentContainerSize > scrollContainerSize;
}

export function isColumnScrollShown(view: HTMLDivElement): boolean {
    const scrollContainer: HTMLDivElement = view.querySelector(`.${COLUMN_SCROLL_JS_SELECTORS.CONTAINER}`);
    const contentContainer: HTMLDivElement = view.querySelector(`.${COLUMN_SCROLL_JS_SELECTORS.CONTENT}`);

    if (scrollContainer && contentContainer) {
        const contentContainerSize = contentContainer.scrollWidth;
        const scrollContainerSize = isFullGridSupport() ? contentContainer.offsetWidth : scrollContainer.offsetWidth;
        return contentContainerSize > scrollContainerSize;
    }
    return false;
}

export function isInLeftSwipeRange(fixedColumnsWidth: number, scrollWidth: number, clientX: number): boolean {
    const leftSwipeRange = getLeftSwipeRange(fixedColumnsWidth, scrollWidth);
    return clientX >= leftSwipeRange.startX && clientX <= leftSwipeRange.stopX;
}

function getLeftSwipeRange(fixedColumnsWidth: number, scrollWidth: number): { startX: number; stopX: number } {
    const swipeWidth = Math.floor(scrollWidth * PERCENT_OF_SCROLLABLE_AREA_FOR_SWIPE);

    return {
        startX: fixedColumnsWidth + scrollWidth - swipeWidth,
        stopX: fixedColumnsWidth + scrollWidth
    };
}
