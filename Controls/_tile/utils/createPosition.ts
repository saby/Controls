interface ITileItemPosition {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

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
        return { left, top, right, bottom };
    }
}