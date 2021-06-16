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
 * Интерфейс описывает структуру объекта, представляющего координаты элемента на странице
 */
export interface IContainerCoords {
    top: number;
    left: number;
    bottom: number;
    right: number;
}

/**
 * Возвращает координаты элемента скролл контейнера на странице
 */
export function getScrollContainerPageCoords(elem: HTMLElement): IContainerCoords {
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

/**
 * Ф-ия определяет находится ли курсор внутри элемента и рядом с его верхней/нижней границей.
 *
 * @param coords - координаты элемента относительно страницы
 * @param cursorPosition - объект, содержащий информацию о положении курсора относительно страницы
 * @param edge - величина виртуальной границы от нижнего/верхнего края элемента при попадании
 * курсора в которую считать что курсор находится рядом с краем этого элемента
 *
 * @return {} Объект с информацией находится ли курсор рядом с одной из границ и рядом с какой границе он находится
 */
export function isCursorAtBorder(
    coords: IContainerCoords,
    cursorPosition: { pageX: number, pageY: number },
    edge: number
): { near: boolean, nearTop: boolean, nearBottom: boolean } {

    // Определяем находится ли курсор в рамках текущей ширины контейнера
    const inX = cursorPosition.pageX > coords.left && cursorPosition.pageX < coords.right;
    // Определяем находится ли курсор у верхней границы элемента
    const nearTop = cursorPosition.pageY > coords.top && cursorPosition.pageY < (coords.top + edge);
    // Определяем находится ли курсор у нижней границы элемента
    const nearBottom = cursorPosition.pageY < coords.bottom && cursorPosition.pageY > (coords.bottom - edge);

    return {
        nearTop,
        nearBottom,
        near: inX && (nearTop || nearBottom)
    };
}
