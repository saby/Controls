import { assert } from 'chai';

/**
 * Проверяет строку css классов на эквивалентность.
 * @param actual
 * @param expected
 * @param message
 */
function isClassesEqual(actual: string, expected: string, message?: string): void {
    assert.isString(actual, 'Argument "actual" must be a string!');
    assert.isString(expected, 'Argument "expected" must be a string!');

    const expectedClasses: string[] = actual.trim().split(' ').filter((className) => className.trim() !== '');
    const failingClasses = [];

    expectedClasses.forEach((className) => {
        if (actual.indexOf(className) === -1) {
            failingClasses.push(className)
        }
    });
    assert.isTrue(failingClasses.length === 0, `${message}. Missing classes: ${failingClasses.join(', ')}.`);
}

export {
    isClassesEqual
}