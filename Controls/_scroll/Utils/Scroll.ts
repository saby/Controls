import {IScrollState} from "./ScrollState";

export const enum SCROLL_DIRECTION {
    VERTICAL = 'vertical',
    HORIZONTAL = 'horizontal'
}

export function scrollTo(container: HTMLElement, position: number, direction: SCROLL_DIRECTION = SCROLL_DIRECTION.VERTICAL): void {
    if (direction === SCROLL_DIRECTION.VERTICAL) {
        container.scrollTop = position;
    } else if (direction === SCROLL_DIRECTION.HORIZONTAL) {
        container.scrollLeft = position;
    }
}

export function getScrollPositionByState(state:IScrollState, direction: SCROLL_DIRECTION = SCROLL_DIRECTION.VERTICAL) {
    let position: number;
    if (direction === SCROLL_DIRECTION.VERTICAL) {
        position = state.scrollTop || 0;
    } else if (direction === SCROLL_DIRECTION.HORIZONTAL) {
        position = state.scrollLeft || 0;
    }
    return position;
}

export function getViewportSizeByState(state:IScrollState, direction: SCROLL_DIRECTION = SCROLL_DIRECTION.VERTICAL) {
    let viewportSize: number;
    if (direction === SCROLL_DIRECTION.VERTICAL) {
        viewportSize = state.clientHeight;
    } else if (direction === SCROLL_DIRECTION.HORIZONTAL) {
        viewportSize = state.clientWidth;
    }
    return viewportSize;
}

export function getContentSizeByState(state:IScrollState, direction: SCROLL_DIRECTION = SCROLL_DIRECTION.VERTICAL) {
    let contentSize: number;
    if (direction === SCROLL_DIRECTION.VERTICAL) {
        contentSize = state.scrollHeight;
    } else if (direction === SCROLL_DIRECTION.HORIZONTAL) {
        contentSize = state.scrollWidth;
    }
    return contentSize;
}

export const enum SCROLL_POSITION {
    START = 'start',
    END = 'end',
    MIDDLE = 'middle',
}

const SCALE_ROUNDING_ERROR_FIX = 1.5;

export function getScrollPositionType(scrollPosition: number, viewportSize: number, contentSize: number): SCROLL_POSITION {
    let curPosition: SCROLL_POSITION;
    if (scrollPosition <= 0) {
        curPosition = SCROLL_POSITION.START;
        // На масштабе появляются дробные пиксели в размерах скролл контейнера.
        // Прибавляем 1.5 пикселя, чтобы избежать неправильных расчетов позиции скролла.
    } else if (scrollPosition + viewportSize + SCALE_ROUNDING_ERROR_FIX >= contentSize) {
        curPosition = SCROLL_POSITION.END;
    } else {
        curPosition = SCROLL_POSITION.MIDDLE;
    }
    return curPosition;
}

export function getScrollPositionTypeByState(scrollState: IScrollState,
                                             direction: SCROLL_DIRECTION = SCROLL_DIRECTION.VERTICAL): SCROLL_POSITION {
    return getScrollPositionType(
        getScrollPositionByState(scrollState, direction),
        getViewportSizeByState(scrollState, direction),
        getContentSizeByState(scrollState, direction)
    );
}

export function canScroll(viewportSize: number, contentSize: number): boolean {
    return contentSize - viewportSize > 1;
}

export function canScrollByState(scrollState: IScrollState,
                                 direction: SCROLL_DIRECTION = SCROLL_DIRECTION.VERTICAL): boolean {
    return canScroll(
        getViewportSizeByState(scrollState, direction),
        getContentSizeByState(scrollState, direction)
    );
}

/**
 * Возвращает координаты элемента скролл контейнера на странице
 */
export function getScrollContainerPageCoords(
    elem: HTMLElement
): {top: number, left: number, bottom: number, right: number} {

    const box = elem.getBoundingClientRect();
    const body = document.body;
    const docEl = document.documentElement;

    const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    const clientTop = docEl.clientTop || body.clientTop || 0;
    const clientLeft = docEl.clientLeft || body.clientLeft || 0;

    return {
        top: box.top + scrollTop - clientTop,
        left: box.left + scrollLeft - clientLeft,
        bottom: box.bottom + scrollTop - clientTop,
        right: box.right + scrollLeft - clientLeft
    };
}
