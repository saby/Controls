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
        position = state.scrollTop;
    } else if (direction === SCROLL_DIRECTION.HORIZONTAL) {
        position = state.scrollLeft;
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

export function getScrollPositionType(scrollPosition: number, viewportSize: number, contentSize: number): SCROLL_POSITION {
    let curPosition: SCROLL_POSITION;
    if (scrollPosition <= 0) {
        curPosition = SCROLL_POSITION.START;
    } else if (scrollPosition + viewportSize >= contentSize) {
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