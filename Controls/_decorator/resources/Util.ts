export interface IText {
    value: string;
    carriagePosition: number;
}

export function paste(original: string, value: string, position: number = original.length): string {
    const validPosition = Math.max(0, position);

    return original.slice(0, validPosition) + value + original.slice(validPosition);
}

export function replace(original: string, value: string, position: number = 0): string {
    const validPosition = Math.max(0, position);

    return original.slice(0, validPosition) + value + original.slice(validPosition + value.length);
}

export function remove(original: string, start: number, end: number = original.length): string {
    return original.substring(0, start) + original.substring(end);
}

/**
 * Paste a value into the text. The carriage position is shifted so that the previous character does not change.
 */
export function pasteWithRepositioning(original: IText, value: string, position: number): IText {
    original.value = paste(original.value, value, position);

    if (original.carriagePosition >= position) {
        original.carriagePosition += value.length;
    }

    return original;
}

/**
 * Replace the value after the carriage. The length of the replaced is equal to the length of the value to be replaced.
 * The carriage position is shifted so that the previous character does not change.
 */
export function replaceWithRepositioning(original: IText, value: string, position: number): IText {
    original.value = replace(original.value, value, position);

    if (original.carriagePosition >= position) {
        original.carriagePosition += value.length;
    }

    return original;
}

/**
 * Remove a value from the text. The carriage position is shifted so that the previous and not remote
 * character does not change.
 */
export function removeWithRepositioning(original: IText, start: number, end: number): IText {
    original.value = remove(original.value, start, end);

    if (original.carriagePosition < start) {
        return original;
    } else if (start <= original.carriagePosition && original.carriagePosition <= end) {
        original.carriagePosition = start;
    } else {
        original.carriagePosition -= end - start;
    }

    return original;
}
