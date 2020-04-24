import { assert } from 'chai';

function isValidClassesType(classes: unknown): boolean {
    return typeof classes === 'string' || (
        classes instanceof Array && !classes.find((c) => typeof c !== 'string')
    );
}

function classesToArray(classes: string | string[]): string[] {
    return classes instanceof Array ? classes : classes.trim().split(' ').filter((className) => className.trim() !== '');
}

/**
 * Проверяет строку css классов на эквивалентность.
 * @param actual
 * @param expected
 * @param message
 */
function isClassesEqual(actual: string | string[], expected: string | string[], message?: string): void {
    assert.isTrue(isValidClassesType(actual), 'Argument "actual" must be a string or Array of string!');
    assert.isTrue(isValidClassesType(expected), 'Argument "expected" must be a string or Array of string!');

    const actualClasses: string[] = classesToArray(actual);
    const expectedClasses: string[] = classesToArray(expected);
    const failingClasses = [];

    expectedClasses.forEach((className) => {
        if (actualClasses.indexOf(className) === -1) {
            failingClasses.push(className);
        }
    });
    assert.isTrue(failingClasses.length === 0, `${message ? message + '. ' : ''}Missing classes: ${failingClasses.join(', ')}.`);
}

/**
 * Проверяет отсутствие переданных классов в переданной строке.
 * @param actual
 * @param missing
 * @param message
 */
function hasNoClasses(actual: string, missing: string, message?: string): void {
    assert.isTrue(isValidClassesType(actual), 'Argument "actual" must be a string or Array of string!');
    assert.isTrue(isValidClassesType(missing), 'Argument "missing" must be a string or Array of string!');

    const actualClasses: string[] = classesToArray(actual);
    const missingClasses: string[] = classesToArray(missing);
    const failingClasses = [];

    missingClasses.forEach((className) => {
        if (actualClasses.indexOf(className) !== -1) {
            failingClasses.push(className);
        }
    });
    assert.isTrue(failingClasses.length === 0, `${message ? message + '. ' : ''}Existing classes: ${failingClasses.join(', ')}.`);
}

export {
    isClassesEqual,
    hasNoClasses
};
