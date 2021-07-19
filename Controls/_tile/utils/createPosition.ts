/**
 * одержит базовые методы для подсчета позиции элемента в document
 */

/**
 * Интерфейс позиции элемента в document
 */
interface ITileItemPosition {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

/**
 * Считает и возвращает позицию элемента в document
 * @param left
 * @param top
 * @param right
 * @param bottom
 */
export function createPositionInBounds(
    left: number,
    top: number,
    right: number,
    bottom: number
): ITileItemPosition {
    if (left < 0) {
        right += left;
        left = 0;
    } else if (right < 0) {
        left += right;
        right = 0;
    }
    if (top < 0) {
        bottom += top;
        top = 0;
    } else if (bottom < 0) {
        top += bottom;
        bottom = 0;
    }

    if (left < 0 || right < 0 || top < 0 || bottom < 0) {
        return null;
    } else {
        return {left, top, right, bottom};
    }
}
