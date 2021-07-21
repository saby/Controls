/**
 * @typedef {String} Tag Тип поля ввода. Определяет HTML элемент для использования.
 * @variant input Однострочное поле ввода.
 * @variant textarea Многострочное поле ввода.
 */
export type Tag = 'input' | 'textarea';
/**
 * @typedef {String} InputType Тип изменения, которое вносит пользователь в поле ввода.
 * @variant insert Вставка нового значения в текущее.
 * @variant deleteForward Удаление части текущего значения, через нажатие клавишь [ctrl +] {delete}.
 * @variant deleteBackward Удаление части текущего значения, через нажатие клавишь [ctrl +] {backspace}.
 * @variant delete Удаление части текущего значения, через его выделение и нажатие клавишь [ctrl +] {backspace|delete}.
 */
export type InputType = 'insert' | 'delete' | 'deleteBackward' | 'deleteForward';
/**
 * @typedef {String} NativeInputType Тип изменения, поддерживаемого браузерами, которое вносит пользователь в поле ввода.
 * @remark
 * https://developer.mozilla.org/en-US/docs/Web/API/InputEvent/inputType
 * https://rawgit.com/w3c/input-events/v1/index.html#interface-InputEvent-Attributes
 * @variant insertText Вставка набранного значения.
 * @variant insertFromPaste Вставка из буфера обмена.
 * @variant insertFromDrop Вставка через перемещение значения.
 * @variant deleteContentBackward Удаление через клавишу backspace.
 * @variant deleteContentForward Удаление через клавишу delete.
 * @variant deleteWordBackward Удаление через клавиши ctrl + backspace.
 * @variant deleteWordForward Удаление через клавиши ctrl + delete.
 */
export type NativeInputType = 'insertText' | 'insertCompositionText' | 'insertFromPaste' | 'insertFromDrop' | 'deleteContentBackward' |
    'deleteContentForward' | 'deleteWordBackward' | 'deleteWordForward';

/**
 * Область выделения текста в поле ввода.
 * Если значения start и end равны, то текст не выделяется, но значение указывает на
 * положение каретки внутри поля.
 */

export interface ISelection {
    /**
     * Значение указывает на порядковый номер первого символа в выделенном фрагменте относительно всего текста.
     */
    start: number;
    /**
     * Значение указывает на порядковый номер последнего символа в выделенном фрагменте относительно всего текста.
     */
    end: number;
}
export interface ISplitValue {
    after: string;
    before: string;
    insert: string;
    delete: string;
}
