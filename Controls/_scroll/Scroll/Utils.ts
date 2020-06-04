export function getVerticalPosition(scrollTop: number, clientHeight: number, scrollHeight: number): string {
    let curPosition;
    if (scrollTop <= 0) {
        curPosition = 'up';
    } else if (scrollTop + clientHeight >= scrollHeight) {
        curPosition = 'down';
    } else {
        curPosition = 'middle';
    }
    return curPosition;
}

export function getHorizontalPosition(scrollLeft: number, clientWidth: number, scrollWidth: number): string {
    let curPosition;
    if (scrollLeft <= 0) {
        curPosition = 'left';
    } else if (scrollLeft + clientWidth >= scrollWidth) {
        curPosition = 'right';
    } else {
        curPosition = 'middle';
    }
    return curPosition;
}

export function canScroll(scrollHeight: number, clientHeight: number): boolean {
    return scrollHeight - clientHeight > 1;
}
